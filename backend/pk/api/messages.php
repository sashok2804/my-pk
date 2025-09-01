<?php
// messages.php - api/messages.php - API для работы с личными сообщениями с JWT
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
$friendId = isset($_GET['friend_id']) ? intval($_GET['friend_id']) : null;

// Обработка запросов
if ($friendId) {
    // Получение сообщений с определенным пользователем
    getMessagesByFriend($db, $friendId);
} else {
    if ($requestMethod === 'GET') {
        // Получение списка последних сообщений
        getRecentMessages($db);
    } else if ($requestMethod === 'POST') {
        // Отправка нового сообщения
        sendMessage($db);
    } else {
        sendError('Method not allowed', 405);
    }
}

// Получение сообщений с определенным пользователем
function getMessagesByFriend($db, $friendId) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    $currentUserId = getCurrentUserId();
    
    // Проверяем, являются ли пользователи друзьями
    $status = getFriendshipStatus($currentUserId, $friendId, $db);
    
    if ($status !== 'friends') {
        sendError('You can only view messages from friends', 403);
    }
    
    // Получаем сообщения
    $stmt = $db->prepare("
        SELECT * FROM messages 
        WHERE (sender_id = ? AND recipient_id = ?) 
        OR (sender_id = ? AND recipient_id = ?)
        ORDER BY created_at ASC
    ");
    $stmt->bind_param("iiii", $currentUserId, $friendId, $friendId, $currentUserId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $messages = [];
    while ($message = $result->fetch_assoc()) {
        $messages[] = $message;
    }
    
    // Отмечаем сообщения как прочитанные
    $stmt = $db->prepare("
        UPDATE messages 
        SET is_read = 1 
        WHERE sender_id = ? AND recipient_id = ? AND is_read = 0
    ");
    $stmt->bind_param("ii", $friendId, $currentUserId);
    $stmt->execute();
    
    sendResponse($messages);
}

// Получение списка последних сообщений
function getRecentMessages($db) {
    $currentUserId = getCurrentUserId();
    
    // Получаем последние сообщения от каждого собеседника
    $stmt = $db->prepare("
        SELECT m.*, u.name, u.avatar
        FROM (
            SELECT MAX(id) as max_id
            FROM messages
            WHERE sender_id = ? OR recipient_id = ?
            GROUP BY 
                CASE 
                    WHEN sender_id = ? THEN recipient_id
                    ELSE sender_id
                END
        ) as latest
        JOIN messages m ON m.id = latest.max_id
        JOIN users u ON (m.sender_id = u.id AND m.sender_id != ?) OR (m.recipient_id = u.id AND m.recipient_id != ?)
        ORDER BY m.created_at DESC
    ");
    $stmt->bind_param("iiiii", $currentUserId, $currentUserId, $currentUserId, $currentUserId, $currentUserId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $conversations = [];
    while ($message = $result->fetch_assoc()) {
        $friend = [
            'id' => ($message['sender_id'] == $currentUserId) ? $message['recipient_id'] : $message['sender_id'],
            'name' => $message['name'],
            'avatar' => $message['avatar']
        ];
        
        unset($message['name']);
        unset($message['avatar']);
        
        $conversations[] = [
            'friend' => $friend,
            'last_message' => $message
        ];
    }
    
    sendResponse($conversations);
}

// Отправка нового сообщения
function sendMessage($db) {
    $currentUserId = getCurrentUserId();
    $data = getRequestData();
    
    // Проверяем обязательные поля
    if (empty($data['recipient_id']) || empty($data['content'])) {
        sendError('Recipient ID and content are required');
    }
    
    $recipientId = intval($data['recipient_id']);
    $content = $db->escapeString($data['content']);
    
    // Проверяем, существует ли получатель
    if (!userExists($recipientId, $db)) {
        sendError('Recipient not found', 404);
    }
    
    // Проверяем, являются ли пользователи друзьями
    $status = getFriendshipStatus($currentUserId, $recipientId, $db);
    
    if ($status !== 'friends') {
        sendError('You can only send messages to friends', 403);
    }
    
    // Отправляем сообщение
    $stmt = $db->prepare("
        INSERT INTO messages (sender_id, recipient_id, content) 
        VALUES (?, ?, ?)
    ");
    $stmt->bind_param("iis", $currentUserId, $recipientId, $content);
    
    if ($stmt->execute()) {
        $messageId = $db->getLastInsertId();
        
        // Получаем отправленное сообщение
        $stmt = $db->prepare("SELECT * FROM messages WHERE id = ?");
        $stmt->bind_param("i", $messageId);
        $stmt->execute();
        $result = $stmt->get_result();
        $message = $result->fetch_assoc();
        
        sendResponse($message, 201);
    } else {
        sendError('Failed to send message');
    }
}
?>