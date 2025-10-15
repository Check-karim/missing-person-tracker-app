# 🚀 Quick Start Guide - GPS Tracking & PWA Features

## Congratulations! 🎉

Your Missing Person Tracker now has **GPS tracking**, **real-time monitoring**, and **PWA capabilities**!

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Update the Database
Run the updated database schema:

```bash
mysql -u your_username -p your_database_name < database.sql
```

**Or manually run these SQL commands:**
```sql
USE missing_person_tracker;

-- Add GPS columns to missing_persons table
ALTER TABLE missing_persons 
ADD COLUMN last_seen_latitude DECIMAL(10, 8),
ADD COLUMN last_seen_longitude DECIMAL(11, 8),
ADD COLUMN found_latitude DECIMAL(10, 8),
ADD COLUMN found_longitude DECIMAL(11, 8);

-- Create user_locations table (already in database.sql)
-- Create location_history table (already in database.sql)
```

### Step 2: Create PWA Icons
You need to add two icon files to the `public/` folder:

**Quick Option** (for testing):
1. Download placeholder icons:
   - [Download 192x192](https://placehold.co/192x192/3b82f6/white?text=MPT) → Save as `public/icon-192.png`
   - [Download 512x512](https://placehold.co/512x512/3b82f6/white?text=MPT) → Save as `public/icon-512.png`

**Professional Option**:
- Use [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
- Upload your logo
- Download and place in `public/` folder

### Step 3: Install Dependencies (Already Done!)
Dependencies are already installed:
- ✅ leaflet
- ✅ react-leaflet
- ✅ @types/leaflet

### Step 4: Start the Application
```bash
npm run dev
```

---

## 🎯 Test the Features

### 1. Test GPS Tracking (User)

1. **Login** to your account
2. Look for the **Location Tracking Status** widget in the bottom-right corner
3. Click on it to expand
4. Click **"Enable Location Access"**
5. Allow location permission when prompted
6. Watch your GPS coordinates update!

### 2. Test Location Reporting

1. Go to **"Report"** page
2. Fill in missing person details
3. Scroll to **"Last Seen Information"** section
4. Click **"📍 Use Current"** button
5. See your current GPS coordinates populate
6. View the **map preview** below
7. Submit the report

### 3. Test Map View

1. Navigate to **"Map"** in the main menu
2. See all missing persons with GPS coordinates
3. Click on markers to view details
4. Use filter buttons to show specific statuses

### 4. Test Admin Live Tracking (Admin Only)

1. Login as admin:
   - Email: `admin@tracker.com`
   - Password: `Admin@123`
2. Click **"Live GPS"** in navigation
3. See all active users on the map
4. Click on user markers for details
5. Watch auto-refresh every 10 seconds

### 5. Test PWA Installation (Mobile)

**On Android:**
1. Open the app in Chrome
2. Tap ⋮ (menu) → "Add to Home Screen"
3. Confirm installation
4. App appears on home screen!

**On iPhone:**
1. Open the app in Safari
2. Tap Share button → "Add to Home Screen"
3. Confirm
4. App appears on home screen!

---

## 📍 Key Features Overview

| Feature | Location | Description |
|---------|----------|-------------|
| **GPS Tracking Widget** | Bottom-right corner | Shows tracking status, start/stop |
| **Missing Persons Map** | `/map` | All cases with GPS on one map |
| **Live User Tracking** | `/admin/live-tracking` | Admin-only real-time monitoring |
| **Report with GPS** | `/report` | Capture GPS when reporting |
| **Case Location Map** | `/missing-persons/[id]` | Individual case map view |

---

## 🔧 Common Issues & Solutions

### Issue: "Location permission denied"
**Solution:** 
```
1. Check browser settings
2. Allow location access
3. Refresh page
4. Try again
```

### Issue: Map not loading
**Solution:**
```
1. Check internet connection
2. Clear browser cache
3. Ensure Leaflet CSS loaded (check console)
```

### Issue: PWA not installing
**Solution:**
```
1. Use HTTPS (required)
2. Check manifest.json is accessible
3. Verify service worker registered
4. Try in Chrome (best support)
```

### Issue: Icons not showing
**Solution:**
```
1. Verify icon files exist:
   - public/icon-192.png
   - public/icon-512.png
2. Check file names match exactly
3. Clear cache and reload
```

---

## 📱 Mobile Testing Tips

1. **HTTPS Required**: GPS only works on HTTPS
   - Use ngrok for local testing: `ngrok http 3000`
   - Or deploy to Vercel/Netlify

2. **Best Browsers**:
   - Android: Chrome (full support)
   - iOS: Safari (iOS 11.3+)

3. **GPS Accuracy**:
   - Wait 10-30 seconds for initial fix
   - Better accuracy outdoors
   - Check accuracy value in widget

---

## 🎨 Customization

### Change Tracking Update Interval
Edit `src/contexts/LocationContext.tsx`:
```typescript
maximumAge: 10000, // 10 seconds (change this)
```

### Change Auto-Refresh Rate
Edit `src/app/admin/live-tracking/page.tsx`:
```typescript
const interval = setInterval(() => {
  fetchLocations();
}, 10000); // 10 seconds (change this)
```

### Customize Map Markers
Edit `src/components/MapView.tsx`:
```typescript
const iconColors = {
  user: '#3b82f6',    // blue
  missing: '#ef4444', // red
  found: '#10b981',   // green
};
```

---

## 📚 Full Documentation

For detailed information, see:
- **Setup Guide**: `GPS_TRACKING_SETUP.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Icon Instructions**: `PWA_ICONS_INSTRUCTIONS.md`

---

## ✅ Verification Checklist

Before deploying to production:

- [ ] Database schema updated
- [ ] Icon files created (icon-192.png, icon-512.png)
- [ ] App runs without errors (`npm run dev`)
- [ ] Location tracking works
- [ ] Maps display correctly
- [ ] Admin can see user locations
- [ ] PWA installs on mobile
- [ ] Service worker registered
- [ ] HTTPS enabled (production)
- [ ] All links work in navigation

---

## 🚀 Deploy to Production

### Recommended Platforms:
1. **Vercel** (Easiest for Next.js)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   ```bash
   npm run build
   # Deploy dist folder
   ```

3. **Your Own Server**
   ```bash
   npm run build
   npm start
   ```

### Production Requirements:
- ✅ HTTPS (required for GPS)
- ✅ MySQL database
- ✅ Environment variables configured
- ✅ Domain name (for PWA)

---

## 🎊 You're All Set!

Your app now has:
- ✅ Real-time GPS tracking
- ✅ Interactive maps (Leaflet + OpenStreetMap)
- ✅ PWA installation
- ✅ Admin live monitoring
- ✅ Background location sync
- ✅ Offline support

**Questions?** Check the documentation files or console errors.

**Happy Tracking! 🗺️📍**

