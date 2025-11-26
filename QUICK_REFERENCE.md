# 🚀 Quick Reference Card

## Start the App (3 Simple Steps)

### Option 1: Using Start Script (Easiest)

**macOS/Linux:**
```bash
cd crypto_app
./start.sh
```

**Windows:**
```cmd
cd crypto_app
start.bat
```

### Option 2: Manual Start

**Step 1: Start Backend**
```bash
cd crypto_app/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Step 2: Open Frontend**
- Open `frontend/index.html` in your browser
- Or visit: http://localhost:8000 (if using http server)

**Step 3: Start Trading Analysis!**
- Select a coin (BTC, ETH, XRP, SOL, ADA, DOGE)
- Wait 5-10 seconds for analysis
- Review composite recommendation

---

## Quick Test

```bash
cd crypto_app
python test_api.py
```

This verifies the backend is working correctly.

---

## Composite Score Quick Reference

| Score Range | Recommendation | Action |
|------------|----------------|---------|
| > 0.4 | STRONG BUY ⬆️⬆️ | High conviction buy |
| 0.2 to 0.4 | BUY ⬆️ | Moderate buy signal |
| -0.2 to 0.2 | HOLD ↔️ | Wait for clarity |
| -0.4 to -0.2 | SELL ⬇️ | Moderate sell signal |
| < -0.4 | STRONG SELL ⬇️⬇️ | High conviction sell |

---

## Indicator Quick Guide

### RSI (Relative Strength Index)
- **< 30** → BUY (Oversold)
- **30-70** → HOLD (Neutral)
- **> 70** → SELL (Overbought)

### MACD
- **Positive histogram, MACD > Signal** → BUY
- **Negative histogram, MACD < Signal** → SELL
- **Otherwise** → HOLD

### Bollinger Bands
- **Price near lower band** → BUY
- **Price near upper band** → SELL
- **Price in middle** → HOLD

### EMA (Exponential Moving Average)
- **Price above EMA** → BUY
- **Price below EMA** → SELL
- **Price near EMA** → HOLD

### Volume Analysis
- **High volume + price up** → BUY
- **High volume + price down** → SELL
- **Normal volume** → HOLD

---

## Weights in Composite Score

| Indicator | Weight | Impact |
|-----------|--------|--------|
| RSI | 25% | 🟢🟢🟢 |
| MACD | 25% | 🟢🟢🟢 |
| Bollinger | 20% | 🟢🟢 |
| EMA | 15% | 🟢 |
| Volume | 15% | 🟢 |

---

## Troubleshooting

### "Connection refused" error
→ Backend not running. Start with `python app.py`

### "No data showing"
→ Check internet connection (API requires online access)

### "CORS error"
→ Check backend URL is `http://localhost:5000`

### "Slow loading"
→ First load takes longer (fetching 30 days of data)

---

## API Endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# Get current price
curl http://localhost:5000/api/price/BTC

# Get full analysis
curl http://localhost:5000/api/analyze/BTC
```

---

## File Structure

```
crypto_app/
├── README.md              ← Full documentation
├── DASHBOARD_GUIDE.md     ← Visual guide
├── QUICK_REFERENCE.md     ← This file
├── start.sh               ← Linux/Mac startup
├── start.bat              ← Windows startup
├── test_api.py            ← Test suite
├── backend/
│   ├── app.py            ← Flask API server
│   └── requirements.txt  ← Python dependencies
└── frontend/
    ├── index.html        ← Main dashboard (open this!)
    └── CryptoDashboard.jsx ← React component
```

---

## Important URLs

- **Dashboard**: `file:///path/to/frontend/index.html`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`
- **CoinGecko API**: https://www.coingecko.com/api/documentation

---

## Next Phase: WhatsApp Alerts (Coming Soon)

Will include:
- Real-time alerts for strong signals
- Custom threshold notifications
- Daily summary reports
- Price alerts
- Integration with n8n or Twilio

---

## ⚠️ Disclaimers

- **Not financial advice**
- **Educational tool only**
- **Do your own research**
- **High risk investment**
- **Past performance ≠ future results**

---

## Support

**For issues:**
1. Check troubleshooting section
2. Run `python test_api.py`
3. Check console for errors (F12 in browser)
4. Verify backend is running

**For customization:**
- Modify weights in `backend/app.py`
- Adjust refresh interval in `frontend/index.html`
- Add more coins in both files

---

## Tips for Best Results

1. ✅ Wait for high confidence signals (> 50%)
2. ✅ Look for agreement across multiple indicators
3. ✅ Consider market context and news
4. ✅ Use HOLD signals wisely (patience pays)
5. ✅ Monitor volume for confirmation
6. ❌ Don't trade on single indicator
7. ❌ Don't chase pumps/dumps
8. ❌ Don't invest emotionally

---

**Happy Trading! 📊🚀💰**

Remember: This tool helps you analyze, but YOU make the decisions!
