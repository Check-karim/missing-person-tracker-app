#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 * 
 * This script generates placeholder PNG icons from the SVG icon.
 * For production, replace with custom icons using design tools or online generators.
 * 
 * Note: This requires installing sharp package: npm install --save-dev sharp
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 PWA Icon Generator\n');

// Check if sharp is installed
try {
  require.resolve('sharp');
} catch (e) {
  console.log('⚠️  This script requires the "sharp" package.');
  console.log('📦 Install it with: npm install --save-dev sharp');
  console.log('\n📖 Alternative: Open public/generate-icons.html in your browser\n');
  process.exit(0);
}

const sharp = require('sharp');

const sizes = [
  { size: 192, filename: 'icon-192.png' },
  { size: 512, filename: 'icon-512.png' }
];

const svgPath = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

// Check if SVG exists
if (!fs.existsSync(svgPath)) {
  console.error('❌ Error: icon.svg not found in public folder');
  process.exit(1);
}

// Generate PNG icons
async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    
    for (const { size, filename } of sizes) {
      const outputPath = path.join(outputDir, filename);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: ${filename} (${size}x${size})`);
    }
    
    console.log('\n🎉 All icons generated successfully!');
    console.log('📁 Icons saved in: public/');
    console.log('\n💡 Tip: Replace these with custom icons for production\n');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();

