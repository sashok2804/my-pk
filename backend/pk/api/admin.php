<?php
// admin.php - api/admin.php - API для админ-панели с JWT
require_once 'db.php';
require_once 'helpers.php';

// Проверяем авторизацию
if (!isAuthenticated()) {
    sendError('Unauthorized', 401);
}

// Проверяем права администратора
if (!isAdmin()) {
    sendError('Access denied. Admin rights required', 403);
}

// Создаем экземпляр базы данных
$db = new Database();

// Определяем действие на основе URL и метода запроса
$requestMethod = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
$postId = isset($_GET['post_id']) ? intval($_GET['post_id']) : null;

// Обработка запросов
switch ($action) {
    case 'stats':
        getStats($db);
        break;
    case 'users':
        if ($userId) {
            if ($requestMethod === 'DELETE') {
                deleteUser($db, $userId);
            } else if ($requestMethod === 'PUT' && isset($_GET['set_role'])) {
                setUserRole($db, $userId);
            } else {
                sendError('Method not allowed', 405);
            }
        } else {
            getUsers($db);
        }
        break;
    case 'posts':
        if ($postId) {
            if ($requestMethod === 'DELETE') {
                deletePost($db, $postId);
            } else {
                sendError('Method not allowed', 405);
            }
        } else {
            getPosts($db);
        }
        break;
    default:
        sendError('Invalid action', 404);
}

// Получение статистики
function getStats($db) {
    // Общее количество пользователей
    $totalUsers = $db->query("SELECT COUNT(*) as count FROM users")->fetch_assoc()['count'];
    
    // Общее количество постов
    $totalPosts = $db->query("SELECT COUNT(*) as count FROM posts")->fetch_assoc()['count'];
    
    // Общее количество комментариев
    $totalComments = $db->query("SELECT COUNT(*) as count FROM comments")->fetch_assoc()['count'];
    
    // Количество новых пользователей за сегодня
    $today = date('Y-m-d 00:00:00');
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE created_at >= ?");
    $stmt->bind_param("s", $today);
    $stmt->execute();
    $newUsersToday = $stmt->get_result()->fetch_assoc()['count'];
    
    // Количество новых постов за сегодня
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM posts WHERE created_at >= ?");
    $stmt->bind_param("s", $today);
    $stmt->execute();
    $newPostsToday = $stmt->get_result()->fetch_assoc()['count'];
    
    sendResponse([
        'totalUsers' => (int)$totalUsers,
        'totalPosts' => (int)$totalPosts,
        'totalComments' => (int)$totalComments,
        'newUsersToday' => (int)$newUsersToday,
        'newPostsToday' => (int)$newPostsToday
    ]);
}

// Получение списка пользователей
function getUsers($db) {
    $query = "
        SELECT id, name, email, avatar, status, role, created_at, updated_at
        FROM users
        ORDER BY id DESC
    ";
    
    $result = $db->query($query);
    
    $users = [];
    while ($user = $result->fetch_assoc()) {
        $users[] = $user;
    }
    
    sendResponse($users);
}

// Удаление пользователя
function deleteUser($db, $userId) {
    // Запрещаем удалять самого себя
    if ($userId === getCurrentUserId()) {
        sendError('You cannot delete your own account through admin panel');
    }
    
    // Проверяем существование пользователя
    if (!userExists($userId, $db)) {
        sendError('User not found', 404);
    }
    
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'User deleted successfully']);
    } else {
        sendError('Failed to delete user');
    }
}

// Изменение роли пользователя
function setUserRole($db, $userId) {
    // Запрещаем менять роль самому себе
    if ($userId === getCurrentUserId()) {
        sendError('You cannot change your own role');
    }
    
    // Проверяем существование пользователя
    if (!userExists($userId, $db)) {
        sendError('User not found', 404);
    }
    
    $data = getRequestData();
    
    if (empty($data['role']) || !in_array($data['role'], ['user', 'admin'])) {
        sendError('Invalid role. Must be "user" or "admin"');
    }
    
    $role = $db->escapeString($data['role']);
    
    $stmt = $db->prepare("UPDATE users SET role = ? WHERE id = ?");
    $stmt->bind_param("si", $role, $userId);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'User role updated successfully']);
    } else {
        sendError('Failed to update user role');
    }
}

// Получение списка постов
function getPosts($db) {
    $query = "
        SELECT p.*, u.name, u.avatar,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
    ";
    
    $result = $db->query($query);
    
    $posts = [];
    while ($post = $result->fetch_assoc()) {
        $post['user'] = [
            'id' => $post['user_id'],
            'name' => $post['name'],
            'avatar' => $post['avatar']
        ];
        
        unset($post['name']);
        unset($post['avatar']);
        
        $posts[] = $post;
    }
    
    sendResponse($posts);
}

// Удаление поста
function deletePost($db, $postId) {
    // Проверяем существование поста
    $stmt = $db->prepare("SELECT id FROM posts WHERE id = ?");
    $stmt->bind_param("i", $postId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Post not found', 404);
    }
    
    $stmt = $db->prepare("DELETE FROM posts WHERE id = ?");
    $stmt->bind_param("i", $postId);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Post deleted successfully']);
    } else {
        sendError('Failed to delete post');
    }
}
?>