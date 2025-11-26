# 🚀 Quick Start - Step by Step

The error "ERR_CONNECTION_REFUSED" means the servers aren't running. Let's start them!

---

## **Step 1: Setup Backend** (First Time Only)

Open a terminal and run:

```bash
cd /Users/mauriciosanchezsilva/Library/CloudStorage/OneDrive-UniversidaddelosAndes/AF-Personal/AP-Finanzas/crypto_app/backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## **Step 2: Setup Frontend** (First Time Only)

Open a **NEW terminal** and run:

```bash
cd /Users/mauriciosanchezsilva/Library/CloudStorage/OneDrive-UniversidaddelosAndes/AF-Personal/AP-Finanzas/crypto_app/frontend

# Install dependencies
npm install
```

---

## **Step 3: Start the Servers**

### **Terminal 1 - Start Backend:**

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

### **Terminal 2 - Start Frontend:**

```bash
cd /Users/mauriciosanchezsilva/Library/CloudStorage/OneDrive-UniversidaddelosAndes/AF-Personal/AP-Finanzas/crypto_app/frontend
npm run dev
```

**You should see:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5001/
  ➜  Network: use --host to expose
```

**The browser should open automatically!** If not, visit: **http://localhost:5001**

---

## ✅ **That's It!**

Once both terminals show the servers running, your app will be available at:

- **Frontend**: http://localhost:5001
- **Backend**: http://localhost:8000

---

## ⚠️ **Keep Both Terminals Open**

The servers need to keep running. To stop them, press `Ctrl+C` in each terminal.

---

## 🔍 **Troubleshooting**

### **"python3: command not found"**
- Install Python 3 from https://www.python.org/

### **"npm: command not found"**
- Install Node.js from https://nodejs.org/

### **"Module not found" errors**
- Make sure you ran `pip install -r requirements.txt` in backend
- Make sure you ran `npm install` in frontend

### **Still getting connection refused?**
- Make sure BOTH servers are running
- Check both terminal windows for errors
- Try visiting http://localhost:8000/api/health to test backend


