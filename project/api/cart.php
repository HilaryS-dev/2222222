<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$token = getAuthToken();

if (!$token) {
    sendResponse(['error' => 'Unauthorized'], 401);
}

switch ($method) {
    case 'GET':
        $customerId = $_GET['customer_id'] ?? '';

        $cartResult = supabaseRequest("carts?customer_id=eq.$customerId", 'GET', null, $token);

        if (empty($cartResult['data'])) {
            sendResponse(['items' => [], 'total' => 0]);
        }

        $cartId = $cartResult['data'][0]['cart_id'];

        $itemsResult = supabaseRequest("cart_items?cart_id=eq.$cartId", 'GET', null, $token);

        $items = [];
        $total = 0;

        foreach ($itemsResult['data'] as $cartItem) {
            $menuResult = supabaseRequest("menu_items?menu_id=eq.{$cartItem['menu_id']}", 'GET', null, $token);
            if (!empty($menuResult['data'])) {
                $menuItem = $menuResult['data'][0];
                $items[] = [
                    'cart_item_id' => $cartItem['cart_item_id'],
                    'menu_id' => $cartItem['menu_id'],
                    'quantity' => $cartItem['quantity'],
                    'item_name' => $menuItem['item_name'],
                    'price' => $menuItem['price'],
                    'subtotal' => $menuItem['price'] * $cartItem['quantity']
                ];
                $total += $menuItem['price'] * $cartItem['quantity'];
            }
        }

        supabaseRequest("carts?cart_id=eq.$cartId", 'PATCH', ['total_amount' => $total], $token);

        sendResponse(['items' => $items, 'total' => $total, 'cart_id' => $cartId]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $customerId = $input['customer_id'];
        $menuId = $input['menu_id'];
        $quantity = $input['quantity'];

        $cartResult = supabaseRequest("carts?customer_id=eq.$customerId", 'GET', null, $token);
        $cartId = $cartResult['data'][0]['cart_id'];

        $existingItem = supabaseRequest("cart_items?cart_id=eq.$cartId&menu_id=eq.$menuId", 'GET', null, $token);

        if (!empty($existingItem['data'])) {
            $newQuantity = $existingItem['data'][0]['quantity'] + $quantity;
            $result = supabaseRequest("cart_items?cart_id=eq.$cartId&menu_id=eq.$menuId", 'PATCH', [
                'quantity' => $newQuantity
            ], $token);
        } else {
            $result = supabaseRequest('cart_items', 'POST', [
                'cart_id' => $cartId,
                'menu_id' => $menuId,
                'quantity' => $quantity
            ], $token);
        }

        sendResponse($result['data'], $result['status']);
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        $cartItemId = $input['cart_item_id'];
        $quantity = $input['quantity'];

        if ($quantity <= 0) {
            $result = supabaseRequest("cart_items?cart_item_id=eq.$cartItemId", 'DELETE', null, $token);
        } else {
            $result = supabaseRequest("cart_items?cart_item_id=eq.$cartItemId", 'PATCH', [
                'quantity' => $quantity
            ], $token);
        }

        sendResponse($result['data'], $result['status']);
        break;

    case 'DELETE':
        $customerId = $_GET['customer_id'] ?? '';
        $itemId = $_GET['item_id'] ?? '';

        if ($itemId) {
            $result = supabaseRequest("cart_items?cart_item_id=eq.$itemId", 'DELETE', null, $token);
        } else {
            $cartResult = supabaseRequest("carts?customer_id=eq.$customerId", 'GET', null, $token);
            if (!empty($cartResult['data'])) {
                $cartId = $cartResult['data'][0]['cart_id'];
                $result = supabaseRequest("cart_items?cart_id=eq.$cartId", 'DELETE', null, $token);
            }
        }

        sendResponse(['success' => true]);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
