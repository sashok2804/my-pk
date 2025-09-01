<?php
// users.php - api/users.php - API для работы с пользователями с JWT
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
$userId = isset($_GET['id']) ? intval($_GET['id']) : null;
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Обработка запросов
if ($userId) {
    // Запросы к конкретному пользователю
    switch ($requestMethod) {
        case 'GET':
            getUserById($db, $userId);
            break;
        case 'PUT':
            updateUser($db, $userId);
            break;
        case 'DELETE':
            deleteUser($db, $userId);
            break;
        default:
            sendError('Method not allowed', 405);
    }
} else {
    // Запросы к списку пользователей
    switch ($action) {
        case 'search':
            searchUsers($db);
            break;
        default:
            if ($requestMethod === 'GET') {
                getUsers($db);
            } else {
                sendError('Method not allowed', 405);
            }
    }
}

// Получение пользователя по ID
function getUserById($db, $userId) {
    // Получаем информацию о пользователе
    $user = getUserInfo($userId, $db, $userId === getCurrentUserId() || isAdmin());
    
    if (!$user) {
        sendError('User not found', 404);
    }
    
    // Получаем количество друзей
    $user['friends_count'] = getFriendsCount($userId, $db);
    
    // Если это текущий пользователь или админ, добавляем список друзей
    if ($userId === getCurrentUserId() || isAdmin()) {
        // Получаем список друзей
        $stmt = $db->prepare("
            SELECT u.id, u.name, u.avatar 
            FROM friendships f
            JOIN users u ON (f.friend_id = u.id AND f.user_id = ?) OR (f.user_id = u.id AND f.friend_id = ?)
            WHERE f.status = 'accepted'
        ");
        $stmt->bind_param("ii", $userId, $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $user['friends'] = [];
        while ($friend = $result->fetch_assoc()) {
            $user['friends'][] = $friend;
        }
    }
    
    // Если текущий пользователь не является запрашиваемым, добавляем статус дружбы
    if ($userId !== getCurrentUserId()) {
        $user['friendship_status'] = getFriendshipStatus(getCurrentUserId(), $userId, $db);
    }
    
    sendResponse($user);
}

// Получение списка пользователей
function getUsers($db) {
    // Для обычных пользователей возвращаем только друзей
    if (!isAdmin()) {
        $currentUserId = getCurrentUserId();
        
        $stmt = $db->prepare("
            SELECT u.id, u.name, u.avatar, u.status
            FROM friendships f
            JOIN users u ON (f.friend_id = u.id AND f.user_id = ?) OR (f.user_id = u.id AND f.friend_id = ?)
            WHERE f.status = 'accepted'
        ");
        $stmt->bind_param("ii", $currentUserId, $currentUserId);
    } else {
        // Для админов возвращаем всех пользователей
        $stmt = $db->prepare("
            SELECT id, name, email, avatar, status, role, created_at
            FROM users
            ORDER BY name
        ");
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $users = [];
    while ($user = $result->fetch_assoc()) {
        $users[] = $user;
    }
    
    sendResponse($users);
}

// Обновление пользователя
function updateUser($db, $userId) {
    $currentUserId = getCurrentUserId();
    
    // Проверяем права доступа
    if ($currentUserId !== $userId && !isAdmin()) {
        sendError('Permission denied', 403);
    }
    
    // Получаем данные из запроса
    $data = getRequestData();
    
    // Обновляем только разрешенные поля
    $allowedFields = ['name', 'status', 'avatar'];
    
    // Для админов разрешаем обновлять еще некоторые поля
    if (isAdmin()) {
        $allowedFields[] = 'role';
    }
    
    $updateFields = [];
    $updateValues = [];
    $types = '';
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updateFields[] = "{$field} = ?";
            $updateValues[] = $data[$field];
            $types .= 's'; // Все поля строковые
        }
    }
    
    if (empty($updateFields)) {
        sendError('No fields to update');
    }
    
    // Добавляем ID пользователя к параметрам
    $updateValues[] = $userId;
    $types .= 'i';
    
    // Формируем и выполняем запрос
    $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    
    // Создаем массив ссылок для bind_param
    $refs = array();
    $refs[] = $types;
    for ($i = 0; $i < count($updateValues); $i++) {
        $refs[] = &$updateValues[$i];
    }
    
    call_user_func_array(array($stmt, 'bind_param'), $refs);
    
    if ($stmt->execute()) {
        // Получаем обновленные данные пользователя
        $user = getUserInfo($userId, $db, $userId === $currentUserId || isAdmin());
        
        // Если пользователь обновил свой профиль, создаем новый токен с актуальными данными
        if ($userId === $currentUserId) {
            $newToken = createJWTToken($user['id'], $user['role']);
            sendResponse([
                'user' => $user,
                'token' => $newToken,
                'message' => 'Profile updated successfully'
            ]);
        } else {
            sendResponse($user);
        }
    } else {
        sendError('Failed to update user');
    }
}

// Удаление пользователя
function deleteUser($db, $userId) {
    // Только админ или сам пользователь может удалить аккаунт
    if (getCurrentUserId() !== $userId && !isAdmin()) {
        sendError('Permission denied', 403);
    }
    
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'User deleted successfully']);
    } else {
        sendError('Failed to delete user');
    }
}

// Поиск пользователей
function searchUsers($db) {
    $query = isset($_GET['q']) ? trim($_GET['q']) : '';
    
    if (empty($query)) {
        sendError('Search query is required');
    }
    
    // Создаем поисковый запрос
    $searchTerm = '%' . $db->escapeString($query) . '%';
    $currentUserId = getCurrentUserId();
    
    // Ищем пользователей, исключая текущего пользователя
    $stmt = $db->prepare("
        SELECT id, name, avatar, status
        FROM users
        WHERE id != ? AND (name LIKE ? OR email LIKE ?)
        ORDER BY name
        LIMIT 20
    ");
    $stmt->bind_param("iss", $currentUserId, $searchTerm, $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $users = [];
    while ($user = $result->fetch_assoc()) {
        // Добавляем статус дружбы
        $user['friendship_status'] = getFriendshipStatus($currentUserId, $user['id'], $db);
        // Добавляем флаг, отправлен ли запрос на дружбу
        $user['request_sent'] = $user['friendship_status'] === 'pending_sent';
        
        $users[] = $user;
    }
    
    sendResponse($users);
}
?>