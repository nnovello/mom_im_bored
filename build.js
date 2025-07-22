#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Custom Build Script ===');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);
console.log('NPM version:', process.env.npm_config_user_agent);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CI:', process.env.CI);

// Check multiple possible locations for react-scripts
const possiblePaths = [
  path.join(__dirname, 'node_modules', '.bin', 'react-scripts'),
  path.join(process.cwd(), 'node_modules', '.bin', 'react-scripts'),
  path.join(process.cwd(), 'node_modules', 'react-scripts', 'bin', 'react-scripts.js'),
  '/usr/local/bin/react-scripts',
  '/usr/bin/react-scripts'
];

console.log('Checking for react-scripts in multiple locations:');
let reactScriptsPath = null;
for (const testPath of possiblePaths) {
  console.log(`  Checking: ${testPath}`);
  if (fs.existsSync(testPath)) {
    console.log(`  ✅ Found at: ${testPath}`);
    reactScriptsPath = testPath;
    break;
  } else {
    console.log(`  ❌ Not found at: ${testPath}`);
  }
}

if (!reactScriptsPath) {
  console.log('❌ React Scripts not found in any location');
  console.log('Attempting to install react-scripts...');
  
  // Try to install react-scripts if not found
  const install = spawn('npm', ['install', 'react-scripts'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  install.on('close', (code) => {
    if (code === 0) {
      console.log('✅ React Scripts installed successfully');
      // Try to find it again
      const newPath = path.join(process.cwd(), 'node_modules', '.bin', 'react-scripts');
      if (fs.existsSync(newPath)) {
        console.log(`✅ Found react-scripts at: ${newPath}`);
        runBuild(newPath);
      } else {
        console.log('❌ Still cannot find react-scripts after installation');
        process.exit(1);
      }
    } else {
      console.log('❌ Failed to install react-scripts');
      process.exit(1);
    }
  });
} else {
  runBuild(reactScriptsPath);
}

function runBuild(scriptPath) {
  console.log('🚀 Starting build process...');
  
  // Try multiple approaches to run the build
  const buildCommands = [
    ['npx', ['react-scripts', 'build']],
    ['node', [scriptPath, 'build']],
    ['npm', ['run', 'build:fallback']]
  ];
  
  function tryNextCommand(index) {
    if (index >= buildCommands.length) {
      console.log('❌ All build approaches failed');
      process.exit(1);
    }
    
    const [command, args] = buildCommands[index];
    console.log(`Trying build command: ${command} ${args.join(' ')}`);
    
    const build = spawn(command, args, {
      stdio: 'inherit',
      env: { ...process.env, CI: 'false' },
      cwd: process.cwd()
    });
    
    build.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Build successful with: ${command} ${args.join(' ')}`);
        process.exit(0);
      } else {
        console.log(`❌ Build failed with: ${command} ${args.join(' ')} (code: ${code})`);
        tryNextCommand(index + 1);
      }
    });
    
    build.on('error', (error) => {
      console.log(`❌ Build error with: ${command} ${args.join(' ')}`);
      console.log(`Error: ${error.message}`);
      tryNextCommand(index + 1);
    });
  }
  
  tryNextCommand(0);
} 