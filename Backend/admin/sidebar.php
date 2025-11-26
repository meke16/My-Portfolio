<?php
require_once __DIR__ . '/../config/database.php';
require 'functions.php';
$stmt = $pdo->query("SELECT * FROM admin_info ORDER BY id DESC LIMIT 1");
$stmt->execute();
$profile = $stmt->fetch(PDO::FETCH_ASSOC);



$name = '';
$profileImage = '';
if (!empty($profile > 0)) {
    $name = $profile['name'];
    $profileImage = $profile['profile_image'];
}

$msg = $pdo->query("SELECT * FROM contact_messages WHERE read_status = false");
$msg = $msg->fetchAll(PDO::FETCH_ASSOC);
?>

<aside class="admin-sidebar">
    <div class="user-profile-info">
        <img src="<?= $profileImage ?>" alt="User Profile Photo" class="profile-photo">
        <p class="user-name"><?= $name ?></p>
    </div>
    <nav>
        <ul>
            <li><a href="dashboard.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'dashboard.php' ? 'active' : ''; ?>">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a></li>
            <li><a href="edit_profile.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'edit_profile.php' ? 'active' : ''; ?>">
                    <i class="fas fa-user-edit"></i> Edit Profile
                </a></li>
            <li><a href="edit_account.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'edit_account.php' ? 'active' : ''; ?>">
                    <i class="fas fa-user-edit"></i> Edit Account
                </a></li>
            <li><a href="manage_projects.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'manage_projects.php' ? 'active' : ''; ?>">
                    <i class="fas fa-project-diagram"></i> Manage Projects
                </a></li>
            <li><a href="manage_skills.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'manage_skills.php' ? 'active' : ''; ?>">
                    <i class="fas fa-code"></i> Manage Skills
                </a></li>
                        <li><a href="portfolio_gallery.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'portfolio_gallery.php' ? 'active' : ''; ?>">
                    <i class="fas fa-code"></i> Manage Portfolio Gallery
                </a></li>
            <li>
                <a href="messages.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'messages.php' ? 'active' : ''; ?> message-item">
                    <div class="message-content">
                        <i class="fas fa-envelope"></i>
                        <span class="message-text">Messages</span>
                        <?php if(count($msg) > 0 ): ?>
                        <span class="message-badge-wrapper">
                            <span class="message-badge"><?= count($msg) ?></span>
                        </span>
                        <?php endif; ?>
                    </div>
                </a>
            </li>
        </ul>
    </nav>
</aside>
<style>
    .message-item {
        position: relative;
        display: flex;
        align-items: center;
        padding: 12px 20px;
        color: #bdc3c7;
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .message-item:hover {
        background: rgba(52, 152, 219, 0.2);
        color: #ecf0f1;
        transform: translateX(5px);
    }

    .message-item.active {
        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
    }

    .message-text {
        flex: 1;
    }

    .message-badge {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: bold;
        min-width: 20px;
        height: 20px;
        text-align: center;
        line-height: 1.2;
        box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
        border: 2px solid #2c3e50;
        margin-left: auto;
        transition: all 0.3s ease;
    }

    /* Hover effects */
    .message-item:hover .message-badge {
        transform: scale(1.1);
        box-shadow: 0 3px 12px rgba(231, 76, 60, 0.4);
    }

    .message-item.active .message-badge {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        color: #e74c3c;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
    }

    /* Pulse animation for new messages */
    .message-badge:not(:empty) {
        animation: pulse 2s infinite;
    }


    /* Empty badge state */
    .message-badge:empty {
        display: none;
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .message-badge {
            font-size: 10px;
            padding: 3px 6px;
            min-width: 18px;
            height: 18px;
        }
    }
</style>