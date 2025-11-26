@echo off
REM Crypto Trading App - Quick Start Script for Windows

echo ================================================
echo 🚀 Crypto Trading Dashboard - Quick Start
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

echo ✅ Python found
echo ✅ Node.js found
echo.

REM Setup backend
echo 📦 Setting up backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo    Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo    Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
if not exist ".dependencies_installed" (
    echo    Installing dependencies...
    pip install -r requirements.txt
    echo. > .dependencies_installed
)

cd ..

REM Setup frontend
echo 📦 Setting up frontend...
cd frontend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo    Installing dependencies...
    call npm install
)

cd ..

echo.
echo ✅ Setup complete!
echo.
echo ================================================
echo 🚀 Starting Application...
echo ================================================
echo.
echo ✅ Backend API: http://localhost:8000
echo ✅ Frontend: http://localhost:5001
echo.
echo 📊 Dashboard will open automatically in your browser!
echo.
echo ⚠️  Keep this window open while using the app
echo    Press Ctrl+C to stop both servers
echo.
echo ================================================
echo.

REM Start backend in background
cd backend
start "Backend API" cmd /k "call venv\Scripts\activate.bat && python app.py"
cd ..

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend (will open browser automatically)
cd frontend
start "Frontend Dev Server" cmd /k "npm run dev"
cd ..

echo.
echo ✅ Both servers are starting!
echo 📊 Check the browser windows that opened
echo.
echo Press any key to view server windows...
pause >nul
