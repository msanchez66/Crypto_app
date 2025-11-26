# 🔧 Simple Fix for Port Issues

## 🎯 **The Problem:**

You have multiple backend/frontend processes running, causing conflicts. Let's clean everything up and restart properly.

---

## ✅ **Quick Fix (3 Steps):**

### **Step 1: Stop Everything**

Run this command in your terminal:

```bash
cd /Users/mauriciosanchezsilva/Library/CloudStorage/OneDrive-UniversidaddelosAndes/AF-Personal/AP-Finanzas/crypto_app

./clean_restart.sh
```

This will stop all running servers.

---

### **Step 2: Start Backend (Terminal 1)**

**Open a NEW terminal** and run:

```bash
cd /Users/mauriciosanchezsilva/Library/CloudStorage/OneDrive-UniversidaddelosAndes/AF-Personal/AP-Finanzas/crypto_app/backend

source venv/bin/activate

python app.py
```

**You should see:**
```
(venv) Starting Crypto Analysis API Server...
Available at: http://localhost:8000
 * Running on http://127.0.0.1:8000
```

**IMPORTANT:** Make sure you see `(venv)` in your prompt!

**Keep this terminal open!**

---

### **Step 3: Start Frontend (Terminal 2)**

**Open ANOTHER NEW terminal** and run:

```bash
cd /Users/mauriciosanchezsilva/Library/CloudStorage/OneDrive-UniversidaddelosAndes/AF-Personal/AP-Finanzas/crypto_app/frontend

npm run dev
```

**You should see:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5001/
```

**Keep this terminal open too!**

---

## ✅ **That's It!**

1. ✅ **Terminal 1**: Backend running on port 8000 (keep open)
2. ✅ **Terminal 2**: Frontend running on port 5001 (keep open)
3. ✅ **Browser**: Visit http://localhost:5001

Your dashboard should now work without errors! 🎉

---

## 🔍 **Verify It's Working:**

1. **Backend Health**: Visit http://localhost:8000/api/health
   - Should show: `{"status": "ok", ...}`

2. **Frontend**: Visit http://localhost:5001
   - Should show dashboard without errors

3. **Select a coin** (BTC, ETH, etc.) in the dashboard
   - Should show crypto data! 📊

---

## 💡 **Important:**

- **Keep BOTH terminals open** while using the app
- **Use venv Python** for backend (make sure `source venv/bin/activate` worked)
- **Only ONE instance** of each server should run

---

## 🆘 **If Still Not Working:**

Check the backend terminal for error messages. Common issues:

- **"Module not found"** → Run: `pip install -r requirements.txt` in backend
- **"Port already in use"** → Run `./clean_restart.sh` again
- **"Connection refused"** → Make sure both servers are actually running

---

## ✅ **Summary:**

1. Run `./clean_restart.sh` to stop everything
2. Start backend in Terminal 1 with venv
3. Start frontend in Terminal 2
4. Visit http://localhost:5001

You're all set! 🚀


