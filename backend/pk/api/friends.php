<?php
// friends.php - api/friends.php - API для работы с друзьями с JWT
require_once 'db.php';
require_once 'helpers.php';

// Проверяем авторизацию
if (!isAuthenticated()) {
    sendError('Unauthorized', 401);
}

// Создаем экземпляр базы данных
$db = new Database();

// Определяем действие на основе URL и метода запроса
$requestMethod = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$friendId = isset($_GET['friend_id']) ? intval($_GET['friend_id']) : null;

// Обработка запросов
switch ($action) {
    case 'request':
        handleFriendRequest($db, $friendId);
        break;
    case 'accept':
        handleAcceptRequest($db, $friendId);
        break;
    case 'reject':
        handleRejectRequest($db, $friendId);
        break;
    case 'requests':
        getFriendRequests($db);
        break;
    case 'suggestions':
        getFriendSuggestions($db);
        break;
    case 'status':
        getFriendshipStatusEndpoint($db, $friendId);
        break;
    default:
        if ($requestMethod === 'GET') {
            // Получение списка друзей
            getFriends($db);
        } else if ($requestMethod === 'DELETE' && $friendId) {
            // Удаление из друзей
            removeFriend($db, $friendId);
        } else {
            sendError('Invalid action or method', 404);
        }
}

// Получение списка друзей
function getFriends($db) {
    $currentUserId = getCurrentUserId();
    
    $stmt = $db->prepare("
        SELECT u.id, u.name, u.avatar, u.status
        FROM friendships f
        JOIN users u ON (f.friend_id = u.id AND f.user_id = ?) OR (f.user_id = u.id AND f.friend_id = ?)
        WHERE f.status = 'accepted'
        ORDER BY u.name
    ");
    $stmt->bind_param("ii", $currentUserId, $currentUserId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $friends = [];
    while ($friend = $result->fetch_assoc()) {
        $friends[] = $friend;
    }
    
    sendResponse($friends);
}

// Отправка запроса на дружбу
function handleFriendRequest($db, $friendId) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $currentUserId = getCurrentUserId();
    
    // Проверяем, не отправляет ли пользователь запрос самому себе
    if ($currentUserId == $friendId) {
        sendError('You cannot send a friend request to yourself');
    }
    
    // Проверяем существование пользователя
    if (!userExists($friendId, $db)) {
        sendError('User not found', 404);
    }
    
    // Проверяем, не отправлен ли уже запрос или не являются ли они уже друзьями
    $status = getFriendshipStatus($currentUserId, $friendId, $db);
    
    if ($status === 'friends') {
        sendError('You are already friends with this user');
    } else if ($status === 'pending_sent') {
        sendError('Friend request already sent');
    } else if ($status === 'pending_received') {
        // Если получен запрос от этого пользователя, принимаем его
        handleAcceptRequest($db, $friendId);
        return;
    }
    
    // Отправляем запрос
    $stmt = $db->prepare("
        INSERT INTO friendships (user_id, friend_id, status) 
        VALUES (?, ?, 'pending')
    ");
    $stmt->bind_param("ii", $currentUserId, $friendId);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Friend request sent']);
    } else {
        sendError('Failed to send friend request');
    }
}

// Принятие запроса на дружбу
function handleAcceptRequest($db, $friendId) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $currentUserId = getCurrentUserId();
    
    // Проверяем, существует ли запрос
    $stmt = $db->prepare("
        SELECT id FROM friendships 
        WHERE user_id = ? AND friend_id = ? AND status = 'pending'
    ");
    $stmt->bind_param("ii", $friendId, $currentUserId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Friend request not found', 404);
    }
    
    // Принимаем запрос
    $stmt = $db->prepare("
        UPDATE friendships 
        SET status = 'accepted' 
        WHERE user_id = ? AND friend_id = ?
    ");
    $stmt->bind_param("ii", $friendId, $currentUserId);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Friend request accepted']);
    } else {
        sendError('Failed to accept friend request');
    }
}

// Отклонение запроса на дружбу
function handleRejectRequest($db, $friendId) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $currentUserId = getCurrentUserId();
    
    // Проверяем, существует ли запрос
    $stmt = $db->prepare("
        SELECT id FROM friendships 
        WHERE user_id = ? AND friend_id = ? AND status = 'pending'
    ");
    $stmt->bind_param("ii", $friendId, $currentUserId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Friend request not found', 404);
    }
    
    // Отклоняем запрос
    $stmt = $db->prepare("
        DELETE FROM friendships 
        WHERE user_id = ? AND friend_id = ?
    ");
    $stmt->bind_param("ii", $friendId, $currentUserId);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Friend request rejected']);
    } else {
        sendError('Failed to reject friend request');
    }
}

// Получение запросов в друзья
function getFriendRequests($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $currentUserId = getCurrentUserId();
    
    // Получаем запросы в друзья
    $stmt = $db->prepare("
        SELECT u.id, u.name, u.avatar, u.status, f.created_at as request_date
        FROM friendships f
        JOIN users u ON f.user_id = u.id
        WHERE f.friend_id = ? AND f.status = 'pending'
        ORDER BY f.created_at DESC
    ");
    $stmt->bind_param("i", $currentUserId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $requests = [];
    while ($request = $result->fetch_assoc()) {
        $requests[] = $request;
    }
    
    sendResponse($requests);
}

// Получение рекомендаций друзей
function getFriendSuggestions($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $currentUserId = getCurrentUserId();
    
    // Получаем пользователей, которые не являются друзьями и нет запросов
    $stmt = $db->prepare("
        SELECT u.id, u.name, u.avatar, u.status
        FROM users u
        WHERE u.id != ? 
        AND u.id NOT IN (
            SELECT IF(f.user_id = ?, f.friend_id, f.user_id)
            FROM friendships f
            WHERE (f.user_id = ? OR f.friend_id = ?)
        )
        ORDER BY RAND()
        LIMIT 20
    ");
    $stmt->bind_param("iiii", $currentUserId, $currentUserId, $currentUserId, $currentUserId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $suggestions = [];
    while ($suggestion = $result->fetch_assoc()) {
        // Добавляем флаг отправки запроса
        $suggestion['request_sent'] = false;
        $suggestions[] = $suggestion;
    }
    
    sendResponse($suggestions);
}

// Удаление из друзей
function removeFriend($db, $friendId) {
    $currentUserId = getCurrentUserId();
    
    // Проверяем, являются ли пользователи друзьями
    $status = getFriendshipStatus($currentUserId, $friendId, $db);
    
    if ($status !== 'friends') {
        sendError('You are not friends with this user', 404);
    }
    
    // Удаляем запись о дружбе
    $stmt = $db->prepare("
        DELETE FROM friendships 
        WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    ");
    $stmt->bind_param("iiii", $currentUserId, $friendId, $friendId, $currentUserId);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Friend removed successfully']);
    } else {
        sendError('Failed to remove friend');
    }
}

// Получение статуса дружбы
function getFriendshipStatusEndpoint($db, $friendId) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $currentUserId = getCurrentUserId();
    
    if (!$friendId) {
        sendError('Friend ID is required');
    }
    
    // Проверяем существование пользователя
    if (!userExists($friendId, $db)) {
        sendError('User not found', 404);
    }
    
    $status = getFriendshipStatus($currentUserId, $friendId, $db);
    
    sendResponse(['status' => $status ?: 'none']);
}
?>