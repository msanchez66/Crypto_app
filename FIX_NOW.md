# ⚡ Quick Fix: Site Can't Be Reached

## ✅ **Status Check:**

- **Backend**: ✅ Running on port 8000
- **Frontend**: ❌ Stopped (that's why you can't reach the site!)

---

## 🚀 **FIX: Start the Frontend**

The frontend server stopped. Here's how to restart it:

### **Step 1: Open a Terminal**

If you still have a terminal running the frontend, check it for errors.
Otherwise, open a new terminal.

### **Step 2: Start Frontend**

Copy and paste these commands:

```bash
cd /Users/mauriciosanchezsilva/Library/CloudStorage/OneDrive-UniversidaddelosAndes/AF-Personal/AP-Finanzas/crypto_app/frontend

npm run dev
```

### **Step 3: You Should See:**

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5001/
  ➜  Network: use --host to expose
```

The browser should open automatically to **http://localhost:5001**!

---

## ✅ **Keep Both Servers Running:**

**Terminal 1 (Backend)**: Should show Flask running on port 8000
**Terminal 2 (Frontend)**: Should show Vite running on port 5001

**Keep both terminals open!** If you close one, that server stops.

---

## 🌐 **Access Your App:**

Once both are running, visit:

**👉 http://localhost:5001 👈**

Your dashboard should work!

---

## 💡 **Why This Happened:**

The frontend server stopped (maybe you closed the terminal or it crashed). Just restart it with `npm run dev` and you're good to go!


