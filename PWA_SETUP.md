# PWA (Progressive Web App) Setup Guide

## Overview
Your Missing Person Tracker app is now configured as a Progressive Web App (PWA), allowing users to install it on their mobile devices for a native app-like experience.

## Features Added

### 1. Service Worker (`public/sw.js`)
- Enables offline functionality
- Caches static resources for faster loading
- Provides fallback when offline
- Automatically updates when new version is deployed

### 2. Install Prompt Component (`src/components/PWAInstallPrompt.tsx`)
- Automatically detects if app can be installed
- Shows install prompt to users after 3 seconds
- Remembers if user dismissed (won't show again for 7 days)
- Beautiful, responsive design for mobile and desktop
- Can be dismissed or accepted

### 3. Web App Manifest (`public/manifest.json`)
- Already configured with:
  - App name and short name
  - Theme color (rose/pink #e11d48)
  - Display mode (standalone)
  - Icon references

### 4. PWA Meta Tags
- Apple iOS support meta tags
- Mobile web app capabilities
- Proper viewport settings
- Theme color configuration

## Icon Setup

### Option 1: Generate Icons with HTML Tool
1. Open `public/generate-icons.html` in a browser
2. Click the download buttons to save both icons
3. Save them in the `public` folder as:
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)
4. Delete the `generate-icons.html` file

### Option 2: Create Custom Icons
Create two PNG images with these specifications:
- **icon-192.png**: 192x192 pixels
- **icon-512.png**: 512x512 pixels

Guidelines:
- Use your brand colors (rose/pink: #e11d48)
- Keep design simple and recognizable at small sizes
- Include the "MPT" text or logo
- Avoid fine details that won't be visible at small sizes
- Use a transparent or colored background
- Consider adding rounded corners (optional)

### Option 3: Use Online Tools
Use free online tools like:
- [PWA Asset Generator](https://www.pwabuilder.com/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

Upload a square logo/image and download the generated icons.

## How It Works

### For Users on Mobile:
1. **Visit the website** in their mobile browser (Chrome, Safari, Edge, etc.)
2. **Install prompt appears** after a few seconds
3. **Click "Install"** to add to home screen
4. **App icon appears** on their device like a native app
5. **Tap to open** - runs in fullscreen without browser UI

### For Users on Desktop:
- Chrome/Edge will show an install icon in the address bar
- Can also install via browser menu → "Install app"

### Browsers That Support Installation:
- ✅ Chrome (Android/Desktop)
- ✅ Edge (Android/Desktop)
- ✅ Samsung Internet (Android)
- ✅ Safari (iOS 16.4+)
- ✅ Firefox (Android)
- ✅ Opera (Android/Desktop)

## Testing PWA Functionality

### 1. Test Install Prompt
1. Run the app: `npm run dev`
2. Open in Chrome/Edge
3. Wait 3 seconds for install prompt
4. Click "Install" to test installation

### 2. Test Offline Functionality
1. Install the app
2. Open DevTools → Network tab
3. Check "Offline" mode
4. Reload the app
5. App should still load (cached version)

### 3. Test Service Worker
1. Open DevTools → Application tab
2. Click "Service Workers" in sidebar
3. Verify service worker is registered
4. Check Cache Storage for cached files

### 4. Audit with Lighthouse
1. Open DevTools → Lighthouse tab
2. Select "Progressive Web App"
3. Click "Generate report"
4. Fix any issues reported

## Troubleshooting

### Install Prompt Not Showing?
- Make sure you're using HTTPS (or localhost)
- Clear browser cache and reload
- Check browser console for errors
- Verify manifest.json is accessible at `/manifest.json`
- Icons must exist at the specified paths

### Service Worker Not Registering?
- Check browser console for errors
- Verify `sw.js` is in the `public` folder
- Make sure you're on HTTPS or localhost
- Try hard refresh (Ctrl+Shift+R)

### Icons Not Showing?
- Verify icon files exist in `public` folder
- Check file names match exactly: `icon-192.png` and `icon-512.png`
- Ensure files are valid PNG format
- Clear browser cache

### App Not Working Offline?
- Wait for service worker to activate (first visit)
- Visit main pages while online first (they get cached)
- API calls won't work offline (by design)
- Check Service Worker status in DevTools

## Customization

### Change App Name
Edit `public/manifest.json`:
```json
{
  "name": "Your App Name",
  "short_name": "Short Name",
  ...
}
```

### Change Theme Color
1. Update `public/manifest.json`:
   ```json
   "theme_color": "#your-color"
   ```
2. Update `src/app/layout.tsx`:
   ```typescript
   themeColor: '#your-color'
   ```

### Modify Install Prompt Timing
Edit `src/components/PWAInstallPrompt.tsx`:
```typescript
// Change delay (currently 3000ms = 3 seconds)
setTimeout(() => {
  setShowInstallPrompt(true);
}, 3000); // Change this value
```

### Modify Cache Strategy
Edit `public/sw.js` to customize:
- Cache name
- URLs to cache
- Caching strategy (cache-first, network-first, etc.)

## Production Deployment

### Important Notes:
1. **HTTPS Required**: PWAs require HTTPS in production (localhost is exempt)
2. **Test Thoroughly**: Test on multiple devices and browsers
3. **Update Version**: Change `CACHE_NAME` in `sw.js` when deploying updates
4. **Clear Old Caches**: Service worker will automatically clean old caches

### Deployment Checklist:
- [ ] Create and place icon files
- [ ] Test install functionality
- [ ] Test offline functionality
- [ ] Run Lighthouse PWA audit
- [ ] Verify manifest.json is accessible
- [ ] Test on real mobile devices
- [ ] Verify HTTPS is working
- [ ] Update cache version in sw.js

## Resources
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev PWA](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Service Worker Cookbook](https://serviceworke.rs/)

## Support
For issues or questions about PWA functionality, check:
1. Browser console for errors
2. DevTools → Application → Service Workers
3. DevTools → Application → Manifest
4. Lighthouse PWA audit results

