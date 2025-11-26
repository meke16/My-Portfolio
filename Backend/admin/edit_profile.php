<?php
require_once __DIR__ . '/auth_check.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/csrf.php';
require __DIR__ . '/../vendor/autoload.php';
use Cloudinary\Cloudinary;

$cloudinary = new Cloudinary([
    'cloud' => [
        'cloud_name' => 'dnwqdukbt',
        'api_key'    => '965758843313653',
        'api_secret' => '5xIHL7NNir4L3AgK8j3066Kr4PI',
    ],
    'url' => ['secure' => true]
]);

$success = '';
$error = '';

// Fetch the latest admin profile (assuming one record)
$stmt = $pdo->query("SELECT * FROM admin_info ORDER BY id DESC LIMIT 1");
$profile = $stmt->fetch(PDO::FETCH_ASSOC);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_or_die();

    $fullName = $_POST['fullName'] ?? '';
    $title = $_POST['title'] ?? '';
    $bio = $_POST['bio'] ?? '';
    $email = $_POST['email'] ?? '';
    $phones = array_filter(array_map('trim', explode(',', $_POST['phones'] ?? '')));
    $locations = array_filter(array_map('trim', explode(',', $_POST['locations'] ?? '')));

    // Social links (entered as URL or username)
    $socials = [
        'github' => trim($_POST['github'] ?? ''),
        'linkedin' => trim($_POST['linkedin'] ?? ''),
        'twitter' => trim($_POST['twitter'] ?? ''),
        'facebook' => trim($_POST['facebook'] ?? ''),
        'tiktok' => trim($_POST['tiktok'] ?? ''),
        'instagram' => trim($_POST['instagram'] ?? '')
    ];

    
    // Handle profile image upload
    $imageFileName = $profile['profile_image'] ?? null;
    if (!empty($_FILES['profile_image']['name'])) {

        $tmpName = $_FILES['profile_image']['tmp_name'];
        $originalName = basename($_FILES['profile_image']['name']);
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        $allowedExts = ['jpg', 'jpeg', 'png', 'gif'];
        if (in_array($ext, $allowedExts)) {
            $newFileName = uniqid('profile_', true) . '.' . $ext;
            try {
                $uploadResult = $cloudinary->uploadApi()->upload($tmpName, [
                    'folder' => 'portfolio/profile',
                ]);
                $imageFileName = $uploadResult['secure_url']; // store URL instead of filename
            } catch (Exception $e) {
                $error = 'Cloudinary upload error: ' . $e->getMessage();
            }
        } else {
            $error = 'Invalid image file type.';
        }
    }



    if (empty($error)) {
        try {
            if ($profile) {
                // Update existing profile
                $stmt = $pdo->prepare("UPDATE admin_info 
                    SET name=?, title=?, bio=?, email=?, phones=?, locations=?, socials=?, profile_image=?,updated_at=CURRENT_TIMESTAMP 
                    WHERE id=?");
                $stmt->execute([
                    $fullName,
                    $title,
                    $bio,
                    $email,
                    json_encode($phones),
                    json_encode($locations),
                    json_encode($socials),
                    $imageFileName,
                    $profile['id']
                ]);
            } else {
                // Insert new profile
                $stmt = $pdo->prepare("INSERT INTO admin_info 
                    (name, title, bio, email, phones, locations, socials, profile_image) 
                    VALUES (?, ?, ?, ?, ?, ?, ?,?)");
                $stmt->execute([
                    $fullName,
                    $title,
                    $bio,
                    $email,
                    json_encode($phones),
                    json_encode($locations),
                    json_encode($socials),
                    $imageFileName,
                ]);
            }

            $success = 'Profile updated successfully!';

            // Refresh profile data
            $stmt = $pdo->query("SELECT * FROM admin_info ORDER BY id DESC LIMIT 1");
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $error = 'Error updating profile: ' . $e->getMessage();
        }
    }
}

// Decode JSON for form display
$phones = !empty($profile['phones']) ? json_decode($profile['phones'], true) : [];
$locations = !empty($profile['locations']) ? json_decode($profile['locations'], true) : [];
$socials = !empty($profile['socials']) ? json_decode($profile['socials'], true) : [];
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Profile</title>
    <link rel="stylesheet" href="admin-styles.css?v=<?= time() ?>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body>
    <?php include __DIR__ . '/header.php'; ?>
    <div class="admin-container">
        <?php include __DIR__ . '/sidebar.php'; ?>

        <main class="admin-content">
            <div class="card">
                <div class="card-header">
                    <h1>Edit Profile</h1>
                </div>

                <?php if ($success): ?>
                    <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
                <?php endif; ?>
                <?php if ($error): ?>
                    <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
                <?php endif; ?>

                <form method="POST" enctype="multipart/form-data">
                    <?= csrf_token_field(); ?>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" name="fullName" value="<?= htmlspecialchars($profile['name'] ?? '') ?>" required>
                        </div>
                        <div class="form-group">
                            <label>Professional Title</label>
                            <input type="text" name="title" value="<?= htmlspecialchars($profile['title'] ?? '') ?>" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Bio</label>
                        <textarea name="bio" rows="4" required><?= htmlspecialchars($profile['bio'] ?? '') ?></textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value="<?= htmlspecialchars($profile['email'] ?? '') ?>">
                        </div>
                        <div class="form-group">
                            <label>Phone(s)</label>
                            <input type="text" name="phones" placeholder="Separate with commas"
                                value="<?= htmlspecialchars(implode(', ', $phones)) ?>">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Location(s)</label>
                        <input type="text" name="locations" placeholder="Separate with commas"
                            value="<?= htmlspecialchars(implode(', ', $locations)) ?>">
                    </div>

                    <h3>Social Media Links</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>GitHub</label>
                            <input type="text" name="github" value="<?= htmlspecialchars($socials['github'] ?? '') ?>">
                        </div>
                        <div class="form-group">
                            <label>LinkedIn</label>
                            <input type="text" name="linkedin" value="<?= htmlspecialchars($socials['linkedin'] ?? '') ?>">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Twitter</label>
                            <input type="text" name="twitter" value="<?= htmlspecialchars($socials['twitter'] ?? '') ?>">
                        </div>
                        <div class="form-group">
                            <label>Facebook</label>
                            <input type="text" name="facebook" value="<?= htmlspecialchars($socials['facebook'] ?? '') ?>">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>TikTok</label>
                        <input type="text" name="tiktok" value="<?= htmlspecialchars($socials['tiktok'] ?? '') ?>">
                    </div>
                    <div class="form-group">
                        <label>Instagram</label>
                        <input type="text" name="instagram" value="<?= htmlspecialchars($socials['instagram'] ?? '') ?>">
                    </div>

                    <div class="form-group">
                        <label>Profile Image</label>
                        <input type="file" name="profile_image" accept="image/*">
                        <?php if (!empty($profile['profile_image'])): ?>
                            <div>
                                <img src="<?= htmlspecialchars($profile['profile_image']) ?>"
                                    alt="Profile" style="max-width: 150px; border-radius: 8px;">
                            </div>
                        <?php endif; ?>
                    </div>



                    <button type="submit" class="btn btn-primary" name="submit">Save Changes</button>
                </form>
            </div>
        </main>
    </div>



</body>

</html>