# 🚀 Quick Setup Guide - React Version

## ✅ What Changed

Your app has been upgraded from HTML to a **proper React application** using Vite!

### New Structure:
```
crypto_app/
├── backend/          # Python Flask API (unchanged)
├── frontend/         # React + Vite app (NEW!)
│   ├── src/
│   │   ├── components/
│   │   │   └── CryptoDashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── launch.py         # Easy launcher script (NEW!)
```

---

## 🎯 How to Run (No Terminal Hassle!)

### **Option 1: Python Launcher (Easiest)** ⭐

**On macOS/Linux:**
```bash
cd crypto_app
python3 launch.py
```

**On Windows:**
```bash
cd crypto_app
python launch.py
```

**What it does:**
- ✅ Sets up backend automatically
- ✅ Sets up frontend automatically
- ✅ Starts both servers
- ✅ Opens browser automatically
- ✅ Shows you the URLs

**Your app will be available at:**
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:5000

---

### **Option 2: Shell Script**

**On macOS/Linux:**
```bash
cd crypto_app
chmod +x launch.sh
./launch.sh
```

**On Windows:**
```bash
cd crypto_app
launch.bat
```

---

### **Option 3: Manual Setup** (If you prefer)

#### **Step 1: Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

#### **Step 2: Frontend** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

---

## 📋 First-Time Setup

### **Prerequisites:**

1. **Python 3.8+** ✅ (You have this)
   ```bash
   python3 --version
   ```

2. **Node.js 18+** (Required for React)
   - Download: https://nodejs.org/
   - Install the LTS version
   - Verify: `node --version` and `npm --version`

---

## 🎉 After Setup

1. **Run the launcher:**
   ```bash
   python3 launch.py
   ```

2. **Wait ~10 seconds** for both servers to start

3. **Browser opens automatically** to:
   - **http://localhost:3000** ← Your React Dashboard!

4. **Start analyzing:**
   - Select a cryptocurrency (BTC, ETH, etc.)
   - View real-time indicators
   - See composite buy/sell signals

---

## 🔍 Verify Everything Works

### **Check Backend:**
Visit: http://localhost:5000/api/health
- Should return: `{"status": "ok", ...}`

### **Check Frontend:**
Visit: http://localhost:3000
- Should show the dashboard
- Select a coin and see analysis

---

## 🛑 Stopping the App

**If using launcher:**
- Press `Ctrl+C` in the terminal
- Both servers will stop automatically

**If running manually:**
- Press `Ctrl+C` in each terminal window

---

## ⚠️ Troubleshooting

### **"Node.js not found"**
- Install Node.js: https://nodejs.org/
- Restart terminal after installation

### **"Port 3000 already in use"**
- Another app is using port 3000
- Close that app or change port in `frontend/vite.config.js`:
  ```js
  server: {
    port: 3001,  // Changed from 3000
  }
  ```

### **"Port 5000 already in use"**
- Backend is already running
- Close it or change port in `backend/app.py`:
  ```python
  app.run(debug=True, port=5001)  # Changed from 5000
  ```

### **Frontend shows "Failed to fetch data"**
- Make sure backend is running on port 5000
- Check: http://localhost:5000/api/health

### **"npm install" takes too long**
- First install can take 2-3 minutes
- This is normal! Dependencies are being downloaded

---

## 📁 What's Different from HTML Version?

| Feature | Old (HTML) | New (React) |
|---------|------------|-------------|
| **Framework** | Inline React in HTML | Proper React + Vite |
| **Build** | None | Vite dev server |
| **Port** | Direct file open | http://localhost:3000 |
| **Hot Reload** | ❌ No | ✅ Yes |
| **Code Organization** | Single HTML file | Component-based structure |
| **Dependencies** | CDN only | npm packages |

---

## 🎨 Features (Same as Before!)

- ✅ Real-time crypto analysis
- ✅ 5 technical indicators (RSI, MACD, Bollinger, EMA, Volume)
- ✅ Composite scoring system
- ✅ Auto-refresh every 30 seconds
- ✅ Beautiful dashboard UI
- ✅ Multiple cryptocurrencies supported

---

## 📚 Next Steps

1. **Run the launcher:** `python3 launch.py`
2. **Bookmark:** http://localhost:3000
3. **Start analyzing cryptocurrencies!**

---

## 💡 Tips

- **Keep the terminal open** while using the app
- **Auto-refresh** is enabled by default (updates every 30s)
- **Check both URLs** if something doesn't work:
  - Frontend: http://localhost:3000
  - Backend: http://localhost:5000/api/health

---

**Enjoy your React-powered crypto trading dashboard!** 🚀📊

