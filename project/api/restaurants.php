<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$token = getAuthToken();

if (!$token) {
    sendResponse(['error' => 'Unauthorized'], 401);
}

switch ($method) {
    case 'GET':
        $result = supabaseRequest('restaurants?status=eq.active', 'GET', null, $token);
        sendResponse($result['data'], $result['status']);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $result = supabaseRequest('restaurants', 'POST', $input, $token);
        sendResponse($result['data'], $result['status']);
        break;

    case 'PUT':
        $id = $_GET['id'] ?? '';
        $input = json_decode(file_get_contents('php://input'), true);
        $result = supabaseRequest("restaurants?restaurant_id=eq.$id", 'PATCH', $input, $token);
        sendResponse($result['data'], $result['status']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? '';
        $result = supabaseRequest("restaurants?restaurant_id=eq.$id", 'DELETE', null, $token);
        sendResponse(['success' => true], $result['status']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
