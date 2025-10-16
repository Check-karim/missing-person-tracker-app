# Testing on Multiple Devices - Quick Guide

## 🖥️ Step 1: Find Your Computer's IP Address

### Windows:
```bash
ipconfig
```
Look for **IPv4 Address** under your active network adapter
Example: `192.168.1.100`

### Mac/Linux:
```bash
ifconfig
```
or
```bash
ip addr show
```

## 📱 Step 2: Configure Next.js for Network Access

By default, Next.js only listens on localhost. To access from other devices:

### Option A: Run with custom host (Recommended)
```bash
npm run dev -- -H 0.0.0.0
```

### Option B: Update package.json
```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "build": "next build",
    "start": "next start"
  }
}
```

Then run:
```bash
npm run dev
```

## 🌐 Step 3: Access from Other Devices

1. **Connect all devices to the SAME Wi-Fi network**
2. **On the second device, open browser and go to:**
   ```
   http://[YOUR-IP]:3000
   ```
   Example: `http://192.168.1.100:3000`

## 🔥 Step 4: Configure Windows Firewall (if blocked)

If you can't access from another device:

### Quick Method:
```powershell
# Open PowerShell as Administrator
New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Manual Method:
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Enter port `3000` → Next
6. Select "Allow the connection" → Next
7. Check all network types → Next
8. Name it "Next.js Dev Server" → Finish

## ✅ Testing Checklist

### On Computer (Development Server):
- [ ] Database tables created (run `add_gps_tables.sql`)
- [ ] Server running with `-H 0.0.0.0` flag
- [ ] Firewall allows port 3000
- [ ] Note your IP address

### On Mobile Device:
- [ ] Connected to same Wi-Fi as computer
- [ ] Location services enabled in device settings
- [ ] Browser updated to latest version
- [ ] Can access `http://[IP]:3000` in browser

### Test Location Features:
- [ ] Click "Use Current" on Report page
- [ ] Grant location permission when prompted
- [ ] Wait 15-30 seconds for GPS lock
- [ ] Check that coordinates appear
- [ ] Try "Select on Map" feature
- [ ] Verify Admin → Live Tracking shows your location

## 📝 Common Issues

### "Site can't be reached" on mobile:
- ✅ Check both devices on same Wi-Fi
- ✅ Verify IP address is correct
- ✅ Check firewall is not blocking port 3000
- ✅ Make sure dev server is running
- ✅ Try accessing `http://[IP]:3000` from computer browser first

### Location timeout on mobile:
- ✅ Enable location services in device settings
- ✅ Grant browser location permission
- ✅ Go outside or near window for better GPS signal
- ✅ Wait 30-60 seconds for first GPS fix
- ✅ Try refreshing the page

### Permission denied on mobile:
- ✅ Clear browser cache and data
- ✅ Revisit the site and grant permission again
- ✅ Check browser settings → permissions → location
- ✅ Try a different browser (Chrome recommended)

### Location works on computer but not phone:
- ✅ Phone GPS might be slower (longer timeout needed)
- ✅ Check if phone has GPS hardware (some tablets don't)
- ✅ Network-assisted GPS may not be available
- ✅ Phone may be in power-saving mode (limits GPS)

## 🎯 Quick Test Commands

### Test if port is accessible:
From mobile device, try:
```
http://[YOUR-IP]:3000/api/auth/me
```
If you get JSON response (even an error), network is working!

### Test location API directly:
Open browser console (F12) on any device and run:
```javascript
navigator.geolocation.getCurrentPosition(
  pos => console.log('✅ GPS:', pos.coords.latitude, pos.coords.longitude),
  err => console.log('❌ Error:', err.message),
  { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
);
```

## 🚀 For Production

When deploying to production:

1. **Use HTTPS** (required for geolocation API)
2. **Update CORS settings** if needed
3. **Configure production firewall** properly
4. **Set proper environment variables**
5. **Test PWA installation** on mobile devices

## 💡 Pro Tips

1. **Use Chrome DevTools** → Device Mode to simulate mobile on desktop
2. **Use ngrok** for testing over internet: `ngrok http 3000`
3. **Check browser console** for specific error messages
4. **Test outdoors first** to rule out GPS signal issues
5. **Keep app in foreground** on mobile for continuous tracking

## 📊 Expected Behavior

### First Time:
- Permission prompt appears
- GPS takes 15-60 seconds to lock
- Accuracy improves over time
- Location updates every few seconds

### After Permission Granted:
- GPS locks faster (5-15 seconds)
- More accurate location
- Continuous updates when tracking is on
- Works in background (PWA installed)

## 🛠️ Development vs Production

| Feature | Development | Production |
|---------|------------|------------|
| URL | `http://192.168.1.x:3000` | `https://yourdomain.com` |
| HTTPS | Not required | **Required** |
| Firewall | Allow port 3000 | Configure properly |
| GPS Timeout | 15 seconds | Can be longer |
| Error Logs | Visible in console | Log to server |

---

## Next Steps

1. ✅ Fix any errors shown in browser console
2. ✅ Test on at least 2 different devices
3. ✅ Verify GPS works both indoors and outdoors
4. ✅ Check Admin Live Tracking shows all users
5. ✅ Test PWA installation on mobile
6. ✅ Verify background tracking works

**Need more help?** Check `MOBILE_GPS_TROUBLESHOOTING.md` for detailed troubleshooting!

