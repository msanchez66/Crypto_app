import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const API_BASE = 'http://localhost:8000/api';

const indicatorColors = {
  RSI: '#22c55e',
  MACD: '#3b82f6',
  Bollinger: '#a855f7',
  EMA: '#f59e0b',
  Volume: '#ec4899'
};

const methodColors = {
  simple_weighted: '#0ea5e9',
  correlation_adjusted: '#14b8a6',
  mahalanobis: '#8b5cf6'
};

const IndicatorHistoryCharts = ({ coin }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/indicator-history/${coin}`);
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to fetch indicator history');
        }
        const data = await response.json();
        setHistory(data.history || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [coin]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-600">Loading indicator history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return null;
  }

  const labels = history.map(item =>
    new Date(item.timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit'
    })
  );

  const indicatorDatasets = Object.keys(indicatorColors).map((key) => ({
    label: key,
    data: history.map(item => item.indicators[key]),
    borderColor: indicatorColors[key],
    backgroundColor: indicatorColors[key],
    fill: false,
    tension: 0.2,
    borderWidth: 1.5,
    pointRadius: 0,
    pointHoverRadius: 0
  }));

  const methodDatasets = Object.keys(methodColors).map((key) => ({
    label: key.replace('_', ' '),
    data: history.map(item => item.methods[key] || 0),
    borderColor: methodColors[key],
    backgroundColor: methodColors[key],
    fill: false,
    tension: 0.2,
    borderWidth: 1.5,
    pointRadius: 0,
    pointHoverRadius: 0
  })).filter(dataset => dataset.data.some(val => val !== 0)); // Only show methods with data

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        min: -1,
        max: 1,
        ticks: {
          callback: (value) => value.toFixed(1)
        }
      },
      x: {
        ticks: {
          maxTicksLimit: 8
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">10-Day Indicator Evolution</h2>
      <p className="text-sm text-gray-600 mb-4">
        Each line is normalized between -1 (strong sell) and +1 (strong buy). This visualization helps verify indicator signals across time and aligns with standard references (Wilder for RSI, Bollinger, etc.).
      </p>
      <div className="grid lg:grid-cols-2 gap-6">
        <div style={{ height: '280px', position: 'relative' }}>
          <h3 className="font-semibold text-gray-700 mb-2">Individual Indicators</h3>
          <div style={{ height: '250px', position: 'relative' }}>
            <Line
              data={{ labels, datasets: indicatorDatasets }}
              options={commonOptions}
            />
          </div>
        </div>
        <div style={{ height: '280px', position: 'relative' }}>
          <h3 className="font-semibold text-gray-700 mb-2">Composite Methods</h3>
          <div style={{ height: '250px', position: 'relative' }}>
            <Line
              data={{ labels, datasets: methodDatasets }}
              options={commonOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorHistoryCharts;

