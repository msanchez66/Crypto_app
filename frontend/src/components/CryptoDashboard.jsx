import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Minus, BarChart3, Info, Wallet, Check, ChevronDown } from 'lucide-react';
import AdvancedAnalysis from './AdvancedAnalysis';
import Portfolio from './Portfolio';

const API_BASE = 'http://localhost:8000/api';

const CryptoDashboard = () => {
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [availableCoins, setAvailableCoins] = useState(['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOGE']);
  const [selectedCoins, setSelectedCoins] = useState(['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOGE']);
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);

  const allAvailableCoins = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'XRP', name: 'Ripple' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'MATIC', name: 'Polygon' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'AVAX', name: 'Avalanche' },
    { symbol: 'LTC', name: 'Litecoin' },
    { symbol: 'SHIB', name: 'Shiba Inu' },
    { symbol: 'TRX', name: 'Tron' },
    { symbol: 'LINK', name: 'Chainlink' }
  ];

  const coins = selectedCoins;

  const toggleCryptoSelection = (coinSymbol) => {
    if (selectedCoins.includes(coinSymbol)) {
      // Remove if already selected
      const newCoins = selectedCoins.filter(c => c !== coinSymbol);
      setSelectedCoins(newCoins);
      // If the removed coin was selected, switch to first available
      if (selectedCoin === coinSymbol && newCoins.length > 0) {
        setSelectedCoin(newCoins[0]);
      }
    } else {
      // Add if not selected
      setSelectedCoins([...selectedCoins, coinSymbol]);
    }
  };

  const fetchAnalysis = async (coin) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/analyze/${coin}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch data: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalysisData(data);
      setLastUpdate(new Date());
    } catch (err) {
      // Show user-friendly error messages
      let errorMessage = err.message;
      if (err.message.includes('rate limit') || err.message.includes('429')) {
        errorMessage = 'API rate limit reached. Please wait 30-60 seconds before trying again.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to backend server. Make sure it\'s running on port 8000.';
      }
      setError(errorMessage);
      console.error('Error fetching analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showAdvanced) {
      fetchAnalysis(selectedCoin);
    }
  }, [selectedCoin, showAdvanced]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchAnalysis(selectedCoin);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [selectedCoin, autoRefresh]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCryptoDropdown && !event.target.closest('.crypto-dropdown-container')) {
        setShowCryptoDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCryptoDropdown]);

  const getSignalColor = (signal) => {
    if (signal === 1) return 'text-green-600 bg-green-100';
    if (signal === -1) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getSignalIcon = (signal) => {
    if (signal === 1) return <TrendingUp className="w-5 h-5" />;
    if (signal === -1) return <TrendingDown className="w-5 h-5" />;
    return <Minus className="w-5 h-5" />;
  };

  const getRecommendationColor = (recommendation) => {
    if (recommendation.includes('STRONG BUY') || recommendation === 'BUY') {
      return 'bg-green-600';
    }
    if (recommendation.includes('STRONG SELL') || recommendation === 'SELL') {
      return 'bg-red-600';
    }
    return 'bg-gray-600';
  };

  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });

  const showTooltip = (e, content) => {
    setTooltip({
      show: true,
      content,
      x: e.clientX + 10,
      y: e.clientY + 10
    });
  };

  const hideTooltip = () => {
    setTooltip({ show: false, content: '', x: 0, y: 0 });
  };

  const indicatorTooltips = {
    'RSI': 'RSI (Relative Strength Index, 14-period): Measures momentum on a 0-100 scale. Values < 30 indicate oversold (BUY), > 70 indicate overbought (SELL). Calculated using Wilder\'s smoothing method over 14 periods.',
    'MACD': 'MACD (Moving Average Convergence Divergence, 12/26/9 periods): Shows trend momentum by comparing 12-period and 26-period exponential moving averages with a 9-period signal line. Positive histogram with MACD above signal line indicates bullish trend (BUY).',
    'Bollinger Bands': 'Bollinger Bands (20-period): Measures volatility using a 20-period simple moving average ± 2 standard deviations. Price near lower band suggests oversold (BUY), near upper band suggests overbought (SELL).',
    'EMA (20)': 'EMA (Exponential Moving Average, 20-period): Gives more weight to recent prices. When price is above EMA, trend is bullish (BUY); below EMA suggests bearish trend (SELL).',
    'Volume Analysis': 'Volume Analysis (5-period recent vs 20-period average): Compares recent 5-period volume to 20-period average volume. High volume with upward price movement confirms bullish trend (BUY); high volume with downward movement confirms bearish trend (SELL).'
  };

  const IndicatorCard = ({ name, data }) => {
    const tooltipContent = indicatorTooltips[name] || `${name}: Technical indicator for market analysis.`;
    
    return (
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200 relative">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">{name}</h3>
            <Info
              className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help"
              onMouseEnter={(e) => showTooltip(e, tooltipContent)}
              onMouseLeave={hideTooltip}
            />
          </div>
          <div className={`p-2 rounded-full ${getSignalColor(data.signal)}`}>
            {getSignalIcon(data.signal)}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            {typeof data.value === 'object' ? (
              <div className="space-y-1">
                {Object.entries(data.value).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key}:</span>
                    <span className="font-mono">{typeof val === 'number' ? val.toFixed(2) : val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-between">
                <span>Value:</span>
                <span className="font-mono font-semibold">{data.value.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          <div className={`text-xs px-3 py-2 rounded ${getSignalColor(data.signal)}`}>
            {data.description}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Title Box */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Crypto Trading Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time technical analysis with composite indicators
          </p>
        </div>

        {/* Crypto Selector and Actions Box */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Selected Cryptos Row */}
          <div className="mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              {coins.length > 0 ? (
                coins.map((coin) => (
                  <button
                    key={coin}
                    onClick={() => setSelectedCoin(coin)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedCoin === coin
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {coin}
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No cryptos selected. Use the dropdown below to add some.</p>
              )}
            </div>
          </div>

          {/* Crypto Dropdown */}
          <div className="mb-6 crypto-dropdown-container">
            <div className="relative">
              <button
                onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700">Select Cryptocurrencies</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showCryptoDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showCryptoDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
                  {allAvailableCoins.map((coin) => {
                    const isSelected = selectedCoins.includes(coin.symbol);
                    return (
                      <button
                        key={coin.symbol}
                        onClick={() => toggleCryptoSelection(coin.symbol)}
                        className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-gray-800">{coin.symbol}</div>
                          <div className="text-xs text-gray-500">{coin.name}</div>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => setShowPortfolio(true)}
                  className="px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
                >
                  <Wallet className="w-5 h-5" />
                  My Portfolio
                </button>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    showAdvanced
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  {showAdvanced ? 'Basic View' : 'Advanced Analysis'}
                </button>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Auto-refresh (30s)</span>
                </div>
                <button
                  onClick={() => fetchAnalysis(selectedCoin)}
                  disabled={loading}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Modal */}
        <Portfolio isOpen={showPortfolio} onClose={() => setShowPortfolio(false)} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Error: {error}. Make sure the backend server is running on port 8000.
          </div>
        )}

        {showAdvanced ? (
          <AdvancedAnalysis coin={selectedCoin} />
        ) : analysisData && (
          <>
            {/* Tooltip */}
            {tooltip.show && (
              <div
                className="fixed bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl z-50 max-w-xs pointer-events-none"
                style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
              >
                {tooltip.content}
              </div>
            )}

            {/* Composite Recommendation */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              {/* Title aligned with Composite Score column - below the figure */}
              <div className="grid md:grid-cols-3 gap-6 mb-4">
                <div></div>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
                  <h2 className="text-xl font-bold text-gray-800 text-left pl-6">
                    Composite Analysis - Individual indicators average
                  </h2>
                </div>
                <div></div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Current Price</p>
                  <p className="text-3xl font-bold text-gray-800">
                    ${analysisData.current_price.toLocaleString()}
                  </p>
                </div>
                
                <div className="text-center relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
                  <p className="text-sm text-gray-600 mb-2">Composite Score</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {analysisData.composite.score.toFixed(3)}
                  </p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        analysisData.composite.score > 0 ? 'bg-green-600' : 'bg-red-600'
                      }`}
                      style={{
                        width: `${Math.min(Math.abs(analysisData.composite.score) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Recommendation</p>
                  <div
                    className={`${getRecommendationColor(
                      analysisData.composite.recommendation
                    )} text-white px-6 py-3 rounded-lg font-bold text-xl`}
                  >
                    {analysisData.composite.recommendation}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Confidence: {analysisData.composite.confidence.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Indicators */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Technical Individual Indicators
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <IndicatorCard name="RSI" data={analysisData.indicators.RSI} />
                <IndicatorCard name="MACD" data={analysisData.indicators.MACD} />
                <IndicatorCard name="Bollinger Bands" data={analysisData.indicators.Bollinger} />
                <IndicatorCard name="EMA (20)" data={analysisData.indicators.EMA} />
                <IndicatorCard name="Volume Analysis" data={analysisData.indicators.Volume} />
              </div>

              {/* Signal Legend - Moved inside Technical Indicators box */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Signal Legend</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span>Buy Signal (+1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                      <Minus className="w-4 h-4" />
                    </div>
                    <span>Hold/Neutral (0)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <span>Sell Signal (-1)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Footer */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  <span className="font-semibold">Last Update:</span>{' '}
                  {lastUpdate?.toLocaleTimeString()}
                </div>
                <div>
                  <span className="font-semibold">Data Source:</span> CoinGecko API
                </div>
              </div>
            </div>
          </>
        )}

        {loading && !analysisData && !showAdvanced && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading analysis...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoDashboard;

