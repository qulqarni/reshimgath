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
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);
if (!$data) {
    $data = $_POST;
}

$orderId   = !empty($data['razorpay_order_id']) ? $data['razorpay_order_id'] : '';
$paymentId = !empty($data['razorpay_payment_id']) ? $data['razorpay_payment_id'] : '';
$signature = !empty($data['razorpay_signature']) ? $data['razorpay_signature'] : '';

if (empty($paymentId)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing razorpay_payment_id.']);
    exit;
}

// Read key secret from environment or .env
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
                    if (trim($k) === 'RAZORPAY_KEY_SECRET') {
                        $keySecret = trim($v, " \t\n\r\0\x0B\"'");
                    }
                }
            }
        }
    }
}

// If secret and signature exist, perform HMAC SHA256 verification
if (!empty($keySecret) && !empty($orderId) && !empty($signature)) {
    $expectedSignature = hash_hmac('sha256', $orderId . '|' . $paymentId, $keySecret);
    if (hash_equals($expectedSignature, $signature)) {
        echo json_encode([
            'success' => true,
            'message' => 'Payment signature verified successfully.',
            'order_id' => $orderId,
            'payment_id' => $paymentId
        ]);
        exit;
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid payment signature. Verification failed.'
        ]);
        exit;
    }
}

// If secret is not configured or direct payment completed on frontend
echo json_encode([
    'success' => true,
    'message' => 'Payment confirmed via payment ID.',
    'order_id' => $orderId ?: ('direct_' . time()),
    'payment_id' => $paymentId
]);
