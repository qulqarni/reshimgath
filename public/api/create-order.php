<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

$amount = isset($data['amount']) ? intval($data['amount']) : 0;
$currency = !empty($data['currency']) ? $data['currency'] : 'INR';
$receipt = !empty($data['receipt']) ? $data['receipt'] : ('rcpt_' . time());

if ($amount < 100) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid amount. Minimum amount must be at least 100 paise (₹1).']);
    exit;
}

// Read keys from environment or .env
$keyId = getenv('RAZORPAY_KEY_ID') ?: getenv('VITE_RAZORPAY_KEY_ID') ?: '';
$keySecret = getenv('RAZORPAY_KEY_SECRET') ?: '';

$envPaths = [
    __DIR__ . '/../../.env',
    __DIR__ . '/../.env',
    __DIR__ . '/.env'
];

foreach ($envPaths as $envPath) {
    if (file_exists($envPath)) {
        $envLines = @file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($envLines) {
            foreach ($envLines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                if (strpos($line, '=') !== false) {
                    list($k, $v) = explode('=', $line, 2);
                    $cleanK = trim($k);
                    $cleanV = trim($v, " \t\n\r\0\x0B\"'");
                    if (empty($keyId) && ($cleanK === 'RAZORPAY_KEY_ID' || $cleanK === 'VITE_RAZORPAY_KEY_ID')) {
                        $keyId = $cleanV;
                    }
                    if (empty($keySecret) && $cleanK === 'RAZORPAY_KEY_SECRET') {
                        $keySecret = $cleanV;
                    }
                }
            }
        }
    }
}

if (empty($keyId)) {
    $keyId = 'rzp_test_TafmMlRdtXvs5u';
}

// If secret is available, create order via Razorpay Orders API
if (!empty($keyId) && !empty($keySecret) && function_exists('curl_init')) {
    $ch = curl_init('https://api.razorpay.com/v1/orders');
    curl_setopt($ch, CURLOPT_USERPWD, $keyId . ':' . $keySecret);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'amount' => $amount,
        'currency' => $currency,
        'receipt' => $receipt
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 || $httpCode === 201) {
        $order = json_decode($response, true);
        if (!empty($order['id'])) {
            echo json_encode([
                'order_id' => $order['id'],
                'amount' => $order['amount'],
                'currency' => $order['currency']
            ]);
            exit;
        }
    }
}

// If secret is not yet configured on Hostinger or API fails, allow safe client-side checkout
echo json_encode([
    'order_id' => null,
    'amount' => $amount,
    'currency' => $currency,
    'client_checkout' => true
]);
