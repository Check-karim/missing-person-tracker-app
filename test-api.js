/**
 * Comprehensive API Test Script for Missing Person Tracker
 * Tests all CRUD operations and notification functionality
 * 
 * Usage: node test-api.js
 * Note: Server must be running on http://localhost:3000
 */

const BASE_URL = 'http://localhost:3000';

// Test utilities
const log = {
  success: (msg) => console.log('\x1b[32m✓\x1b[0m', msg),
  error: (msg) => console.log('\x1b[31m✗\x1b[0m', msg),
  info: (msg) => console.log('\x1b[36mℹ\x1b[0m', msg),
  section: (msg) => console.log('\n\x1b[1m' + '='.repeat(60) + '\x1b[0m\n\x1b[1m' + msg + '\x1b[0m\n' + '='.repeat(60))
};

let testUser = null;
let testUser2 = null;
let adminUser = null;
let testCaseId = null;
let testCommentId = null;

// Helper function to make API calls
async function apiCall(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// Test 1: Authentication APIs
async function testAuthentication() {
  log.section('Testing Authentication APIs');

  // Test Register
  log.info('Testing user registration...');
  const registerData = {
    full_name: 'Test User',
    email: `test${Date.now()}@test.com`,
    password: 'Test@123',
    phone: '+1234567890'
  };

  const register = await apiCall('POST', '/api/auth/register', registerData);
  if (register.status === 201 && register.data.token) {
    testUser = { ...register.data.user, token: register.data.token };
    log.success('User registration successful');
  } else {
    log.error(`Registration failed: ${JSON.stringify(register)}`);
    return false;
  }

  // Register second user for testing notifications
  log.info('Registering second test user...');
  const registerData2 = {
    full_name: 'Test User 2',
    email: `test2${Date.now()}@test.com`,
    password: 'Test@123',
    phone: '+1234567891'
  };
  const register2 = await apiCall('POST', '/api/auth/register', registerData2);
  if (register2.status === 201) {
    testUser2 = { ...register2.data.user, token: register2.data.token };
    log.success('Second user registration successful');
  } else {
    log.error('Second user registration failed');
  }

  // Test Login
  log.info('Testing user login...');
  const login = await apiCall('POST', '/api/auth/login', {
    email: registerData.email,
    password: registerData.password
  });
  if (login.status === 200 && login.data.token) {
    log.success('User login successful');
  } else {
    log.error('Login failed');
    return false;
  }

  // Test Admin Login
  log.info('Testing admin login...');
  const adminLogin = await apiCall('POST', '/api/auth/login', {
    email: 'admin@tracker.com',
    password: 'Admin@123'
  });
  if (adminLogin.status === 200 && adminLogin.data.token) {
    adminUser = { ...adminLogin.data.user, token: adminLogin.data.token };
    log.success('Admin login successful');
  } else {
    log.error('Admin login failed');
  }

  // Test Get Current User
  log.info('Testing get current user...');
  const me = await apiCall('GET', '/api/auth/me', null, testUser.token);
  if (me.status === 200 && me.data.user) {
    log.success('Get current user successful');
  } else {
    log.error('Get current user failed');
    return false;
  }

  return true;
}

// Test 2: Missing Persons CRUD
async function testMissingPersonsCRUD() {
  log.section('Testing Missing Persons CRUD APIs');

  // Test CREATE
  log.info('Testing create missing person report...');
  const reportData = {
    full_name: 'John Test Doe',
    age: 25,
    gender: 'male',
    last_seen_location: 'Test Location, Test City',
    last_seen_date: '2025-10-01',
    last_seen_time: '14:30:00',
    height: '5\'10"',
    weight: '170 lbs',
    hair_color: 'Brown',
    eye_color: 'Blue',
    contact_name: 'Test Contact',
    contact_phone: '+1234567890',
    priority: 'high',
    distinctive_features: 'Test tattoo on left arm'
  };

  const create = await apiCall('POST', '/api/missing-persons', reportData, testUser.token);
  if (create.status === 201 && create.data.data) {
    testCaseId = create.data.data.id;
    log.success(`Missing person report created successfully (ID: ${testCaseId})`);
  } else {
    log.error('Create missing person failed');
    return false;
  }

  // Test READ ALL
  log.info('Testing get all missing persons...');
  const getAll = await apiCall('GET', '/api/missing-persons');
  if (getAll.status === 200 && getAll.data.data) {
    log.success(`Retrieved ${getAll.data.data.length} missing persons`);
  } else {
    log.error('Get all missing persons failed');
    return false;
  }

  // Test READ SINGLE
  log.info('Testing get single missing person...');
  const getSingle = await apiCall('GET', `/api/missing-persons/${testCaseId}`);
  if (getSingle.status === 200 && getSingle.data.data) {
    log.success('Retrieved single missing person successfully');
  } else {
    log.error('Get single missing person failed');
    return false;
  }

  // Test GET MY REPORTS
  log.info('Testing get my reports...');
  const myReports = await apiCall('GET', '/api/missing-persons/my-reports', null, testUser.token);
  if (myReports.status === 200 && myReports.data.data) {
    log.success(`Retrieved ${myReports.data.data.length} user reports`);
  } else {
    log.error('Get my reports failed');
    return false;
  }

  // Test UPDATE
  log.info('Testing update missing person...');
  const update = await apiCall('PUT', `/api/missing-persons/${testCaseId}`, {
    additional_info: 'Updated test information',
    priority: 'critical'
  }, testUser.token);
  if (update.status === 200) {
    log.success('Missing person updated successfully');
  } else {
    log.error('Update missing person failed');
    return false;
  }

  // Test UPDATE by another user (should create notification)
  log.info('Testing update by another user (for notification)...');
  const updateByOther = await apiCall('PUT', `/api/missing-persons/${testCaseId}`, {
    additional_info: 'Updated by admin'
  }, adminUser.token);
  if (updateByOther.status === 200) {
    log.success('Update by admin successful (should trigger notification)');
  } else {
    log.error('Update by admin failed');
  }

  // Test SEARCH & FILTER
  log.info('Testing search functionality...');
  const search = await apiCall('GET', '/api/missing-persons?search=John');
  if (search.status === 200) {
    log.success(`Search returned ${search.data.data.length} results`);
  } else {
    log.error('Search failed');
  }

  log.info('Testing status filter...');
  const filter = await apiCall('GET', '/api/missing-persons?status=missing');
  if (filter.status === 200) {
    log.success(`Status filter returned ${filter.data.data.length} results`);
  } else {
    log.error('Status filter failed');
  }

  log.info('Testing priority filter...');
  const priorityFilter = await apiCall('GET', '/api/missing-persons?priority=critical');
  if (priorityFilter.status === 200) {
    log.success(`Priority filter returned ${priorityFilter.data.data.length} results`);
  } else {
    log.error('Priority filter failed');
  }

  return true;
}

// Test 3: Status Updates with Notifications
async function testStatusUpdates() {
  log.section('Testing Status Updates & Notifications');

  // Test STATUS UPDATE
  log.info('Testing status update...');
  const statusUpdate = await apiCall('PUT', `/api/missing-persons/${testCaseId}/status`, {
    status: 'investigation',
    update_note: 'Investigation started'
  }, testUser2.token);
  
  if (statusUpdate.status === 200) {
    log.success('Status updated successfully (should trigger notification)');
  } else {
    log.error('Status update failed');
    return false;
  }

  // Wait a bit for notification to be created
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test GET NOTIFICATIONS (should show status update notification)
  log.info('Testing get notifications...');
  const notifications = await apiCall('GET', '/api/notifications', null, testUser.token);
  if (notifications.status === 200 && notifications.data.data) {
    const count = notifications.data.data.length;
    const unreadCount = notifications.data.data.filter(n => !n.is_read).length;
    log.success(`Retrieved ${count} notifications (${unreadCount} unread)`);
    
    // Show notification details
    if (count > 0) {
      notifications.data.data.forEach((notif, idx) => {
        log.info(`  ${idx + 1}. [${notif.type}] ${notif.title}: ${notif.message}`);
      });
    }
  } else {
    log.error('Get notifications failed');
    return false;
  }

  // Test MARK NOTIFICATION AS READ
  if (notifications.data.data.length > 0) {
    const notifId = notifications.data.data[0].id;
    log.info('Testing mark notification as read...');
    const markRead = await apiCall('PUT', '/api/notifications', {
      notification_id: notifId
    }, testUser.token);
    if (markRead.status === 200) {
      log.success('Notification marked as read successfully');
    } else {
      log.error('Mark notification as read failed');
    }
  }

  // Test UPDATE STATUS TO FOUND
  log.info('Testing update status to found...');
  const foundUpdate = await apiCall('PUT', `/api/missing-persons/${testCaseId}/status`, {
    status: 'found',
    update_note: 'Person found safe',
    found_location: 'Test Found Location'
  }, testUser2.token);
  
  if (foundUpdate.status === 200) {
    log.success('Status updated to found (should trigger notification)');
  } else {
    log.error('Status update to found failed');
  }

  return true;
}

// Test 4: Comments with Notifications
async function testComments() {
  log.section('Testing Comments & Notifications');

  // Test CREATE COMMENT
  log.info('Testing create comment...');
  const comment = await apiCall('POST', '/api/comments', {
    missing_person_id: testCaseId,
    comment: 'This is a test comment with important information',
    is_anonymous: false
  }, testUser2.token);

  if (comment.status === 201 && comment.data.data) {
    testCommentId = comment.data.data.id;
    log.success('Comment created successfully (should trigger notification)');
  } else {
    log.error('Create comment failed');
    return false;
  }

  // Test CREATE ANONYMOUS COMMENT
  log.info('Testing create anonymous comment...');
  const anonComment = await apiCall('POST', '/api/comments', {
    missing_person_id: testCaseId,
    comment: 'This is an anonymous tip',
    is_anonymous: true
  }, testUser2.token);

  if (anonComment.status === 201) {
    log.success('Anonymous comment created successfully');
  } else {
    log.error('Create anonymous comment failed');
  }

  // Test GET COMMENTS
  log.info('Testing get comments...');
  const comments = await apiCall('GET', `/api/comments?missing_person_id=${testCaseId}`);
  if (comments.status === 200 && comments.data.data) {
    log.success(`Retrieved ${comments.data.data.length} comments`);
    comments.data.data.forEach((c, idx) => {
      log.info(`  ${idx + 1}. ${c.user_name}: ${c.comment.substring(0, 50)}...`);
    });
  } else {
    log.error('Get comments failed');
    return false;
  }

  // Check notifications again
  await new Promise(resolve => setTimeout(resolve, 500));
  log.info('Checking notifications after comment...');
  const notifs = await apiCall('GET', '/api/notifications', null, testUser.token);
  if (notifs.status === 200) {
    const commentNotifs = notifs.data.data.filter(n => n.type === 'comment');
    log.success(`Found ${commentNotifs.length} comment notifications`);
  }

  return true;
}

// Test 5: Admin Features
async function testAdminFeatures() {
  log.section('Testing Admin Features');

  // Test ADMIN ANALYTICS
  log.info('Testing admin analytics...');
  const analytics = await apiCall('GET', '/api/admin/analytics', null, adminUser.token);
  if (analytics.status === 200 && analytics.data.statistics) {
    const stats = analytics.data.statistics;
    log.success('Admin analytics retrieved successfully:');
    log.info(`  Total Cases: ${stats.total_cases}`);
    log.info(`  Active Missing: ${stats.active_missing}`);
    log.info(`  Found Cases: ${stats.found_cases}`);
    log.info(`  Under Investigation: ${stats.under_investigation}`);
    log.info(`  Closed Cases: ${stats.closed_cases}`);
    log.info(`  Critical Cases: ${stats.critical_cases}`);
  } else {
    log.error('Admin analytics failed');
    return false;
  }

  // Test DELETE (Admin only)
  log.info('Testing delete missing person (admin only)...');
  // First create a test case to delete
  const tempCase = await apiCall('POST', '/api/missing-persons', {
    full_name: 'Temp Test Case',
    gender: 'male',
    last_seen_location: 'Test',
    last_seen_date: '2025-10-01',
    contact_name: 'Test',
    contact_phone: '+1234567890'
  }, testUser.token);

  if (tempCase.status === 201) {
    const tempId = tempCase.data.data.id;
    
    // Try to delete as regular user (should fail)
    const deleteAsUser = await apiCall('DELETE', `/api/missing-persons/${tempId}`, null, testUser.token);
    if (deleteAsUser.status === 403) {
      log.success('Delete blocked for non-admin (as expected)');
    } else {
      log.error('Delete should be blocked for non-admin users');
    }

    // Delete as admin (should succeed)
    const deleteAsAdmin = await apiCall('DELETE', `/api/missing-persons/${tempId}`, null, adminUser.token);
    if (deleteAsAdmin.status === 200) {
      log.success('Delete successful for admin');
    } else {
      log.error('Admin delete failed');
    }
  }

  return true;
}

// Test 6: Edge Cases and Validation
async function testValidation() {
  log.section('Testing Validation & Edge Cases');

  // Test create without required fields
  log.info('Testing create without required fields...');
  const invalidCreate = await apiCall('POST', '/api/missing-persons', {
    full_name: 'Test'
  }, testUser.token);
  if (invalidCreate.status === 400) {
    log.success('Validation working - rejected incomplete data');
  } else {
    log.error('Validation failed - should reject incomplete data');
  }

  // Test update non-existent record
  log.info('Testing update non-existent record...');
  const invalidUpdate = await apiCall('PUT', '/api/missing-persons/999999', {
    full_name: 'Test'
  }, testUser.token);
  if (invalidUpdate.status === 404) {
    log.success('Update validation working - non-existent record');
  } else {
    log.error('Should return 404 for non-existent record');
  }

  // Test invalid status update
  log.info('Testing invalid status value...');
  const invalidStatus = await apiCall('PUT', `/api/missing-persons/${testCaseId}/status`, {
    status: 'invalid_status'
  }, testUser.token);
  if (invalidStatus.status === 400) {
    log.success('Status validation working - rejected invalid status');
  } else {
    log.error('Should reject invalid status values');
  }

  // Test unauthorized access
  log.info('Testing unauthorized access...');
  const noAuth = await apiCall('POST', '/api/missing-persons', {
    full_name: 'Test',
    gender: 'male',
    last_seen_location: 'Test',
    last_seen_date: '2025-10-01',
    contact_name: 'Test',
    contact_phone: '+1234567890'
  });
  if (noAuth.status === 401) {
    log.success('Auth validation working - rejected unauthorized request');
  } else {
    log.error('Should reject unauthorized requests');
  }

  return true;
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('   Missing Person Tracker - API Test Suite');
  console.log('='.repeat(60) + '\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  try {
    // Run all tests
    const tests = [
      { name: 'Authentication', fn: testAuthentication },
      { name: 'Missing Persons CRUD', fn: testMissingPersonsCRUD },
      { name: 'Status Updates', fn: testStatusUpdates },
      { name: 'Comments', fn: testComments },
      { name: 'Admin Features', fn: testAdminFeatures },
      { name: 'Validation', fn: testValidation }
    ];

    for (const test of tests) {
      results.total++;
      try {
        const passed = await test.fn();
        if (passed !== false) {
          results.passed++;
          log.success(`${test.name} tests PASSED\n`);
        } else {
          results.failed++;
          log.error(`${test.name} tests FAILED\n`);
        }
      } catch (error) {
        results.failed++;
        log.error(`${test.name} tests FAILED with error: ${error.message}\n`);
      }
    }

    // Print summary
    log.section('Test Summary');
    console.log(`Total Test Suites: ${results.total}`);
    console.log(`\x1b[32mPassed: ${results.passed}\x1b[0m`);
    console.log(`\x1b[31mFailed: ${results.failed}\x1b[0m`);
    
    if (results.failed === 0) {
      console.log('\n\x1b[32m✓ All tests passed successfully!\x1b[0m\n');
    } else {
      console.log('\n\x1b[31m✗ Some tests failed. Please check the logs above.\x1b[0m\n');
    }

  } catch (error) {
    console.error('\n\x1b[31mTest suite failed with error:\x1b[0m', error);
  }
}

// Check if server is running before starting tests
async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    return true;
  } catch (error) {
    console.error('\x1b[31m✗ Server is not running on', BASE_URL, '\x1b[0m');
    console.log('Please start the server with: npm run dev');
    return false;
  }
}

// Run tests
checkServer().then(isRunning => {
  if (isRunning) {
    runTests();
  } else {
    process.exit(1);
  }
});

