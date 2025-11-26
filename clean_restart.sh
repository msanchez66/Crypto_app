#!/bin/bash

# Clean restart script - stops all processes and starts fresh

APP_DIR="/Users/mauriciosanchezsilva/Library/CloudStorage/OneDrive-UniversidaddelosAndes/AF-Personal/AP-Finanzas/crypto_app"

echo "🧹 Cleaning up old processes..."
echo ""

# Kill all backend processes
pkill -f "python.*app.py" 2>/dev/null
pkill -f "Flask" 2>/dev/null
echo "✅ Backend processes killed"

# Kill all frontend processes  
pkill -f "vite" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
echo "✅ Frontend processes killed"

# Wait a moment
sleep 2

# Verify ports are free
echo ""
echo "🔍 Checking ports..."
if lsof -i :8000 > /dev/null 2>&1; then
    echo "⚠️  Port 8000 still in use"
    lsof -i :8000 | grep LISTEN
else
    echo "✅ Port 8000 is free"
fi

if lsof -i :5001 > /dev/null 2>&1; then
    echo "⚠️  Port 5001 still in use"
    lsof -i :5001 | grep LISTEN
else
    echo "✅ Port 5001 is free"
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Open Terminal 1 - Start Backend:"
echo "   cd $APP_DIR/backend"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "2. Open Terminal 2 - Start Frontend:"
echo "   cd $APP_DIR/frontend"
echo "   npm run dev"
echo ""
echo "3. Visit: http://localhost:5001"
echo ""


