# Insert ID Access Fix

## Issue

**Error:** Internal Server Error when creating users or missing person reports
**Symptom:** Data was being saved to database successfully, but API returned 500 error

## Root Cause

MySQL2's `execute()` method returns a `ResultSetHeader` object for INSERT operations, not an array. The code was incorrectly trying to access `insertId` as:

```javascript
// WRONG - causes undefined error
const result = await query('INSERT INTO ...');
const id = result[0]?.insertId;  // result[0] is undefined!
```

The MySQL2 result structure for INSERT is:
```javascript
ResultSetHeader {
  fieldCount: 0,
  affectedRows: 1,
  insertId: 123,  // <-- Direct property, not in an array
  info: '',
  serverStatus: 2,
  warningStatus: 0
}
```

## Solution

Created a new `execute()` function in `db.ts` that properly handles INSERT/UPDATE/DELETE operations:

### File: `src/lib/db.ts`

```typescript
import { ResultSetHeader } from 'mysql2';

// New function for INSERT, UPDATE, DELETE operations
export async function execute(sql: string, params?: any[]): Promise<ResultSetHeader> {
  try {
    const [result] = await pool.execute(sql, params);
    return result as ResultSetHeader;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}
```

**Usage:**
```typescript
// Correct way
const result = await execute('INSERT INTO ...');
const id = result.insertId;  // ✅ Works correctly
```

## Files Fixed

### 1. ✅ `src/lib/db.ts`
- Added `execute()` function for INSERT/UPDATE/DELETE operations
- Imported `ResultSetHeader` type from mysql2

### 2. ✅ `src/app/api/auth/register/route.ts`
**Before:**
```typescript
const result = await query('INSERT INTO users...');
const userId = result[0]?.insertId;  // ❌ Undefined
```

**After:**
```typescript
const result = await execute('INSERT INTO users...');
const userId = result.insertId;  // ✅ Works
```

### 3. ✅ `src/app/api/missing-persons/route.ts` (POST)
**Before:**
```typescript
const result = await query('INSERT INTO missing_persons...');
const missingPersonId = result[0]?.insertId;  // ❌ Undefined
```

**After:**
```typescript
const result = await execute('INSERT INTO missing_persons...');
const missingPersonId = result.insertId;  // ✅ Works
```

### 4. ✅ `src/app/api/comments/route.ts` (POST)
**Before:**
```typescript
const result = await query('INSERT INTO comments...');
const commentId = result[0]?.insertId;  // ❌ Undefined
```

**After:**
```typescript
const result = await execute('INSERT INTO comments...');
const commentId = result.insertId;  // ✅ Works
```

Also fixed notification INSERT:
```typescript
await execute('INSERT INTO notifications...');  // No need for insertId here
```

### 5. ✅ `src/app/api/missing-persons/[id]/status/route.ts`
Fixed UPDATE and INSERT queries:
```typescript
await execute('UPDATE missing_persons...');
await execute('INSERT INTO status_updates...');
await execute('INSERT INTO notifications...');
```

### 6. ✅ `src/app/api/missing-persons/[id]/route.ts`
Fixed notification INSERT:
```typescript
await execute('INSERT INTO notifications...');
```

## Function Usage Guide

### Use `query<T>()` for SELECT operations:
```typescript
// Returns array of results
const users = await query<User>('SELECT * FROM users WHERE id = ?', [id]);
const user = users[0];  // Get first result
```

### Use `execute()` for INSERT/UPDATE/DELETE:
```typescript
// Returns ResultSetHeader
const result = await execute('INSERT INTO users VALUES (?)', [data]);
console.log(result.insertId);      // New record ID
console.log(result.affectedRows);  // Number of rows affected

const updateResult = await execute('UPDATE users SET name = ? WHERE id = ?', [name, id]);
console.log(updateResult.affectedRows);  // Number of rows updated

const deleteResult = await execute('DELETE FROM users WHERE id = ?', [id]);
console.log(deleteResult.affectedRows);  // Number of rows deleted
```

### Use `queryOne<T>()` for single SELECT result:
```typescript
// Returns single result or null
const user = await queryOne<User>('SELECT * FROM users WHERE id = ?', [id]);
if (user) {
  console.log(user.name);
}
```

## MySQL2 ResultSetHeader Properties

```typescript
interface ResultSetHeader {
  fieldCount: number;       // Number of fields
  affectedRows: number;     // Rows affected by INSERT/UPDATE/DELETE
  insertId: number;         // Auto-increment ID for INSERT
  info: string;             // Additional info
  serverStatus: number;     // Server status flags
  warningStatus: number;    // Warning count
  changedRows?: number;     // Rows actually changed (UPDATE)
}
```

## Testing

### Before Fix:
```bash
POST /api/auth/register
Response: 500 Internal Server Error
Database: ✅ User created (but error returned)
```

### After Fix:
```bash
POST /api/auth/register
Response: 201 Created
{
  "message": "Registration successful",
  "user": { ... },
  "token": "..."
}
Database: ✅ User created
```

## Benefits

1. ✅ **Proper Type Safety** - ResultSetHeader is correctly typed
2. ✅ **Clear Separation** - Different functions for different SQL operations
3. ✅ **No More Undefined** - Direct access to insertId
4. ✅ **Better Error Messages** - Clear distinction in error logs
5. ✅ **Consistent Pattern** - All INSERT operations use execute()

## Common Patterns

### Creating a Record and Getting It Back
```typescript
// Insert new record
const result = await execute(
  'INSERT INTO missing_persons (...) VALUES (...)',
  [values]
);

// Get the created record with all computed fields
const [newRecord] = await query<MissingPerson>(
  'SELECT * FROM missing_persons WHERE id = ?',
  [result.insertId]
);

return NextResponse.json({ data: newRecord }, { status: 201 });
```

### Update Without Needing Result
```typescript
// Simple update
await execute(
  'UPDATE missing_persons SET status = ? WHERE id = ?',
  [newStatus, id]
);
```

### Checking Affected Rows
```typescript
const result = await execute(
  'DELETE FROM missing_persons WHERE id = ?',
  [id]
);

if (result.affectedRows === 0) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

## Migration Checklist

When adding new endpoints:

- [ ] Use `execute()` for INSERT operations
- [ ] Use `execute()` for UPDATE operations  
- [ ] Use `execute()` for DELETE operations
- [ ] Use `query<T>()` for SELECT operations
- [ ] Access `insertId` directly from result (not `result[0]`)
- [ ] Check `affectedRows` for update/delete validation
- [ ] Import both `query` and `execute` from `@/lib/db`

## Related Issues

- ✅ Fixed: "Bind parameters must not contain undefined" (see DATABASE_NULL_FIX.md)
- ✅ Fixed: "Internal server error on registration/creation" (this document)
- ✅ Fixed: Notifications not created properly

## Summary

The issue was caused by incorrect access to MySQL2's ResultSetHeader object. By creating a dedicated `execute()` function and using it for all INSERT/UPDATE/DELETE operations, we now have:

- Proper type safety with ResultSetHeader
- Direct access to insertId and affectedRows
- Clear separation between SELECT and modification operations
- No more undefined errors when creating records

All INSERT operations now work correctly and return proper success responses!

---

**Fix Applied:** October 12, 2025  
**Issue:** Internal server error on INSERT operations  
**Resolution:** Created execute() function for proper ResultSetHeader handling  
**Status:** ✅ All endpoints working correctly

