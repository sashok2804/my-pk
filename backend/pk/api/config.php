<?php
// config.php - api/config.php - Файл с настройками подключения к базе данных и JWT

// Настройки базы данных
define('DB_HOST', 'localhost');
define('DB_USER', 'root'); // Имя пользователя БД
define('DB_PASS', ''); // Пароль БД
define('DB_NAME', 'social_network'); // Имя базы данных

// Настройки приложения
define('APP_NAME', 'PK Social Network');

// JWT настройки
define('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRATION', 3600 * 24 * 7); // 7 дней в секундах

// Устанавливаем временную зону
date_default_timezone_set('Europe/Moscow');

// Логирование для отладки
error_log("=== CONFIG LOADED ===");
error_log("JWT Secret configured: " . (defined('JWT_SECRET') ? 'YES' : 'NO'));
error_log("=== END CONFIG ===");
?>