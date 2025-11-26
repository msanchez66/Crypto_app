#!/bin/bash

# Crypto Trading App - Quick Start Script
# This script sets up and runs both backend and frontend

echo "================================================"
echo "🚀 Crypto Trading Dashboard - Quick Start"
echo "================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo "✅ Node.js found: $(node --version)"
echo ""

# Setup backend
echo "📦 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "   Activating virtual environment..."
source venv/bin/activate

# Install dependencies
if [ ! -f ".dependencies_installed" ]; then
    echo "   Installing dependencies..."
    pip install -r requirements.txt
    touch .dependencies_installed
fi

cd ..

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "================================================"
echo "🚀 Starting Application..."
echo "================================================"
echo ""
echo "✅ Backend API: http://localhost:8000"
echo "✅ Frontend: http://localhost:5001"
echo ""
echo "📊 Dashboard will open automatically in your browser!"
echo ""
echo "⚠️  Keep this terminal open while using the app"
echo "   Press Ctrl+C to stop both servers"
echo ""
echo "================================================"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend in background
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend in background
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for both processes
wait
