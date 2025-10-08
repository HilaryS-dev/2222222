<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$currentUser = requireAuth();

switch ($method) {
    case 'GET':
        $db = getDB();
        $result = $db->query("SELECT * FROM restaurant WHERE status = 'active' ORDER BY restaurant_id DESC");
        $restaurants = [];
        while ($row = $result->fetch_assoc()) {
            $restaurants[] = $row;
        }
        sendResponse($restaurants);
        break;

    case 'POST':
        if ($currentUser['user_type'] !== 'admin') {
            sendResponse(['error' => 'Unauthorized'], 403);
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO restaurant (restaurant_name, address, contact_info, location, status) VALUES (?, ?, ?, ?, 'active')");
        $stmt->bind_param('ssss', $input['restaurant_name'], $input['address'], $input['contact_info'], $input['location']);
        if (!$stmt->execute()) {
            sendResponse(['error' => 'Failed to create restaurant'], 500);
        }
        $stmt->close();
        sendResponse(['success' => true, 'restaurant_id' => $db->insert_id]);
        break;

    case 'PUT':
        if ($currentUser['user_type'] !== 'admin' && $currentUser['user_type'] !== 'manager') {
            sendResponse(['error' => 'Unauthorized'], 403);
        }
        $id = $_GET['id'] ?? '';
        $input = json_decode(file_get_contents('php://input'), true);
        $db = getDB();

        $fields = [];
        $params = [];
        $types = '';

        if (isset($input['restaurant_name'])) {
            $fields[] = 'restaurant_name = ?';
            $params[] = $input['restaurant_name'];
            $types .= 's';
        }
        if (isset($input['address'])) {
            $fields[] = 'address = ?';
            $params[] = $input['address'];
            $types .= 's';
        }
        if (isset($input['contact_info'])) {
            $fields[] = 'contact_info = ?';
            $params[] = $input['contact_info'];
            $types .= 's';
        }
        if (isset($input['status'])) {
            $fields[] = 'status = ?';
            $params[] = $input['status'];
            $types .= 's';
        }

        if (empty($fields)) {
            sendResponse(['error' => 'No fields to update'], 400);
        }

        $params[] = $id;
        $types .= 'i';

        $sql = "UPDATE restaurant SET " . implode(', ', $fields) . " WHERE restaurant_id = ?";
        $stmt = $db->prepare($sql);
        $stmt->bind_param($types, ...$params);

        if (!$stmt->execute()) {
            sendResponse(['error' => 'Failed to update restaurant'], 500);
        }
        $stmt->close();
        sendResponse(['success' => true]);
        break;

    case 'DELETE':
        if ($currentUser['user_type'] !== 'admin') {
            sendResponse(['error' => 'Unauthorized'], 403);
        }
        $id = $_GET['id'] ?? '';
        $db = getDB();
        $stmt = $db->prepare("UPDATE restaurant SET status = 'inactive' WHERE restaurant_id = ?");
        $stmt->bind_param('i', $id);
        if (!$stmt->execute()) {
            sendResponse(['error' => 'Failed to delete restaurant'], 500);
        }
        $stmt->close();
        sendResponse(['success' => true]);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
