<?php
session_start();
require 'functions.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' and isset($_POST['login'])) {
    require_once __DIR__ . '/../config/database.php';

        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        
        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_id'] = $user['id'];
            $_SESSION['admin_username'] = $user['username'];
            $_SESSION['age'] = 30;
            if(isset($_POST['remeberMe'])) {
                setcookie('admin_username',$_SESSION['admin_username'],time()-3600);
            }
            header('Location: dashboard.php');
            exit;
        } else {
            $error = 'Invalid username or password';
        }
    } catch(PDOException $e) {
        $error = 'Login error: ' . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login</title>
    <link rel="stylesheet" href="admin-styles.css?v=<?= time(); ?>">
</head>
<body class="login-page">
    <div class="login-container">
        <div class="login-box">
            <h1>Portfolio Admin</h1>
            <p>Login to manage your portfolio</p>
            
            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <form method="POST" action="">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" value="<?= (isset($_COOKIE['admin_username'])) ? $_COOKIE['admin_username']:  $username = $_POST['username'] ?? ''; ?>" name="username" required autofocus>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" required>
                </div>
                <p style="margin-top: 0px; margin-bottom:3px; font-size:15px"><input name="remeberMe" type="checkbox"> Remeber Me</p>
                <button name="login" type="submit" class="btn btn-primary btn-block">Login</button>
            </form>
        </div>
    </div>
</body>
</html>
