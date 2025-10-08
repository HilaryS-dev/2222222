<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$token = getAuthToken();

if (!$token) {
    sendResponse(['error' => 'Unauthorized'], 401);
}

switch ($method) {
    case 'GET':
        $orderId = $_GET['id'] ?? '';
        $customerId = $_GET['customer_id'] ?? '';
        $restaurantId = $_GET['restaurant_id'] ?? '';

        if ($orderId) {
            $result = supabaseRequest("orders?order_id=eq.$orderId", 'GET', null, $token);
        } elseif ($customerId) {
            $result = supabaseRequest("orders?customer_id=eq.$customerId&order=created_at.desc", 'GET', null, $token);
        } elseif ($restaurantId) {
            $result = supabaseRequest("orders?restaurant_id=eq.$restaurantId&order=created_at.desc", 'GET', null, $token);
        } else {
            $result = supabaseRequest('orders?order=created_at.desc', 'GET', null, $token);
        }

        sendResponse($result['data'], $result['status']);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $result = supabaseRequest('orders', 'POST', $input, $token);

        if ($result['status'] === 201 && isset($input['items'])) {
            $orderId = $result['data'][0]['order_id'];
            foreach ($input['items'] as $item) {
                supabaseRequest('order_items', 'POST', [
                    'order_id' => $orderId,
                    'menu_id' => $item['menu_id'],
                    'item_quantity' => $item['quantity'],
                    'item_price' => $item['price']
                ], $token);
            }

            if ($input['order_type'] === 'delivery') {
                supabaseRequest('deliveries', 'POST', [
                    'order_id' => $orderId,
                    'pickup_location' => $input['pickup_location'] ?? '',
                    'status' => 'pending'
                ], $token);
            }
        }

        sendResponse($result['data'], $result['status']);
        break;

    case 'PUT':
        $id = $_GET['id'] ?? '';
        $input = json_decode(file_get_contents('php://input'), true);
        $result = supabaseRequest("orders?order_id=eq.$id", 'PATCH', $input, $token);
        sendResponse($result['data'], $result['status']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
