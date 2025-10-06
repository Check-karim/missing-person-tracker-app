#!/bin/bash

# Missing Person Tracker - Setup Script
# This script helps you set up the project quickly

echo "================================"
echo "Missing Person Tracker - Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✓ npm found: $(npm --version)"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL command not found. Make sure MySQL is installed and in your PATH."
    echo "   Visit: https://dev.mysql.com/downloads/"
fi

echo ""
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed successfully"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    
    cat > .env.local << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=missing_person_tracker
DB_PORT=3306

# JWT Secret
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your_jwt_secret_key_change_this_in_production")

# Admin Credentials
ADMIN_EMAIL=admin@tracker.com
ADMIN_PASSWORD=Admin@123

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF

    echo "✓ Created .env.local file"
    echo "⚠️  Please edit .env.local with your MySQL password and other settings"
    echo ""
else
    echo "✓ .env.local already exists"
    echo ""
fi

# Prompt for database setup
read -p "Do you want to set up the database now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter MySQL root password: " -s mysql_password
    echo ""
    
    echo "Setting up database..."
    mysql -u root -p"$mysql_password" < database.sql
    
    if [ $? -eq 0 ]; then
        echo "✓ Database setup completed successfully"
    else
        echo "❌ Database setup failed. Please check your MySQL credentials."
        echo "   You can manually run: mysql -u root -p < database.sql"
    fi
    echo ""
fi

echo "================================"
echo "Setup Complete! 🎉"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your actual MySQL password"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@tracker.com"
echo "  Password: Admin@123"
echo ""
echo "For more information, see README.md or INSTALLATION.md"
echo ""

