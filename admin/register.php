<?php
session_start();
require_once __DIR__ . '/../config/database.php';


// Check if any admin user exists
$check = $pdo->prepare("SELECT id FROM admin_users");
$check->execute();
$rows = $check->fetchAll(PDO::FETCH_ASSOC);

if (count($rows) > 0) {
    echo "<script>
        alert('Admin already registered');
        window.location.href = 'login.php';
    </script>";
} 

if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: dashboard.php');
    exit;
}



$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $confirm = trim($_POST['confirm_password'] ?? '');

    if ($username === '' || $password === '') {
        $message = 'All fields are required.';
    } elseif ($password !== $confirm) {
        $message = 'Passwords do not match.';
    } else {
        try {
            // Check if any admin user exists
            $check = $pdo->prepare("SELECT id FROM admin_users");
            $check->execute();
            $rows = $check->fetchAll(PDO::FETCH_ASSOC);

            if (count($rows) > 0) {
                echo "<script>
                    alert('Admin already registered');
                    window.location.href = 'login.php';
                </script>";
            } else {
                // Hash the password
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

                // Insert into database
                $stmt = $pdo->prepare("INSERT INTO admin_users (username, password, created_at) VALUES (?, ?, NOW())");
                $stmt->execute([$username, $hashedPassword]);

                $message = 'Admin user registered successfully! You can now login.';
            }
        } catch (PDOException $e) {
            $message = 'Registration error: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register Admin</title>
    <link rel="stylesheet" href="admin-styles.css">
</head>

<body class="login-page">
    <div class="login-container">
        <div class="login-box">
            <h1>Admin Registration</h1>
            <p>Create your admin account</p>

            <?php if ($message): ?>
                <div class="alert alert-info"><?php echo htmlspecialchars($message); ?></div>
            <?php endif; ?>

            <form method="POST" action="">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" name="username" required autofocus>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" required>
                </div>
                <div class="form-group">
                    <label>Confirm Password</label>
                    <input type="password" name="confirm_password" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Register</button>
            </form>

            <div class="login-info">
                <p>Already registered? <a href="login.php">Login here</a></p>
            </div>
        </div>
    </div>
</body>

</html>