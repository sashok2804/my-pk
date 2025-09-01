<?php
// index.php - api/index.php - Главный файл API для маршрутизации запросов с JWT

// Устанавливаем CORS заголовки для всех запросов
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowed_origins = [
    'http://localhost:3000', 
    'http://localhost',
    'http://vk.local',
    'http://vk.local:3000'
];

if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Если это запрос OPTIONS (preflight), завершаем выполнение
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Логирование для отладки
error_log("=== API REQUEST START ===");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("URI: " . $_SERVER['REQUEST_URI']);
error_log("Origin: " . $origin);
error_log("Query String: " . ($_SERVER['QUERY_STRING'] ?? 'empty'));

// Логируем заголовки авторизации
$headers = getallheaders();
if (isset($headers['Authorization'])) {
    error_log("Authorization header present: " . substr($headers['Authorization'], 0, 20) . "...");
} else {
    error_log("No Authorization header found");
}

// Получаем URL запроса
$request_uri = $_SERVER['REQUEST_URI'];

// Удаляем параметры запроса из URL
$request_path = strtok($request_uri, '?');

// Логируем путь
error_log("Request Path: " . $request_path);

// Если путь начинается с /api/, убираем этот префикс
if (strpos($request_path, '/api/') === 0) {
    $api_path = substr($request_path, 5); // Убираем "/api/"
} else {
    $api_path = ltrim($request_path, '/');
}

error_log("API Path: " . $api_path);

// Если путь пустой, возвращаем информацию об API
if (empty($api_path)) {
    echo json_encode([
        'message' => 'PK Social Network API with JWT',
        'version' => '2.0',
        'auth_type' => 'JWT Bearer Token',
        'endpoints' => ['auth', 'users', 'posts', 'friends', 'messages', 'admin']
    ]);
    exit;
}

// Разбиваем путь на сегменты
$segments = explode('/', $api_path);
$endpoint = $segments[0];

error_log("Endpoint: " . $endpoint);
error_log("Segments: " . json_encode($segments));

// Устанавливаем GET-параметры на основе URL
switch ($endpoint) {
    case 'auth':
        // URL: /api/auth/ACTION
        $_GET['action'] = $segments[1] ?? '';
        error_log("Auth action: " . $_GET['action']);
        
        if (file_exists('auth.php')) {
            include 'auth.php';
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Auth module not found']);
        }
        break;
    
    case 'users':
        // URL: /api/users/ID или /api/users/search
        if (isset($segments[1])) {
            if ($segments[1] === 'search') {
                $_GET['action'] = 'search';
            } else {
                $_GET['id'] = $segments[1];
            }
        }
        
        if (file_exists('users.php')) {
            include 'users.php';
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Users module not found']);
        }
        break;
    
    case 'posts':
        // URL: /api/posts/ID или /api/posts/user/USER_ID или /api/posts/ID/ACTION
        if (isset($segments[1])) {
            if ($segments[1] === 'user' && isset($segments[2])) {
                $_GET['user_id'] = $segments[2];
            } else {
                $_GET['id'] = $segments[1];
                
                if (isset($segments[2])) {
                    $_GET['action'] = $segments[2];
                }
            }
        }
        
        if (file_exists('posts.php')) {
            include 'posts.php';
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Posts module not found']);
        }
        break;
    
    case 'friends':
        // URL: /api/friends/ACTION/ID
        if (isset($segments[1])) {
            if (in_array($segments[1], ['request', 'accept', 'reject', 'status']) && isset($segments[2])) {
                $_GET['action'] = $segments[1];
                $_GET['friend_id'] = $segments[2];
            } else if (in_array($segments[1], ['requests', 'suggestions'])) {
                $_GET['action'] = $segments[1];
            } else {
                $_GET['friend_id'] = $segments[1];
            }
        }
        
        if (file_exists('friends.php')) {
            include 'friends.php';
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Friends module not found']);
        }
        break;
    
    case 'messages':
        // URL: /api/messages/FRIEND_ID
        if (isset($segments[1])) {
            $_GET['friend_id'] = $segments[1];
        }
        
        if (file_exists('messages.php')) {
            include 'messages.php';
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Messages module not found']);
        }
        break;
    
    case 'admin':
        // URL: /api/admin/ACTION или /api/admin/ACTION/ID
        if (isset($segments[1])) {
            $_GET['action'] = $segments[1];
            
            if (isset($segments[2])) {
                if ($_GET['action'] === 'users') {
                    $_GET['user_id'] = $segments[2];
                    
                    if (isset($segments[3]) && $segments[3] === 'role') {
                        $_GET['set_role'] = true;
                    }
                } else if ($_GET['action'] === 'posts') {
                    $_GET['post_id'] = $segments[2];
                }
            }
        }
        
        if (file_exists('admin.php')) {
            include 'admin.php';
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Admin module not found']);
        }
        break;
    
    default:
        // Если эндпоинт не найден, возвращаем ошибку
        error_log("Unknown endpoint: " . $endpoint);
        http_response_code(404);
        echo json_encode([
            'error' => 'API endpoint not found', 
            'endpoint' => $endpoint,
            'path' => $api_path,
            'available_endpoints' => ['auth', 'users', 'posts', 'friends', 'messages', 'admin']
        ]);
        exit;
}

error_log("=== API REQUEST END ===");
?>