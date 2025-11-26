# 🔄 Restart Both Servers - Quick Guide

## ⚠️ **Problem: Site Can't Be Reached**

This means one or both servers stopped running. Let's restart them!

---

## 🚀 **Solution: Start Both Servers**

You need **TWO terminals** running simultaneously:

---

### **Terminal 1: Backend (Flask API)**

Open a terminal and run:

```bash
cd /Users/mauriciosanchezsilva/Library/CloudStorage/OneDrive-UniversidaddelosAndes/AF-Personal/AP-Finanzas/crypto_app/backend

source venv/bin/activate

python app.py
```

**You should see:**
```
Starting Crypto Analysis API Server...
Available at: http://localhost:8000
 * Running on http://127.0.0.1:8000
```

**Keep this terminal open!**

---

### **Terminal 2: Frontend (React/Vite)**

Open a **NEW terminal** and run:

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

## ✅ **Once Both Are Running:**

1. **Backend terminal** shows Flask server running on port 8000
2. **Frontend terminal** shows Vite dev server running on port 5001
3. **Browser** will open automatically OR visit: **http://localhost:5001**

---

## 💡 **Important Notes:**

- **Keep BOTH terminals open** while using the app
- If you close a terminal, that server stops
- If you see "connection refused", one of the servers isn't running

---

## 🔍 **Quick Check:**

Visit these URLs to verify:

1. **Backend Health**: http://localhost:8000/api/health
   - Should return: `{"status": "ok", ...}`

2. **Frontend**: http://localhost:5001
   - Should show your dashboard

---

## 🆘 **Troubleshooting:**

### **"Port already in use"**
- Stop the old server first (press `Ctrl+C` in its terminal)

### **"npm: command not found"**
- Make sure you're in the `frontend` directory
- Run `npm install` first if needed

### **"python: command not found"**
- Make sure you activated the venv: `source venv/bin/activate`

---

## ✅ **After Restart:**

Both servers should be running, and your dashboard should work at **http://localhost:5001**!


