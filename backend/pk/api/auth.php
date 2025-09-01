<?php
// auth.php - api/auth.php - Обработчик запросов авторизации с JWT

require_once 'db.php';
require_once 'helpers.php';

// Создаем экземпляр базы данных
$db = new Database();

// Определяем действие на основе URL
$action = isset($_GET['action']) ? $_GET['action'] : '';

error_log("=== AUTH REQUEST ===");
error_log("Action: " . $action);
error_log("Method: " . $_SERVER['REQUEST_METHOD']);

switch ($action) {
    case 'register':
        handleRegister($db);
        break;
    case 'login':
        handleLogin($db);
        break;
    case 'logout':
        handleLogout();
        break;
    case 'check':
        handleCheckAuth($db);
        break;
    case 'refresh':
        handleRefreshToken($db);
        break;
    default:
        sendError('Invalid action', 404);
}

// Обработка регистрации
function handleRegister($db) {
    // Проверяем метод запроса
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    // Получаем данные из запроса
    $data = getRequestData();
    
    // Проверяем обязательные поля
    if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
        sendError('Please provide name, email and password');
    }
    
    // Валидируем email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email format');
    }
    
    // Проверяем длину пароля
    if (strlen($data['password']) < 6) {
        sendError('Password must be at least 6 characters long');
    }
    
    // Проверяем, не занят ли email
    $email = $db->escapeString($data['email']);
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        sendError('Email already in use');
    }
    
    // Хешируем пароль
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Добавляем пользователя в базу
    $name = $db->escapeString($data['name']);
    
    $stmt = $db->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $email, $hashedPassword);
    
    if ($stmt->execute()) {
        $userId = $db->getLastInsertId();
        
        // Создаем JWT токен
        $token = createJWTToken($userId, 'user');
        
        // Получаем данные пользователя
        $user = getUserInfo($userId, $db, true);
        
        sendResponse([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => $user
        ], 201);
    } else {
        sendError('Registration failed');
    }
}

// Обработка входа
function handleLogin($db) {
    // Проверяем метод запроса
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    error_log("=== LOGIN ATTEMPT ===");
    
    // Получаем данные из запроса
    $data = getRequestData();
    
    // Проверяем обязательные поля
    if (empty($data['email']) || empty($data['password'])) {
        sendError('Please provide email and password');
    }
    
    // Получаем пользователя по email
    $email = $db->escapeString($data['email']);
    $stmt = $db->prepare("SELECT id, name, email, password, avatar, role FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Invalid credentials', 401);
    }
    
    $user = $result->fetch_assoc();
    
    // Проверяем пароль
    if (!password_verify($data['password'], $user['password'])) {
        sendError('Invalid credentials', 401);
    }
    
    // Создаем JWT токен
    $token = createJWTToken($user['id'], $user['role']);
    
    error_log("=== LOGIN SUCCESS ===");
    error_log("JWT token created for user: " . $user['id']);
    
    // Отправляем успешный ответ
    unset($user['password']); // Удаляем пароль из ответа
    
    sendResponse([
        'message' => 'Login successful',
        'token' => $token,
        'user' => $user
    ]);
}

// Обработка выхода
function handleLogout() {
    // Проверяем метод запроса
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    error_log("=== LOGOUT ===");
    
    // При использовании JWT токенов, логика выхода может быть на клиенте
    // Здесь мы можем добавить токен в blacklist если нужно
    
    sendResponse(['message' => 'Logout successful']);
}

// Проверка авторизации
function handleCheckAuth($db) {
    // Проверяем метод запроса
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    error_log("=== CHECK AUTH ===");
    
    // Проверяем авторизацию через JWT
    if (!isAuthenticated()) {
        sendResponse([
            'authenticated' => false,
            'error' => 'Invalid or expired token'
        ], 401);
        return;
    }
    
    // Получаем данные пользователя
    $userId = getCurrentUserId();
    $user = getUserInfo($userId, $db, true);
    
    if (!$user) {
        sendResponse([
            'authenticated' => false,
            'error' => 'User not found'
        ], 401);
        return;
    }
    
    sendResponse([
        'authenticated' => true,
        'user' => $user
    ]);
}

// Обновление токена
function handleRefreshToken($db) {
    // Проверяем метод запроса
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }
    
    error_log("=== REFRESH TOKEN ===");
    
    // Проверяем текущий токен
    if (!isAuthenticated()) {
        sendError('Invalid token', 401);
    }
    
    $userId = getCurrentUserId();
    $user = getUserInfo($userId, $db, true);
    
    if (!$user) {
        sendError('User not found', 404);
    }
    
    // Создаем новый токен
    $newToken = createJWTToken($user['id'], $user['role']);
    
    sendResponse([
        'message' => 'Token refreshed successfully',
        'token' => $newToken,
        'user' => $user
    ]);
}
?>