<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'POST':
        $action = $_GET['action'] ?? '';

        if ($action === 'signup') {
            if (!isset($input['email']) || !isset($input['password']) || !isset($input['name']) || !isset($input['user_type'])) {
                sendResponse(['error' => 'Missing required fields'], 400);
            }

            $authResult = supabaseAuth('signup', [
                'email' => $input['email'],
                'password' => $input['password']
            ]);

            if ($authResult['status'] !== 200) {
                sendResponse(['error' => 'Registration failed', 'details' => $authResult['data']], $authResult['status']);
            }

            $userId = $authResult['data']['user']['id'];
            $token = $authResult['data']['access_token'];

            $profileResult = supabaseRequest('user_profiles', 'POST', [
                'user_id' => $userId,
                'name' => $input['name'],
                'email' => $input['email'],
                'phone_number' => $input['phone_number'] ?? '',
                'user_type' => $input['user_type']
            ], $token);

            if ($input['user_type'] === 'customer') {
                supabaseRequest('customers', 'POST', [
                    'customer_id' => $userId
                ], $token);

                supabaseRequest('carts', 'POST', [
                    'customer_id' => $userId,
                    'total_amount' => 0
                ], $token);
            } elseif ($input['user_type'] === 'delivery') {
                supabaseRequest('delivery_agents', 'POST', [
                    'agent_id' => $userId,
                    'is_available' => false
                ], $token);
            }

            sendResponse([
                'success' => true,
                'user' => $authResult['data']['user'],
                'token' => $token
            ]);

        } elseif ($action === 'login') {
            if (!isset($input['email']) || !isset($input['password'])) {
                sendResponse(['error' => 'Missing email or password'], 400);
            }

            $authResult = supabaseAuth('token?grant_type=password', [
                'email' => $input['email'],
                'password' => $input['password']
            ]);

            if ($authResult['status'] !== 200) {
                sendResponse(['error' => 'Invalid credentials', 'details' => $authResult['data']], $authResult['status']);
            }

            $token = $authResult['data']['access_token'];
            $userId = $authResult['data']['user']['id'];

            $profileResult = supabaseRequest("user_profiles?user_id=eq.$userId", 'GET', null, $token);

            sendResponse([
                'success' => true,
                'user' => $authResult['data']['user'],
                'token' => $token,
                'profile' => $profileResult['data'][0] ?? null
            ]);
        }

        sendResponse(['error' => 'Invalid action'], 400);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
