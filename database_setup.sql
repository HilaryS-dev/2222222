-- Database setup for SmartBite Restaurant App with RBAC
-- This script adds the user_sessions table and creates a default admin user

USE smartbite;

-- Create user_sessions table for token-based authentication
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Create default admin user (password: admin123)
-- Password hash for 'admin123' using PHP password_hash
INSERT INTO user (name, phone_number, email, password)
VALUES ('Admin User', '1234567890', 'admin@smartbite.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE name = name;

-- Get the admin user ID
SET @admin_id = (SELECT user_id FROM user WHERE email = 'admin@smartbite.com');

-- Add admin user to admin table
INSERT INTO admin (admin_id)
SELECT @admin_id
WHERE NOT EXISTS (SELECT 1 FROM admin WHERE admin_id = @admin_id);

-- Display information
SELECT 'Database setup completed!' as message;
SELECT 'Admin credentials:' as info;
SELECT 'Email: admin@smartbite.com' as admin_email;
SELECT 'Password: admin123' as admin_password;
SELECT 'IMPORTANT: Change this password after first login!' as warning;
