# GPS Tracking & PWA Setup Guide

## Overview
This guide explains how to set up and use the GPS tracking and PWA (Progressive Web App) features in the Missing Person Tracker application.

## Features Added

### 1. **Real-Time GPS Tracking**
- Tracks registered user locations in real-time
- Sends location updates to the server every 10 seconds
- Stores location history for analysis
- Admin can view all user locations on a live map

### 2. **PWA Support**
- Install the app on mobile devices
- Works offline with service worker
- Native app-like experience
- Location tracking in background

### 3. **Map Integration**
- Uses **Leaflet** (free, open-source mapping library)
- Shows missing persons on interactive maps
- Displays user locations for admin
- Location-based reporting

## Database Setup

### Step 1: Update Database Schema

Run the updated `database.sql` file to add new tables and columns:

```sql
-- New columns in missing_persons table
ALTER TABLE missing_persons 
ADD COLUMN last_seen_latitude DECIMAL(10, 8),
ADD COLUMN last_seen_longitude DECIMAL(11, 8),
ADD COLUMN found_latitude DECIMAL(10, 8),
ADD COLUMN found_longitude DECIMAL(11, 8);

-- New tables
CREATE TABLE user_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(10, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_active (is_active)
);

CREATE TABLE location_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
);
```

Or simply run:
```bash
mysql -u your_username -p your_database < database.sql
```

## PWA Installation

### For Users (Mobile Devices)

#### Android:
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen"
4. Name the app and tap "Add"
5. The app icon will appear on your home screen

#### iOS (iPhone/iPad):
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name the app and tap "Add"
5. The app icon will appear on your home screen

### Enabling Location Tracking

1. **On First Use:**
   - The app will request location permission
   - Tap "Allow" or "While Using the App"

2. **Manual Control:**
   - Look for the location tracking status widget (bottom-right corner)
   - Click to expand and see location details
   - Use "Start Tracking" / "Stop Tracking" buttons

3. **For Continuous Tracking:**
   - Enable "Always Allow" location access in device settings
   - Keep the app installed on home screen
   - The service worker will sync location in background

## How to Use

### For Regular Users

#### 1. Report Missing Person with GPS
1. Go to "Report" page
2. Fill in the missing person details
3. In "Last Seen Location" section:
   - Enter address manually, OR
   - Click "📍 Use Current" to auto-capture GPS coordinates
4. View location preview on the map
5. Submit report

#### 2. Enable Location Tracking
1. Click the location status widget (bottom-right)
2. Click "Enable Location Access"
3. Allow permission in browser
4. Location tracking starts automatically
5. Your location is sent to admin every 10 seconds

#### 3. View Missing Persons on Map
1. Navigate to "Map" page
2. See all missing persons with GPS coordinates
3. Filter by status (Missing, Investigation, Found)
4. Click markers to view case details

### For Admin Users

#### 1. View Live User Tracking
1. Navigate to "Live GPS" in the navigation menu
2. See all active user locations on the map
3. View user details by clicking on markers
4. Auto-refresh updates every 10 seconds
5. Toggle auto-refresh on/off as needed

#### 2. Access User Location History
- API endpoint: `/api/location/history?userId=X&limit=100`
- Requires admin authentication

#### 3. Monitor Real-Time Updates
- Dashboard shows location statistics
- Notifications sent when users update location
- Track accuracy of GPS readings

## API Endpoints

### Location Tracking

#### Update User Location (POST)
```
POST /api/location/update
Headers: Authorization: Bearer <token>
Body: {
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10
}
```

#### Get All User Locations (GET) - Admin Only
```
GET /api/location/users
Headers: Authorization: Bearer <token>
```

#### Get Location History (GET)
```
GET /api/location/history?userId=1&limit=100
Headers: Authorization: Bearer <token>
```

### Missing Persons with GPS

#### Create Report with GPS
```
POST /api/missing-persons
Headers: Authorization: Bearer <token>
Body: {
  ...existing fields...,
  "last_seen_latitude": 40.7128,
  "last_seen_longitude": -74.0060
}
```

## Privacy & Security

### Data Protection
- GPS data is encrypted in transit (HTTPS)
- Only admins can view user locations
- Users can stop tracking anytime
- Location history is user-specific

### User Consent
- Explicit permission required
- Clear indication when tracking is active
- Easy opt-out mechanism
- Transparent data usage

### Best Practices
1. Only enable tracking when needed
2. Review location permissions regularly
3. Clear location history periodically
4. Use HTTPS in production

## Troubleshooting

### Location Not Working

#### Problem: "Location permission denied"
**Solution:**
1. Check browser location settings
2. Enable location services on device
3. Grant permission when prompted
4. Refresh the page and try again

#### Problem: "Geolocation not supported"
**Solution:**
1. Update your browser to latest version
2. Use HTTPS (required for geolocation)
3. Try a different browser (Chrome, Safari, Firefox)

#### Problem: "Inaccurate GPS coordinates"
**Solution:**
1. Move to an area with better GPS signal
2. Enable "High Accuracy" in device settings
3. Wait for GPS to acquire satellites
4. Check accuracy reading in tracking widget

### PWA Installation Issues

#### Problem: "Add to Home Screen" not showing
**Solution:**
1. Ensure you're using HTTPS
2. Verify manifest.json is accessible
3. Check service worker is registered
4. Try in Chrome (best PWA support)

#### Problem: App not working offline
**Solution:**
1. Visit app while online first
2. Check service worker registration
3. Clear cache and reinstall
4. Verify `/sw.js` is accessible

### Map Display Issues

#### Problem: Map not loading
**Solution:**
1. Check internet connection
2. Ensure Leaflet CSS is loaded
3. Clear browser cache
4. Check console for errors

#### Problem: Markers not showing
**Solution:**
1. Verify GPS coordinates are saved
2. Check data format (latitude/longitude)
3. Ensure coordinates are within valid range
4. Refresh the page

## Technical Details

### Technologies Used
- **Leaflet**: Open-source mapping library
- **OpenStreetMap**: Free map tiles
- **Service Workers**: Background sync & offline support
- **Geolocation API**: Browser GPS access
- **IndexedDB**: Local storage for pending updates

### Performance Optimization
- Location updates throttled to 10 seconds
- Map markers clustered for large datasets
- Lazy loading for map components
- Service worker caching for offline use

### Browser Compatibility
- Chrome: ✅ Full support
- Safari: ✅ Full support (iOS 11.3+)
- Firefox: ✅ Full support
- Edge: ✅ Full support
- Internet Explorer: ❌ Not supported

## Future Enhancements

Potential improvements:
- Geofencing alerts when missing person spotted nearby
- Route tracking and heatmaps
- Export location data to KML/GPX
- Offline map caching
- Battery optimization for long-term tracking
- Push notifications for location updates

## Support

For issues or questions:
1. Check this documentation
2. Review console errors
3. Test in different browser
4. Contact system administrator

---

**Note**: Always test GPS features in a real mobile environment. Desktop browsers may have limited GPS accuracy.

