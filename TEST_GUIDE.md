# Quick Test Guide - Missing Person Tracker API

## Prerequisites

- Node.js installed
- MySQL database running
- Server started on port 3000

## Running the API Tests

### Step 1: Start the Development Server

```bash
npm run dev
```

Wait for the server to start. You should see:
```
✓ Ready in Xms
○ Local: http://localhost:3000
```

### Step 2: Run the Test Script

Open a new terminal window and run:

```bash
node test-api.js
```

## What Gets Tested

### ✅ Authentication (4 tests)
- User registration
- User login  
- Admin login
- Get current user info

### ✅ Missing Persons CRUD (10+ tests)
- Create report
- Get all reports
- Get single report
- Get my reports
- Update report
- Update by admin (triggers notification)
- Search by name
- Filter by status
- Filter by priority
- Delete (admin only)

### ✅ Status Updates (3 tests)
- Change status to investigation
- Change status to found
- Verify notifications created

### ✅ Comments (3 tests)
- Add regular comment
- Add anonymous comment
- Get all comments
- Verify notifications

### ✅ Admin Features (2 tests)
- Get analytics dashboard
- Admin-only delete permission

### ✅ Validation (4 tests)
- Reject incomplete data
- Handle non-existent records
- Reject invalid status values
- Block unauthorized access

## Expected Output

```
============================================================
   Missing Person Tracker - API Test Suite
============================================================

============================================================
Testing Authentication APIs
============================================================
ℹ Testing user registration...
✓ User registration successful
ℹ Registering second test user...
✓ Second user registration successful
ℹ Testing user login...
✓ User login successful
ℹ Testing admin login...
✓ Admin login successful
ℹ Testing get current user...
✓ Get current user successful
✓ Authentication tests PASSED

============================================================
Testing Missing Persons CRUD APIs
============================================================
ℹ Testing create missing person report...
✓ Missing person report created successfully (ID: 123)
ℹ Testing get all missing persons...
✓ Retrieved X missing persons
ℹ Testing get single missing person...
✓ Retrieved single missing person successfully
[... more tests ...]
✓ Missing Persons CRUD tests PASSED

============================================================
Testing Status Updates & Notifications
============================================================
ℹ Testing status update...
✓ Status updated successfully (should trigger notification)
ℹ Testing get notifications...
✓ Retrieved X notifications (Y unread)
  1. [status_update] Status Update: Status updated to: investigation
✓ Status Updates tests PASSED

============================================================
Testing Comments & Notifications
============================================================
ℹ Testing create comment...
✓ Comment created successfully (should trigger notification)
ℹ Testing create anonymous comment...
✓ Anonymous comment created successfully
ℹ Testing get comments...
✓ Retrieved X comments
✓ Comments tests PASSED

============================================================
Testing Admin Features
============================================================
ℹ Testing admin analytics...
✓ Admin analytics retrieved successfully:
  Total Cases: X
  Active Missing: Y
  Found Cases: Z
✓ Admin Features tests PASSED

============================================================
Testing Validation & Edge Cases
============================================================
ℹ Testing create without required fields...
✓ Validation working - rejected incomplete data
ℹ Testing update non-existent record...
✓ Update validation working - non-existent record
✓ Validation tests PASSED

============================================================
Test Summary
============================================================
Total Test Suites: 6
Passed: 6
Failed: 0

✓ All tests passed successfully!
```

## Manual API Testing

If you prefer manual testing, you can use tools like:

### Using cURL

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@test.com","password":"Test@123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123"}'
```

**Create Report:**
```bash
curl -X POST http://localhost:3000/api/missing-persons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"full_name":"John Doe","gender":"male","last_seen_location":"Test","last_seen_date":"2025-10-01","contact_name":"Test","contact_phone":"+1234567890"}'
```

**Get Notifications:**
```bash
curl http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman or Insomnia

1. Import the following endpoints:
   - `POST http://localhost:3000/api/auth/register`
   - `POST http://localhost:3000/api/auth/login`
   - `GET http://localhost:3000/api/missing-persons`
   - `POST http://localhost:3000/api/missing-persons`
   - `PUT http://localhost:3000/api/missing-persons/:id`
   - `PUT http://localhost:3000/api/missing-persons/:id/status`
   - `POST http://localhost:3000/api/comments`
   - `GET http://localhost:3000/api/notifications`

2. For authenticated endpoints, add header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

## Notification Testing Checklist

To verify notifications work correctly:

1. **Create a test case as User A**
2. **Login as User B (or admin)**
3. **Update the case** (change priority, add info, etc.)
4. **Login back as User A**
5. **Check notifications** - Should see notification about the update

### Expected Notification Types:

| Action | Notification Title | Notification Type |
|--------|-------------------|-------------------|
| Status changed by others | Status Update | status_update |
| Case details updated by others | Case Updated | general |
| Someone comments on case | New Comment | comment |
| Person marked as found | Status Update | found |

## Troubleshooting

### Server Not Running
```
✗ Server is not running on http://localhost:3000
Please start the server with: npm run dev
```
**Solution:** Start the dev server first

### Database Connection Error
```
Get missing persons error: Error: connect ECONNREFUSED
```
**Solution:** Check MySQL is running and `.env.local` is configured

### Authentication Errors
```
{ error: 'Unauthorized' }
```
**Solution:** Ensure you're passing the Bearer token in Authorization header

### Test Timeouts
**Solution:** Increase timeout or check if API is responding slowly

## Cleaning Up Test Data

After testing, you may want to clean up test data:

```sql
-- Remove test users (will cascade delete their reports)
DELETE FROM users WHERE email LIKE 'test%@test.com';

-- Or reset the entire database
DROP DATABASE missing_person_tracker;
CREATE DATABASE missing_person_tracker;
-- Then re-run the database.sql script
```

## Performance Monitoring

During tests, monitor:
- Response times (should be < 500ms for most operations)
- Database query performance
- Memory usage
- Number of database connections

## Next Steps

1. ✅ Run automated tests
2. ✅ Verify all endpoints work
3. ✅ Check notifications are created
4. ✅ Test with multiple users
5. ✅ Verify admin-only features
6. Review the `API_AUDIT_REPORT.md` for detailed findings

## Support

If you encounter issues:
1. Check server logs for errors
2. Verify database connectivity
3. Ensure all environment variables are set
4. Check the `API_AUDIT_REPORT.md` for API details

---

**Last Updated:** October 12, 2025  
**Test Script Version:** 1.0  
**Compatible With:** Missing Person Tracker v1.0

