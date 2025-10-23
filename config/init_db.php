<?php
require_once 'database.php';

// Create tables
$sql = "
-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio info table
CREATE TABLE IF NOT EXISTS portfolio_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    bio TEXT,
    email VARCHAR(100),
    phone VARCHAR(20),
    location VARCHAR(100),
    github VARCHAR(100),
    linkedin VARCHAR(100),
    twitter VARCHAR(100),
    profile_image VARCHAR(255) DEFAULT 'assets/images/developer.jpg',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    logo VARCHAR(255),
    category VARCHAR(50),
    proficiency INT DEFAULT 70,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    url VARCHAR(255),
    github_url VARCHAR(255),
    technologies TEXT,
    display_order INT DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO admin_users (username, password) 
VALUES ('admin', '$2y$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (username) DO NOTHING;

-- Insert default portfolio info
INSERT INTO portfolio_info (name, title, bio, email, phone, location, github, linkedin, twitter) 
VALUES (
    'John Developer',
    'Full Stack Developer & Software Engineer',
    'Passionate developer with expertise in building modern web applications. Specialized in creating scalable, user-friendly solutions using cutting-edge technologies.',
    'contact@example.com',
    '+1 234 567 8900',
    'San Francisco, CA',
    'github.com/yourusername',
    'linkedin.com/in/yourusername',
    'twitter.com/yourusername'
)
ON CONFLICT DO NOTHING;

-- Insert default skills
INSERT INTO skills (name, logo, category, proficiency, display_order) VALUES
('HTML5', 'assets/logos/html.png', 'Frontend', 90, 1),
('CSS3', 'assets/logos/css.png', 'Frontend', 85, 2),
('JavaScript', 'assets/logos/javascript.png', 'Frontend', 88, 3),
('React', 'assets/logos/react.png', 'Frontend', 85, 4),
('Node.js', 'assets/logos/nodejs.png', 'Backend', 80, 5),
('PHP', 'assets/logos/php.png', 'Backend', 75, 6),
('MySQL', 'assets/logos/mysql.png', 'Database', 78, 7),
('Git', 'assets/logos/git.png', 'Tools', 85, 8)
ON CONFLICT DO NOTHING;
";

try {
    $pdo->exec($sql);
    echo "Database initialized successfully!";
} catch(PDOException $e) {
    echo "Error initializing database: " . $e->getMessage();
}
?>
