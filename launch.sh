#!/bin/bash

# Crypto Trading App Launcher (macOS/Linux)
# Automatically starts both backend and frontend servers

echo "================================================"
echo "🚀 Crypto Trading Dashboard Launcher"
echo "================================================"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi
echo "✅ Python found: $(python3 --version)"

# Setup backend
echo ""
echo "📦 Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

# Start backend in background
echo ""
echo "🔥 Starting backend server on http://localhost:5000..."
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Setup and start frontend
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    echo ""
    echo "📦 Setting up frontend..."
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        echo "   Installing frontend dependencies (this may take a minute)..."
        npm install
    fi
    
    echo ""
    echo "🔥 Starting frontend server on http://localhost:3000..."
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    sleep 5
else
    echo ""
    echo "⚠️  Node.js/npm not found. Skipping frontend."
    echo "   Please install Node.js from https://nodejs.org/"
    FRONTEND_PID=""
fi

# Open browser
echo ""
echo "✅ Application is ready!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:5000/api/health"
echo ""
echo "⚠️  Keep this terminal open while using the app."
echo "   Press Ctrl+C to stop all servers."
echo ""

# Try to open browser (macOS/Linux)
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000" 2>/dev/null &
elif command -v open &> /dev/null; then
    open "http://localhost:3000" 2>/dev/null &
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "✅ Servers stopped. Goodbye!"
    exit
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Wait for processes
wait

