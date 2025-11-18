<?php
$db_host = "127.0.0.1";
$db_port = 3306;
$db_name = "portfolio";
$db_user = "root";
$db_pass = "Adey@@1997";

try {
    // Connect without specifying a DB
    $pdo = new PDO(
        "mysql:host=$db_host;port=$db_port",
        $db_user,
        $db_pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Check if database exists
    $stmt = $pdo->query("SHOW DATABASES LIKE '$db_name'");
    if ($stmt->rowCount() === 0) {
        // Database does not exist → create it
        $pdo->exec("CREATE DATABASE `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE `$db_name`");

        // Create tables
        $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS portfolio_info (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            title VARCHAR(150),
            bio TEXT,
            email VARCHAR(100),
            phone VARCHAR(20),
            location VARCHAR(100),
            github VARCHAR(100),
            linkedin VARCHAR(100),
            twitter VARCHAR(100),
            profile_image VARCHAR(255) DEFAULT 'assets/images/developer.jpg',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS skills (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50),
            logo VARCHAR(255),
            category VARCHAR(50),
            proficiency INT DEFAULT 70,
            display_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(150),
            description TEXT,
            image VARCHAR(255),
            url VARCHAR(255),
            github_url VARCHAR(255),
            technologies TEXT,
            display_order INT DEFAULT 0,
            featured BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100),
            subject VARCHAR(200),
            message TEXT,
            read_status BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ");

        // Redirect to registration page after DB is created
        header("Location: register.php");
        exit;
    } else {
        // Database exists → connect normally
        $pdo->exec("USE `$db_name`");
        // echo "Database '$db_name' already exists. You can proceed.";
    }
} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}
