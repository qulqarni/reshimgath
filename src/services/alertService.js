/**
 * Alert & Notification Service for Sambodhi Sarang
 * Triggers instant alerts to Bureau Administrators upon key events.
 */

/**
 * Triggers an instant email notification to the Bureau Administrator (pk9823425404@gmail.com)
 * when a new candidate registers on the website.
 * This runs asynchronously and is completely non-blocking.
 * Supports both Vercel (Node.js API) and Hostinger (PHP API) seamlessly.
 *
 * @param {Object} candidateData Candidate details
 * @returns {Promise<Object>} API response status
 */
export const sendAdminRegistrationAlert = async (candidateData) => {
  if (!candidateData) return { success: false, error: 'No candidate data provided' };

  try {
    const payload = {
      candidateName: candidateData.name || candidateData.fullName || 'New Candidate',
      candidatePhone: candidateData.phone || candidateData.mobile || 'N/A',
      candidateEmail: candidateData.email || 'N/A',
      candidateGender: candidateData.gender || 'Not specified',
      candidateAge: candidateData.age || '',
      candidateDob: candidateData.dob || '',
      registrationId: candidateData.registrationId || '',
      district: candidateData.district || '',
      city: candidateData.city || ''
    };

    // Attempt 1: Standard /api/send-registration-alert (Vercel & Vite dev server)
    try {
      const res = await fetch('/api/send-registration-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.success) {
          console.log('✅ [Admin Alert] Registration email dispatched to admin.');
          return data;
        }
      }
    } catch (e1) {
      console.warn('⚠️ [Admin Alert] Attempt 1 failed, trying fallback PHP endpoint...');
    }

    // Attempt 2: Direct /api/send-registration-alert.php (Hostinger live site fallback)
    try {
      const resPhp = await fetch('/api/send-registration-alert.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resPhp.ok) {
        const dataPhp = await resPhp.json().catch(() => ({}));
        if (dataPhp?.success) {
          console.log('✅ [Admin Alert] Registration email dispatched via PHP endpoint.');
          return dataPhp;
        }
      }
    } catch (e2) {
      console.warn('⚠️ [Admin Alert] Attempt 2 failed:', e2.message);
    }

    return { success: false, error: 'Could not deliver email through available endpoints' };
  } catch (error) {
    console.warn('⚠️ [Admin Alert] Exception in sendAdminRegistrationAlert:', error);
    return { success: false, error: error.message };
  }
};
