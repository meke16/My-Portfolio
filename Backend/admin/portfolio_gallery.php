<?php
require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/csrf.php';

$success = '';
$error = '';

/* --------------------------------------
   DELETE GALLERY ITEM
-------------------------------------- */
if (isset($_GET['delete']) && isset($_GET['token'])) {
    if (validate_csrf_token($_GET['token'])) {
        try {
            $stmt = $pdo->prepare("DELETE FROM portfolio_gallery WHERE id = ?");
            $stmt->execute([$_GET['delete']]);
            $success = 'Gallery item deleted successfully!';
        } catch(PDOException $e) {
            $error = 'Error deleting item: ' . $e->getMessage();
        }
    } else {
        $error = 'Invalid security token.';
    }
}

/* --------------------------------------
   ADD / EDIT GALLERY ITEM
-------------------------------------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_or_die();

    $id = $_POST['id'] ?? '';
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $media_type = $_POST['media_type'] ?? 'image';
    $media_url = $_POST['media_url'] ?? '';
    $thumbnail_url = $_POST['thumbnail_url'] ?? '';

    try {
        if ($id) {
            $stmt = $pdo->prepare("
                UPDATE portfolio_gallery
                SET title=?, description=?, media_type=?, media_url=?, thumbnail_url=?
                WHERE id=?
            ");
            $stmt->execute([$title, $description, $media_type, $media_url, $thumbnail_url, $id]);
            $success = 'Gallery item updated successfully!';
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO portfolio_gallery (title, description, media_type, media_url, thumbnail_url)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([$title, $description, $media_type, $media_url, $thumbnail_url]);
            $success = 'Gallery item added successfully!';
        }
    } catch(PDOException $e) {
        $error = 'Error saving item: ' . $e->getMessage();
    }
}

/* --------------------------------------
   EDIT MODE LOAD
-------------------------------------- */
$edit_item = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM portfolio_gallery WHERE id = ?");
    $stmt->execute([$_GET['edit']]);
    $edit_item = $stmt->fetch(PDO::FETCH_ASSOC);
}

/* --------------------------------------
   LOAD ALL GALLERY ITEMS
-------------------------------------- */
$stmt = $pdo->query("SELECT * FROM portfolio_gallery ORDER BY id DESC");
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Gallery</title>
    <link rel="stylesheet" href="admin-styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>

<?php include __DIR__ . '/header.php'; ?>

<div class="admin-container">
<?php include __DIR__ . '/sidebar.php'; ?>

<main class="admin-content">
    <h1>Manage Portfolio Gallery</h1>

    <?php if ($success): ?><div class="alert alert-success"><?= $success ?></div><?php endif; ?>
    <?php if ($error): ?><div class="alert alert-error"><?= $error ?></div><?php endif; ?>

    <div class="card">
        <h2><?= $edit_item ? 'Edit Gallery Item' : 'Add New Gallery Item' ?></h2>

        <form method="POST">
            <?= csrf_token_field(); ?>
            <input type="hidden" name="id" value="<?= $edit_item['id'] ?? '' ?>">

            <div class="form-row">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title"
                        value="<?= htmlspecialchars($edit_item['title'] ?? '') ?>" required>
                </div>

                <div class="form-group">
                    <label>Media Type</label>
                    <select name="media_type">
                        <option value="image" <?= ($edit_item['media_type'] ?? '') === 'image' ? 'selected' : '' ?>>Image</option>
                        <option value="video" <?= ($edit_item['media_type'] ?? '') === 'video' ? 'selected' : '' ?>>Video</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label>Description (optional)</label>
                <textarea name="description"><?= htmlspecialchars($edit_item['description'] ?? '') ?></textarea>
            </div>

            <div class="form-group">
                <label>Media URL</label>
                <input type="text" name="media_url"
                    value="<?= htmlspecialchars($edit_item['media_url'] ?? '') ?>" required>
            </div>

            <div class="form-group">
                <label>Thumbnail URL (optional)</label>
                <input type="text" name="thumbnail_url"
                    value="<?= htmlspecialchars($edit_item['thumbnail_url'] ?? '') ?>">
            </div>

            <button type="submit" class="btn btn-primary">
                <?= $edit_item ? 'Update Item' : 'Add Item' ?>
            </button>

            <?php if ($edit_item): ?>
                <a href="portfolio_gallery.php" class="btn btn-secondary">Cancel</a>
            <?php endif; ?>
        </form>
    </div>

    <div class="card" style="margin-top: 30px;">
        <h2>All Gallery Items</h2>

        <?php if (empty($items)): ?>
            <p>No gallery items yet.</p>
        <?php else: ?>
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Preview</th>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Media URL</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($items as $g): ?>
                        <tr>
                            <td>
                                <?php if ($g['media_type'] === 'image'): ?>
                                    <img src="<?= htmlspecialchars($g['media_url']) ?>" width="60" height="40" style="object-fit:cover;border-radius:5px;">
                                <?php else: ?>
                                    <img src="<?= htmlspecialchars($g['thumbnail_url'] ?: 'https://via.placeholder.com/60x40?text=Video') ?>"
                                         width="60" height="40" style="object-fit:cover;border-radius:5px;">
                                <?php endif; ?>
                            </td>

                            <td><?= htmlspecialchars($g['title']) ?></td>
                            <td><?= htmlspecialchars($g['media_type']) ?></td>
                            <td style="max-width:250px;word-break:break-word;">
                                <?= htmlspecialchars($g['media_url']) ?>
                            </td>

                            <td class="action-buttons-table">
                                <a href="?edit=<?= $g['id'] ?>" class="btn btn-info">Edit</a>
                                <a href="?delete=<?= $g['id'] ?>&token=<?= urlencode(generate_csrf_token()) ?>"
                                   class="btn btn-danger"
                                   onclick="return confirm('Are you sure?')">
                                    Delete
                                </a>
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
