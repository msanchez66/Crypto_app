#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

console.log('🚀 Starting Crypto Trading Dashboard...\n');

// Check if we're on Windows or Unix-like
const isWindows = os.platform() === 'win32';

// Function to run commands
function runCommand(command, args, cwd, env = {}) {
  return spawn(command, args, {
    cwd: cwd,
    env: { ...process.env, ...env },
    shell: isWindows,
    stdio: 'inherit'
  });
}

// Check if backend venv exists
const backendVenv = path.join(__dirname, 'backend', 'venv');
const frontendNodeModules = path.join(__dirname, 'frontend', 'node_modules');

// Start backend
console.log('📦 Starting Backend API (Port 8000)...');
let backendProcess;

if (isWindows) {
  backendProcess = runCommand('python', ['app.py'], path.join(__dirname, 'backend'));
} else {
  // Try to use venv Python if it exists
  const venvPython = path.join(backendVenv, 'bin', 'python');
  if (fs.existsSync(venvPython)) {
    backendProcess = runCommand(venvPython, ['app.py'], path.join(__dirname, 'backend'));
  } else {
    backendProcess = runCommand('python3', ['app.py'], path.join(__dirname, 'backend'));
  }
}

// Start frontend after a short delay
setTimeout(() => {
  console.log('🎨 Starting React Frontend (Port 5001)...\n');
  console.log('✅ Backend: http://localhost:8000');
  console.log('✅ Frontend: http://localhost:5001');
  console.log('\n📊 Dashboard will open automatically in your browser!\n');
  
  const frontendProcess = runCommand('npm', ['run', 'dev'], path.join(__dirname, 'frontend'));

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down servers...');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit();
  });
}, 2000);

