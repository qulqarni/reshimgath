import { RAZORPAY_TEST_KEY } from '../data/subscriptionPlans';

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
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK. Please check your internet connection.'));
    document.body.appendChild(script);
  });
};

/**
 * Opens Razorpay Checkout Modal
 */
export const openRazorpayCheckout = async ({ plan, user, onSuccess, onError }) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert('Razorpay Payment Gateway failed to load. Please try again.');
      if (onError) onError('SDK_LOAD_ERROR');
      return;
    }

    const options = {
      key: RAZORPAY_TEST_KEY,
      amount: plan.price * 100, // Amount in paise
      currency: 'INR',
      name: 'Sambodhi Sarang Matrimony',
      description: `${plan.name} Subscription Plan — ${plan.visits} Candidate Profile Visits`,
      image: 'https://cdn-icons-png.flaticon.com/512/2583/2583344.png',
      handler: function (response) {
        console.log('Razorpay Payment Success:', response);
        if (onSuccess) {
          onSuccess({
            paymentId: response.razorpay_payment_id,
            plan: plan
          });
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
          console.log('Razorpay Checkout Modal dismissed');
          if (onError) onError('DISMISSED');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      console.error('Razorpay Payment Failed:', response.error);
      alert(`Payment Failed: ${response.error.description || 'Transaction declined.'}`);
      if (onError) onError(response.error);
    });

    rzp.open();
  } catch (err) {
    console.error('Razorpay Checkout Error:', err);
    alert('Could not launch Razorpay Payment Checkout. Please try again.');
    if (onError) onError(err);
  }
};
