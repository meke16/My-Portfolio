<?php
// Database configuration
// $db_host = getenv('PGHOST');
// $db_port = getenv('PGPORT');
// $db_name = getenv('PGDATABASE');
// $db_user = getenv('PGUSER');
// $db_pass = getenv('PGPASSWORD');
$db_host = "127.0.0.1";
$db_port = 3306;
$db_name = "portfolio";
$db_user = "root";
$db_pass = "Adey@@1997";


try {
    $pdo = new PDO(
        "mysql:host=$db_host;port=$db_port;dbname=$db_name",
        $db_user,
        $db_pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch(PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
