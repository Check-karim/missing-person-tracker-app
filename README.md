# Missing Person Tracker 🔍

A comprehensive, mobile-first web application for tracking and reporting missing persons. Built with Next.js, TypeScript, Tailwind CSS, and MySQL.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### User Features
- 🔐 **User Authentication**: Secure registration and login system
- 📝 **Report Missing Persons**: Submit detailed reports with comprehensive information
- 🔍 **Search & Filter**: Advanced search by name, location, status, and priority
- 📊 **Track Reports**: View and manage your submitted reports
- 💬 **Comments & Tips**: Add comments and tips on cases (with anonymous option)
- 🔔 **Notifications**: Receive updates on your reports
- ✅ **Update Status**: Mark missing persons as found or update investigation status

### Admin Features
- 📈 **Analytics Dashboard**: Comprehensive statistics and insights
- 📊 **Data Visualization**: Charts showing case distributions and trends
- 👥 **User Management**: View all users and their activities
- 📋 **Report Generation**: Generate detailed analytics reports
- 🔍 **Advanced Filtering**: Filter by age groups, gender, priority levels
- ⏱️ **Performance Metrics**: Track average resolution times

### Technical Features
- 📱 **Mobile-First Design**: Optimized for mobile devices with responsive layouts
- 🎨 **Modern UI/UX**: Beautiful, intuitive interface with smooth animations
- ⚡ **Fast Performance**: Server-side rendering and optimized queries
- 🔒 **Secure**: JWT authentication, password hashing, SQL injection prevention
- 🌐 **SEO Friendly**: Proper meta tags and semantic HTML
- ♿ **Accessible**: WCAG compliant with proper ARIA labels

## 🛠️ Tech Stack

- **Frontend**: 
  - Next.js 14 (App Router)
  - React 18
  - TypeScript 5.3
  - Tailwind CSS 3.4
  
- **Backend**:
  - Next.js API Routes
  - MySQL 8.0
  - JWT Authentication
  
- **Libraries**:
  - bcryptjs (Password hashing)
  - jsonwebtoken (JWT tokens)
  - date-fns (Date formatting)
  - react-hot-toast (Notifications)
  - Chart.js (Data visualization)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ installed and running
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=missing_person_tracker
   DB_PORT=3306

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key_change_this_in_production

   # Admin Credentials
   ADMIN_EMAIL=admin@tracker.com
   ADMIN_PASSWORD=Admin@123

   # Next.js
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

### Database Setup

1. **Create the database**
   
   Log into MySQL:
   ```bash
   mysql -u root -p
   ```

2. **Run the database schema**
   ```bash
   mysql -u root -p < database.sql
   ```
   
   Or manually run the SQL file in your MySQL client:
   ```sql
   source /path/to/database.sql
   ```

3. **Verify tables created**
   ```sql
   USE missing_person_tracker;
   SHOW TABLES;
   ```

   You should see:
   - users
   - missing_persons
   - status_updates
   - comments
   - notifications

### Running the Application

1. **Development mode**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Production build**
   ```bash
   npm run build
   npm start
   ```

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | MySQL host address | Yes |
| `DB_USER` | MySQL username | Yes |
| `DB_PASSWORD` | MySQL password | Yes |
| `DB_NAME` | Database name | Yes |
| `DB_PORT` | MySQL port (default: 3306) | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `ADMIN_EMAIL` | Admin email address | Yes |
| `ADMIN_PASSWORD` | Admin password | Yes |
| `NEXT_PUBLIC_API_URL` | API base URL | Yes |

## 📖 Usage

### User Registration & Login

1. Navigate to the login page
2. Click "Sign up" to create a new account
3. Fill in your details and submit
4. You'll be automatically logged in and redirected to the dashboard

### Reporting a Missing Person

1. Log in to your account
2. Click "Report Missing" from the dashboard or navigation
3. Fill in all required fields:
   - Personal information (name, age, gender)
   - Last seen details (location, date, time)
   - Physical description
   - Contact information
4. Submit the report
5. You'll receive a unique case number

### Searching for Missing Persons

1. Go to the "Missing Persons" page
2. Use the search bar to search by name, case number, or location
3. Apply filters for status and priority
4. Click on any case to view detailed information

### Updating Case Status

1. Open a missing person's detail page
2. Click "Update Status"
3. Select the new status
4. Add notes about the update
5. If marking as "Found", provide the found location
6. Submit the update

### Admin Dashboard

1. Log in with admin credentials:
   - Email: `admin@tracker.com`
   - Password: `Admin@123`
2. Navigate to the Admin Dashboard
3. View comprehensive analytics:
   - Total cases, found, missing
   - Priority distributions
   - Age and gender statistics
   - Recent cases
   - Average resolution time

## 📁 Project Structure

```
tracker/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── me/
│   │   │   ├── missing-persons/ # Missing persons CRUD
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── status/
│   │   │   │   ├── my-reports/
│   │   │   │   └── route.ts
│   │   │   ├── comments/        # Comments API
│   │   │   ├── notifications/   # Notifications API
│   │   │   └── admin/           # Admin analytics
│   │   ├── auth/                # Auth pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/           # Main dashboard
│   │   ├── missing-persons/     # Missing persons list & detail
│   │   │   └── [id]/
│   │   ├── report/              # Report missing person
│   │   ├── my-reports/          # User's reports
│   │   ├── admin/               # Admin dashboard
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Splash screen
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── Navigation.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/                # React Context
│   │   └── AuthContext.tsx
│   ├── lib/                     # Utilities
│   │   ├── db.ts               # Database connection
│   │   ├── auth.ts             # Auth utilities
│   │   └── middleware.ts       # API middleware
│   └── types/                   # TypeScript types
│       └── index.ts
├── database.sql                 # Database schema
├── .cursorrules                # Project rules
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Missing Persons

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/missing-persons` | List all missing persons | No |
| POST | `/api/missing-persons` | Create new report | Yes |
| GET | `/api/missing-persons/[id]` | Get single person | No |
| PUT | `/api/missing-persons/[id]` | Update person details | Yes |
| DELETE | `/api/missing-persons/[id]` | Delete report (admin) | Yes (Admin) |
| PUT | `/api/missing-persons/[id]/status` | Update status | Yes |
| GET | `/api/missing-persons/my-reports` | Get user's reports | Yes |

### Comments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/comments` | Get comments for a case | No |
| POST | `/api/comments` | Add comment | Yes |

### Notifications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get user notifications | Yes |
| PUT | `/api/notifications` | Mark as read | Yes |

### Admin

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/analytics` | Get analytics data | Yes (Admin) |

## 👥 User Roles

### Regular User
- Register and login
- Report missing persons
- View all missing persons
- Update status on any case
- Add comments and tips
- Track their own reports
- Receive notifications

### Admin
- All regular user permissions
- Access admin dashboard
- View comprehensive analytics
- Delete reports
- View system-wide statistics
- Generate reports

**Default Admin Credentials:**
- Email: `admin@tracker.com`
- Password: `Admin@123`

> ⚠️ **Important**: Change the default admin password in production!

## 🎨 Screenshots

### Splash Screen
Beautiful splash screen with smooth animations when the app loads.

### Dashboard
- Quick stats overview
- Recent cases
- Quick action buttons
- Mobile-optimized layout

### Missing Persons List
- Search and filter functionality
- Card-based layout
- Status badges
- Priority indicators

### Detail View
- Comprehensive person information
- Status update functionality
- Comments section
- Contact information

### Admin Dashboard
- Analytics overview
- Charts and graphs
- Distribution statistics
- Recent activity

## 🔒 Security Features

- **Password Hashing**: Using bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: Server and client-side validation
- **Protected Routes**: Middleware authentication
- **XSS Prevention**: Proper input sanitization
- **CORS Configuration**: Restricted origins

## 🎯 Future Enhancements

- [ ] Image upload for missing persons
- [ ] Email notifications
- [ ] SMS alerts integration
- [ ] Map integration for locations
- [ ] Advanced search with AI
- [ ] Export reports (PDF, CSV)
- [ ] Multi-language support
- [ ] Real-time updates with WebSockets
- [ ] Push notifications
- [ ] Mobile apps (iOS/Android)
- [ ] Social media integration
- [ ] Face recognition
- [ ] Geolocation tracking

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Development

### Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Database Migrations

If you make changes to the database schema:

1. Update `database.sql` with the new schema
2. Create a migration script if needed
3. Document the changes in the README

## 🐛 Known Issues

- None at the moment

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- The open-source community for various libraries used

---

**Built with ❤️ to help bring missing persons home**

