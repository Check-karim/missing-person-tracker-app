# Installation Guide - Missing Person Tracker

## Quick Start Guide

Follow these steps to get the Missing Person Tracker up and running on your local machine.

### Step 1: Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)
- **npm** or **yarn** package manager (comes with Node.js)

Verify your installations:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
mysql --version # Should show 8.0.x or higher
```

### Step 2: Clone the Repository

```bash
git clone <repository-url>
cd tracker
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js
- React
- TypeScript
- Tailwind CSS
- MySQL2
- And other dependencies

### Step 4: Set Up MySQL Database

#### 4.1 Start MySQL Service

**On Windows:**
```bash
net start MySQL80
```

**On macOS/Linux:**
```bash
sudo service mysql start
# or
sudo systemctl start mysql
```

#### 4.2 Log into MySQL

```bash
mysql -u root -p
```
Enter your MySQL root password when prompted.

#### 4.3 Run the Database Schema

**Option A: From MySQL CLI**
```sql
source /path/to/tracker/database.sql
```

**Option B: From Terminal**
```bash
mysql -u root -p < database.sql
```

**Option C: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your local server
3. File > Open SQL Script
4. Select `database.sql`
5. Execute the script

#### 4.4 Verify Database Creation

```sql
SHOW DATABASES;
USE missing_person_tracker;
SHOW TABLES;
```

You should see 5 tables:
- users
- missing_persons
- status_updates
- comments
- notifications

### Step 5: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# On Windows
copy .env.example .env.local

# On macOS/Linux
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=missing_person_tracker
DB_PORT=3306

# JWT Secret (generate a random string)
JWT_SECRET=your_random_secret_key_here_min_32_characters

# Admin Credentials
ADMIN_EMAIL=admin@tracker.com
ADMIN_PASSWORD=Admin@123

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Important Notes:**
- Replace `your_mysql_password` with your actual MySQL password
- Generate a secure JWT_SECRET (you can use: `openssl rand -base64 32`)
- Change the admin password in production!

### Step 6: Run the Application

#### Development Mode

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

You should see:
- ✓ Ready in [time]
- ○ Compiling ...
- ✓ Compiled successfully

#### Production Mode

```bash
npm run build
npm start
```

### Step 7: Test the Application

1. **Open your browser** and navigate to `http://localhost:3000`

2. **Splash Screen**: You'll see the splash screen for 2-3 seconds

3. **Login/Register**: 
   - Click "Sign up" to create a new account
   - Or use admin credentials to login:
     - Email: `admin@tracker.com`
     - Password: `Admin@123`

4. **Dashboard**: After login, you'll be redirected to the dashboard

5. **Test Features**:
   - Report a missing person
   - View the missing persons list
   - Update case status
   - Add comments
   - Check admin dashboard (if logged in as admin)

## Common Issues and Solutions

### Issue 1: Database Connection Failed

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solutions**:
- Make sure MySQL service is running
- Verify database credentials in `.env.local`
- Check if MySQL is listening on port 3306:
  ```sql
  SHOW VARIABLES LIKE 'port';
  ```

### Issue 2: Module Not Found

**Error**: `Module not found: Can't resolve...`

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue 3: Port Already in Use

**Error**: `Port 3000 is already in use`

**Solutions**:
- Kill the process using port 3000:
  ```bash
  # On Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # On macOS/Linux
  lsof -ti:3000 | xargs kill -9
  ```
- Or use a different port:
  ```bash
  PORT=3001 npm run dev
  ```

### Issue 4: JWT Token Issues

**Error**: `Invalid token` or authentication errors

**Solution**:
- Clear browser localStorage
- Make sure JWT_SECRET is set in `.env.local`
- Logout and login again

### Issue 5: Database Schema Issues

**Error**: `Table doesn't exist`

**Solution**:
1. Drop and recreate the database:
   ```sql
   DROP DATABASE IF EXISTS missing_person_tracker;
   ```
2. Run the database.sql file again

## Verification Checklist

- [ ] Node.js installed and version is 18+
- [ ] MySQL installed and running
- [ ] Database created with all tables
- [ ] .env.local file configured correctly
- [ ] Dependencies installed successfully
- [ ] Application starts without errors
- [ ] Can register a new user
- [ ] Can login successfully
- [ ] Dashboard loads correctly
- [ ] Can create a missing person report
- [ ] Admin dashboard accessible with admin credentials

## Next Steps

After successful installation:

1. **Change Admin Password**: Update the admin password in production
2. **Configure Production Database**: Set up a production MySQL database
3. **Set Up Backup**: Configure regular database backups
4. **SSL Certificate**: Set up HTTPS for production
5. **Domain Configuration**: Point your domain to the application
6. **Monitoring**: Set up error tracking and monitoring

## Getting Help

If you encounter issues:

1. Check the [README.md](README.md) for detailed documentation
2. Review the [.cursorrules](.cursorrules) for project information
3. Check the console for error messages
4. Verify all environment variables are set correctly
5. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, MySQL version)

## Production Deployment

For production deployment:

1. Use a production-grade MySQL database
2. Set NODE_ENV=production
3. Use strong JWT_SECRET
4. Enable HTTPS
5. Configure proper CORS
6. Set up database backups
7. Use environment-specific configuration
8. Enable logging and monitoring
9. Set up CI/CD pipeline
10. Configure rate limiting

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run linter

# Database
mysql -u root -p    # Connect to MySQL
SHOW DATABASES;     # List databases
USE missing_person_tracker;  # Select database
SHOW TABLES;        # List tables
DESCRIBE users;     # Show table structure

# Debugging
npm run dev -- --inspect  # Start with Node inspector
```

## Success!

If you've completed all steps successfully, you now have a fully functional Missing Person Tracker application running locally! 🎉

Happy tracking! If you encounter any issues, please refer to the troubleshooting section or open an issue on GitHub.

