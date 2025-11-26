# 🔧 Fix Port Issues - Final Solution

## ✅ **Diagnosis:**

Both ports are actually **working**:
- ✅ Backend on port 8000: Responding
- ✅ Frontend on port 5001: Responding

But they can't communicate. This is likely because:
1. **Multiple backend processes** running (causing conflicts)
2. **Backend using wrong Python** (anaconda instead of venv)

---

## 🚀 **Solution: Clean Restart**

### **Step 1: Stop ALL Running Servers**

**Find and stop all backend/frontend processes:**

Open a terminal and run:

```bash
# Kill all backend processes
pkill -f "python.*app.py"
pkill -f "Flask"

# Kill all frontend processes
pkill -f "vite"
pkill -f "npm run dev"
```

Wait a few seconds, then verify they're stopped:

```bash
lsof -i :8000
lsof -i :5001
```

Both should return nothing (no processes).

---

### **Step 2: Start Backend Properly**

Open **Terminal 1** and run:

```bash
cd /Users/mauriciosanchezsilva/Library/CloudStorage/OneDrive-UniversidaddelosAndes/AF-Personal/AP-Finanzas/crypto_app/backend

# IMPORTANT: Activate venv first!
source venv/bin/activate

# Make sure you see (venv) in your prompt
# Then start the server
python app.py
```

**You should see:**
```
(venv) Starting Crypto Analysis API Server...
Available at: http://localhost:8000
 * Running on http://127.0.0.1:8000
```

**Check:** The prompt should show `(venv)` at the start!

---

### **Step 3: Start Frontend**

Open **Terminal 2** (NEW terminal) and run:

```bash
cd /Users/mauriciosanchezsilva/Library/CloudStorage/OneDrive-UniversidaddelosAndes/AF-Personal/AP-Finanzas/crypto_app/frontend

npm run dev
```

**You should see:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5001/
```

---

### **Step 4: Test Connection**

Visit these URLs to verify:

1. **Backend Health**: http://localhost:8000/api/health
   - Should return: `{"status": "ok", ...}`

2. **Backend API**: http://localhost:8000/api/analyze/BTC
   - Should return crypto data (might take 5-10 seconds)

3. **Frontend**: http://localhost:5001
   - Should show dashboard without errors

---

## ✅ **After Clean Restart:**

- ✅ Only ONE backend process running (using venv Python)
- ✅ Only ONE frontend process running
- ✅ Both communicating properly

---

## 🔍 **If Still Not Working:**

Check the backend terminal for errors. Common issues:

1. **"Module not found"** → Dependencies not installed in venv
   - Fix: `cd backend && source venv/bin/activate && pip install -r requirements.txt`

2. **"Port already in use"** → Old process still running
   - Fix: Kill old processes first (Step 1)

3. **"Connection refused"** → Server not started
   - Fix: Make sure both terminals show servers running

---

## 💡 **Key Points:**

- **Always activate venv** before starting backend: `source venv/bin/activate`
- **Only one instance** of each server should run
- **Keep both terminals open** while using the app

---

## ✅ **Quick Verification:**

Run these commands to check:

```bash
# Check ports
lsof -i :8000  # Should show ONE Python process
lsof -i :5001  # Should show ONE node/vite process

# Check backend
curl http://localhost:8000/api/health  # Should return JSON

# Check frontend
curl http://localhost:5001  # Should return HTML
```

All should work! 🎉


