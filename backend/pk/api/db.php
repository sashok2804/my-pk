<?php
// db.php - api/db.php - Файл для подключения к базе данных MySQL
require_once 'config.php';

class Database {
    private $host = DB_HOST;
    private $user = DB_USER;
    private $pass = DB_PASS;
    private $dbname = DB_NAME;
    
    private $conn;
    private $error;
    
    public function __construct() {
        // Устанавливаем соединение с базой данных
        $this->conn = new mysqli($this->host, $this->user, $this->pass, $this->dbname);
        
        // Проверяем соединение
        if ($this->conn->connect_error) {
            $this->error = 'Database Connection Error: ' . $this->conn->connect_error;
            error_log($this->error);
            die(json_encode(['error' => 'Database connection failed']));
        }
        
        // Устанавливаем кодировку
        $this->conn->set_charset('utf8');
    }
    
    // Получить соединение с базой данных
    public function getConnection() {
        return $this->conn;
    }
    
    // Подготовить SQL запрос
    public function prepare($sql) {
        return $this->conn->prepare($sql);
    }
    
    // Выполнить простой запрос
    public function query($sql) {
        return $this->conn->query($sql);
    }
    
    // Экранирование строки для предотвращения SQL-инъекций
    public function escapeString($string) {
        return $this->conn->real_escape_string($string);
    }
    
    // Получить ID последней вставленной записи
    public function getLastInsertId() {
        return $this->conn->insert_id;
    }
    
    // Получить количество затронутых строк
    public function getAffectedRows() {
        return $this->conn->affected_rows;
    }
    
    // Закрыть соединение
    public function close() {
        $this->conn->close();
    }
    
    // Получить сообщение об ошибке
    public function getError() {
        return $this->conn->error;
    }
}
?>