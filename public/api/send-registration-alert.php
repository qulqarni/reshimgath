<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    $data = $_POST;
}

$candidateName   = !empty($data['candidateName']) ? htmlspecialchars($data['candidateName']) : 'New Candidate';
$candidatePhone  = !empty($data['candidatePhone']) ? htmlspecialchars($data['candidatePhone']) : 'N/A';
$candidateEmail  = !empty($data['candidateEmail']) ? htmlspecialchars($data['candidateEmail']) : 'N/A';
$candidateGender = !empty($data['candidateGender']) ? htmlspecialchars($data['candidateGender']) : 'Not specified';
$candidateAge    = !empty($data['candidateAge']) ? htmlspecialchars($data['candidateAge']) : '';
$candidateDob    = !empty($data['candidateDob']) ? htmlspecialchars($data['candidateDob']) : '';
$registrationId  = !empty($data['registrationId']) ? htmlspecialchars($data['registrationId']) : '';
$district        = !empty($data['district']) ? htmlspecialchars($data['district']) : '';
$city            = !empty($data['city']) ? htmlspecialchars($data['city']) : '';

$cleanPhone = preg_replace('/[^0-9]/', '', $candidatePhone);
$phoneWithCountry = (strlen($cleanPhone) === 10) ? '91' . $cleanPhone : $cleanPhone;
$whatsappLink = 'https://wa.me/' . $phoneWithCountry . '?text=' . urlencode('Hello ' . $candidateName . ', namaskar from Sambodhi Sarang Marriage Bureau regarding your registration.');

$displayLocParts = array_filter([$city, $district, 'Maharashtra']);
$displayLocation = implode(', ', $displayLocParts);
$formattedDate = date('d M Y, h:i A');

$subject = "🔔 New Registration: " . $candidateName . ($registrationId ? " (SS-" . $registrationId . ")" : "") . " — Sambodhi Sarang";

$htmlBody = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Candidate Registration</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF8F5; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
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

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #F1E5E8; border-radius: 16px; overflow: hidden; margin-bottom: 24px;">
                <tr style="background-color: #FDF7F8;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #8B1D42; width: 35%; border-bottom: 1px solid #F1E5E8;">
                    Candidate Name
                  </td>
                  <td style="padding: 12px 16px; font-size: 14px; font-weight: bold; color: #0F172A; border-bottom: 1px solid #F1E5E8;">
                    ' . $candidateName . '
                  </td>
                </tr>

                ' . ($registrationId ? '
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #64748B; border-bottom: 1px solid #F1E5E8;">
                    Registration ID
                  </td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #8B1D42; border-bottom: 1px solid #F1E5E8;">
                    SS-' . $registrationId . '
                  </td>
                </tr>
                ' : '') . '

                <tr style="background-color: #FDF7F8;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #64748B; border-bottom: 1px solid #F1E5E8;">
                    Gender & Age
                  </td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1E5E8;">
                    <strong>' . ucfirst($candidateGender) . '</strong> ' . ($candidateAge ? '• ' . $candidateAge . ' Years' : '') . ' ' . ($candidateDob ? '(DOB: ' . $candidateDob . ')' : '') . '
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #64748B; border-bottom: 1px solid #F1E5E8;">
                    Mobile Number
                  </td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #0F172A; border-bottom: 1px solid #F1E5E8;">
                    <a href="tel:' . $candidatePhone . '" style="color: #0F172A; text-decoration: none;">' . $candidatePhone . '</a>
                    <br/>
                    <a href="' . $whatsappLink . '" target="_blank" style="display: inline-block; margin-top: 6px; font-size: 11px; font-weight: bold; color: #059669; text-decoration: none; background-color: #ECFDF5; border: 1px solid #A7F3D0; padding: 3px 8px; border-radius: 6px;">
                      💬 Chat on WhatsApp
                    </a>
                  </td>
                </tr>

                <tr style="background-color: #FDF7F8;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #64748B; border-bottom: 1px solid #F1E5E8;">
                    Email Address
                  </td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1E5E8;">
                    <a href="mailto:' . $candidateEmail . '" style="color: #8B1D42; text-decoration: none;">' . $candidateEmail . '</a>
                  </td>
                </tr>

                ' . ($displayLocation ? '
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #64748B; border-bottom: 1px solid #F1E5E8;">
                    Location
                  </td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1E5E8;">
                    📍 ' . $displayLocation . '
                  </td>
                </tr>
                ' : '') . '

                <tr style="background-color: #FDF7F8;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #64748B;">
                    Registration Time
                  </td>
                  <td style="padding: 12px 16px; font-size: 12px; color: #64748B;">
                    🕒 ' . $formattedDate . '
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
';

// Gmail SMTP Credentials
$smtpHost = 'ssl://smtp.gmail.com';
$smtpPort = 465;
$smtpUser = 'pk9823425404@gmail.com';
$smtpPass = 'pbynrraidgncpigp'; // Gmail App Password
$recipient = 'pk9823425404@gmail.com';

function sendSmtpEmail($host, $port, $user, $pass, $to, $subject, $body, $replyTo) {
    $socket = @fsockopen($host, $port, $errno, $errstr, 15);
    if (!$socket) {
        return ['success' => false, 'error' => "Connection failed: $errstr ($errno)"];
    }

    $read = function($sock) {
        $response = '';
        while ($line = fgets($sock, 512)) {
            $response .= $line;
            if (substr($line, 3, 1) === ' ') break;
        }
        return $response;
    };

    $send = function($sock, $cmd) use ($read) {
        fputs($sock, $cmd . "\r\n");
        return $read($sock);
    };

    $read($socket);
    $send($socket, "EHLO sambodhisarang.com");
    $send($socket, "AUTH LOGIN");
    $send($socket, base64_encode($user));
    $authResp = $send($socket, base64_encode($pass));

    if (strpos($authResp, '235') === false) {
        fclose($socket);
        return ['success' => false, 'error' => 'SMTP Authentication failed: ' . trim($authResp)];
    }

    $send($socket, "MAIL FROM: <$user>");
    $send($socket, "RCPT TO: <$to>");
    $send($socket, "DATA");

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Sambodhi Sarang Portal <$user>\r\n";
    $headers .= "To: <$to>\r\n";
    if (!empty($replyTo) && $replyTo !== 'N/A') {
        $headers .= "Reply-To: <$replyTo>\r\n";
    }
    $headers .= "Subject: " . '=?UTF-8?B?' . base64_encode($subject) . '?=' . "\r\n";

    $dataCmd = $headers . "\r\n" . $body . "\r\n.";
    $res = $send($socket, $dataCmd);
    $send($socket, "QUIT");
    fclose($socket);

    return ['success' => true, 'response' => trim($res)];
}

$res = sendSmtpEmail($smtpHost, $smtpPort, $smtpUser, $smtpPass, $recipient, $subject, $htmlBody, $candidateEmail);

if ($res['success']) {
    echo json_encode(['success' => true, 'message' => 'Email sent successfully via Gmail SMTP']);
} else {
    // Fallback to PHP mail() if direct socket failed
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Sambodhi Sarang <$smtpUser>\r\n";
    $mailSent = @mail($recipient, $subject, $htmlBody, $headers);
    if ($mailSent) {
        echo json_encode(['success' => true, 'fallback' => true, 'message' => 'Sent via PHP mail()']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $res['error']]);
    }
}
