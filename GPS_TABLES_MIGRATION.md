# GPS Tracking Tables Migration Guide

## Problem
The application is missing the GPS tracking database tables (`user_locations` and `location_history`).

## Error Message
```
Error: Table 'missing_person_tracker.user_locations' doesn't exist
```

## Solution

### Method 1: Using MySQL Command Line

1. Open your MySQL command line client or terminal

2. Connect to MySQL:
```bash
mysql -u root -p
# Enter your MySQL password when prompted
```

3. Run the migration script:
```bash
mysql -u root -p missing_person_tracker < add_gps_tables.sql
```

**OR** if you're already in MySQL:
```sql
USE missing_person_tracker;
source add_gps_tables.sql
```

### Method 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your database server
3. Open the file `add_gps_tables.sql`
4. Click the **Execute** button (lightning bolt icon)
5. Verify the tables were created

### Method 3: Using phpMyAdmin

1. Open phpMyAdmin in your browser
2. Select the `missing_person_tracker` database
3. Click on the **SQL** tab
4. Copy and paste the contents of `add_gps_tables.sql`
5. Click **Go** to execute

### Method 4: Copy-Paste SQL

If you prefer, you can directly copy and paste this SQL:

```sql
USE missing_person_tracker;

-- User Locations Table (Real-time GPS Tracking)
CREATE TABLE IF NOT EXISTS user_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(10, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Location History Table
CREATE TABLE IF NOT EXISTS location_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Verify Installation

After running the migration, verify the tables were created:

```sql
USE missing_person_tracker;
SHOW TABLES;
```

You should see:
- `user_locations`
- `location_history`

You can also check the table structure:
```sql
DESCRIBE user_locations;
DESCRIBE location_history;
```

## Testing

After creating the tables:

1. Restart your Next.js development server:
```bash
npm run dev
```

2. Log in as an admin user
3. Navigate to **Admin → Live Tracking**
4. The page should load without errors

## What These Tables Do

- **`user_locations`**: Stores the current/active GPS location for each user who has enabled location tracking
- **`location_history`**: Maintains a history of all location updates for tracking and analytics

## Troubleshooting

### Error: "Cannot add foreign key constraint"
This means the `users` table doesn't exist. Run the complete `database.sql` file first:
```bash
mysql -u root -p < database.sql
```

### Error: "Access denied"
Make sure you're using a MySQL user with CREATE TABLE privileges.

### Error: "Unknown database"
Create the database first:
```sql
CREATE DATABASE IF NOT EXISTS missing_person_tracker;
```

## Need Help?

If you encounter any issues:
1. Check that MySQL is running
2. Verify your database credentials in `.env.local`
3. Ensure the `missing_person_tracker` database exists
4. Check that you have proper MySQL permissions

---

**After completing this migration, your GPS tracking features will work properly!** ✅

