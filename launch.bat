@echo off
REM Crypto Trading App Launcher (Windows)
REM Automatically starts both backend and frontend servers

echo ================================================
echo 🚀 Crypto Trading Dashboard Launcher
echo ================================================
echo.

REM Get script directory
cd /d "%~dp0"

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+
    pause
    exit /b 1
)
echo ✅ Python found
python --version

REM Setup backend
echo.
echo 📦 Setting up backend...
cd backend

if not exist "venv" (
    echo    Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -q -r requirements.txt

REM Start backend
echo.
echo 🔥 Starting backend server on http://localhost:5000...
start "Backend Server" cmd /k "python app.py"
cd ..

timeout /t 3 /nobreak >nul

REM Setup and start frontend
where node >nul 2>&1
if %errorlevel% equ 0 (
    where npm >nul 2>&1
    if %errorlevel% equ 0 (
        echo.
        echo 📦 Setting up frontend...
        cd frontend
        
        if not exist "node_modules" (
            echo    Installing frontend dependencies...
            call npm install
        )
        
        echo.
        echo 🔥 Starting frontend server on http://localhost:3000...
        start "Frontend Server" cmd /k "npm run dev"
        cd ..
        
        timeout /t 5 /nobreak >nul
    ) else (
        echo.
        echo ⚠️  npm not found. Skipping frontend.
        echo    Please install Node.js from https://nodejs.org/
    )
) else (
    echo.
    echo ⚠️  Node.js not found. Skipping frontend.
    echo    Please install Node.js from https://nodejs.org/
)

REM Open browser
echo.
echo ✅ Application is ready!
echo.
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend API: http://localhost:5000/api/health
echo.
echo ⚠️  Keep these windows open while using the app.
echo    Close the windows to stop the servers.
echo.

start http://localhost:3000

pause

