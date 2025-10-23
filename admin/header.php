<header class="admin-header">
    <div class="header-left">
        <h2>Portfolio Admin</h2>
    </div>
    <div class="header-right">
        <span>Welcome, <?php echo htmlspecialchars($_SESSION['admin_username']); ?></span>
        <a href="../public/index.html" target="_blank" class="btn btn-sm btn-info">View Site</a>
        <a href="logout.php" class="btn btn-sm btn-danger">Logout</a>
    </div>
</header>
