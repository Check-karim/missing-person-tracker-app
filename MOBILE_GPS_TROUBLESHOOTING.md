# Mobile GPS & Location Troubleshooting Guide

## Common Issues and Solutions

### 🔴 Issue 1: "Location request timed out"

**Causes:**
- GPS is disabled on the device
- Poor GPS signal (indoors, underground, etc.)
- App doesn't have location permission
- Timeout is too short for the device's GPS

**Solutions:**

#### For Android:
1. **Enable Location Services:**
   - Go to Settings → Location
   - Turn ON "Use location"
   - Set mode to "High accuracy" (uses GPS, Wi-Fi, and mobile networks)

2. **Grant App Permission:**
   - Go to Settings → Apps → Chrome (or your browser)
   - Tap Permissions → Location
   - Select "Allow all the time" or "Allow only while using the app"

3. **Check GPS Signal:**
   - Go outside or near a window
   - Wait 30-60 seconds for GPS to acquire signal
   - GPS works better outdoors

#### For iOS (iPhone/iPad):
1. **Enable Location Services:**
   - Go to Settings → Privacy & Security → Location Services
   - Turn ON "Location Services"

2. **Grant Browser Permission:**
   - Settings → Safari → Location
   - Select "Ask" or "Allow"

3. **For Chrome/Other Browsers:**
   - Settings → Chrome → Location
   - Enable location access

### 🔴 Issue 2: App doesn't work after installation on phone

**Causes:**
- Service worker issues
- Cache problems
- Missing permissions after install
- HTTPS requirement not met

**Solutions:**

1. **Clear Browser Cache:**
   - Android Chrome: Settings → Privacy → Clear browsing data
   - iOS Safari: Settings → Safari → Clear History and Website Data

2. **Reinstall the PWA:**
   - Uninstall the app from home screen
   - Open the website in browser
   - Click "Add to Home Screen" again

3. **Check HTTPS:**
   - The app MUST be accessed via HTTPS or localhost
   - Check if URL shows a lock icon 🔒

4. **Grant Permissions After Install:**
   - Open the installed app
   - When prompted for location access, click "Allow"
   - If not prompted, check app settings

### 🔴 Issue 3: "Location information unavailable"

**Solutions:**

1. **Enable GPS/Location Hardware:**
   - Make sure airplane mode is OFF
   - Turn GPS ON in quick settings
   - Restart your device

2. **Check Network Connection:**
   - Connect to Wi-Fi or mobile data
   - Some devices use network-assisted GPS

3. **Wait for GPS Lock:**
   - First GPS fix can take 30-60 seconds
   - Be patient, especially if indoors

### 🔴 Issue 4: Location works on one device but not another

**Possible Reasons:**
- Different browsers handle permissions differently
- Some devices have better GPS hardware
- Network-assisted GPS may not be available on all devices
- Browser security settings vary

**Solutions:**

1. **Try Different Browsers:**
   - Chrome (recommended)
   - Firefox
   - Safari (iOS)
   - Edge

2. **Update Browser:**
   - Make sure you're using the latest version
   - Old browsers may have location bugs

3. **Check Device Compatibility:**
   - Very old devices may have GPS issues
   - Some tablets don't have GPS hardware

## Testing Steps

### Step 1: Test in Browser First
```
1. Open browser (Chrome recommended)
2. Go to localhost:3000 or your app URL
3. Navigate to "Report Missing Person"
4. Click "Use Current" location button
5. Grant permission when prompted
6. Wait 15-30 seconds for GPS lock
```

### Step 2: Test on Second Device
```
1. Find your computer's local IP address:
   - Windows: Open cmd → type 'ipconfig' → look for IPv4 Address
   - Example: 192.168.1.100

2. On the second device:
   - Connect to same Wi-Fi network as computer
   - Open browser
   - Go to http://[YOUR-IP]:3000
   - Example: http://192.168.1.100:3000

3. Grant location permission when prompted
4. Test location features
```

### Step 3: Test Installed PWA
```
1. In browser, tap menu (⋮)
2. Select "Add to Home Screen"
3. Open app from home screen
4. Grant location permission if prompted
5. Test all location features
```

## For Developers

### Increase Timeout in Code

If you're experiencing consistent timeouts, you can increase the timeout values:

**File:** `src/contexts/LocationContext.tsx`

```typescript
// Line 47-48: Increase timeout
timeout: 15000,        // Change to 20000 or 30000 if needed
maximumAge: 30000     // Allows cached GPS data

// Line 189-190: Same for watchPosition
timeout: 15000,
maximumAge: 30000
```

### Test with Mock Location

For testing without actual GPS:

**Chrome DevTools:**
1. Open DevTools (F12)
2. Click ⋮ menu → More tools → Sensors
3. Choose a location from dropdown or enter custom coordinates
4. Test the app with mock location

**Android:**
1. Enable Developer Options
2. Settings → Developer Options → Select mock location app
3. Install a GPS spoofing app
4. Test with simulated GPS

## Best Practices

### For End Users:
1. ✅ Use Chrome or Safari for best compatibility
2. ✅ Enable location services before opening app
3. ✅ Test outdoors first to ensure GPS works
4. ✅ Grant "Allow all the time" permission for continuous tracking
5. ✅ Keep app updated

### For Admin/Live Tracking:
1. ✅ Make sure MySQL tables are created (see GPS_TABLES_MIGRATION.md)
2. ✅ Check that users have granted location permission
3. ✅ Users must have the app open or installed for tracking to work
4. ✅ Background tracking requires PWA installation

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Location permission denied" | User clicked "Block" | Go to browser settings and allow location |
| "Location request timed out" | GPS taking too long | Go outdoors, wait longer, or check GPS is ON |
| "Location information unavailable" | GPS hardware issue | Enable GPS in device settings |
| "Geolocation is not supported" | Browser too old | Update browser or use Chrome |
| "Failed to fetch user locations" | Database issue | Run migration script (see GPS_TABLES_MIGRATION.md) |

## Still Having Issues?

1. **Check Browser Console:**
   - Press F12 → Console tab
   - Look for specific error messages
   - Share screenshot with developer

2. **Try This Quick Test:**
   ```javascript
   // Open browser console (F12) and paste:
   navigator.geolocation.getCurrentPosition(
     pos => console.log('✅ GPS works!', pos.coords),
     err => console.log('❌ GPS error:', err.message),
     { enableHighAccuracy: true, timeout: 15000 }
   );
   ```

3. **Network Setup:**
   - If testing on local network, make sure firewall allows port 3000
   - Use HTTPS in production (required for location API)

## Production Deployment Checklist

- [ ] App is served over HTTPS
- [ ] Service worker is registered properly
- [ ] Database tables created
- [ ] Environment variables configured
- [ ] Icons and manifest.json in place
- [ ] Location permissions requested on first use
- [ ] Timeout values appropriate for target devices
- [ ] Fallback UI for permission denied states
- [ ] Clear error messages for users

---

**Remember:** GPS works best:
- 🌞 Outdoors
- 📡 With clear view of sky
- 📱 On modern devices
- 🌐 With network connection
- ⚡ After 30-60 second warm-up

