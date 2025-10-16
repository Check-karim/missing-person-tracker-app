# Fix: Missing GPS Columns Error

## Error Message
```
Error: Unknown column 'last_seen_latitude' in 'field list'
```

This error occurs when your database was created before GPS columns were added to the schema, or you have an outdated version of the `missing_persons` table.

## Quick Fix

### Method 1: Run the Batch File (Easiest - Windows)

1. **Double-click** `fix_missing_columns.bat`
2. Enter your MySQL username (usually `root`)
3. Enter your MySQL password when prompted
4. Done! ✅

### Method 2: Run SQL Script Directly

```bash
mysql -u root -p missing_person_tracker < add_missing_person_gps_columns.sql
```

### Method 3: Manual SQL (Copy & Paste)

Open MySQL Workbench, phpMyAdmin, or MySQL command line and run:

```sql
USE missing_person_tracker;

-- Add GPS columns to missing_persons table
ALTER TABLE missing_persons 
ADD COLUMN IF NOT EXISTS last_seen_latitude DECIMAL(10, 8) AFTER last_seen_location,
ADD COLUMN IF NOT EXISTS last_seen_longitude DECIMAL(11, 8) AFTER last_seen_latitude;

-- Also add found location GPS columns
ALTER TABLE missing_persons
ADD COLUMN IF NOT EXISTS found_latitude DECIMAL(10, 8) AFTER found_location,
ADD COLUMN IF NOT EXISTS found_longitude DECIMAL(11, 8) AFTER found_latitude;
```

## Verify the Fix

After running the migration, verify the columns exist:

```sql
USE missing_person_tracker;
DESCRIBE missing_persons;
```

You should see:
- `last_seen_latitude` (DECIMAL(10,8))
- `last_seen_longitude` (DECIMAL(11,8))
- `found_latitude` (DECIMAL(10,8))
- `found_longitude` (DECIMAL(11,8))

## Test the Application

1. **Restart your Next.js server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

2. **Try to report a missing person:**
   - Go to "Report Missing Person"
   - Fill in the form
   - Click "Use Current Location" or "Select on Map"
   - Submit the form
   - Should work without errors! ✅

## Why This Happened

There are a few reasons this might happen:

1. **Database created before GPS feature:**
   - You created the database with an older version of `database.sql`
   - GPS columns were added later

2. **Partial database setup:**
   - Only some tables were created
   - Migration wasn't run

3. **Database was reset:**
   - Tables were dropped and recreated without GPS columns

## Complete Database Reset (If Issues Persist)

If the above fixes don't work, you may need to recreate the entire database:

### ⚠️ WARNING: This will delete ALL existing data!

```sql
-- Backup your data first if needed
DROP DATABASE IF EXISTS missing_person_tracker;

-- Recreate from scratch
CREATE DATABASE missing_person_tracker;
```

Then run the complete schema:
```bash
mysql -u root -p < database.sql
```

## Columns Added by This Migration

| Column Name | Type | Description |
|------------|------|-------------|
| `last_seen_latitude` | DECIMAL(10,8) | GPS latitude of last seen location |
| `last_seen_longitude` | DECIMAL(11,8) | GPS longitude of last seen location |
| `found_latitude` | DECIMAL(10,8) | GPS latitude where person was found |
| `found_longitude` | DECIMAL(11,8) | GPS longitude where person was found |

## Related Migrations

If you're also getting errors about other missing tables/columns, run these in order:

1. **GPS Tracking Tables** (if not exist):
   ```bash
   mysql -u root -p missing_person_tracker < add_gps_tables.sql
   ```

2. **Missing Persons GPS Columns** (this migration):
   ```bash
   mysql -u root -p missing_person_tracker < add_missing_person_gps_columns.sql
   ```

## Troubleshooting

### Error: "Table 'missing_person_tracker.missing_persons' doesn't exist"

Your database wasn't created. Run the full schema:
```bash
mysql -u root -p < database.sql
```

### Error: "Access denied"

You don't have ALTER TABLE permissions. Use a user with proper privileges:
```sql
GRANT ALTER ON missing_person_tracker.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Column already exists"

The migration script uses `ADD COLUMN IF NOT EXISTS` which should handle this, but if you get this error in older MySQL versions, the columns already exist. You're good to go!

### Still Getting Errors?

1. Check which columns exist:
   ```sql
   SHOW COLUMNS FROM missing_persons;
   ```

2. Check your `database.sql` file has these columns (lines 28-29)

3. Make sure you're running the latest version of the code

4. Try the complete database reset (see above)

## After Fix - Expected Behavior

Once fixed, you should be able to:

1. ✅ Click "Use Current Location" to get GPS coordinates
2. ✅ Click "Select on Map" to choose location visually
3. ✅ See coordinates auto-fill in the form
4. ✅ Submit missing person report successfully
5. ✅ View location on map in the report details
6. ✅ See missing person locations in admin dashboard

## For Developers

If you're deploying to a new environment, make sure to run all migrations in order:

```bash
# 1. Create database and base schema
mysql -u root -p < database.sql

# 2. Add GPS tracking tables
mysql -u root -p missing_person_tracker < add_gps_tables.sql

# 3. Add GPS columns to missing_persons (if not in base schema)
mysql -u root -p missing_person_tracker < add_missing_person_gps_columns.sql
```

Or better yet, use the all-in-one setup:
```bash
# Windows
setup.bat

# Linux/Mac
./setup.sh
```

---

**After running this migration, your application should work perfectly!** 🎉

If you continue to have issues, please check:
- MySQL is running
- Database credentials are correct in `.env.local`
- You're using the correct database name
- You have proper permissions

