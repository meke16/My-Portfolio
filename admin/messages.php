<?php
require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/csrf.php';

// Mark as read
if (isset($_GET['mark_read']) && isset($_GET['token'])) {
    if (validate_csrf_token($_GET['token'])) {
        $stmt = $pdo->prepare("UPDATE contact_messages SET read_status = true WHERE id = ?");
        $stmt->execute([$_GET['mark_read']]);
    }
}
// UnMark as read
if (isset($_GET['unread']) && isset($_GET['token'])) {
    if (validate_csrf_token($_GET['token'])) {
        $stmt = $pdo->prepare("UPDATE contact_messages SET read_status = false WHERE id = ?");
        $stmt->execute([$_GET['unread']]);
    }
}

// Delete message
if (isset($_GET['delete']) && isset($_GET['token'])) {
    if (validate_csrf_token($_GET['token'])) {
        $stmt = $pdo->prepare("DELETE FROM contact_messages WHERE id = ?");
        $stmt->execute([$_GET['delete']]);
    }
}

$stmt = $pdo->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
$messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Messages</title>
    <link rel="stylesheet" href="admin-styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body>
    <?php include __DIR__ . '/header.php'; ?>

    <div class="admin-container">
        <?php include __DIR__ . '/sidebar.php'; ?>

        <main class="admin-content">
            <h1>Contact Messages</h1>

            <div class="card">
                <?php if (empty($messages)): ?>
                    <p>No messages yet.</p>
                <?php else: ?>
                    <div class="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Subject</th>
                                    <th>Message</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($messages as $msg): ?>
                                    <tr style="<?php echo !$msg['read_status'] ? 'font-weight: bold;' : ''; ?>">
                                        <td><?php echo date('M d, Y', strtotime($msg['created_at'])); ?></td>
                                        <td><?php echo htmlspecialchars($msg['name']); ?></td>
                                        <td><?php echo htmlspecialchars($msg['email']); ?></td>
                                        <td><?php echo htmlspecialchars($msg['subject']); ?></td>
                                        <td><?php echo htmlspecialchars(substr($msg['message'], 0, 50)) . '...'; ?></td>
                                        <td><?php echo $msg['read_status'] ? 'Read' : 'Unread'; ?></td>
                                        <td class="action-buttons-table">
                                            <?php if (!$msg['read_status']): ?>
                                                <a href="?mark_read=<?php echo $msg['id']; ?>&token=<?php echo urlencode(generate_csrf_token()); ?>" class="btn btn-info">Mark Read</a>
                                            <?php elseif ($msg['read_status']): ?>
                                                <a href="?unread=<?php echo $msg['id']; ?>&token=<?php echo urlencode(generate_csrf_token()); ?>" class="btn btn-primary">Unread</a>
                                            <?php endif; ?>
                                            <a href="?delete=<?php echo $msg['id']; ?>&token=<?php echo urlencode(generate_csrf_token()); ?>" class="btn btn-danger" onclick="return confirm('Delete this message?')">Delete</a>
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