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

    // Determine endpoint priority based on environment:
    // On Hostinger (sambodhisarang.com) and static hosts, .php is the physical server script.
    const isHostinger = typeof window !== 'undefined' && (
      window.location.hostname.includes('sambodhisarang.com') ||
      window.location.pathname.endsWith('.php') ||
      !window.location.hostname.includes('vercel.app')
    );

    const endpoints = isHostinger
      ? ['/api/send-registration-alert.php', '/api/send-registration-alert']
      : ['/api/send-registration-alert', '/api/send-registration-alert.php'];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        });

        const contentType = res.headers.get('content-type') || '';
        // Guard against SPA returning index.html (200 OK text/html)
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json().catch(() => ({}));
          if (data && data.success) {
            console.log(`✅ [Admin Alert] Registration email dispatched via ${ep}:`, data);
            return data;
          }
        }
      } catch (err) {
        console.warn(`⚠️ [Admin Alert] Endpoint ${ep} attempt failed:`, err.message);
      }
    }

    return { success: false, error: 'Could not deliver email through available endpoints' };
  } catch (error) {
    console.warn('⚠️ [Admin Alert] Exception in sendAdminRegistrationAlert:', error);
    return { success: false, error: error.message };
  }
};
