# 🚀 How to Run Your Crypto Trading App

## 📋 Quick Start (Choose One Method)

---

## **Method 1: Automatic Start (Easiest)** ⭐

### **On macOS/Linux:**
```bash
cd crypto_app
chmod +x start.sh
./start.sh
```

### **On Windows:**
```bash
cd crypto_app
start.bat
```

**What this does:**
- ✅ Creates Python virtual environment
- ✅ Installs all dependencies
- ✅ Starts the backend server on port 5000

**Then:**
1. Open `frontend/index.html` in your web browser
2. Select a cryptocurrency (BTC, ETH, etc.)
3. View the analysis!

---

## **Method 2: Manual Setup** 🔧

### **Step 1: Setup Backend**

Open terminal and run:

```bash
# Navigate to project folder
cd crypto_app/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

**You should see:**
```
Starting Crypto Analysis API Server...
Available at: http://localhost:5000
 * Running on http://127.0.0.1:5000
```

**Keep this terminal open!** The server needs to keep running.

### **Step 2: Open Frontend Dashboard**

**Option A: Direct File Open**
- Navigate to `crypto_app/frontend/`
- Double-click `index.html`
- It will open in your default browser

**Option B: Local Server (Recommended)**
```bash
# In a NEW terminal window
cd crypto_app/frontend
python3 -m http.server 8000
```
Then visit: `http://localhost:8000` in your browser

---

## **Method 3: Test the API First** 🧪

Test that everything works:

```bash
cd crypto_app
python test_api.py
```

This will:
- ✅ Check if backend is running
- ✅ Test price endpoint
- ✅ Test full analysis endpoint
- ✅ Show you the results

---

## 📊 Using the Dashboard

1. **Select a Coin**: Click BTC, ETH, XRP, SOL, ADA, or DOGE
2. **Wait 5-10 seconds**: The app fetches 30 days of data and calculates indicators
3. **View Results**:
   - **Composite Score**: Overall buy/sell/hold recommendation
   - **Individual Indicators**: RSI, MACD, Bollinger Bands, EMA, Volume
   - **Confidence Level**: How strong the signal is

---

## ⚠️ Troubleshooting

### **Backend won't start**

**Check Python version:**
```bash
python3 --version
# Should be 3.8 or higher
```

**Reinstall dependencies:**
```bash
cd backend
pip install -r requirements.txt --force-reinstall
```

### **"Port 5000 already in use"**

**Find what's using port 5000:**
```bash
# macOS/Linux:
lsof -i :5000

# Windows:
netstat -ano | findstr :5000
```

**Kill the process or use a different port:**
```python
# In app.py, change line 325:
app.run(debug=True, port=5001)  # Changed from 5000
```

### **Frontend shows "Error: Failed to fetch data"**

**Check if backend is running:**
```bash
# Visit in browser:
http://localhost:5000/api/health

# Should return: {"status": "ok", "timestamp": "..."}
```

**Common issues:**
- Backend not running → Start it with `python app.py`
- Wrong port → Make sure backend is on port 5000
- CORS error → Backend has CORS enabled, but check if URL is correct

### **No data showing**

**Verify internet connection:**
- The app requires online access to CoinGecko API

**Check browser console:**
- Press F12 in your browser
- Go to "Console" tab
- Look for error messages

---

## 🔄 Stopping the Application

**To stop the backend:**
- Go to the terminal running `python app.py`
- Press `Ctrl+C`
- This stops the server

**To stop frontend server (if using Option B):**
- Same terminal where you ran `python3 -m http.server 8000`
- Press `Ctrl+C`

---

## 📱 Next Time You Use It

**Every time you want to use the app:**

1. **Start backend:**
   ```bash
   cd crypto_app/backend
   source venv/bin/activate  # Or venv\Scripts\activate on Windows
   python app.py
   ```

2. **Open frontend:**
   - Open `frontend/index.html` in browser
   - Or run local server: `cd frontend && python3 -m http.server 8000`

**That's it!** The dashboard auto-refreshes every 30 seconds.

---

## ✅ Verification Checklist

Before using the app, verify:

- [ ] Python 3.8+ installed (`python3 --version`)
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Backend server running (visit `http://localhost:5000/api/health`)
- [ ] Frontend opens in browser (no errors in console)
- [ ] Can select a coin and see analysis results

---

## 🎯 Quick Test

**Test 1: Health Check**
```bash
curl http://localhost:5000/api/health
```
Should return: `{"status": "ok", ...}`

**Test 2: Price Check**
```bash
curl http://localhost:5000/api/price/BTC
```
Should return price data.

**Test 3: Full Analysis**
```bash
curl http://localhost:5000/api/analyze/BTC
```
Should return complete analysis with indicators.

---

## 💡 Tips

1. **Keep backend running**: The terminal with `python app.py` must stay open
2. **Auto-refresh**: Dashboard updates every 30 seconds automatically
3. **Manual refresh**: Click the refresh button anytime
4. **Multiple coins**: Switch between coins to compare signals
5. **Browser cache**: If issues, try clearing browser cache or hard refresh (Ctrl+Shift+R)

---

## 🎉 You're Ready!

Your crypto trading analysis app is now running. Use the composite score and individual indicators to make informed trading decisions.

**Remember**: This is a tool for analysis, not financial advice. Always do your own research!

---

**Need help?** Check `CODE_REVIEW.md` for detailed code feedback and `README.md` for full documentation.


