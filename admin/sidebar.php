<?php
require_once __DIR__ . '/../config/database.php';
$stmt = $pdo->query("SELECT * FROM admin_info ORDER BY id DESC LIMIT 1");
$profile = $stmt->fetch(PDO::FETCH_ASSOC);



$name = '';
$profileImage = '';
if(!empty($profile > 0)) {
    $name = $profile['name'];
    $profileImage = $profile['profile_image'];
}

?>

<aside class="admin-sidebar">
    <div class="user-profile-info">
        <img src="../frontend/public/assets/profile/<?= $profileImage ?>" alt="User Profile Photo" class="profile-photo">
        <p class="user-name"><?= $name ?></p> </div>
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
            <li><a href="messages.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'messages.php' ? 'active' : ''; ?>">
                <i class="fas fa-envelope"></i> Messages
            </a></li>
        </ul>
    </nav>
</aside>
