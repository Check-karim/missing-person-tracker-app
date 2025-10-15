# PWA Icon Instructions

## Required Icons

The PWA manifest references two icon sizes that need to be created:

1. **icon-192.png** - 192x192 pixels
2. **icon-512.png** - 512x512 pixels

## How to Create Icons

### Option 1: Using an Online Icon Generator

1. Go to [https://www.pwabuilder.com/imageGenerator](https://www.pwabuilder.com/imageGenerator)
2. Upload your logo/icon image
3. Generate all required sizes
4. Download the generated icons
5. Place `icon-192.png` and `icon-512.png` in the `public/` folder

### Option 2: Using Design Tools

#### Using Canva (Free):
1. Create a new design with 512x512px dimensions
2. Design your app icon (suggestion: Missing person silhouette with GPS pin)
3. Download as PNG
4. Save as `icon-512.png` in `public/` folder
5. Resize to 192x192px and save as `icon-192.png`

#### Using Photoshop/GIMP:
1. Create a new 512x512px image
2. Design your icon with transparent or solid background
3. Export as PNG: `icon-512.png`
4. Resize to 192x192px and export as `icon-192.png`
5. Place both files in the `public/` folder

## Recommended Icon Design

### Theme Suggestions:
- **Primary Color**: Blue (#3b82f6) - trust and security
- **Symbol Ideas**:
  - Silhouette of a person with a GPS pin/marker
  - Search magnifying glass with location pin
  - Shield with GPS coordinates
  - Family group with location marker

### Design Guidelines:
- **Simple and Clear**: Should be recognizable at small sizes
- **High Contrast**: Works on both light and dark backgrounds
- **No Text**: Icons should be symbolic, not text-based
- **Centered**: Leave padding around edges (safe zone)
- **Square Format**: Design for square/circular containers

## Quick Temporary Solution

For testing purposes, you can:

1. Use a placeholder icon generator:
   - Go to [https://placehold.co/](https://placehold.co/)
   - Generate: `https://placehold.co/192x192/3b82f6/white?text=MPT`
   - Generate: `https://placehold.co/512x512/3b82f6/white?text=MPT`

2. Download these images
3. Rename and save in `public/` folder

## Verification

After adding icons, verify:

1. Files exist:
   - `public/icon-192.png`
   - `public/icon-512.png`

2. Test the manifest:
   - Visit `/manifest.json` in browser
   - Check if icons are referenced correctly

3. Test PWA installation:
   - Open app in mobile browser
   - Try "Add to Home Screen"
   - Icon should appear correctly

## File Placement

```
Tracker/
├── public/
│   ├── icon-192.png  ← Place here
│   ├── icon-512.png  ← Place here
│   ├── manifest.json
│   └── sw.js
└── ...
```

## Notes

- Icons should be optimized for web (compressed PNG)
- Use transparent background for best results
- Test on both light and dark mode devices
- Ensure icons look good in circular masks (Android)

