import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const PriceChart = ({ coin }) => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, price: 0, date: '' });
  const chartRef = useRef(null);

  useEffect(() => {
    if (coin) {
      fetchPriceHistory(coin);
    }
  }, [coin]);

  const fetchPriceHistory = async (coinSymbol) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/price-history/${coinSymbol}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch price history: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate response has required data
      if (!data || !data.price_history || data.price_history.length === 0) {
        throw new Error('No price history data received');
      }
      
      setPriceData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching price history:', err);
      setPriceData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !priceData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading price chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error loading chart: {error}
      </div>
    );
  }

  if (!priceData || !priceData.price_history || priceData.price_history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Price Evolution (30 Days)</h2>
        <div className="text-center text-gray-500 py-8">
          No price data available
        </div>
      </div>
    );
  }

  const prices = priceData.price_history.map(p => parseFloat(p.price) || 0).filter(p => p > 0);
  const timestamps = priceData.price_history
    .map(p => {
      try {
        return new Date(p.timestamp);
      } catch {
        return null;
      }
    })
    .filter(t => t !== null);
  
  if (prices.length === 0 || timestamps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Price Evolution (30 Days)</h2>
        <div className="text-center text-gray-500 py-8">
          Unable to parse price data
        </div>
      </div>
    );
  }
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const chartHeight = 300;
  const chartWidth = 100; // percentage

  // Calculate price change
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const priceChangePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
  const isPositive = priceChangePercent >= 0;

  // Create SVG path for the line
  const createPath = () => {
    if (prices.length === 0) return '';
    
    const points = prices.map((price, index) => {
      const x = (index / (prices.length - 1)) * 100;
      const y = 100 - ((price - minPrice) / priceRange) * 100;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  // Format timestamp for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get labels for x-axis (every ~20% of data)
  const getXAxisLabels = () => {
    const labelCount = 5;
    const step = Math.floor(timestamps.length / (labelCount - 1));
    const labels = [];
    
    for (let i = 0; i < timestamps.length; i += step) {
      labels.push({
        x: (i / (timestamps.length - 1)) * 100,
        label: formatDate(timestamps[i])
      });
    }
    
    // Always include last timestamp
    if (labels[labels.length - 1].x !== 100) {
      labels.push({
        x: 100,
        label: formatDate(timestamps[timestamps.length - 1])
      });
    }
    
    return labels;
  };

  // Handle mouse move over chart
  const handleMouseMove = (e) => {
    if (!chartRef.current) return;
    
    const rect = chartRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    
    if (x < 0 || x > 100) {
      setTooltip({ show: false, x: 0, y: 0, price: 0, date: '' });
      return;
    }
    
    // Find closest data point
    const index = Math.round((x / 100) * (prices.length - 1));
    const clampedIndex = Math.max(0, Math.min(index, prices.length - 1));
    const price = prices[clampedIndex];
    const timestamp = timestamps[clampedIndex];
    
    const y = 100 - ((price - minPrice) / priceRange) * 100;
    
    setTooltip({
      show: true,
      x: e.clientX,
      y: e.clientY,
      price: price,
      date: timestamp ? new Date(timestamp).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : ''
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, price: 0, date: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Price Evolution (30 Days)</h2>
        <div className={`flex items-center gap-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          <span className="font-semibold">
            {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="relative">
        {/* Chart Container */}
        <div 
          ref={chartRef}
          className="relative" 
          style={{ height: `${chartHeight}px` }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {/* Grid lines */}
            <defs>
              <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.3)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0.05)" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.2"
                strokeDasharray="1,1"
              />
            ))}

            {/* Price area fill - keep red shaded area */}
            <path
              d={`${createPath()} L 100,100 L 0,100 Z`}
              fill="url(#priceGradient)"
            />

            {/* Price line - black and thinner */}
            <path
              d={createPath()}
              fill="none"
              stroke="#000000"
              strokeWidth="0.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Current price indicator */}
            <circle
              cx="100"
              cy={100 - ((lastPrice - minPrice) / priceRange) * 100}
              r="0.8"
              fill="#000000"
            />
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
            <span>${maxPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span>${((minPrice + maxPrice) / 2).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span>${minPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip.show && (
          <div
            className="fixed bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl z-50 pointer-events-none"
            style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y - 10}px` }}
          >
            <div className="font-semibold">${tooltip.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-gray-300 mt-1">{tooltip.date}</div>
          </div>
        )}

        {/* X-axis labels */}
        <div className="relative h-6 mt-2">
          {getXAxisLabels().map((label, index) => (
            <div
              key={index}
              className="absolute text-xs text-gray-500"
              style={{ left: `${label.x}%`, transform: 'translateX(-50%)' }}
            >
              {label.label}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-xs text-gray-500">30-Day High</div>
            <div className="text-lg font-semibold text-green-600">
              ${maxPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">30-Day Low</div>
            <div className="text-lg font-semibold text-red-600">
              ${minPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">24h Change</div>
            <div className={`text-lg font-semibold ${priceData.price_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceData.price_change_24h >= 0 ? '+' : ''}{priceData.price_change_24h.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;

