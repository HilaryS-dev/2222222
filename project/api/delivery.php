<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$token = getAuthToken();

if (!$token) {
    sendResponse(['error' => 'Unauthorized'], 401);
}

switch ($method) {
    case 'GET':
        $agentId = $_GET['agent_id'] ?? '';
        $orderId = $_GET['order_id'] ?? '';

        if ($agentId) {
            $result = supabaseRequest("deliveries?delivery_agent_id=eq.$agentId&order=created_at.desc", 'GET', null, $token);
        } elseif ($orderId) {
            $result = supabaseRequest("deliveries?order_id=eq.$orderId", 'GET', null, $token);
        } else {
            $result = supabaseRequest('deliveries?order=created_at.desc', 'GET', null, $token);
        }

        sendResponse($result['data'], $result['status']);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $result = supabaseRequest('deliveries', 'POST', $input, $token);
        sendResponse($result['data'], $result['status']);
        break;

    case 'PUT':
        $id = $_GET['id'] ?? '';
        $input = json_decode(file_get_contents('php://input'), true);
        $result = supabaseRequest("deliveries?delivery_id=eq.$id", 'PATCH', $input, $token);
        sendResponse($result['data'], $result['status']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
