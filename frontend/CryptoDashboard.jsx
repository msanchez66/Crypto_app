import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const CryptoDashboard = () => {
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const coins = ['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOGE'];

  const fetchAnalysis = async (coin) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/analyze/${coin}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setAnalysisData(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(selectedCoin);
  }, [selectedCoin]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchAnalysis(selectedCoin);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [selectedCoin, autoRefresh]);

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

  const IndicatorCard = ({ name, data }) => {
    return (
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-800">{name}</h3>
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Crypto Trading Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time technical analysis with composite indicators
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4"
                />
                Auto-refresh (30s)
              </label>
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

        {/* Coin Selector */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            {coins.map((coin) => (
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
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Error: {error}. Make sure the backend server is running on port 8000.
          </div>
        )}

        {analysisData && (
          <>
            {/* Composite Recommendation */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Composite Analysis
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Current Price</p>
                  <p className="text-3xl font-bold text-gray-800">
                    ${analysisData.current_price.toLocaleString()}
                  </p>
                </div>
                
                <div className="text-center">
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
                Technical Indicators
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <IndicatorCard name="RSI" data={analysisData.indicators.RSI} />
                <IndicatorCard name="MACD" data={analysisData.indicators.MACD} />
                <IndicatorCard name="Bollinger Bands" data={analysisData.indicators.Bollinger} />
                <IndicatorCard name="EMA (20)" data={analysisData.indicators.EMA} />
                <IndicatorCard name="Volume Analysis" data={analysisData.indicators.Volume} />
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

            {/* Legend */}
            <div className="bg-white rounded-lg shadow-lg p-4 mt-6">
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
          </>
        )}

        {loading && !analysisData && (
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
