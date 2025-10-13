# Database NULL Handling Fix

## Issue

**Error Message:**
```
Database query error: Error: Bind parameters must not contain undefined. 
To pass SQL NULL specify JS null
```

**Cause:** MySQL2 library requires `null` values (not `undefined`) for NULL database columns.

## Problem Location

When creating a missing person report with optional fields left empty, JavaScript `undefined` values were being passed to the database query, causing the error.

**Example:**
```javascript
// WRONG - causes error
const values = [name, age, undefined, undefined]; // undefined causes error

// CORRECT - works properly  
const values = [name, age, null, null]; // null is accepted
```

## Solution Applied

### File: `src/app/api/missing-persons/route.ts`

**Fixed the POST endpoint** to convert `undefined` to `null` using the nullish coalescing operator (`??`):

```javascript
// Before (caused error):
[
  req.user!.id, full_name, age, gender, last_seen_location,
  last_seen_date, last_seen_time, height, weight, hair_color,
  // ... if any of these were undefined, error occurred
]

// After (fixed):
[
  req.user!.id,           // required
  full_name,              // required
  age ?? null,            // optional - converts undefined to null
  gender,                 // required
  last_seen_location,     // required
  last_seen_date,         // required
  last_seen_time ?? null, // optional - converts undefined to null
  height ?? null,         // optional
  weight ?? null,         // optional
  hair_color ?? null,     // optional
  eye_color ?? null,      // optional
  skin_tone ?? null,      // optional
  distinctive_features ?? null,  // optional
  clothing_description ?? null,  // optional
  medical_conditions ?? null,    // optional
  photo_url ?? null,             // optional
  contact_name,                  // required
  contact_phone,                 // required
  contact_email ?? null,         // optional
  additional_info ?? null,       // optional
  priority || 'medium',          // optional with default
  caseNumber                     // auto-generated
]
```

### File: `src/app/api/missing-persons/[id]/route.ts`

**Enhanced the PUT endpoint** to handle empty strings as NULL:

```javascript
// Convert empty strings to null for optional fields
for (const field of allowedFields) {
  if (data[field] !== undefined) {
    updateFields.push(`${field} = ?`);
    updateValues.push(data[field] === '' ? null : data[field]);
  }
}
```

## Understanding the Operators

### Nullish Coalescing (`??`)
```javascript
value ?? null  // If value is null or undefined, use null
```

**Examples:**
- `undefined ?? null` → `null` ✅
- `null ?? null` → `null` ✅
- `"text" ?? null` → `"text"` ✅
- `0 ?? null` → `0` ✅
- `false ?? null` → `false` ✅

### Logical OR (`||`)
```javascript
value || 'default'  // If value is falsy, use default
```

**Examples:**
- `undefined || 'default'` → `'default'`
- `null || 'default'` → `'default'`
- `"" || 'default'` → `'default'`
- `0 || 'default'` → `'default'`
- `false || 'default'` → `'default'`

**Key Difference:** 
- `??` only checks for `null` or `undefined`
- `||` checks for any falsy value (null, undefined, "", 0, false)

## Required vs Optional Fields

### Required Fields (must have values)
- `full_name`
- `gender`
- `last_seen_location`
- `last_seen_date`
- `contact_name`
- `contact_phone`

These are validated before the database query and will return a 400 error if missing.

### Optional Fields (can be NULL)
- `age`
- `last_seen_time`
- `height`
- `weight`
- `hair_color`
- `eye_color`
- `skin_tone`
- `distinctive_features`
- `clothing_description`
- `medical_conditions`
- `photo_url`
- `contact_email`
- `additional_info`
- `priority` (defaults to 'medium' if not provided)

These use `?? null` to convert undefined values to proper NULL.

## Testing the Fix

### Before Fix:
```javascript
// This would fail with the error:
const data = {
  full_name: "John Doe",
  gender: "male",
  last_seen_location: "NYC",
  last_seen_date: "2025-10-01",
  contact_name: "Jane",
  contact_phone: "+1234567890"
  // age, height, weight, etc. are undefined
};
// Error: Bind parameters must not contain undefined
```

### After Fix:
```javascript
// This now works correctly:
const data = {
  full_name: "John Doe",
  gender: "male",
  last_seen_location: "NYC",
  last_seen_date: "2025-10-01",
  contact_name: "Jane",
  contact_phone: "+1234567890"
  // age, height, weight, etc. are undefined → converted to null
};
// Success! Report created with NULL values for optional fields
```

## Benefits of This Fix

1. ✅ **No More Undefined Errors** - All optional fields properly handle missing values
2. ✅ **Database Integrity** - NULL values correctly stored in database
3. ✅ **Flexible Form Submission** - Users don't need to fill all optional fields
4. ✅ **Type Safety** - TypeScript and database types align properly
5. ✅ **Maintainable Code** - Clear distinction between required and optional fields

## Other Endpoints Checked

The following endpoints were also reviewed and confirmed to handle NULL values correctly:

- ✅ **Status Update** (`/api/missing-persons/[id]/status`) - Uses `|| null` syntax
- ✅ **Comments** (`/api/comments`) - Uses `|| false` for boolean
- ✅ **Update** (`/api/missing-persons/[id]`) - Now handles empty strings as NULL

## Best Practices for Future Development

When adding new database queries:

1. **Identify Optional Fields**
   ```javascript
   // Optional fields in database schema
   photo_url VARCHAR(500) NULL,  // Can be NULL
   age INT NULL,                 // Can be NULL
   ```

2. **Use Proper NULL Handling**
   ```javascript
   // For optional fields, use ?? null
   [name, age ?? null, photo_url ?? null]
   
   // For optional fields with defaults, use ||
   [name, priority || 'medium', is_active || false]
   ```

3. **Validate Required Fields**
   ```javascript
   if (!name || !email) {
     return error('Required fields missing');
   }
   ```

4. **Document the Fields**
   ```javascript
   const {
     full_name,      // required
     age,           // optional - can be undefined
     priority,      // optional - defaults to 'medium'
   } = data;
   ```

## MySQL2 Library Behavior

The MySQL2 library enforces strict parameter binding:

- ❌ `undefined` → Error: "Bind parameters must not contain undefined"
- ✅ `null` → Properly inserts NULL into database
- ✅ `""` (empty string) → Inserts empty string
- ✅ `0` → Inserts zero
- ✅ `false` → Inserts false/0

## Debugging Tips

If you encounter similar errors:

1. **Check the error stack trace** for the file and line number
2. **Identify which parameter is undefined** by checking the data being passed
3. **Add logging** to see the values:
   ```javascript
   console.log('Query params:', params);
   ```
4. **Use ?? null** for optional parameters
5. **Validate required fields** before the query

## Related Files Modified

1. ✅ `src/app/api/missing-persons/route.ts` - POST endpoint fixed
2. ✅ `src/app/api/missing-persons/[id]/route.ts` - PUT endpoint enhanced

## Status

✅ **FIXED** - The error has been resolved and tested.

Now you can create missing person reports with only the required fields, and all optional fields will properly default to NULL in the database.

---

**Fix Applied:** October 12, 2025  
**Issue:** Bind parameters must not contain undefined  
**Resolution:** Convert undefined to null using nullish coalescing operator

