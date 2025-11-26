# 🚀 Quick Start Guide

## ✅ Your App is Now React-Based!

The interface is now a proper React application (no more standalone HTML). 

---

## 🌐 **Localhost URLs**

Once you start the app, access it at:

- **Frontend Dashboard**: **http://localhost:5001** ⭐ (Opens automatically!)
- **Backend API**: http://localhost:8000

---

## 🎯 **How to Run (Super Easy!)**

### **Method 1: One-Click Start** ⭐ (Easiest)

**On macOS/Linux:**
```bash
cd crypto_app
./start.sh
```

**On Windows:**
```bash
cd crypto_app
start.bat
```

**That's it!** The script will:
- ✅ Set up everything automatically
- ✅ Start backend on port 8000
- ✅ Start React frontend on port 5001
- ✅ **Open your browser automatically** to http://localhost:5001

---

### **Method 2: Manual Start**

**Terminal 1 - Start Backend:**
```bash
cd crypto_app/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Terminal 2 - Start Frontend:**
```bash
cd crypto_app/frontend
npm install  # Only first time
npm run dev
```

The browser will open automatically to **http://localhost:5001**

---

## 📋 **First Time Setup**

If this is your first time running the app:

1. **Install Node.js** (if not installed):
   - Download from: https://nodejs.org/
   - Version 16 or higher

2. **Install Python 3** (if not installed):
   - Download from: https://www.python.org/
   - Version 3.8 or higher

3. **Run the start script:**
   ```bash
   ./start.sh  # macOS/Linux
   # OR
   start.bat   # Windows
   ```

The script will install all dependencies automatically!

---

## 🎨 **What Changed**

✅ **Before**: Standalone HTML file with CDN React
✅ **Now**: Proper React + Vite application with:
- ✅ Fast hot module replacement (HMR)
- ✅ Modern build tooling
- ✅ Better performance
- ✅ Proper React development environment

---

## 📊 **Using the Dashboard**

1. Wait for both servers to start (about 10 seconds)
2. Browser opens automatically to **http://localhost:5001**
3. Select a cryptocurrency (BTC, ETH, etc.)
4. View real-time analysis!

---

## ⚠️ **Troubleshooting**

### Browser doesn't open automatically?
- Just visit: **http://localhost:5001** manually

### Port 5001 already in use?
- Change port in `frontend/vite.config.js`:
  ```js
  server: {
    port: 3001,  // Change to any port
    open: true
  }
  ```

### Backend not starting?
- Make sure Python 3.8+ is installed
- Check if port 5000 is free

### Frontend not starting?
- Make sure Node.js 16+ is installed
- Run `cd frontend && npm install`

---

## 🎉 **You're All Set!**

Just run `./start.sh` (or `start.bat` on Windows) and the app will open at:

**👉 http://localhost:5001 👈**

Enjoy your crypto trading dashboard! 📊🚀

