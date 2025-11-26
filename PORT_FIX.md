# 🔧 Port 5000 Access Denied - FIXED!

## ✅ Problem Identified

Port 5000 was already in use by **macOS Control Center** (AirPlay Receiver service). This is why you got "access denied" errors.

## ✅ Solution Applied

I've changed the frontend port to **5001** to avoid the conflict.

---

## 🌐 **New URLs**

- **Frontend Dashboard**: **http://localhost:5001** ⭐
- **Backend API**: http://localhost:8000

---

## 🚀 **How to Start Now**

Just run your start script:

```bash
./start.sh
```

Or on Windows:
```bash
start.bat
```

The app will now open at **http://localhost:5001** automatically!

---

## 🔄 **Optional: If You Really Want Port 5000**

If you prefer to use port 5000 for the frontend, you can disable macOS AirPlay Receiver:

### **Disable AirPlay Receiver (macOS):**

1. Open **System Settings** (or System Preferences)
2. Go to **General** → **AirDrop & Handoff**
3. Turn off **AirPlay Receiver**

OR

1. Open **System Settings**
2. Search for **"Sharing"**
3. Uncheck **"AirPlay Receiver"**

Then change the port back in `frontend/vite.config.js`:
```js
server: {
  port: 5000,  // Change back to 5000
  open: true,
  host: true
}
```

---

## ✅ **Current Setup (Recommended)**

- Frontend: **Port 5001** (no conflicts)
- Backend: **Port 8000** (no conflicts)

**Just use http://localhost:5001 and you're good to go!** 🎉


