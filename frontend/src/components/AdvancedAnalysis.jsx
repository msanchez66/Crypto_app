import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, Activity, Info } from 'lucide-react';
import IndicatorHistoryCharts from './IndicatorHistoryCharts';

const API_BASE = 'http://localhost:8000/api';

const AdvancedAnalysis = ({ coin }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });

  useEffect(() => {
    if (coin) {
      fetchAdvancedAnalysis(coin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin]);

  const fetchAdvancedAnalysis = async (coinSymbol) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/advanced-analysis/${coinSymbol}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch advanced analysis: ${response.status} ${response.statusText}`);
      }
      
      const analysisData = await response.json();
      setData(analysisData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching advanced analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSignalColor = (signal) => {
    // CORRECT: Green for BUY (positive, moving right toward +1.0), Red for SELL (negative, moving left toward -1.0)
    if (signal > 0) return 'bg-green-500'; // BUY = Green (extends right toward +1.0)
    if (signal < 0) return 'bg-red-500';   // SELL = Red (extends left toward -1.0)
    return 'bg-gray-400'; // HOLD = Gray (at center 0)
  };

  const getSignalTextColor = (signal) => {
    if (signal > 0) return 'text-green-700'; // BUY = Green text
    if (signal < 0) return 'text-red-700';   // SELL = Red text
    return 'text-gray-700'; // HOLD = Gray text
  };

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

  const prepareBarChartData = () => {
    if (!data) return { individual: [], composite: [] };

    const individual = [
      {
        name: 'RSI (14-period)',
        value: data.methods.individual_signals.RSI.signal,
        recommendation: data.methods.individual_signals.RSI.recommendation
      },
      {
        name: 'MACD (12/26/9)',
        value: data.methods.individual_signals.MACD.signal,
        recommendation: data.methods.individual_signals.MACD.recommendation
      },
      {
        name: 'Bollinger Bands (20-period)',
        value: data.methods.individual_signals.Bollinger.signal,
        recommendation: data.methods.individual_signals.Bollinger.recommendation
      },
      {
        name: 'EMA (20-period)',
        value: data.methods.individual_signals.EMA.signal,
        recommendation: data.methods.individual_signals.EMA.recommendation
      },
      {
        name: 'Volume Analysis',
        value: data.methods.individual_signals.Volume.signal,
        recommendation: data.methods.individual_signals.Volume.recommendation
      }
    ];

    const composite = [
      {
        name: 'Simple Weighted',
        value: data.methods.simple_weighted.score,
        recommendation: data.methods.simple_weighted.recommendation
      },
      {
        name: 'Correlation-Adjusted',
        value: data.methods.correlation_adjusted.score,
        recommendation: data.methods.correlation_adjusted.recommendation
      },
      {
        name: 'Mahalanobis',
        value: data.methods.mahalanobis.score,
        recommendation: data.methods.mahalanobis.recommendation
      }
      // PCA Composite removed per user request
    ];

    return { individual, composite };
  };

  // Tooltip content definitions
  const methodTooltips = {
    simple_weighted: 'Simple Weighted Average: Combines all 5 indicators (RSI, MACD, Bollinger, EMA, Volume) with fixed weights (25%, 25%, 20%, 15%, 15%). Each indicator is normalized to a -1 to +1 scale, then weighted and summed.',
    correlation_adjusted: 'Correlation-Adjusted Weights: Similar to Simple Weighted, but adjusts weights based on correlation matrix. Indicators that are highly correlated with others get lower weights to avoid double-counting similar information.',
    mahalanobis: 'Mahalanobis Distance: Measures how far the current indicator values are from historical patterns (neutral, bullish, bearish) using statistical distance. Considers the covariance structure of the data.'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading advanced analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { individual, composite } = prepareBarChartData();
  const allSignals = [...individual, ...composite];
  const maxSignal = Math.max(...allSignals.map(d => Math.abs(d.value)), 1);

  const renderBarChart = (items, title) => {
    return (
      <div className="space-y-3">
        {items.map((item, index) => {
          const absValue = Math.abs(item.value);
          const widthPercent = (absValue / maxSignal) * 100;
          const isPositive = item.value > 0;
          
          // Determine color: GREEN for BUY (positive), RED for SELL (negative)
          let barColor;
          if (item.value > 0) {
            barColor = '#22c55e'; // green-500 - BUY signal (extends right toward +1.0)
          } else if (item.value < 0) {
            barColor = '#ef4444'; // red-500 - SELL signal (extends left toward -1.0)
          } else {
            barColor = '#9ca3af'; // gray-400 - HOLD (at center 0)
          }
          
          return (
            <div key={index} className="flex items-center gap-4">
              {/* Y-axis label */}
              <div className="w-48 text-sm font-medium text-gray-700 text-right">
                {item.name}
              </div>
              
              {/* Bar container */}
              <div className="flex-1 relative h-8 bg-gray-100 rounded-full overflow-hidden">
                {/* Zero line at center */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 z-10" />
                
                {/* Bar - positioned from center, extends toward appropriate direction */}
                {/* FIXED: Positive values extend RIGHT (toward +1.0 BUY), Negative values extend LEFT (toward -1.0 SELL) */}
                <div
                  className={`absolute top-0 bottom-0 h-full transition-all duration-500 ${
                    isPositive ? 'left-1/2' : 'right-1/2'
                  }`}
                  style={{
                    width: `${widthPercent / 2}%`,
                    backgroundColor: barColor
                  }}
                >
                  {/* Value label - positioned at the end of the bar */}
                  <div className={`absolute ${isPositive ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 -translate-y-1/2 text-xs font-semibold ${getSignalTextColor(item.value)} whitespace-nowrap`}>
                    {item.value.toFixed(3)} ({item.recommendation})
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl z-50 max-w-xs pointer-events-none"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Individual Indicators Signal Comparison */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Individual Indicators
          </h2>
          <div className="text-xs text-gray-500 italic">
            💡 Compare with TradingView, CoinGecko, or other platforms to validate calculations
          </div>
        </div>
        
        {renderBarChart(individual)}

        {/* X-axis labels - aligned with bar container */}
        <div className="flex justify-between mt-4" style={{ paddingLeft: '12rem', paddingRight: '1rem' }}>
          <span className="text-xs text-red-600 font-semibold">-1.0 (SELL)</span>
          <span className="text-xs text-gray-600 font-semibold">0 (HOLD)</span>
          <span className="text-xs text-green-600 font-semibold">+1.0 (BUY)</span>
        </div>
      </div>

      {/* Composite Methods Signal Comparison */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Composite Methods
        </h2>
        
        {renderBarChart(composite)}

        {/* X-axis labels - aligned with bar container */}
        <div className="flex justify-between mt-4" style={{ paddingLeft: '12rem', paddingRight: '1rem' }}>
          <span className="text-xs text-red-600 font-semibold">-1.0 (SELL)</span>
          <span className="text-xs text-gray-600 font-semibold">0 (HOLD)</span>
          <span className="text-xs text-green-600 font-semibold">+1.0 (BUY)</span>
        </div>
      </div>

      {/* Methods Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Methods Summary</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="border rounded-lg p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-600">Simple Weighted</h3>
              <Info
                className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help"
                onMouseEnter={(e) => showTooltip(e, methodTooltips.simple_weighted)}
                onMouseLeave={hideTooltip}
              />
            </div>
            <div className={`text-2xl font-bold ${getSignalTextColor(data.methods.simple_weighted.score)}`}>
              {data.methods.simple_weighted.score.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {data.methods.simple_weighted.recommendation}
            </div>
          </div>

          <div className="border rounded-lg p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-600">Correlation-Adjusted</h3>
              <Info
                className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help"
                onMouseEnter={(e) => showTooltip(e, methodTooltips.correlation_adjusted)}
                onMouseLeave={hideTooltip}
              />
            </div>
            <div className={`text-2xl font-bold ${getSignalTextColor(data.methods.correlation_adjusted.score)}`}>
              {data.methods.correlation_adjusted.score.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {data.methods.correlation_adjusted.recommendation}
            </div>
          </div>

          <div className="border rounded-lg p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-600">Mahalanobis</h3>
              <Info
                className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help"
                onMouseEnter={(e) => showTooltip(e, methodTooltips.mahalanobis)}
                onMouseLeave={hideTooltip}
              />
            </div>
            <div className={`text-2xl font-bold ${getSignalTextColor(data.methods.mahalanobis.score)}`}>
              {data.methods.mahalanobis.score.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {data.methods.mahalanobis.recommendation}
            </div>
          </div>
        </div>

        {/* Consensus */}
        {data.consensus && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h3 className="font-bold text-lg mb-3">Consensus Analysis</h3>
            
            {/* Explanation */}
            <div className="mb-4 p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>What is Consensus?</strong> Consensus combines signals from the three composite methods we actively track (Simple Weighted, Correlation-Adjusted, and Mahalanobis). The average score shows the overall market sentiment. <strong>"HIGH"</strong> agreement means all methods agree on the direction, while <strong>"MIXED"</strong> indicates conflicting signals - use caution in mixed scenarios.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Average Score:</span>
                <span className={`ml-2 text-xl font-bold ${getSignalTextColor(data.consensus.average_score)}`}>
                  {data.consensus.average_score.toFixed(3)}
                </span>
                <span className="ml-2 text-sm text-gray-600">
                  ({getSignalDescriptionHelper(data.consensus.average_score)})
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Methods Agreement:</span>
                <span className={`ml-2 font-semibold ${data.consensus.agreement ? 'text-green-600' : 'text-yellow-600'}`}>
                  {data.consensus.agreement ? 'HIGH ✓' : 'MIXED'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Indicator Evolution Charts - Last 10 Days */}
      <IndicatorHistoryCharts coin={coin} />

      {/* Correlation Matrix - Moved to End of Page */}
      {data.correlation_matrix && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Correlation Matrix
            </h2>
            <div className="text-sm text-gray-500 italic">
              Computed over 30 days of hourly data
            </div>
          </div>
          
          {data.strong_correlations && data.strong_correlations.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Strong Correlations Detected:</h3>
              <ul className="space-y-1 text-sm">
                {data.strong_correlations.slice(0, 5).map((corr, idx) => (
                  <li key={idx} className="text-gray-600">
                    <span className="font-medium">{corr.indicator1}</span> ↔{' '}
                    <span className="font-medium">{corr.indicator2}</span>: {corr.correlation.toFixed(3)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Indicator</th>
                  {Object.keys(data.correlation_matrix).map((indicator) => (
                    <th key={indicator} className="p-2 text-center font-semibold">
                      {indicator}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.correlation_matrix).map(([indicator, correlations]) => (
                  <tr key={indicator} className="border-b">
                    <td className="p-2 font-medium">{indicator}</td>
                    {Object.values(correlations).map((value, idx) => {
                      const corrValue = typeof value === 'number' ? value : parseFloat(value);
                      const intensity = Math.abs(corrValue);
                      
                      return (
                        <td key={idx} className="p-2 text-center">
                          <div className={`inline-block px-2 py-1 rounded ${
                            intensity > 0.5 ? 'bg-blue-200' : intensity > 0.3 ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {corrValue.toFixed(2)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Normalization Explanation */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-md text-gray-800 mb-3">How Normalization Works</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>RSI (14-period):</strong> Normalized from 0-100 scale to -1 to +1. Values {'<'} 30 (oversold) map to positive signals, {'>'} 70 (overbought) map to negative signals.</p>
              <p><strong>MACD (12/26/9):</strong> Uses hyperbolic tangent (tanh) function for smooth normalization. Formula: tanh(MACD_histogram / 100). Positive histogram values indicate bullish momentum.</p>
              <p><strong>Bollinger Bands (20-period):</strong> Position value (0-1) normalized to -1 to +1. Formula: (position - 0.5) × 2. Values near 0 (lower band) map to +1 (BUY), near 1 (upper band) map to -1 (SELL).</p>
              <p><strong>EMA (20-period):</strong> Ratio of price to EMA normalized using tanh. Formula: tanh((price/EMA - 1.0) × 2). Price above EMA ({'>'}1.0) indicates bullish trend.</p>
              <p><strong>Volume Analysis:</strong> Volume ratio normalized using tanh. Formula: tanh(volume_ratio - 1.0). Values {'>'} 1.5 with positive price change indicate strong buying pressure.</p>
              <p className="mt-3 pt-3 border-t border-blue-300"><strong>All composite methods</strong> combine these normalized indicator values using different weighting schemes (simple weighted, correlation-adjusted, Mahalanobis distance) to produce final scores in the -1 to +1 range.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getSignalDescriptionHelper = (score) => {
  if (score >= 0.6) return "STRONG BUY";
  if (score >= 0.2) return "BUY";
  if (score <= -0.6) return "STRONG SELL";
  if (score <= -0.2) return "SELL";
  return "HOLD";
};

export default AdvancedAnalysis;
