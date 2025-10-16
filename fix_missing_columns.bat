@echo off
REM Fix Missing GPS Columns in Missing Persons Table
REM Run this if you get "Unknown column 'last_seen_latitude'" error

echo ===============================================
echo  Fix Missing Persons GPS Columns
echo ===============================================
echo.

REM Check if MySQL is in PATH
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: MySQL is not found in your PATH
    echo Please install MySQL or add it to your PATH
    echo.
    echo Common MySQL locations:
    echo   C:\Program Files\MySQL\MySQL Server 8.0\bin
    echo   C:\xampp\mysql\bin
    echo   C:\wamp64\bin\mysql\mysql8.0.x\bin
    echo.
    pause
    exit /b 1
)

echo MySQL found!
echo.

REM Prompt for database credentials
set /p MYSQL_USER="Enter MySQL username (default: root): " || set MYSQL_USER=root
set /p MYSQL_DB="Enter database name (default: missing_person_tracker): " || set MYSQL_DB=missing_person_tracker

echo.
echo Connecting to MySQL...
echo Adding GPS columns to missing_persons table...
echo.

REM Run the SQL script
mysql -u %MYSQL_USER% -p %MYSQL_DB% < add_missing_person_gps_columns.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===============================================
    echo  SUCCESS! GPS columns added
    echo ===============================================
    echo.
    echo Columns added to missing_persons table:
    echo   - last_seen_latitude
    echo   - last_seen_longitude
    echo   - found_latitude (if not exists)
    echo   - found_longitude (if not exists)
    echo.
    echo You can now report missing persons with GPS coordinates!
    echo.
) else (
    echo.
    echo ===============================================
    echo  ERROR: Migration failed
    echo ===============================================
    echo.
    echo Please check:
    echo   1. MySQL is running
    echo   2. Database credentials are correct
    echo   3. Database 'missing_person_tracker' exists
    echo   4. You have ALTER TABLE permissions
    echo.
)

pause

