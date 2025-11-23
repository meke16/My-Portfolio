<?php
require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/csrf.php';

$success = '';
$error = '';

// Handle delete
if (isset($_GET['delete']) && isset($_GET['token'])) {
    if (validate_csrf_token($_GET['token'])) {
        $id = $_GET['delete'];
        try {
            $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
            $stmt->execute([$id]);
            $success = 'Project deleted successfully!';
        } catch(PDOException $e) {
            $error = 'Error deleting project: ' . $e->getMessage();
        }
    } else {
        $error = 'Invalid security token';
    }
}

// Handle add/edit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_or_die();
    $id = $_POST['id'] ?? '';
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $url = $_POST['url'] ?? '';
    $github_url = $_POST['github_url'] ?? '';
    $technologies = $_POST['technologies'] ?? '';
    $image = $_POST['image'] ?? '';
    $featured = isset($_POST['featured']) ? true : 0;
    
    try {
        if ($id) {
            $stmt = $pdo->prepare("UPDATE projects SET title=?, description=?, url=?, github_url=?, technologies=?, image=?, featured=? WHERE id=?");
            $stmt->execute([$title, $description, $url, $github_url, $technologies, $image, $featured, $id]);
            $success = 'Project updated successfully!';
        } else {
            $stmt = $pdo->prepare("INSERT INTO projects (title, description, url, github_url, technologies, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $description, $url, $github_url, $technologies, $image, $featured]);
            $success = 'Project added successfully!';
        }
    } catch(PDOException $e) {
        $error = 'Error saving project: ' . $e->getMessage();
    }
}

// Get edit data
$edit_project = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ?");
    $stmt->execute([$_GET['edit']]);
    $edit_project = $stmt->fetch(PDO::FETCH_ASSOC);
}

// Get all projects
$stmt = $pdo->query("SELECT * FROM projects ORDER BY created_at DESC");
$projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Projects</title>
    <link rel="stylesheet" href="admin-styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <?php include __DIR__ . '/header.php'; ?>
    
    <div class="admin-container">
        <?php include __DIR__ . '/sidebar.php'; ?>
        
        <main class="admin-content">
            <h1>Manage Projects</h1>
            
            <?php if ($success): ?>
                <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
            <?php endif; ?>
            
            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <div class="card">
                <h2><?php echo $edit_project ? 'Edit Project' : 'Add New Project'; ?></h2>
                
                <form method="POST">
                    <?php echo csrf_token_field(); ?>
                    <input type="hidden" name="id" value="<?php echo $edit_project['id'] ?? ''; ?>">
                    
                    <div class="form-group">
                        <label>Project Title</label>
                        <input type="text" name="title" value="<?php echo htmlspecialchars($edit_project['title'] ?? ''); ?>" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="description" rows="4" required><?php echo htmlspecialchars($edit_project['description'] ?? ''); ?></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Live URL (optional)</label>
                            <input type="url" name="url" value="<?php echo htmlspecialchars($edit_project['url'] ?? ''); ?>">
                        </div>
                        <div class="form-group">
                            <label>GitHub URL (optional)</label>
                            <input type="url" name="github_url" value="<?php echo htmlspecialchars($edit_project['github_url'] ?? ''); ?>">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Technologies (comma-separated)</label>
                        <input type="text" name="technologies" value="<?php echo htmlspecialchars($edit_project['technologies'] ?? ''); ?>" placeholder="React, Node.js, MongoDB">
                    </div>
                    
                    <div class="form-group">
                        <label>Image URL (optional)</label>
                        <input type="text" name="image" value="<?php echo htmlspecialchars($edit_project['image'] ?? ''); ?>" placeholder="https://example.com/image.jpg">
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="featured" <?php echo ($edit_project['featured'] ?? false) ? 'checked' : ''; ?>>
                            Featured Project
                        </label>
                    </div>
                    
                    <button type="submit" class="btn btn-primary"><?php echo $edit_project ? 'Update' : 'Add'; ?> Project</button>
                    <?php if ($edit_project): ?>
                        <a href="manage_projects.php" class="btn btn-secondary">Cancel</a>
                    <?php endif; ?>
                </form>
            </div>
            
            <div class="card" style="margin-top: 30px;">
                <h2>All Projects</h2>
                
                <?php if (empty($projects)): ?>
                    <p>No projects added yet.</p>
                <?php else: ?>
                    <div class="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Technologies</th>
                                    <th>Featured</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($projects as $project): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($project['title']); ?></td>
                                        <td><?php echo htmlspecialchars($project['technologies']); ?></td>
                                        <td><?php echo $project['featured'] ? 'Yes' : 'No'; ?></td>
                                        <td class="action-buttons-table">
                                            <a href="?edit=<?php echo $project['id']; ?>" class="btn btn-info">Edit</a>
                                            <a href="?delete=<?php echo $project['id']; ?>&token=<?php echo urlencode(generate_csrf_token()); ?>" class="btn btn-danger" onclick="return confirm('Are you sure?')">Delete</a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>
        </main>
    </div>
</body>
</html>
