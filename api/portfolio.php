<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config/database.php';

try {
    // Get portfolio info
    $stmt = $pdo->query("SELECT * FROM admin_info ORDER BY id DESC LIMIT 1");
    $info = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get skills
    $stmt = $pdo->query("SELECT * FROM skills ORDER BY id ASC");
    $skills = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get projects
    $stmt = $pdo->query("SELECT * FROM projects ORDER BY  created_at DESC");
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'info' => $info,
        'skills' => $skills,
        'projects' => $projects
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching portfolio data: ' . $e->getMessage()
    ]);
}
?>
