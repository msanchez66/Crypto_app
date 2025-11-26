#!/bin/bash

# Simple script to start both backend and frontend
# This will help you see what's happening

APP_DIR="/Users/mauriciosanchezsilva/Library/CloudStorage/OneDrive-UniversidaddelosAndes/AF-Personal/AP-Finanzas/crypto_app"

echo "🚀 Starting Crypto Trading App..."
echo ""

cd "$APP_DIR"

# Check if backend venv exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating backend virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate backend venv and install dependencies if needed
cd backend
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import flask" 2>/dev/null; then
    echo "📦 Installing backend dependencies..."
    pip install -q -r requirements.txt
fi

# Start backend in background
echo "🔥 Starting Backend API (Port 8000)..."
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "❌ Backend failed to start. Check the error above."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend is running on http://localhost:8000"
echo ""

# Setup frontend if needed
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    echo "   (This may take 1-2 minutes the first time...)"
    npm install
fi

# Start frontend
echo "🔥 Starting Frontend (Port 5001)..."
echo ""
echo "✅ Frontend will open automatically at: http://localhost:5001"
echo ""
echo "⚠️  Keep this terminal open while using the app"
echo "   Press Ctrl+C to stop both servers"
echo ""

npm run dev &
FRONTEND_PID=$!

# Wait for user to stop
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait


