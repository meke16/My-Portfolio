<?php
require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/../config/database.php';

// Get statistics
$stmt = $pdo->query("SELECT COUNT(*) as count FROM projects");
$projects_count = $stmt->fetch()['count'];

$stmt = $pdo->query("SELECT COUNT(*) as count FROM skills");
$skills_count = $stmt->fetch()['count'];

$stmt = $pdo->query("SELECT COUNT(*) as count FROM contact_messages WHERE read_status = false");
$unread_messages = $stmt->fetch()['count'];

$stmt = $pdo->query("SELECT COUNT(*) as count FROM contact_messages");
$total_messages = $stmt->fetch()['count'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <link rel="stylesheet" href="admin-styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Bootstrap 5 JS Bundle -->
<!-- Bootstrap 5 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"></head>
<body data-theme="dark">
    <?php include __DIR__ . '/header.php'; ?>
    
    <div class="admin-container">
        <?php include __DIR__ . '/sidebar.php'; ?>
        
        <main class="admin-content">
            <h1>Dashboard</h1>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-project-diagram"></i></div>
                    <div class="stat-info">
                        <h3><?php echo $projects_count; ?></h3>
                        <p>Projects</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-code"></i></div>
                    <div class="stat-info">
                        <h3><?php echo $skills_count; ?></h3>
                        <p>Skills</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-envelope"></i></div>
                    <div class="stat-info">
                        <h3><?php echo $unread_messages; ?></h3>
                        <p>Unread Messages</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-comments"></i></div>
                    <div class="stat-info">
                        <h3><?php echo $total_messages; ?></h3>
                        <p>Total Messages</p>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h2>Quick Actions</h2>
                <div class="action-buttons">
                    <a href="edit_profile.php" class="btn btn-primary">
                        <i class="fas fa-user-edit"></i> Edit Profile
                    </a>
                    <a href="manage_projects.php" class="btn btn-success">
                        <i class="fas fa-plus"></i> Add Project
                    </a>
                    <a href="manage_skills.php" class="btn btn-info">
                        <i class="fas fa-plus"></i> Add Skill
                    </a>
                    <a href="messages.php" class="btn btn-warning">
                        <i class="fas fa-envelope"></i> View Messages
                    </a>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
