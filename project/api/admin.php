<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$currentUser = requireAuth();

if ($currentUser['user_type'] !== 'admin') {
    sendResponse(['error' => 'Unauthorized. Admin access required.'], 403);
}

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? '';

        if ($action === 'restaurants') {
            $db = getDB();
            $result = $db->query("
                SELECT r.*, u.name as manager_name, u.email as manager_email
                FROM restaurant r
                LEFT JOIN restaurant_manager rm ON r.restaurant_id = rm.restaurant_id
                LEFT JOIN user u ON rm.manager_id = u.user_id
                ORDER BY r.restaurant_id DESC
            ");
            $restaurants = [];
            while ($row = $result->fetch_assoc()) {
                $restaurants[] = $row;
            }
            sendResponse(['restaurants' => $restaurants]);

        } elseif ($action === 'managers') {
            $db = getDB();
            $result = $db->query("
                SELECT u.user_id, u.name, u.email, u.phone_number, r.restaurant_name
                FROM user u
                INNER JOIN restaurant_manager rm ON u.user_id = rm.manager_id
                LEFT JOIN restaurant r ON rm.restaurant_id = r.restaurant_id
                ORDER BY u.user_id DESC
            ");
            $managers = [];
            while ($row = $result->fetch_assoc()) {
                $managers[] = $row;
            }
            sendResponse(['managers' => $managers]);

        } elseif ($action === 'users') {
            $db = getDB();
            $result = $db->query("
                SELECT u.user_id, u.name, u.email, u.phone_number,
                       CASE
                           WHEN u.user_id IN (SELECT customer_id FROM customer) THEN 'customer'
                           WHEN u.user_id IN (SELECT manager_id FROM restaurant_manager) THEN 'manager'
                           WHEN u.user_id IN (SELECT agent_id FROM delivery_agent) THEN 'delivery'
                           WHEN u.user_id IN (SELECT admin_id FROM admin) THEN 'admin'
                           ELSE 'customer'
                       END as user_type
                FROM user u
                ORDER BY u.user_id DESC
            ");
            $users = [];
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            sendResponse(['users' => $users]);
        }

        sendResponse(['error' => 'Invalid action'], 400);
        break;

    case 'POST':
        $action = $_GET['action'] ?? '';

        if ($action === 'create_restaurant') {
            if (!isset($input['restaurant_name']) || !isset($input['address']) || !isset($input['contact_info'])) {
                sendResponse(['error' => 'Missing required fields'], 400);
            }

            $db = getDB();
            $stmt = $db->prepare("
                INSERT INTO restaurant (restaurant_name, address, contact_info, location, status)
                VALUES (?, ?, ?, ?, 'active')
            ");

            $location = $input['location'] ?? '';
            $stmt->bind_param('ssss',
                $input['restaurant_name'],
                $input['address'],
                $input['contact_info'],
                $location
            );

            if (!$stmt->execute()) {
                sendResponse(['error' => 'Failed to create restaurant'], 500);
            }

            $restaurantId = $stmt->insert_id;
            $stmt->close();

            sendResponse([
                'success' => true,
                'restaurant_id' => $restaurantId,
                'message' => 'Restaurant created successfully'
            ]);

        } elseif ($action === 'create_manager') {
            if (!isset($input['name']) || !isset($input['email']) || !isset($input['password']) || !isset($input['restaurant_id'])) {
                sendResponse(['error' => 'Missing required fields'], 400);
            }

            $db = getDB();

            $stmt = $db->prepare("SELECT restaurant_id FROM restaurant WHERE restaurant_id = ?");
            $stmt->bind_param('i', $input['restaurant_id']);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                sendResponse(['error' => 'Restaurant not found'], 404);
            }
            $stmt->close();

            $stmt = $db->prepare("SELECT user_id FROM user WHERE email = ?");
            $stmt->bind_param('s', $input['email']);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                sendResponse(['error' => 'Email already exists'], 400);
            }
            $stmt->close();

            $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
            $phone = $input['phone_number'] ?? '';

            $stmt = $db->prepare("INSERT INTO user (name, phone_number, email, password) VALUES (?, ?, ?, ?)");
            $stmt->bind_param('ssss', $input['name'], $phone, $input['email'], $hashedPassword);

            if (!$stmt->execute()) {
                sendResponse(['error' => 'Failed to create user'], 500);
            }

            $managerId = $stmt->insert_id;
            $stmt->close();

            $stmt = $db->prepare("INSERT INTO restaurant_manager (manager_id, restaurant_id) VALUES (?, ?)");
            $stmt->bind_param('ii', $managerId, $input['restaurant_id']);

            if (!$stmt->execute()) {
                $db->query("DELETE FROM user WHERE user_id = $managerId");
                sendResponse(['error' => 'Failed to create manager'], 500);
            }
            $stmt->close();

            sendResponse([
                'success' => true,
                'manager_id' => $managerId,
                'message' => 'Manager created successfully'
            ]);

        } elseif ($action === 'assign_manager') {
            if (!isset($input['manager_id']) || !isset($input['restaurant_id'])) {
                sendResponse(['error' => 'Missing required fields'], 400);
            }

            $db = getDB();

            $stmt = $db->prepare("SELECT manager_id FROM restaurant_manager WHERE manager_id = ?");
            $stmt->bind_param('i', $input['manager_id']);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                sendResponse(['error' => 'Manager already assigned to a restaurant'], 400);
            }
            $stmt->close();

            $stmt = $db->prepare("INSERT INTO restaurant_manager (manager_id, restaurant_id) VALUES (?, ?)");
            $stmt->bind_param('ii', $input['manager_id'], $input['restaurant_id']);

            if (!$stmt->execute()) {
                sendResponse(['error' => 'Failed to assign manager'], 500);
            }
            $stmt->close();

            sendResponse([
                'success' => true,
                'message' => 'Manager assigned successfully'
            ]);
        }

        sendResponse(['error' => 'Invalid action'], 400);
        break;

    case 'PUT':
        $action = $_GET['action'] ?? '';
        $id = $_GET['id'] ?? null;

        if ($action === 'update_restaurant' && $id) {
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
            if (isset($input['location'])) {
                $fields[] = 'location = ?';
                $params[] = $input['location'];
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

            sendResponse(['success' => true, 'message' => 'Restaurant updated successfully']);
        }

        sendResponse(['error' => 'Invalid action'], 400);
        break;

    case 'DELETE':
        $action = $_GET['action'] ?? '';
        $id = $_GET['id'] ?? null;

        if ($action === 'delete_restaurant' && $id) {
            $db = getDB();
            $stmt = $db->prepare("UPDATE restaurant SET status = 'inactive' WHERE restaurant_id = ?");
            $stmt->bind_param('i', $id);

            if (!$stmt->execute()) {
                sendResponse(['error' => 'Failed to delete restaurant'], 500);
            }
            $stmt->close();

            sendResponse(['success' => true, 'message' => 'Restaurant deleted successfully']);
        }

        sendResponse(['error' => 'Invalid action'], 400);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
