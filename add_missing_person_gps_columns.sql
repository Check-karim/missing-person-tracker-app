-- Migration Script: Add GPS Columns to Missing Persons Table
-- Run this script if you get "Unknown column 'last_seen_latitude'" error

USE missing_person_tracker;

-- Add last_seen GPS columns
ALTER TABLE missing_persons 
ADD COLUMN last_seen_latitude DECIMAL(10, 8) AFTER last_seen_location;

ALTER TABLE missing_persons 
ADD COLUMN last_seen_longitude DECIMAL(11, 8) AFTER last_seen_latitude;

-- Add found location GPS columns
ALTER TABLE missing_persons
ADD COLUMN found_latitude DECIMAL(10, 8) AFTER found_location;

ALTER TABLE missing_persons
ADD COLUMN found_longitude DECIMAL(11, 8) AFTER found_latitude;

-- Verify columns were added
DESCRIBE missing_persons;

SELECT 'GPS columns added successfully!' as status;

