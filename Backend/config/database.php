<?php

$dsn = "pgsql:host=ep-silent-bush-ad841qa5-pooler.c-2.us-east-1.aws.neon.tech;port=5432;dbname=portfolio;sslmode=require";
$user = "neondb_owner";
$pass = "npg_oWiRh76Uudvs";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    echo "Connected to Neon PostgreSQL successfully!";

    // Create tables (PostgreSQL versions)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_info (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            title VARCHAR(100),
            bio TEXT,
            email VARCHAR(150) NOT NULL,
            phones JSONB,
            locations JSONB,
            socials JSONB,
            profile_image VARCHAR(255),
            gallery_images JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS skills (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50),
            logo VARCHAR(255),
            category VARCHAR(50),
            proficiency INT DEFAULT 70,
            display_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            title VARCHAR(150),
            description TEXT,
            image VARCHAR(255),
            url VARCHAR(255),
            github_url VARCHAR(255),
            technologies TEXT,
            display_order INT DEFAULT 0,
            featured BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS contact_messages (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100),
            subject VARCHAR(200),
            message TEXT,
            read_status BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ");

    echo "<br>Tables created successfully!";

} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}
?>

