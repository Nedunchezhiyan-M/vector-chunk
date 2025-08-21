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
  // Run TypeScript compilation
  console.log('📝 Compiling TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });
  
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
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Output directory: ./dist');
  console.log('📦 Package ready for publishing');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

