/**
 * Alert & Notification Service for Sambodhi Sarang
 * Triggers instant alerts to Bureau Administrators upon key events.
 */

/**
 * Triggers an instant email notification to the Bureau Administrator (pk9823425404@gmail.com)
 * when a new candidate registers on the website.
 * This runs asynchronously and is completely non-blocking.
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

    const res = await fetch('/api/send-registration-alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (data?.success) {
      console.log('✅ [Admin Alert] Email notification dispatched successfully to admin.');
    } else if (data?.warning) {
      console.info('ℹ️ [Admin Alert] Email alert info:', data.warning);
    }
    return data;
  } catch (error) {
    console.warn('⚠️ [Admin Alert] Failed to trigger admin registration alert email:', error);
    return { success: false, error: error.message };
  }
};
