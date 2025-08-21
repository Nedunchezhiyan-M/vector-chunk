#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Vector Chunk Package...\n');

// Clean dist directory
if (fs.existsSync('./dist')) {
  console.log('🧹 Cleaning dist directory...');
  fs.rmSync('./dist', { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync('./dist', { recursive: true });

try {
  // Run TypeScript compilation without source maps
  console.log('📝 Compiling TypeScript...');
  execSync('npx tsc --sourceMap false --declarationMap false --removeComments true', { stdio: 'inherit' });
  
  // Copy package.json to dist
  console.log('📦 Copying package files...');
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  // Remove dev dependencies and scripts for production
  delete packageJson.devDependencies;
  delete packageJson.scripts;
  packageJson.main = './index.js';
  packageJson.types = './index.d.ts';
  
  fs.writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2));
  
  // Copy README and LICENSE
  if (fs.existsSync('./README.md')) {
    fs.copyFileSync('./README.md', './dist/README.md');
  }
  
  if (fs.existsSync('./LICENSE')) {
    fs.copyFileSync('./LICENSE', './dist/LICENSE');
  }
  
  // Remove any remaining map files to reduce size
  console.log('🧹 Removing source maps...');
  function removeMapFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        removeMapFiles(filePath);
      } else if (file.endsWith('.map')) {
        fs.unlinkSync(filePath);
      }
    });
  }
  removeMapFiles('./dist');
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Output directory: ./dist');
  console.log('📦 Package ready for publishing');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

