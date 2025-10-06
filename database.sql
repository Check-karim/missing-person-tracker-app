-- Missing Person Tracker Database Schema
-- Created: 2025-10-06

CREATE DATABASE IF NOT EXISTS missing_person_tracker;
USE missing_person_tracker;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Missing Persons Table
CREATE TABLE IF NOT EXISTS missing_persons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    age INT,
    gender ENUM('male', 'female', 'other') NOT NULL,
    last_seen_location VARCHAR(500) NOT NULL,
    last_seen_date DATE NOT NULL,
    last_seen_time TIME,
    height VARCHAR(50),
    weight VARCHAR(50),
    hair_color VARCHAR(50),
    eye_color VARCHAR(50),
    skin_tone VARCHAR(50),
    distinctive_features TEXT,
    clothing_description TEXT,
    medical_conditions TEXT,
    photo_url VARCHAR(500),
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255),
    additional_info TEXT,
    status ENUM('missing', 'found', 'investigation', 'closed') DEFAULT 'missing',
    found_date TIMESTAMP NULL,
    found_location VARCHAR(500),
    found_by INT,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    case_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (found_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_reporter (reporter_id),
    INDEX idx_case_number (case_number),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Status Updates Table (History Log)
CREATE TABLE IF NOT EXISTS status_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    missing_person_id INT NOT NULL,
    user_id INT NOT NULL,
    old_status ENUM('missing', 'found', 'investigation', 'closed'),
    new_status ENUM('missing', 'found', 'investigation', 'closed') NOT NULL,
    update_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (missing_person_id) REFERENCES missing_persons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_missing_person (missing_person_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments/Tips Table
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    missing_person_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (missing_person_id) REFERENCES missing_persons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_missing_person (missing_person_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    missing_person_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('status_update', 'comment', 'found', 'general') DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (missing_person_id) REFERENCES missing_persons(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Admin User
-- Password: Admin@123 (hashed with bcrypt)
INSERT INTO users (full_name, email, password, is_admin, phone) VALUES 
('System Administrator', 'admin@tracker.com', '$2a$10$kqZyZCOWwDd64vOrPbM2jOmc130TxnBMVlz14HB0juH03emVbRU.C', TRUE, '+1234567890');

-- Generate case number trigger
DELIMITER $$

CREATE TRIGGER before_missing_person_insert
BEFORE INSERT ON missing_persons
FOR EACH ROW
BEGIN
    IF NEW.case_number IS NULL THEN
        SET NEW.case_number = CONCAT('MP', YEAR(NOW()), LPAD(FLOOR(RAND() * 999999), 6, '0'));
    END IF;
END$$

DELIMITER ;

-- Create Views for Reports

-- Active Missing Persons View
CREATE OR REPLACE VIEW active_missing_persons AS
SELECT 
    mp.*,
    u.full_name as reporter_name,
    u.email as reporter_email,
    u.phone as reporter_phone,
    DATEDIFF(CURRENT_DATE, mp.last_seen_date) as days_missing
FROM missing_persons mp
JOIN users u ON mp.reporter_id = u.id
WHERE mp.status IN ('missing', 'investigation')
ORDER BY mp.created_at DESC;

-- Statistics View
CREATE OR REPLACE VIEW missing_person_statistics AS
SELECT 
    COUNT(*) as total_cases,
    SUM(CASE WHEN status = 'missing' THEN 1 ELSE 0 END) as active_missing,
    SUM(CASE WHEN status = 'found' THEN 1 ELSE 0 END) as found_cases,
    SUM(CASE WHEN status = 'investigation' THEN 1 ELSE 0 END) as under_investigation,
    SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_cases,
    SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical_cases,
    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_cases,
    AVG(CASE WHEN status = 'found' AND found_date IS NOT NULL 
        THEN DATEDIFF(found_date, created_at) 
        ELSE NULL END) as avg_days_to_find
FROM missing_persons;

-- Sample data for testing (optional - uncomment to use)
/*
INSERT INTO users (full_name, email, password, phone) VALUES 
('John Doe', 'john@example.com', '$2a$10$rZJ5qJYX8YJ5qJYX8YJ5qO5qJ5qJYX8YJ5qJYX8YJ5qJYX8YJ5qJe', '+1234567891'),
('Jane Smith', 'jane@example.com', '$2a$10$rZJ5qJYX8YJ5qJYX8YJ5qO5qJ5qJYX8YJ5qJYX8YJ5qJYX8YJ5qJe', '+1234567892');

INSERT INTO missing_persons (
    reporter_id, full_name, age, gender, last_seen_location, 
    last_seen_date, height, weight, hair_color, eye_color,
    contact_name, contact_phone, status, priority
) VALUES 
(2, 'Michael Johnson', 25, 'male', '123 Main St, New York, NY', '2025-10-01', 
 '5\'10"', '170 lbs', 'Brown', 'Blue', 'John Doe', '+1234567891', 'missing', 'high'),
(2, 'Emily Davis', 32, 'female', '456 Oak Ave, Los Angeles, CA', '2025-09-28',
 '5\'6"', '140 lbs', 'Blonde', 'Green', 'Jane Smith', '+1234567892', 'investigation', 'medium');
*/

