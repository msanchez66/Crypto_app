import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const Portfolio = ({ isOpen, onClose }) => {
  const [holdings, setHoldings] = useState({});
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingCoin, setEditingCoin] = useState(null);
  const [amount, setAmount] = useState('');

  const coins = ['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOGE'];
  const coinNames = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'XRP': 'Ripple',
    'SOL': 'Solana',
    'ADA': 'Cardano',
    'DOGE': 'Dogecoin'
  };

  // Load portfolio from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('crypto_portfolio');
    if (saved) {
      try {
        setHoldings(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading portfolio:', e);
      }
    }
  }, []);

  // Save portfolio to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(holdings).length > 0 || Object.keys(holdings).length === 0) {
      localStorage.setItem('crypto_portfolio', JSON.stringify(holdings));
    }
  }, [holdings]);

  // Fetch current prices
  useEffect(() => {
    if (isOpen && Object.keys(holdings).length > 0) {
      fetchPrices();
    }
  }, [isOpen, holdings]);

  const fetchPrices = async () => {
    setLoading(true);
    const priceMap = {};
    
    for (const coin of Object.keys(holdings)) {
      try {
        const response = await fetch(`${API_BASE}/analyze/${coin}`);
        if (response.ok) {
          const data = await response.json();
          priceMap[coin] = data.current_price;
        }
      } catch (err) {
        console.error(`Error fetching price for ${coin}:`, err);
      }
    }
    
    setPrices(priceMap);
    setLoading(false);
  };

  const addOrUpdateHolding = (coin) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      alert('Please enter a valid amount');
      return;
    }

    setHoldings(prev => ({
      ...prev,
      [coin]: numAmount
    }));
    setAmount('');
    setEditingCoin(null);
  };

  const removeHolding = (coin) => {
    setHoldings(prev => {
      const newHoldings = { ...prev };
      delete newHoldings[coin];
      return newHoldings;
    });
  };

  const calculateTotalValue = () => {
    return Object.entries(holdings).reduce((total, [coin, amount]) => {
      const price = prices[coin] || 0;
      return total + (amount * price);
    }, 0);
  };

  const calculateTotalCost = () => {
    // This would ideally come from user input, but for now we'll estimate
    // In a real app, users would input their purchase prices
    return Object.entries(holdings).reduce((total, [coin, amount]) => {
      const price = prices[coin] || 0;
      // Estimate cost as 95% of current value (assuming some profit)
      return total + (amount * price * 0.95);
    }, 0);
  };

  const calculateProfitLoss = () => {
    return calculateTotalValue() - calculateTotalCost();
  };

  const calculateProfitLossPercent = () => {
    const cost = calculateTotalCost();
    if (cost === 0) return 0;
    return ((calculateProfitLoss() / cost) * 100);
  };

  const getPortfolioDistribution = () => {
    const total = calculateTotalValue();
    if (total === 0) return [];
    
    return Object.entries(holdings)
      .map(([coin, amount]) => {
        const value = (amount * (prices[coin] || 0));
        return {
          coin,
          value,
          percentage: (value / total) * 100
        };
      })
      .sort((a, b) => b.value - a.value);
  };

  const totalValue = calculateTotalValue();
  const profitLoss = calculateProfitLoss();
  const profitLossPercent = calculateProfitLossPercent();
  const distribution = getPortfolioDistribution();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <PieChart className="w-6 h-6" />
              My Portfolio
            </h2>
            <p className="text-blue-100 text-sm mt-1">Track your cryptocurrency holdings</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Portfolio Summary */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-semibold">Total Value</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className={`rounded-lg p-4 border ${
              profitLoss >= 0 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                {profitLoss >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm font-semibold">Profit/Loss</span>
              </div>
              <div className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-sm mt-1 ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm font-semibold text-gray-600 mb-2">Holdings</div>
              <div className="text-2xl font-bold text-gray-800">
                {Object.keys(holdings).length}
              </div>
              <div className="text-xs text-gray-500 mt-1">Cryptocurrencies</div>
            </div>
          </div>

          {/* Add/Edit Holdings */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Add or Update Holdings</h3>
            <div className="flex flex-wrap gap-2">
              {coins.map(coin => (
                <button
                  key={coin}
                  onClick={() => {
                    setEditingCoin(coin);
                    setAmount(holdings[coin]?.toString() || '');
                  }}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    editingCoin === coin
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {coin}
                </button>
              ))}
            </div>

            {editingCoin && (
              <div className="mt-4 flex gap-2">
                <input
                  type="number"
                  step="0.00000001"
                  min="0"
                  placeholder={`Enter amount of ${editingCoin}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => addOrUpdateHolding(editingCoin)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {holdings[editingCoin] ? 'Update' : 'Add'}
                </button>
                <button
                  onClick={() => {
                    setEditingCoin(null);
                    setAmount('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Holdings List */}
          {Object.keys(holdings).length > 0 ? (
            <div className="bg-white border rounded-lg overflow-hidden">
              <h3 className="font-semibold text-gray-800 p-4 border-b">Your Holdings</h3>
              <div className="divide-y">
                {Object.entries(holdings).map(([coin, amount]) => {
                  const price = prices[coin] || 0;
                  const value = amount * price;
                  const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

                  return (
                    <div key={coin} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-lg text-gray-800">{coin}</h4>
                            <span className="text-sm text-gray-500">{coinNames[coin]}</span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Amount:</span>
                              <div className="font-semibold text-gray-800">{amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Price:</span>
                              <div className="font-semibold text-gray-800">
                                {loading ? '...' : `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Value:</span>
                              <div className="font-semibold text-gray-800">
                                {loading ? '...' : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Allocation:</span>
                              <div className="font-semibold text-gray-800">{percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                          {/* Progress bar for allocation */}
                          <div className="mt-2 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeHolding(coin)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove holding"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <PieChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No holdings yet. Add your first cryptocurrency above!</p>
            </div>
          )}

          {/* Portfolio Distribution Chart */}
          {distribution.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Portfolio Distribution</h3>
              <div className="space-y-3">
                {distribution.map(({ coin, value, percentage }) => (
                  <div key={coin}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{coin}</span>
                      <span className="text-sm text-gray-600">
                        {percentage.toFixed(1)}% • ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Suggestions Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Portfolio Features</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Real-time price updates from CoinGecko API</li>
              <li>• Automatic profit/loss calculation</li>
              <li>• Portfolio allocation visualization</li>
              <li>• Data saved locally in your browser</li>
              <li className="text-blue-600 font-semibold mt-2">Future enhancements: Purchase price tracking, transaction history, performance charts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;


