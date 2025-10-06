@echo off
REM Missing Person Tracker - Setup Script for Windows
REM This script helps you set up the project quickly

echo ================================
echo Missing Person Tracker - Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed. Please install Node.js 18+ first.
    echo   Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo + Node.js found
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo + npm found
npm --version

REM Check if MySQL is installed
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ! MySQL command not found. Make sure MySQL is installed and in your PATH.
    echo   Visit: https://dev.mysql.com/downloads/
)

echo.
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo X Failed to install dependencies
    pause
    exit /b 1
)

echo + Dependencies installed successfully
echo.

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo Creating .env.local file...
    
    (
        echo # Database Configuration
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=your_password
        echo DB_NAME=missing_person_tracker
        echo DB_PORT=3306
        echo.
        echo # JWT Secret
        echo JWT_SECRET=your_jwt_secret_key_change_this_in_production
        echo.
        echo # Admin Credentials
        echo ADMIN_EMAIL=admin@tracker.com
        echo ADMIN_PASSWORD=Admin@123
        echo.
        echo # Next.js
        echo NEXT_PUBLIC_API_URL=http://localhost:3000
    ) > .env.local

    echo + Created .env.local file
    echo ! Please edit .env.local with your MySQL password and other settings
    echo.
) else (
    echo + .env.local already exists
    echo.
)

REM Prompt for database setup
set /p setup_db="Do you want to set up the database now? (y/n) "

if /i "%setup_db%"=="y" (
    set /p mysql_password="Enter MySQL root password: "
    
    echo Setting up database...
    mysql -u root -p%mysql_password% < database.sql
    
    if %ERRORLEVEL% EQU 0 (
        echo + Database setup completed successfully
    ) else (
        echo X Database setup failed. Please check your MySQL credentials.
        echo   You can manually run: mysql -u root -p < database.sql
    )
    echo.
)

echo ================================
echo Setup Complete! 🎉
echo ================================
echo.
echo Next steps:
echo 1. Edit .env.local with your actual MySQL password
echo 2. Run 'npm run dev' to start the development server
echo 3. Open http://localhost:3000 in your browser
echo.
echo Default admin credentials:
echo   Email: admin@tracker.com
echo   Password: Admin@123
echo.
echo For more information, see README.md or INSTALLATION.md
echo.
pause

