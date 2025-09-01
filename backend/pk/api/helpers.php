<?php
// helpers.php - api/helpers.php - Вспомогательные функции для работы приложения с JWT

// Простая реализация JWT
class SimpleJWT {
    public static function encode($payload, $secret, $algorithm = 'HS256') {
        $header = json_encode(['typ' => 'JWT', 'alg' => $algorithm]);
        $payload = json_encode($payload);
        
        $headerEncoded = self::base64UrlEncode($header);
        $payloadEncoded = self::base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $secret, true);
        $signatureEncoded = self::base64UrlEncode($signature);
        
        return $headerEncoded . '.' . $payloadEncoded . '.' . $signatureEncoded;
    }
    
    public static function decode($jwt, $secret) {
        $parts = explode('.', $jwt);
        
        if (count($parts) !== 3) {
            return false;
        }
        
        list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;
        
        $header = json_decode(self::base64UrlDecode($headerEncoded), true);
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);
        
        if (!$header || !$payload) {
            return false;
        }
        
        // Проверяем подпись
        $signature = self::base64UrlDecode($signatureEncoded);
        $expectedSignature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $secret, true);
        
        if (!hash_equals($signature, $expectedSignature)) {
            return false;
        }
        
        // Проверяем время истечения
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }
    
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    private static function base64UrlDecode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
}

// Получение JWT токена из заголовков
function getJWTFromHeaders() {
    $headers = getallheaders();
    
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}

// Создание JWT токена для пользователя
function createJWTToken($userId, $userRole = 'user') {
    $payload = [
        'iss' => APP_NAME,
        'iat' => time(),
        'exp' => time() + JWT_EXPIRATION,
        'user_id' => $userId,
        'user_role' => $userRole
    ];
    
    return SimpleJWT::encode($payload, JWT_SECRET, JWT_ALGORITHM);
}

// Проверка и декодирование JWT токена
function verifyJWTToken($token) {
    try {
        $payload = SimpleJWT::decode($token, JWT_SECRET);
        
        if (!$payload) {
            error_log("JWT: Invalid token structure");
            return false;
        }
        
        error_log("JWT: Token verified successfully for user " . $payload['user_id']);
        return $payload;
    } catch (Exception $e) {
        error_log("JWT: Token verification failed - " . $e->getMessage());
        return false;
    }
}

// Проверка авторизации пользователя через JWT
function isAuthenticated() {
    $token = getJWTFromHeaders();
    
    error_log("=== isAuthenticated DEBUG ===");
    error_log("Token from headers: " . ($token ? 'PRESENT' : 'NOT FOUND'));
    
    if (!$token) {
        error_log("No JWT token found in headers");
        return false;
    }
    
    $payload = verifyJWTToken($token);
    
    if (!$payload) {
        error_log("JWT token verification failed");
        return false;
    }
    
    // Сохраняем данные пользователя в глобальных переменных для текущего запроса
    global $currentUserId, $currentUserRole;
    $currentUserId = $payload['user_id'];
    $currentUserRole = $payload['user_role'] ?? 'user';
    
    error_log("Authentication successful for user: " . $currentUserId);
    error_log("=== END isAuthenticated DEBUG ===");
    
    return true;
}

// Получение ID текущего пользователя
function getCurrentUserId() {
    global $currentUserId;
    
    if (!isset($currentUserId)) {
        $token = getJWTFromHeaders();
        if ($token) {
            $payload = verifyJWTToken($token);
            if ($payload) {
                $currentUserId = $payload['user_id'];
            }
        }
    }
    
    error_log("getCurrentUserId: " . ($currentUserId ?? 'NULL'));
    return $currentUserId ?? null;
}

// Проверка роли пользователя
function isAdmin() {
    global $currentUserRole;
    
    if (!isset($currentUserRole)) {
        $token = getJWTFromHeaders();
        if ($token) {
            $payload = verifyJWTToken($token);
            if ($payload) {
                $currentUserRole = $payload['user_role'] ?? 'user';
            }
        }
    }
    
    $isAdmin = isset($currentUserRole) && $currentUserRole === 'admin';
    error_log("isAdmin: " . ($isAdmin ? 'YES' : 'NO') . " (role: " . ($currentUserRole ?? 'NOT SET') . ")");
    return $isAdmin;
}

// Получение данных из запроса
function getRequestData() {
    // Для GET запросов
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        return $_GET;
    }
    
    // Для POST, PUT, DELETE запросов
    $contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
    
    if (strpos($contentType, 'application/json') !== false) {
        // Если JSON данные
        $json = file_get_contents('php://input');
        $data = json_decode($json, true) ?: [];
        error_log("Request data (JSON): " . json_encode($data));
        return $data;
    } else {
        // Если форма
        error_log("Request data (POST): " . json_encode($_POST));
        return $_POST;
    }
}

// Отправка JSON ответа
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    
    // Устанавливаем content-type только если он еще не установлен
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
    }
    
    error_log("Sending response: " . json_encode($data));
    echo json_encode($data);
    exit;
}

// Отправка ошибки
function sendError($message, $statusCode = 400) {
    error_log("Sending error: $message (code: $statusCode)");
    sendResponse(['error' => $message], $statusCode);
}

// Защита от SQL-инъекций
function sanitizeInput($input, $db) {
    if (is_array($input)) {
        foreach ($input as $key => $value) {
            $input[$key] = sanitizeInput($value, $db);
        }
    } else {
        $input = $db->escapeString(trim($input));
    }
    return $input;
}

// Проверка существования пользователя
function userExists($userId, $db) {
    $stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->num_rows > 0;
}

// Получение информации о пользователе
function getUserInfo($userId, $db, $includePrivate = false) {
    $sql = "SELECT id, name, email, avatar, status, role, created_at FROM users WHERE id = ?";
    
    $stmt = $db->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return null;
    }
    
    $user = $result->fetch_assoc();
    
    // Если не запрашиваются приватные данные, удаляем email для обычных пользователей
    if (!$includePrivate && getCurrentUserId() != $userId && !isAdmin()) {
        unset($user['email']);
    }
    
    return $user;
}

// Получение количества друзей пользователя
function getFriendsCount($userId, $db) {
    $stmt = $db->prepare("
        SELECT COUNT(*) as count FROM friendships 
        WHERE (user_id = ? OR friend_id = ?) 
        AND status = 'accepted'
    ");
    $stmt->bind_param("ii", $userId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    return $row['count'];
}

// Получение статуса дружбы между пользователями
function getFriendshipStatus($userId, $friendId, $db) {
    $stmt = $db->prepare("
        SELECT * FROM friendships 
        WHERE (user_id = ? AND friend_id = ?) 
        OR (user_id = ? AND friend_id = ?)
    ");
    $stmt->bind_param("iiii", $userId, $friendId, $friendId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return null;
    }
    
    $friendship = $result->fetch_assoc();
    
    if ($friendship['status'] === 'accepted') {
        return 'friends';
    } else if ($friendship['user_id'] == $userId) {
        return 'pending_sent';
    } else {
        return 'pending_received';
    }
}

// Обогащение данных поста
function enrichPost($post, $db) {
    // Добавляем информацию о пользователе
    $post['user'] = getUserInfo($post['user_id'], $db);
    
    // Получаем лайки
    $stmt = $db->prepare("SELECT user_id FROM post_likes WHERE post_id = ?");
    $stmt->bind_param("i", $post['id']);
    $stmt->execute();
    $likesResult = $stmt->get_result();
    $post['likes'] = [];
    
    while ($like = $likesResult->fetch_assoc()) {
        $post['likes'][] = $like;
    }
    
    // Проверяем, лайкнул ли текущий пользователь пост
    $currentUserId = getCurrentUserId();
    $post['liked_by_current_user'] = false;
    
    if ($currentUserId) {
        foreach ($post['likes'] as $like) {
            if ($like['user_id'] == $currentUserId) {
                $post['liked_by_current_user'] = true;
                break;
            }
        }
    }
    
    // Получаем комментарии
    $stmt = $db->prepare("
        SELECT c.*, u.name, u.avatar 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    ");
    $stmt->bind_param("i", $post['id']);
    $stmt->execute();
    $commentsResult = $stmt->get_result();
    $post['comments'] = [];
    
    while ($comment = $commentsResult->fetch_assoc()) {
        $comment['user'] = [
            'id' => $comment['user_id'],
            'name' => $comment['name'],
            'avatar' => $comment['avatar']
        ];
        unset($comment['name']);
        unset($comment['avatar']);
        
        $post['comments'][] = $comment;
    }
    
    // Если это репост, получаем оригинальный пост
    if (isset($post['original_post_id']) && $post['original_post_id']) {
        $stmt = $db->prepare("SELECT * FROM posts WHERE id = ?");
        $stmt->bind_param("i", $post['original_post_id']);
        $stmt->execute();
        $originalPostResult = $stmt->get_result();
        
        if ($originalPostResult->num_rows > 0) {
            $originalPost = $originalPostResult->fetch_assoc();
            $post['original_post'] = enrichPost($originalPost, $db);
        }
    }
    
    return $post;
}

// Проверка владельца поста
function isPostOwner($postId, $userId, $db) {
    $stmt = $db->prepare("SELECT user_id FROM posts WHERE id = ?");
    $stmt->bind_param("i", $postId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return false;
    }
    
    $post = $result->fetch_assoc();
    return $post['user_id'] == $userId;
}
?>