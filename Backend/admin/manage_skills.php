<?php
require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/csrf.php';

$success = '';
$error = '';

// Handle delete
if (isset($_GET['delete']) && isset($_GET['token'])) {
    if (validate_csrf_token($_GET['token'])) {
        try {
            $stmt = $pdo->prepare("DELETE FROM skills WHERE id = ?");
            $stmt->execute([$_GET['delete']]);
            $success = 'Skill deleted successfully!';
        } catch(PDOException $e) {
            $error = 'Error deleting skill: ' . $e->getMessage();
        }
    } else {
        $error = 'Invalid security token';
    }
}

// Handle add/edit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_or_die();
    $id = $_POST['id'] ?? '';
    $name = $_POST['name'] ?? '';
    $logo = $_POST['logo'] ?? '';
    $category = $_POST['category'] ?? '';
    $proficiency = $_POST['proficiency'] ?? 70;
    
    try {
        if ($id) {
            $stmt = $pdo->prepare("UPDATE skills SET name=?, logo=?, category=?, proficiency=? WHERE id=?");
            $stmt->execute([$name, $logo, $category, $proficiency, $id]);
            $success = 'Skill updated successfully!';
        } else {
            $stmt = $pdo->prepare("INSERT INTO skills (name, logo, category, proficiency) VALUES (?, ?, ?, ?)");
            $stmt->execute([$name, $logo, $category, $proficiency]);
            $success = 'Skill added successfully!';
        }
    } catch(PDOException $e) {
        $error = 'Error saving skill: ' . $e->getMessage();
    }
}

$edit_skill = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM skills WHERE id = ?");
    $stmt->execute([$_GET['edit']]);
    $edit_skill = $stmt->fetch(PDO::FETCH_ASSOC);
}

$stmt = $pdo->query("SELECT * FROM skills ORDER BY id ASC");
$skills = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Skills</title>
    <link rel="stylesheet" href="admin-styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <?php include __DIR__ . '/header.php'; ?>
    
    <div class="admin-container">
        <?php include __DIR__ . '/sidebar.php'; ?>
        
        <main class="admin-content">
            <h1>Manage Skills</h1>
            
            <?php if ($success): ?><div class="alert alert-success"><?php echo $success; ?></div><?php endif; ?>
            <?php if ($error): ?><div class="alert alert-error"><?php echo $error; ?></div><?php endif; ?>
            
            <div class="card">
                <h2><?php echo $edit_skill ? 'Edit Skill' : 'Add New Skill'; ?></h2>
                
                <form method="POST">
                    <?php echo csrf_token_field(); ?>
                    <input type="hidden" name="id" value="<?php echo $edit_skill['id'] ?? ''; ?>">
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Skill Name</label>
                            <input type="text" name="name" value="<?php echo htmlspecialchars($edit_skill['name'] ?? ''); ?>" required>
                        </div>
                        <div class="form-group">
                            <label>Category</label>
                            <select name="category">
                                <option disabled="disabled" selected>Select Category</option>
                                <option value="Frontend" <?php echo ($edit_skill['category'] ?? '') == 'Frontend' ? 'selected' : ''; ?>>Frontend</option>
                                <option value="Backend" <?php echo ($edit_skill['category'] ?? '') == 'Backend' ? 'selected' : ''; ?>>Backend</option>
                                <option value="Framework" <?php echo ($edit_skill['category'] ?? '') == 'Framework' ? 'selected' : ''; ?>>Framework</option>
                                <option value="Database" <?php echo ($edit_skill['category'] ?? '') == 'Database' ? 'selected' : ''; ?>>Database</option>
                                <option value="Tools" <?php echo ($edit_skill['category'] ?? '') == 'Tools' ? 'selected' : ''; ?>>Tools</option>
                                <option value="Other" <?php echo ($edit_skill['category'] ?? '') == 'Other' ? 'selected' : ''; ?>>Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Logo URL (optional - use placeholder or icon URL)</label>
                        <input type="text" name="logo" value="<?php echo htmlspecialchars($edit_skill['logo'] ?? ''); ?>" placeholder="https://example.com/logo.png">
                    </div>
                    
                    <div class="form-group">
                        <label>Proficiency (0-100)</label>
                        <input type="number" name="proficiency" min="0" max="100" value="<?php echo $edit_skill['proficiency'] ?? ''; ?>" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary"><?php echo $edit_skill ? 'Update' : 'Add'; ?> Skill</button>
                    <?php if ($edit_skill): ?><a href="manage_skills.php" class="btn btn-secondary">Cancel</a><?php endif; ?>
                </form>
            </div>
            
            <div class="card" style="margin-top: 30px;">
                <h2>All Skills</h2>
                
                <?php if (empty($skills)): ?>
                    <p>No skills added yet.</p>
                <?php else: ?>
                    <div class="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Proficiency</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($skills as $skill): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($skill['name']); ?></td>
                                        <td><?php echo htmlspecialchars($skill['category']); ?></td>
                                        <td><?php echo $skill['proficiency']; ?>%</td>
                                        <td class="action-buttons-table">
                                            <a href="?edit=<?php echo $skill['id']; ?>" class="btn btn-info">Edit</a>
                                            <a href="?delete=<?php echo $skill['id']; ?>&token=<?php echo urlencode(generate_csrf_token()); ?>" class="btn btn-danger" onclick="return confirm('Are you sure?')">Delete</a>
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
