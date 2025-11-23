<?php
require_once __DIR__ . '/../config/database.php';
// Fetch all tables dynamically from PostgreSQL
$tables = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")->fetchAll(PDO::FETCH_COLUMN);

function getColumns($pdo, $table) {
    $stmt = $pdo->prepare("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = :t");
    $stmt->execute(['t' => $table]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Dynamic Database Schema Visual</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .card { width:260px; }
    .paper { background:linear-gradient(180deg,#fff 0%,#fafafa 100%); box-shadow:0 6px 30px rgba(0,0,0,0.05);}    
  </style>
</head>
<body class="bg-slate-50 min-h-screen p-6">
<div class="max-w-7xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Dynamic Database Schema</h1>
    <p class="text-sm text-slate-500 mb-6">All tables are loaded automatically from your PostgreSQL database.</p>

    <div class="grid grid-cols-3 gap-6 paper p-6 rounded-xl">
        <?php foreach ($tables as $table): ?>
            <?php $cols = getColumns($pdo, $table); ?>
            <div class="card bg-white rounded-lg border p-4 shadow-sm">
                <div class="text-lg font-semibold mb-2"><?= htmlspecialchars($table) ?></div>
                <ul class="text-sm text-slate-700 leading-6">
                    <?php foreach ($cols as $col): ?>
                        <li><span class="font-semibold"><?= htmlspecialchars($col['column_name']) ?></span> — <?= htmlspecialchars($col['data_type']) ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endforeach; ?>
    </div>
</div>
</body>
</html>