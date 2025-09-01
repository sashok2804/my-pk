<?php
// posts.php - api/posts.php - API для работы с постами с JWT
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
$postId = isset($_GET['id']) ? intval($_GET['id']) : null;
$action = isset($_GET['action']) ? $_GET['action'] : '';
$userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

// Обработка запросов
if ($postId) {
    // Запросы к конкретному посту
    switch ($requestMethod) {
        case 'GET':
            getPostById($db, $postId);
            break;
        case 'PUT':
            updatePost($db, $postId);
            break;
        case 'DELETE':
            deletePost($db, $postId);
            break;
        default:
            // Проверяем дополнительные действия
            if ($action === 'like') {
                handleLike($db, $postId);
            } else if ($action === 'comments') {
                handleComments($db, $postId);
            } else if ($action === 'repost') {
                handleRepost($db, $postId);
            } else {
                sendError('Method not allowed', 405);
            }
    }
} else if ($userId) {
    // Получение постов пользователя
    getUserPosts($db, $userId);
} else {
    // Запросы к списку постов
    switch ($requestMethod) {
        case 'GET':
            getPosts($db);
            break;
        case 'POST':
            createPost($db);
            break;
        default:
            sendError('Method not allowed', 405);
    }
}

// Получение поста по ID
function getPostById($db, $postId) {
    $stmt = $db->prepare("SELECT * FROM posts WHERE id = ?");
    $stmt->bind_param("i", $postId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Post not found', 404);
    }
    
    $post = $result->fetch_assoc();
    $post = enrichPost($post, $db);
    
    sendResponse($post);
}

// Получение ленты постов
function getPosts($db) {
    $currentUserId = getCurrentUserId();
    
    // Получаем посты друзей и свои посты
    $stmt = $db->prepare("
        SELECT p.*
        FROM posts p
        WHERE p.user_id = ?
        OR p.user_id IN (
            SELECT IF(f.user_id = ?, f.friend_id, f.user_id)
            FROM friendships f
            WHERE (f.user_id = ? OR f.friend_id = ?)
            AND f.status = 'accepted'
        )
        ORDER BY p.created_at DESC
        LIMIT 50
    ");
    $stmt->bind_param("iiii", $currentUserId, $currentUserId, $currentUserId, $currentUserId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $posts = [];
    while ($post = $result->fetch_assoc()) {
        $posts[] = enrichPost($post, $db);
    }
    
    sendResponse($posts);
}

// Получение постов пользователя
function getUserPosts($db, $userId) {
    // Проверяем существование пользователя
    if (!userExists($userId, $db)) {
        sendError('User not found', 404);
    }
    
    $stmt = $db->prepare("
        SELECT * FROM posts 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $posts = [];
    while ($post = $result->fetch_assoc()) {
        $posts[] = enrichPost($post, $db);
    }
    
    sendResponse($posts);
}

// Создание поста
function createPost($db) {
    $currentUserId = getCurrentUserId();
    $data = getRequestData();
    
    // Проверяем обязательные поля
    if (empty($data['content'])) {
        sendError('Content is required');
    }
    
    $content = $db->escapeString($data['content']);
    $image = isset($data['image']) ? $db->escapeString($data['image']) : null;
    
    $stmt = $db->prepare("INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $currentUserId, $content, $image);
    
    if ($stmt->execute()) {
        $postId = $db->getLastInsertId();
        
        // Получаем созданный пост
        $stmt = $db->prepare("SELECT * FROM posts WHERE id = ?");
        $stmt->bind_param("i", $postId);
        $stmt->execute();
        $result = $stmt->get_result();
        $post = $result->fetch_assoc();
        
        $post = enrichPost($post, $db);
        
        sendResponse($post, 201);
    } else {
        sendError('Failed to create post');
    }
}

// Обновление поста
function updatePost($db, $postId) {
    $currentUserId = getCurrentUserId();
    
    // Проверяем, является ли пользователь владельцем поста или админом
    if (!isPostOwner($postId, $currentUserId, $db) && !isAdmin()) {
        sendError('Permission denied', 403);
    }
    
    $data = getRequestData();
    
    // Проверяем обязательные поля
    if (empty($data['content'])) {
        sendError('Content is required');
    }
    
    $content = $db->escapeString($data['content']);
    $image = isset($data['image']) ? $db->escapeString($data['image']) : null;
    
    $stmt = $db->prepare("UPDATE posts SET content = ?, image = ? WHERE id = ?");
    $stmt->bind_param("ssi", $content, $image, $postId);
    
    if ($stmt->execute()) {
        // Получаем обновленный пост
        $stmt = $db->prepare("SELECT * FROM posts WHERE id = ?");
        $stmt->bind_param("i", $postId);
        $stmt->execute();
        $result = $stmt->get_result();
        $post = $result->fetch_assoc();
        
        $post = enrichPost($post, $db);
        
        sendResponse($post);
    } else {
        sendError('Failed to update post');
    }
}

// Удаление поста
function deletePost($db, $postId) {
    $currentUserId = getCurrentUserId();
    
    // Проверяем, является ли пользователь владельцем поста или админом
    if (!isPostOwner($postId, $currentUserId, $db) && !isAdmin()) {
        sendError('Permission denied', 403);
    }
    
    $stmt = $db->prepare("DELETE FROM posts WHERE id = ?");
    $stmt->bind_param("i", $postId);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Post deleted successfully']);
    } else {
        sendError('Failed to delete post');
    }
}

// Обработка лайков
function handleLike($db, $postId) {
    $currentUserId = getCurrentUserId();
    
    // Проверяем существование поста
    $stmt = $db->prepare("SELECT id FROM posts WHERE id = ?");
    $stmt->bind_param("i", $postId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Post not found', 404);
    }
    
    // Проверяем, есть ли уже лайк от пользователя
    $stmt = $db->prepare("
        SELECT id FROM post_likes 
        WHERE post_id = ? AND user_id = ?
    ");
    $stmt->bind_param("ii", $postId, $currentUserId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // Если лайк уже есть, удаляем его (toggle)
        $stmt = $db->prepare("
            DELETE FROM post_likes 
            WHERE post_id = ? AND user_id = ?
        ");
        $stmt->bind_param("ii", $postId, $currentUserId);
        $stmt->execute();
        
        sendResponse(['message' => 'Like removed']);
    } else {
        // Если лайка нет, добавляем
        $stmt = $db->prepare("
            INSERT INTO post_likes (post_id, user_id) 
            VALUES (?, ?)
        ");
        $stmt->bind_param("ii", $postId, $currentUserId);
        $stmt->execute();
        
        sendResponse(['message' => 'Post liked']);
    }
}

// Обработка комментариев
function handleComments($db, $postId) {
    $currentUserId = getCurrentUserId();
    
    // Проверяем существование поста
    $stmt = $db->prepare("SELECT id FROM posts WHERE id = ?");
    $stmt->bind_param("i", $postId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Post not found', 404);
    }
    
    // Обработка в зависимости от метода запроса
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Получение комментариев к посту
        $stmt = $db->prepare("
            SELECT c.*, u.name, u.avatar 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        ");
        $stmt->bind_param("i", $postId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $comments = [];
        while ($comment = $result->fetch_assoc()) {
            $comment['user'] = [
                'id' => $comment['user_id'],
                'name' => $comment['name'],
                'avatar' => $comment['avatar']
            ];
            unset($comment['name']);
            unset($comment['avatar']);
            
            $comments[] = $comment;
        }
        
        sendResponse($comments);
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Добавление комментария
        $data = getRequestData();
        
        if (empty($data['content'])) {
            sendError('Comment content is required');
        }
        
        $content = $db->escapeString($data['content']);
        
        $stmt = $db->prepare("
            INSERT INTO comments (post_id, user_id, content) 
            VALUES (?, ?, ?)
        ");
        $stmt->bind_param("iis", $postId, $currentUserId, $content);
        
        if ($stmt->execute()) {
            $commentId = $db->getLastInsertId();
            
            // Получаем добавленный комментарий
            $stmt = $db->prepare("
                SELECT c.*, u.name, u.avatar 
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.id = ?
            ");
            $stmt->bind_param("i", $commentId);
            $stmt->execute();
            $result = $stmt->get_result();
            $comment = $result->fetch_assoc();
            
            $comment['user'] = [
                'id' => $comment['user_id'],
                'name' => $comment['name'],
                'avatar' => $comment['avatar']
            ];
            unset($comment['name']);
            unset($comment['avatar']);
            
            sendResponse($comment, 201);
        } else {
            sendError('Failed to add comment');
        }
    } else {
        sendError('Method not allowed', 405);
    }
}

// Обработка репостов
function handleRepost($db, $postId) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    $currentUserId = getCurrentUserId();
    
    // Проверяем существование поста
    $stmt = $db->prepare("SELECT id, user_id FROM posts WHERE id = ?");
    $stmt->bind_param("i", $postId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Post not found', 404);
    }
    
    $post = $result->fetch_assoc();
    
    // Проверяем, не делает ли пользователь репост своего поста
    if ($post['user_id'] == $currentUserId) {
        sendError('You cannot repost your own post');
    }
    
    // Создаем репост
    $stmt = $db->prepare("
        INSERT INTO posts (user_id, content, original_post_id) 
        VALUES (?, 'Поделился постом', ?)
    ");
    $stmt->bind_param("ii", $currentUserId, $postId);
    
    if ($stmt->execute()) {
        $repostId = $db->getLastInsertId();
        
        // Получаем созданный репост
        $stmt = $db->prepare("SELECT * FROM posts WHERE id = ?");
        $stmt->bind_param("i", $repostId);
        $stmt->execute();
        $result = $stmt->get_result();
        $repost = $result->fetch_assoc();
        
        $repost = enrichPost($repost, $db);
        
        sendResponse($repost, 201);
    } else {
        sendError('Failed to repost');
    }
}
?>