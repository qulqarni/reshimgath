import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const {
      candidateName = 'New Candidate',
      candidatePhone = 'N/A',
      candidateEmail = 'N/A',
      candidateGender = 'Not specified',
      candidateAge = 'N/A',
      candidateDob = '',
      registrationId = '',
      district = '',
      city = ''
    } = req.body || {};

    // Destination admin email
    const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'pk9823425404@gmail.com';
    const gmailUser = process.env.GMAIL_USER || adminEmail;
    const rawAppPassword = process.env.GMAIL_APP_PASSWORD || '';
    const gmailAppPassword = rawAppPassword.replace(/\s+/g, '');

    if (!gmailAppPassword) {
      console.warn('[Registration Alert] GMAIL_APP_PASSWORD is not set. Email notification skipped.');
      return res.status(200).json({
        success: false,
        warning: 'GMAIL_APP_PASSWORD is not configured in environment variables. Email alert was skipped.',
        info: 'Set GMAIL_APP_PASSWORD in Vercel or .env file to enable instant email delivery.'
      });
    }

    // Clean phone number for WhatsApp link
    const cleanDigits = String(candidatePhone).replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    const whatsappLink = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(`Hello ${candidateName}, namaskar from Sambodhi Sarang Marriage Bureau regarding your registration.`)}`;

    // Create Nodemailer Transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });

    const displayLocation = [city, district, 'Maharashtra'].filter(Boolean).join(', ');
    const formattedDate = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const emailSubject = `🔔 New Registration: ${candidateName} (${registrationId ? `SS-${registrationId}` : 'New Member'}) — Sambodhi Sarang`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Candidate Registration</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FBF8F5; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(139, 29, 66, 0.08); border: 1px solid #F1D4DB;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B1D42 0%, #5E112A 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 100px; padding: 4px 14px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                🔔 New Registration Alert
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                संबोधी सारंग वधूवर सूचक केंद्र
              </h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #F8D7DA; opacity: 0.95;">
                A new member has just registered on your matrimonial portal!
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 24px;">
              <p style="margin: 0 0 16px; font-size: 14px; color: #475569; line-height: 1.5;">
                Hello <strong>Admin</strong>, here are the complete details of the candidate who just signed up:
              </p>

              <!-- Candidate Info Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #F1E5E8; border-radius: 16px; overflow: hidden; margin-bottom: 24px;">
                <tr style="background-color: #FDF7F8;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #8B1D42; width: 35%; border-bottom: 1px solid #F1E5E8;">
                    Candidate Name
                  </td>
                  <td style="padding: 12px 16px; font-size: 14px; font-weight: bold; color: #0F172A; border-bottom: 1px solid #F1E5E8;">
                    ${candidateName}
                  </td>
                </tr>

                ${registrationId ? `
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #64748B; border-bottom: 1px solid #F1E5E8;">
                    Registration ID
                  </td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #8B1D42; border-bottom: 1px solid #F1E5E8;">
                    SS-${registrationId}
                  </td>
                </tr>
                ` : ''}

                <tr style="background-color: #FDF7F8;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #64748B; border-bottom: 1px solid #F1E5E8;">
                    Gender & Age
                  </td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1E5E8;">
                    <strong>${candidateGender ? candidateGender.charAt(0).toUpperCase() + candidateGender.slice(1) : 'N/A'}</strong> ${candidateAge ? `• ${candidateAge} Years` : ''} ${candidateDob ? `(DOB: ${candidateDob})` : ''}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #64748B; border-bottom: 1px solid #F1E5E8;">
                    Mobile Number
                  </td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #0F172A; border-bottom: 1px solid #F1E5E8;">
                    <a href="tel:${candidatePhone}" style="color: #0F172A; text-decoration: none;">${candidatePhone}</a>
                    <br/>
                    <a href="${whatsappLink}" target="_blank" style="display: inline-block; margin-top: 6px; font-size: 11px; font-weight: bold; color: #059669; text-decoration: none; background-color: #ECFDF5; border: 1px solid #A7F3D0; padding: 3px 8px; border-radius: 6px;">
                      💬 Chat on WhatsApp
                    </a>
                  </td>
                </tr>

                <tr style="background-color: #FDF7F8;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #64748B; border-bottom: 1px solid #F1E5E8;">
                    Email Address
                  </td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1E5E8;">
                    <a href="mailto:${candidateEmail}" style="color: #8B1D42; text-decoration: none;">${candidateEmail}</a>
                  </td>
                </tr>

                ${displayLocation ? `
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #64748B; border-bottom: 1px solid #F1E5E8;">
                    Location
                  </td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1E5E8;">
                    📍 ${displayLocation}
                  </td>
                </tr>
                ` : ''}

                <tr style="background-color: #FDF7F8;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #64748B;">
                    Registration Time
                  </td>
                  <td style="padding: 12px 16px; font-size: 12px; color: #64748B;">
                    🕒 ${formattedDate}
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; margin-bottom: 12px;">
                <tr>
                  <td align="center">
                    <a href="https://sambodhisarang.com/admin" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #8B1D42 0%, #6E1533 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 14px; font-size: 14px; font-weight: bold; box-shadow: 0 4px 12px rgba(139, 29, 66, 0.25);">
                      👉 Open Administrator Control Panel
                    </a>
                  </td>
                </tr>
              </table>

              <p style="text-align: center; font-size: 11px; color: #94A3B8; margin: 12px 0 0;">
                Click above to view full bio, verify phone number, or assign membership plans.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 18px 24px; text-align: center; border-top: 1px solid #F1E5E8;">
              <p style="margin: 0; font-size: 11px; color: #64748B;">
                <strong>Sambodhi Sarang Matrimony</strong> • Ichalkaranji, Maharashtra<br/>
                Official Support: +91 9823425404 | pk9823425404@gmail.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send the email
    const mailOptions = {
      from: `"Sambodhi Sarang Portal" <${gmailUser}>`,
      to: adminEmail,
      replyTo: candidateEmail && candidateEmail !== 'N/A' ? candidateEmail : adminEmail,
      subject: emailSubject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Registration Alert] Email successfully dispatched:', info.messageId);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      recipient: adminEmail
    });

  } catch (error) {
    console.error('[Registration Alert] Error sending email alert:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send registration alert email.'
    });
  }
}
