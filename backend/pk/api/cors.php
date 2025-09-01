<?php
// cors.php - api/cors.php - Настройки CORS для всех API-запросов с JWT

// Получаем источник запроса
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Разрешенные домены
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost',
    'http://vk.local',
    'http://vk.local:3000'
];

// Устанавливаем CORS заголовки
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Для разработки можно использовать *
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

// Убираем Access-Control-Allow-Credentials, так как при JWT не нужны credentials

// Если это preflight запрос, завершаем выполнение
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
?>