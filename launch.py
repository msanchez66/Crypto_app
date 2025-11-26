#!/usr/bin/env python3
"""
Crypto Trading App Launcher
Automatically starts both backend and frontend servers
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.8+"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required. Current version:", sys.version)
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def setup_backend():
    """Setup backend virtual environment and dependencies"""
    backend_dir = Path(__file__).parent / "backend"
    venv_dir = backend_dir / "venv"
    
    print("\n📦 Setting up backend...")
    
    # Create virtual environment if it doesn't exist
    if not venv_dir.exists():
        print("   Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", str(venv_dir)], check=True)
    
    # Determine the correct python/pip paths
    if sys.platform == "win32":
        python = venv_dir / "Scripts" / "python.exe"
        pip = venv_dir / "Scripts" / "pip.exe"
    else:
        python = venv_dir / "bin" / "python"
        pip = venv_dir / "bin" / "pip"
    
    # Install backend dependencies
    print("   Installing backend dependencies...")
    requirements = backend_dir / "requirements.txt"
    if requirements.exists():
        subprocess.run([str(pip), "install", "-q", "-r", str(requirements)], check=True)
    
    return python, backend_dir

def setup_frontend():
    """Setup frontend dependencies"""
    frontend_dir = Path(__file__).parent / "frontend"
    node_modules = frontend_dir / "node_modules"
    
    print("\n📦 Setting up frontend...")
    
    # Check if Node.js is installed
    try:
        subprocess.run(["node", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️  Node.js not found. Please install Node.js from https://nodejs.org/")
        print("   Frontend will not start automatically.")
        return None, None
    
    # Check if npm is installed
    try:
        subprocess.run(["npm", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️  npm not found. Please install npm.")
        return None, None
    
    # Install frontend dependencies if node_modules doesn't exist
    if not node_modules.exists():
        print("   Installing frontend dependencies (this may take a minute)...")
        os.chdir(frontend_dir)
        subprocess.run(["npm", "install"], check=True)
        os.chdir(Path(__file__).parent)
    
    return frontend_dir

def start_backend(python, backend_dir):
    """Start the Flask backend server"""
    print("\n🔥 Starting backend server on http://localhost:5000...")
    
    os.chdir(backend_dir)
    backend_process = subprocess.Popen(
        [str(python), "app.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait a bit for server to start
    time.sleep(3)
    
    # Check if server started successfully
    if backend_process.poll() is not None:
        print("❌ Backend failed to start. Check for errors above.")
        return None
    
    print("✅ Backend server is running!")
    return backend_process

def start_frontend(frontend_dir):
    """Start the Vite frontend server"""
    if not frontend_dir:
        return None
    
    print("\n🔥 Starting frontend server on http://localhost:3000...")
    
    os.chdir(frontend_dir)
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait a bit for server to start
    time.sleep(5)
    
    print("✅ Frontend server is running!")
    return frontend_process

def main():
    """Main launcher function"""
    print("=" * 60)
    print("🚀 Crypto Trading Dashboard Launcher")
    print("=" * 60)
    
    # Check Python version
    check_python_version()
    
    # Setup backend
    python, backend_dir = setup_backend()
    
    # Setup frontend
    frontend_dir = setup_frontend()
    
    # Start backend
    backend_process = start_backend(python, backend_dir)
    if not backend_process:
        print("\n❌ Failed to start backend. Exiting.")
        sys.exit(1)
    
    # Start frontend
    frontend_process = start_frontend(frontend_dir)
    
    # Open browser
    print("\n🌐 Opening browser...")
    time.sleep(2)
    
    frontend_url = "http://localhost:3000"
    backend_url = "http://localhost:5000/api/health"
    
    print(f"\n✅ Application is ready!")
    print(f"\n📍 Frontend: {frontend_url}")
    print(f"📍 Backend API: {backend_url}")
    print(f"\n⚠️  Keep this terminal open while using the app.")
    print("   Press Ctrl+C to stop all servers.\n")
    
    # Try to open browser
    try:
        webbrowser.open(frontend_url)
    except:
        print(f"   Please manually open: {frontend_url}")
    
    # Wait for user to stop
    try:
        while True:
            time.sleep(1)
            # Check if processes are still running
            if backend_process.poll() is not None:
                print("\n❌ Backend process stopped unexpectedly!")
                break
            if frontend_process and frontend_process.poll() is not None:
                print("\n❌ Frontend process stopped unexpectedly!")
                break
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping servers...")
        
        if backend_process:
            backend_process.terminate()
            backend_process.wait()
        
        if frontend_process:
            frontend_process.terminate()
            frontend_process.wait()
        
        print("✅ Servers stopped. Goodbye!")

if __name__ == "__main__":
    main()

