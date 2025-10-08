<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'smartbite');

function getDB() {
    static $conn = null;
    if ($conn === null) {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            sendResponse(['error' => 'Database connection failed'], 500);
        }
        $conn->set_charset('utf8mb4');
    }
    return $conn;
}

function generateToken($userId) {
    return base64_encode(random_bytes(32) . ':' . $userId . ':' . time());
}

function validateToken($token) {
    if (!$token) return null;

    $db = getDB();
    $stmt = $db->prepare("SELECT user_id FROM user_sessions WHERE token = ? AND expires_at > NOW()");
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();

    return $row ? $row['user_id'] : null;
}

function getUserById($userId) {
    $db = getDB();
    $stmt = $db->prepare("
        SELECT u.*,
               CASE
                   WHEN u.user_id IN (SELECT customer_id FROM customer) THEN 'customer'
                   WHEN u.user_id IN (SELECT manager_id FROM restaurant_manager) THEN 'manager'
                   WHEN u.user_id IN (SELECT agent_id FROM delivery_agent) THEN 'delivery'
                   WHEN u.user_id IN (SELECT admin_id FROM admin) THEN 'admin'
                   ELSE 'customer'
               END as user_type
        FROM user u
        WHERE u.user_id = ?
    ");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();
    return $user;
}

function getAuthToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        return str_replace('Bearer ', '', $headers['Authorization']);
    }
    return null;
}

function requireAuth() {
    $token = getAuthToken();
    $userId = validateToken($token);
    if (!$userId) {
        sendResponse(['error' => 'Unauthorized'], 401);
    }
    return getUserById($userId);
}

function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}
