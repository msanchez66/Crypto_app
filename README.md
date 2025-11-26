# Crypto Trading Decision Support App

A real-time cryptocurrency trading dashboard with technical analysis using 5 key performance indicators and a composite scoring system.

## 📊 Features

### Technical Indicators Implemented:
1. **RSI (Relative Strength Index)** - Momentum oscillator
2. **MACD (Moving Average Convergence Divergence)** - Trend momentum
3. **Bollinger Bands** - Volatility indicator
4. **EMA (Exponential Moving Average)** - Trend direction
5. **Volume Profile** - Market strength confirmation

### Key Capabilities:
- ✅ Real-time price monitoring for BTC, ETH, XRP, SOL, ADA, DOGE
- ✅ Individual indicator analysis with buy/sell/hold signals
- ✅ Composite weighted score for overall recommendation
- ✅ Auto-refresh every 30 seconds
- ✅ Clean, professional dashboard UI
- ✅ Confidence scoring for recommendations

## 🏗️ Architecture

```
crypto_app/
├── backend/
│   ├── app.py              # Flask API with indicator calculations
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── index.html          # React dashboard (standalone HTML)
    └── CryptoDashboard.jsx # React component (for build systems)
```

## 🚀 Quick Start

### Step 1: Setup Python Backend

```bash
cd crypto_app/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
python app.py
```

The backend will start on `http://localhost:5000`

### Step 2: Open the Frontend

Simply open `frontend/index.html` in your browser. No build process required!

The dashboard is a standalone HTML file that uses CDN-hosted React and Tailwind CSS.

Alternatively, you can serve it with a simple HTTP server:

```bash
cd crypto_app/frontend
python -m http.server 8000
```

Then visit: `http://localhost:8000`

## 🎯 How It Works

### Composite Scoring Algorithm

Each indicator provides a signal:
- **+1** = Buy signal
- **0** = Hold/Neutral
- **-1** = Sell signal

Weighted composite score:
```python
weights = {
    'RSI': 0.25,      # 25% weight
    'MACD': 0.25,     # 25% weight
    'Bollinger': 0.20, # 20% weight
    'EMA': 0.15,      # 15% weight
    'Volume': 0.15    # 15% weight
}
```

Final recommendation:
- **> 0.4** = STRONG BUY
- **> 0.2** = BUY
- **< -0.4** = STRONG SELL
- **< -0.2** = SELL
- **Otherwise** = HOLD

### Indicator Logic

#### RSI (Relative Strength Index)
- **< 30**: Oversold → BUY
- **> 70**: Overbought → SELL
- **30-70**: Neutral → HOLD

#### MACD
- **Histogram > 0** and **MACD > Signal**: Bullish → BUY
- **Histogram < 0** and **MACD < Signal**: Bearish → SELL
- **Otherwise**: HOLD

#### Bollinger Bands
- **Price < 20% from lower band**: BUY
- **Price > 80% from upper band**: SELL
- **Middle range**: HOLD

#### EMA (20-period)
- **Price > EMA**: Above trend → BUY
- **Price < EMA * 0.98**: Below trend → SELL
- **Otherwise**: HOLD

#### Volume Analysis
- **High volume (>1.5x avg) + Price up**: Strong buy → BUY
- **High volume (>1.5x avg) + Price down**: Strong sell → SELL
- **Normal volume**: HOLD

## 📡 API Endpoints

### Get Full Analysis
```bash
GET http://localhost:5000/api/analyze/{coin}
```

Example:
```bash
curl http://localhost:5000/api/analyze/BTC
```

Response includes:
- Current price
- All 5 indicators with values and signals
- Composite score and recommendation
- Confidence level

### Get Current Price
```bash
GET http://localhost:5000/api/price/{coin}
```

### Health Check
```bash
GET http://localhost:5000/api/health
```

## 🎨 Dashboard Features

- **Coin Selection**: Quick switch between 6 cryptocurrencies
- **Composite Score**: Visual progress bar and confidence percentage
- **Individual Indicators**: Detailed cards for each indicator
- **Auto-refresh**: Toggle 30-second updates
- **Manual Refresh**: Click refresh button anytime
- **Visual Signals**: Color-coded buy/sell/hold indicators
- **Real-time Updates**: Latest data from CoinGecko API

## 📊 Data Source

Uses **CoinGecko API** (free, no API key required):
- Historical price data (30 days, hourly intervals)
- Real-time prices
- Volume data
- No rate limiting for reasonable usage

## 🔧 Customization

### Change Indicator Weights

Edit `backend/app.py`, function `calculate_composite_score()`:

```python
weights = {
    'RSI': 0.30,      # Increase RSI importance
    'MACD': 0.30,     # Increase MACD importance
    'Bollinger': 0.15,
    'EMA': 0.15,
    'Volume': 0.10
}
```

### Add More Coins

Edit `frontend/index.html` and add to `coin_map` in `backend/app.py`:

```python
coin_map = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'XRP': 'ripple',
    'SOL': 'solana',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'MATIC': 'matic-network',  # Add new coin
    'LINK': 'chainlink'         # Add new coin
}
```

### Adjust Refresh Interval

Edit `frontend/index.html`, change the interval (in milliseconds):

```javascript
const interval = setInterval(() => {
    fetchAnalysis(selectedCoin);
}, 60000); // 60 seconds instead of 30
```

### Modify Indicator Thresholds

Edit signal logic in `backend/app.py`, function `get_indicator_signal()`:

```python
# Example: Make RSI more conservative
if indicator_name == 'RSI':
    if value < 25:  # Changed from 30
        return 1, "BUY - Oversold"
    elif value > 75:  # Changed from 70
        return -1, "SELL - Overbought"
```

## 📱 Future Enhancements (Phase 2)

### WhatsApp Notifications

Can be implemented using:
1. **Twilio API** - Professional solution
2. **n8n workflow** - Your preferred automation tool
3. **WhatsApp Business API** - Official integration

Trigger conditions:
- Strong buy/sell signals
- Composite score threshold crossings
- Price alerts
- Indicator divergences

### Additional Features
- Historical performance tracking
- Backtesting capability
- Multi-timeframe analysis
- Portfolio tracking
- Custom alert rules
- ML-based predictions

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check Python version (3.8+)
python --version

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### CORS errors in browser
The backend has CORS enabled. If issues persist:
- Check if backend is running on port 5000
- Try using `127.0.0.1` instead of `localhost`
- Clear browser cache

### No data showing
- Verify internet connection (API requires online access)
- Check browser console for errors (F12)
- Verify backend is running: visit `http://localhost:5000/api/health`

### API rate limiting
CoinGecko free tier has rate limits:
- 10-50 calls/minute
- The app refreshes every 30 seconds (2 calls/minute per coin)
- If limited, increase refresh interval

## 📈 Performance Tips

1. **Backend caching**: Add Redis to cache API responses
2. **Database**: Store historical analysis for trends
3. **WebSocket**: Real-time updates instead of polling
4. **Multiple exchanges**: Aggregate data from Binance + CoinGecko
5. **Advanced indicators**: Add Fibonacci, Ichimoku, Stochastic

## 🔐 Security Notes

- No API keys stored (using free endpoints)
- No authentication required (development version)
- For production: Add rate limiting, authentication, HTTPS
- Never share trading decisions publicly

## 📝 Technical Details

**Backend:**
- Python 3.8+
- Flask (API framework)
- Pandas (data manipulation)
- NumPy (calculations)
- Requests (API calls)

**Frontend:**
- React 18
- Tailwind CSS
- Vanilla JavaScript (no build required)
- CDN-hosted libraries

## 🎓 Learning Resources

- **RSI**: https://www.investopedia.com/terms/r/rsi.asp
- **MACD**: https://www.investopedia.com/terms/m/macd.asp
- **Bollinger Bands**: https://www.investopedia.com/terms/b/bollingerbands.asp
- **EMA**: https://www.investopedia.com/terms/e/ema.asp
- **Volume Analysis**: https://www.investopedia.com/articles/technical/02/010702.asp

## ⚠️ Disclaimer

**This tool is for educational and informational purposes only.**

- Not financial advice
- No guarantee of accuracy
- Cryptocurrency trading involves substantial risk
- Always do your own research (DYOR)
- Never invest more than you can afford to lose
- Past performance doesn't indicate future results

## 🤝 Contributing

To extend this project:
1. Add more indicators (Fibonacci, Ichimoku, etc.)
2. Implement portfolio tracking
3. Add backtesting functionality
4. Create mobile app version
5. Add ML predictions
6. Integrate multiple exchange data

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation: https://www.coingecko.com/api/documentation
3. Test endpoints manually with curl/Postman

## 🎯 Next Steps

1. ✅ Backend API - COMPLETE
2. ✅ React Dashboard - COMPLETE
3. ⏳ WhatsApp Integration - PENDING (as requested)
4. ⏳ Historical tracking - PENDING
5. ⏳ Advanced ML predictions - PENDING

Ready to start trading analysis! 🚀📊💰
