/**
 * Dynamically loads the Razorpay Checkout SDK script
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK. Please check your internet connection.'));
    document.body.appendChild(script);
  });
};

/**
 * Backend Step 1: Create Order Endpoint Call (/api/create-order)
 */
export const createRazorpayOrder = async ({ amount, currency = 'INR', receipt }) => {
  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount, // Amount in paise (minimum 100)
      currency,
      receipt: receipt || `rcpt_${Date.now()}`
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create Razorpay payment order on server.');
  }
  return data; // { order_id, amount, currency }
};

/**
 * Backend Step 3: Verify Payment Signature Endpoint Call (/api/verify-payment)
 */
export const verifyRazorpayPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Payment signature verification failed.');
  }
  return data; // { success: true, message, order_id, payment_id }
};

/**
 * Full Standard Checkout Flow Integration
 */
export const openRazorpayCheckout = async ({ plan, user, onSuccess, onError, onStatusChange }) => {
  try {
    if (onStatusChange) onStatusChange('LOADING_SDK');

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert('Razorpay Payment Gateway SDK failed to load. Please check your internet connection.');
      if (onError) onError(new Error('SDK_LOAD_ERROR'));
      return;
    }

    if (onStatusChange) onStatusChange('CREATING_ORDER');

    // 1. Create order on backend (/api/create-order)
    const amountInPaise = Math.max(100, Math.round(plan.price * 100));
    const orderData = await createRazorpayOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `plan_${plan.id}_${Date.now()}`
    });

    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      throw new Error('VITE_RAZORPAY_KEY_ID environment variable is missing. Please set VITE_RAZORPAY_KEY_ID in Vercel environment settings.');
    }

    if (onStatusChange) onStatusChange('OPENING_MODAL');

    // 2. Open Razorpay Checkout Modal
    const options = {
      key: razorpayKeyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Sambodhi Sarang Matrimony',
      description: `${plan.name} Subscription Plan — ${plan.visits} Profile Visits`,
      image: 'https://cdn-icons-png.flaticon.com/512/2583/2583344.png',
      order_id: orderData.order_id,
      handler: async function (response) {
        try {
          if (onStatusChange) onStatusChange('VERIFYING_PAYMENT');

          // 3. Verify Payment Signature on backend (/api/verify-payment)
          const verificationResult = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          if (verificationResult && verificationResult.success) {
            if (onSuccess) {
              onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                plan
              });
            }
          } else {
            throw new Error('Payment signature verification failed.');
          }
        } catch (verifyError) {
          console.error('Payment Verification Failed:', verifyError);
          alert(`Payment Verification Error: ${verifyError.message || 'Signature mismatch.'}`);
          if (onError) onError(verifyError);
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || ''
      },
      notes: {
        plan_id: plan.id,
        user_id: user?.id || 'guest',
        user_name: user?.name || ''
      },
      theme: {
        color: '#4A1525' // Brand Plum Theme Color
      },
      modal: {
        ondismiss: function () {
          console.log('Razorpay Checkout Modal dismissed by user.');
          if (onStatusChange) onStatusChange('DISMISSED');
          if (onError) onError(new Error('USER_CANCELLED'));
        }
      }
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', function (response) {
      console.error('Razorpay Payment Failed Event:', response.error);
      const errMsg = response.error?.description || response.error?.reason || 'Transaction declined by bank or user.';
      alert(`Payment Failed: ${errMsg}`);
      if (onError) onError(response.error);
    });

    rzp.open();
  } catch (err) {
    console.error('Razorpay Checkout Error:', err);
    alert(`Could not process payment: ${err.message || 'Server error'}`);
    if (onError) onError(err);
  }
};
