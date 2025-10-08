<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'POST':
        $action = $_GET['action'] ?? '';

        if ($action === 'signup') {
            if (!isset($input['email']) || !isset($input['password']) || !isset($input['name'])) {
                sendResponse(['error' => 'Missing required fields'], 400);
            }

            $db = getDB();

            $email = $input['email'];
            $stmt = $db->prepare("SELECT user_id FROM user WHERE email = ?");
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                sendResponse(['error' => 'Email already exists'], 400);
            }
            $stmt->close();

            $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
            $name = $input['name'];
            $phone = $input['phone_number'] ?? '';

            $stmt = $db->prepare("INSERT INTO user (name, phone_number, email, password) VALUES (?, ?, ?, ?)");
            $stmt->bind_param('ssss', $name, $phone, $email, $hashedPassword);

            if (!$stmt->execute()) {
                sendResponse(['error' => 'Registration failed'], 500);
            }

            $userId = $stmt->insert_id;
            $stmt->close();

            $stmt = $db->prepare("INSERT INTO customer (customer_id) VALUES (?)");
            $stmt->bind_param('i', $userId);
            $stmt->execute();
            $stmt->close();

            $stmt = $db->prepare("INSERT INTO cart (customer_id, total_amount) VALUES (?, 0)");
            $stmt->bind_param('i', $userId);
            $stmt->execute();
            $stmt->close();

            $token = generateToken($userId);
            $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));

            $stmt = $db->prepare("INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
            $stmt->bind_param('iss', $userId, $token, $expiresAt);
            $stmt->execute();
            $stmt->close();

            $user = getUserById($userId);

            sendResponse([
                'success' => true,
                'user' => [
                    'id' => $user['user_id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'user_type' => $user['user_type']
                ],
                'token' => $token
            ]);

        } elseif ($action === 'login') {
            if (!isset($input['email']) || !isset($input['password'])) {
                sendResponse(['error' => 'Missing email or password'], 400);
            }

            $db = getDB();
            $email = $input['email'];

            $stmt = $db->prepare("SELECT user_id, password FROM user WHERE email = ?");
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $stmt->close();

            if (!$row || !password_verify($input['password'], $row['password'])) {
                sendResponse(['error' => 'Invalid credentials'], 401);
            }

            $userId = $row['user_id'];
            $token = generateToken($userId);
            $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));

            $stmt = $db->prepare("INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
            $stmt->bind_param('iss', $userId, $token, $expiresAt);
            $stmt->execute();
            $stmt->close();

            $user = getUserById($userId);

            sendResponse([
                'success' => true,
                'user' => [
                    'id' => $user['user_id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'user_type' => $user['user_type']
                ],
                'token' => $token
            ]);
        }

        sendResponse(['error' => 'Invalid action'], 400);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
