<?php
require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/csrf.php';


// Fetch logged-in admin user ID from session (adjust if different)
$adminUserId = $_SESSION['admin_id'] ?? null;
if (!$adminUserId) {
    header('Location: login.php');
    exit;
}

$successAccount = '';
$errorAccount = '';

// Fetch current user data
$stmt = $pdo->prepare("SELECT * FROM admin_users WHERE id = ?");
$stmt->execute([$adminUserId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_account'])) {
    verify_csrf_or_die();

    $newUsername = trim($_POST['username'] ?? '');
    $oldPassword = $_POST['old_password'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';

    // Validate inputs
    if (empty($newUsername)) {
        $errorAccount = 'Username cannot be empty.';
    } elseif (!empty($newPassword) || !empty($confirmPassword)) {
        // If password fields filled, check old password and match new passwords
        if (empty($oldPassword)) {
            $errorAccount = 'Please enter your current password to change password.';
        } elseif (!password_verify($oldPassword, $user['password'])) {
            $errorAccount = 'Current password is incorrect.';
        } elseif ($newPassword !== $confirmPassword) {
            $errorAccount = 'New passwords do not match.';
        }
    }

    if (empty($errorAccount)) {
        try {
            if (!empty($newPassword)) {
                $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

                $stmt = $pdo->prepare("UPDATE admin_users SET username = ?, password= ? WHERE id = ?");
                $stmt->execute([$newUsername, $newPasswordHash, $adminUserId]);
            } else {
                $stmt = $pdo->prepare("UPDATE admin_users SET username = ? WHERE id = ?");
                $stmt->execute([$newUsername, $adminUserId]);
            }
            $successAccount = 'Account updated successfully.';
        } catch (PDOException $e) {
            $errorAccount = 'Error updating account: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit - Account</title>
    <link rel="stylesheet" href="admin-styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .admin-container {
            height: 100vh;
        }
        .card {
            margin: auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
    </style>
</head>

<body>
    <?php include __DIR__ . '/header.php'; ?>
    <div class="admin-container">
        <?php include __DIR__ . '/sidebar.php'; ?>
        <div class="card">
            <div class="card-header">
                <h2>Edit Account</h2>
            </div>

            <?php if ($successAccount): ?>
                <div style="width: 350px;" class="alert alert-success"><?= htmlspecialchars($successAccount) ?></div>
            <?php endif; ?>
            <?php if ($errorAccount): ?>
                <div style="width: 350px;" class="alert alert-error"><?= htmlspecialchars($errorAccount) ?></div>
            <?php endif; ?>

            <form method="POST">
                <?= csrf_token_field(); ?>

                <div class="form-group">
                    <label>Username</label>
                    <input type="text" name="username" value="<?= htmlspecialchars($user['username'] ?? '') ?>" required>
                </div>


                <div class="form-group">
                    <label>Current Password (required to change password)</label>
                    <input type="password" name="old_password" placeholder="Enter current password">
                </div>

                <div class="form-group">
                    <label>New Password</label>
                    <input type="password" name="new_password" placeholder="Enter new password">
                </div>

                <div class="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" name="confirm_password" placeholder="Confirm new password">
                </div>

                <button type="submit" name="update_account" class="btn btn-primary">Update Account</button>
            </form>
        </div>
    </div>

</body>

</html>