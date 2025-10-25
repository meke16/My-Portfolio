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




if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['filename'])) {
    $filename = basename($_POST['filename']); // sanitize filename

    // Fetch current gallery
    $stmt = $pdo->query("SELECT id, gallery_images FROM admin_info ORDER BY id DESC LIMIT 1");
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($profile && !empty($profile['gallery_images'])) {
        $gallery = json_decode($profile['gallery_images'], true) ?? [];

        // Remove the image from array
        $updatedGallery = array_values(array_filter($gallery, fn($img) => $img !== $filename));

        // Update DB
        $stmt = $pdo->prepare("UPDATE admin_info SET gallery_images = ? WHERE id = ?");
        $stmt->execute([json_encode($updatedGallery), $profile['id']]);

try {
    // Extract public ID from URL (Cloudinary URLs end with /<public_id>.<ext>)
    $publicId = pathinfo(parse_url($filename, PHP_URL_PATH), PATHINFO_FILENAME);
    $cloudinary->uploadApi()->destroy('portfolio/gallery/' . $publicId);
} catch (Exception $e) {
    // optional: log the error or show it
}

        echo 'success';
    } else {
        echo 'no_gallery';
    }

    exit;
} else {
    echo 'invalid';
}

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
    // Handle gallery images upload (multiple)
    $galleryImages = !empty($profile['gallery_images']) ? json_decode($profile['gallery_images'], true) : [];

    if (!empty($_FILES['gallery_images']['name'][0])) {

        foreach ($_FILES['gallery_images']['name'] as $key => $name) {
            $tmpName = $_FILES['gallery_images']['tmp_name'][$key];
            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            $allowedExts = ['jpg', 'jpeg', 'png', 'gif'];

            if (in_array($ext, $allowedExts)) {
                $newFileName = uniqid('gallery_', true) . '.' . $ext;
               try {
                    $uploadResult = $cloudinary->uploadApi()->upload($tmpName, [
                        'folder' => 'portfolio/gallery'
                    ]);
                    $galleryImages[] = $uploadResult['secure_url']; // store URL instead of filename
                } catch (Exception $e) {
                    $error = 'Cloudinary gallery upload failed: ' . $e->getMessage();
                }
            }
        }
    }


    if (empty($error)) {
        try {
            if ($profile) {
                // Update existing profile
                $stmt = $pdo->prepare("UPDATE admin_info 
                    SET name=?, title=?, bio=?, email=?, phones=?, locations=?, socials=?, profile_image=?, gallery_images=? ,updated_at=CURRENT_TIMESTAMP 
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
                    json_encode($galleryImages),
                    $profile['id']
                ]);
            } else {
                // Insert new profile
                $stmt = $pdo->prepare("INSERT INTO admin_info 
                    (name, title, bio, email, phones, locations, socials, profile_image, gallery_images) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)");
                $stmt->execute([
                    $fullName,
                    $title,
                    $bio,
                    $email,
                    json_encode($phones),
                    json_encode($locations),
                    json_encode($socials),
                    $imageFileName,
                    json_encode($galleryImages)
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
    <link rel="stylesheet" href="admin-styles.css">
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
                    <div class="form-group">
                        <label>Gallery Images (you can select multiple)</label>
                        <input type="file" name="gallery_images[]" accept="image/*" multiple>

                        <?php
                        if (!empty($profile['gallery_images'])):
                            $gallery = json_decode($profile['gallery_images'], true);
                            if (!empty($gallery)):
                        ?>
                                <div class="gallery-preview" style="display:flex; flex-wrap:wrap; gap:10px; margin-top:10px;">
                                    <?php foreach ($gallery as $img): ?>
                                        <div style="position:relative; display:inline-block;">
                                            <img src="<?php echo htmlspecialchars($img); ?>"
                                                alt="Gallery Image" style="max-width:100px; border-radius:8px;">
                                            <button type="button" class="remove-btn"
                                                data-filename="<?php echo htmlspecialchars($img); ?>"
                                                style="position:absolute; top:0; right:0; background:red; color:white; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer;">×</button>
                                        </div>

                                    <?php endforeach; ?>
                                </div>
                        <?php endif;
                        endif; ?>
                    </div>


                    <button type="submit" class="btn btn-primary" name="submit">Save Changes</button>
                </form>
            </div>
        </main>
    </div>
<script>
document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (!confirm('Remove this image?')) return;

        const filename = btn.dataset.filename;
        const csrfToken = document.querySelector('[name="csrf_token"]').value;

        const formData = new URLSearchParams();
        formData.append('filename', filename);
        formData.append('csrf_token', csrfToken);

        fetch('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded' // 👈 Important
            },
            body: formData
        })
        .then(res => res.text())
        .then(response => {
            console.log('Server response:', response); // debug line
            if (response.trim() === 'success') {
                btn.parentElement.remove();
            } else {
                alert('Failed to remove image: ' + response);
            }
        })
        .catch(err => alert('Error: ' + err));
    });
});
</script>


</body>

</html>