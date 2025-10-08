<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$token = getAuthToken();

if (!$token) {
    sendResponse(['error' => 'Unauthorized'], 401);
}

switch ($method) {
    case 'GET':
        $restaurantId = $_GET['restaurant_id'] ?? '';
        if ($restaurantId) {
            $result = supabaseRequest("tables?restaurant_id=eq.$restaurantId", 'GET', null, $token);
        } else {
            $result = supabaseRequest('tables', 'GET', null, $token);
        }
        sendResponse($result['data'], $result['status']);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $result = supabaseRequest('tables', 'POST', $input, $token);
        sendResponse($result['data'], $result['status']);
        break;

    case 'PUT':
        $id = $_GET['id'] ?? '';
        $input = json_decode(file_get_contents('php://input'), true);
        $result = supabaseRequest("tables?table_id=eq.$id", 'PATCH', $input, $token);
        sendResponse($result['data'], $result['status']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
