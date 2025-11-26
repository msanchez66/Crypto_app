from flask import Flask, jsonify
from flask_cors import CORS
import requests
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import time
from correlation_analysis import (
    compute_indicator_time_series,
    compute_correlation_matrix,
    compute_all_methods,
    find_strong_correlations,
    get_signal_description,
    normalize_indicator_to_signal,
    method1_simple_weighted
)

app = Flask(__name__)
CORS(app)

# CoinGecko API (free, no API key required)
BASE_URL = "https://api.coingecko.com/api/v3"

# Supported coins (symbol -> CoinGecko ID)
COIN_MAP = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'XRP': 'ripple',
    'SOL': 'solana',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'BNB': 'binancecoin',
    'MATIC': 'matic-network',
    'LTC': 'litecoin',
    'DOT': 'polkadot',
    'AVAX': 'avalanche-2',
    'SHIB': 'shiba-inu',
    'TRX': 'tron',
    'LINK': 'chainlink'
}

# Simple in-memory cache to reduce API calls
_data_cache = {}
_cache_duration = 60  # Cache for 60 seconds

# Rate limiting: track last request time
_last_request_time = 0
_min_request_interval = 1.2  # Minimum 1.2 seconds between requests (50 requests/minute max)

def get_historical_data(coin_id, days=30):
    """Fetch historical price data from CoinGecko with rate limiting and caching"""
    global _last_request_time, _data_cache
    
    # Check cache first
    cache_key = f"{coin_id}_{days}"
    if cache_key in _data_cache:
        cached_data, cached_time = _data_cache[cache_key]
        if (datetime.now() - cached_time).total_seconds() < _cache_duration:
            print(f"Using cached data for {coin_id}")
            return cached_data
    
    # Rate limiting: ensure minimum time between requests
    current_time = time.time()
    time_since_last = current_time - _last_request_time
    if time_since_last < _min_request_interval:
        sleep_time = _min_request_interval - time_since_last
        print(f"Rate limiting: waiting {sleep_time:.2f} seconds...")
        time.sleep(sleep_time)
    
    url = f"{BASE_URL}/coins/{coin_id}/market_chart"
    params = {
        'vs_currency': 'usd',
        'days': days
        # Note: interval='hourly' requires Enterprise plan
        # Free tier automatically returns hourly data for days 2-90
    }
    
    max_retries = 3
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            _last_request_time = time.time()
            response = requests.get(url, params=params, timeout=15)
            
            # Handle rate limiting (429 status code)
            if response.status_code == 429:
                wait_time = retry_delay * (attempt + 1)
                print(f"Rate limit hit (429). Waiting {wait_time} seconds before retry {attempt + 1}/{max_retries}...")
                if attempt < max_retries - 1:
                    time.sleep(wait_time)
                    continue
                else:
                    raise Exception("Rate limit exceeded. Please wait a minute before trying again.")
            
            response.raise_for_status()
            data = response.json()
            
            # Convert to DataFrame
            prices = data['prices']
            volumes = data['total_volumes']
            
            df = pd.DataFrame(prices, columns=['timestamp', 'price'])
            df['volume'] = [v[1] for v in volumes]
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            
            # Cache the result
            _data_cache[cache_key] = (df, datetime.now())
            
            return df
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                wait_time = retry_delay * (attempt + 1)
                print(f"Rate limit hit (429). Waiting {wait_time} seconds before retry {attempt + 1}/{max_retries}...")
                if attempt < max_retries - 1:
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"Rate limit exceeded after {max_retries} retries")
                    return None
            else:
                print(f"HTTP Error fetching data for {coin_id}: {e}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    continue
                return None
        except requests.exceptions.Timeout:
            print(f"Timeout fetching data for {coin_id} (attempt {attempt + 1}/{max_retries})")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                continue
            return None
        except Exception as e:
            print(f"Error fetching data for {coin_id}: {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                continue
            return None
    
    return None

def calculate_rsi(prices, period=14):
    """Calculate Relative Strength Index using Wilder's smoothing method"""
    deltas = np.diff(prices)
    
    # Separate gains and losses
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    
    # Initialize arrays for RSI
    rsi = np.zeros_like(prices)
    
    # Calculate initial average gain and loss (simple average for first period)
    if len(gains) < period:
        # Not enough data, return neutral value
        return 50.0
    
    avg_gain = np.mean(gains[:period])
    avg_loss = np.mean(losses[:period])
    
    # Handle edge case where avg_loss is zero
    if avg_loss == 0:
        return 100.0
    
    # Calculate initial RS and RSI
    rs = avg_gain / avg_loss
    rsi[period] = 100.0 - (100.0 / (1.0 + rs))
    
    # Apply Wilder's smoothing for remaining periods
    for i in range(period + 1, len(prices)):
        gain = gains[i - 1]  # i-1 because gains array is one shorter
        loss = losses[i - 1]
        
        # Wilder's smoothing: new_avg = (old_avg * (period - 1) + new_value) / period
        avg_gain = (avg_gain * (period - 1) + gain) / period
        avg_loss = (avg_loss * (period - 1) + loss) / period
        
        if avg_loss == 0:
            rsi[i] = 100.0
        else:
            rs = avg_gain / avg_loss
            rsi[i] = 100.0 - (100.0 / (1.0 + rs))
    
    return rsi[-1]

def calculate_macd(prices):
    """Calculate MACD (Moving Average Convergence Divergence)"""
    exp1 = pd.Series(prices).ewm(span=12, adjust=False).mean()
    exp2 = pd.Series(prices).ewm(span=26, adjust=False).mean()
    macd = exp1 - exp2
    signal = macd.ewm(span=9, adjust=False).mean()
    histogram = macd - signal
    
    return {
        'macd': float(macd.iloc[-1]),
        'signal': float(signal.iloc[-1]),
        'histogram': float(histogram.iloc[-1])
    }

def calculate_bollinger_bands(prices, period=20):
    """Calculate Bollinger Bands"""
    sma = pd.Series(prices).rolling(window=period).mean()
    std = pd.Series(prices).rolling(window=period).std()
    
    upper_band = sma + (std * 2)
    lower_band = sma - (std * 2)
    
    current_price = prices[-1]
    
    return {
        'upper': float(upper_band.iloc[-1]),
        'middle': float(sma.iloc[-1]),
        'lower': float(lower_band.iloc[-1]),
        'current': current_price
    }

def calculate_ema(prices, period=20):
    """Calculate Exponential Moving Average"""
    ema = pd.Series(prices).ewm(span=period, adjust=False).mean()
    return float(ema.iloc[-1])

def analyze_volume(volumes, prices):
    """Analyze volume trend"""
    recent_volume = np.mean(volumes[-5:])
    
    # Handle edge case: if not enough data, use all available data
    if len(volumes) < 10:
        avg_volume = np.mean(volumes) if len(volumes) > 0 else recent_volume
    else:
        avg_volume = np.mean(volumes[:-5])
    
    volume_ratio = recent_volume / avg_volume if avg_volume > 0 else 1
    
    # Price trend - handle edge case for insufficient data
    if len(prices) >= 5:
        recent_price_change = (prices[-1] - prices[-5]) / prices[-5] * 100
    else:
        recent_price_change = (prices[-1] - prices[0]) / prices[0] * 100 if len(prices) > 1 else 0
    
    return {
        'volume_ratio': float(volume_ratio),
        'price_change': float(recent_price_change),
        'avg_volume': float(avg_volume)
    }

def get_indicator_signal(indicator_name, value, current_price=None):
    """Convert indicator value to buy/sell/hold signal (-1, 0, 1)"""
    
    if indicator_name == 'RSI':
        if value < 30:
            return 1, "BUY - Oversold"
        elif value > 70:
            return -1, "SELL - Overbought"
        else:
            return 0, "HOLD - Neutral"
    
    elif indicator_name == 'MACD':
        histogram = value['histogram']
        if histogram > 0 and value['macd'] > value['signal']:
            return 1, "BUY - Bullish crossover"
        elif histogram < 0 and value['macd'] < value['signal']:
            return -1, "SELL - Bearish crossover"
        else:
            return 0, "HOLD - No clear signal"
    
    elif indicator_name == 'Bollinger':
        band_width = value['upper'] - value['lower']
        if band_width == 0:
            # Bands are equal (rare edge case), consider neutral
            position = 0.5
        else:
            position = (current_price - value['lower']) / band_width
        
        if position < 0.2:
            return 1, "BUY - Near lower band"
        elif position > 0.8:
            return -1, "SELL - Near upper band"
        else:
            return 0, "HOLD - Middle range"
    
    elif indicator_name == 'EMA':
        if current_price > value:
            return 1, "BUY - Above EMA"
        elif current_price < value * 0.98:
            return -1, "SELL - Below EMA"
        else:
            return 0, "HOLD - Near EMA"
    
    elif indicator_name == 'Volume':
        if value['volume_ratio'] > 1.5 and value['price_change'] > 0:
            return 1, "BUY - High volume uptrend"
        elif value['volume_ratio'] > 1.5 and value['price_change'] < 0:
            return -1, "SELL - High volume downtrend"
        else:
            return 0, "HOLD - Normal volume"
    
    return 0, "HOLD"

def calculate_composite_score(signals):
    """Calculate weighted composite score"""
    weights = {
        'RSI': 0.25,
        'MACD': 0.25,
        'Bollinger': 0.20,
        'EMA': 0.15,
        'Volume': 0.15
    }
    
    composite = sum(signals[key] * weights[key] for key in weights)
    
    if composite > 0.4:
        return "STRONG BUY", composite
    elif composite > 0.2:
        return "BUY", composite
    elif composite < -0.4:
        return "STRONG SELL", composite
    elif composite < -0.2:
        return "SELL", composite
    else:
        return "HOLD", composite

@app.route('/api/analyze/<coin>', methods=['GET'])
def analyze_coin(coin):
    """Analyze a cryptocurrency and return all indicators"""
    
    # Map common symbols to CoinGecko IDs
    coin_id = COIN_MAP.get(coin.upper(), coin.lower())
    
    # Fetch historical data
    df = get_historical_data(coin_id, days=30)
    
    if df is None or len(df) < 50:
        error_msg = 'Unable to fetch data from CoinGecko API. '
        if df is None:
            error_msg += 'This may be due to rate limiting. Please wait a moment and try again.'
        else:
            error_msg += 'Insufficient data received.'
        return jsonify({'error': error_msg}), 500
    
    prices = df['price'].values
    volumes = df['volume'].values
    current_price = prices[-1]
    
    # Calculate all indicators
    rsi_value = calculate_rsi(prices)
    macd_value = calculate_macd(prices)
    bb_value = calculate_bollinger_bands(prices)
    ema_value = calculate_ema(prices, period=20)
    volume_analysis = analyze_volume(volumes, prices)
    
    # Get signals for each indicator (for display purposes)
    signals = {}
    signal_descriptions = {}
    
    rsi_signal, rsi_desc = get_indicator_signal('RSI', rsi_value)
    signals['RSI'] = rsi_signal
    signal_descriptions['RSI'] = rsi_desc
    
    macd_signal, macd_desc = get_indicator_signal('MACD', macd_value)
    signals['MACD'] = macd_signal
    signal_descriptions['MACD'] = macd_desc
    
    bb_signal, bb_desc = get_indicator_signal('Bollinger', bb_value, current_price)
    signals['Bollinger'] = bb_signal
    signal_descriptions['Bollinger'] = bb_desc
    
    ema_signal, ema_desc = get_indicator_signal('EMA', ema_value, current_price)
    signals['EMA'] = ema_signal
    signal_descriptions['EMA'] = ema_desc
    
    vol_signal, vol_desc = get_indicator_signal('Volume', volume_analysis)
    signals['Volume'] = vol_signal
    signal_descriptions['Volume'] = vol_desc
    
    # Calculate composite score using Simple Weighted method (same as Advanced Analysis)
    # Prepare indicator values in the format expected by method1_simple_weighted
    bb_position = (current_price - bb_value['lower']) / (bb_value['upper'] - bb_value['lower']) if (bb_value['upper'] - bb_value['lower']) != 0 else 0.5
    
    indicator_values = {
        'RSI': rsi_value,
        'MACD': macd_value['histogram'],
        'Bollinger': bb_position,
        'EMA': current_price / ema_value,  # EMA ratio
        'Volume': volume_analysis['volume_ratio']
    }
    
    # Use Simple Weighted method to get composite score
    composite_score, normalized_signals = method1_simple_weighted(indicator_values)
    recommendation = get_signal_description(composite_score)
    
    # Prepare response
    result = {
        'coin': coin.upper(),
        'coin_id': coin_id,
        'timestamp': datetime.now().isoformat(),
        'current_price': float(current_price),
        'indicators': {
            'RSI': {
                'value': float(rsi_value),
                'signal': rsi_signal,
                'description': rsi_desc
            },
            'MACD': {
                'value': macd_value,
                'signal': macd_signal,
                'description': macd_desc
            },
            'Bollinger': {
                'value': bb_value,
                'signal': bb_signal,
                'description': bb_desc
            },
            'EMA': {
                'value': float(ema_value),
                'signal': ema_signal,
                'description': ema_desc
            },
            'Volume': {
                'value': volume_analysis,
                'signal': vol_signal,
                'description': vol_desc
            }
        },
        'composite': {
            'score': float(composite_score),
            'recommendation': recommendation,
            'confidence': abs(composite_score) * 100
        }
    }
    
    return jsonify(result)

@app.route('/api/price/<coin>', methods=['GET'])
def get_current_price(coin):
    """Get current price for a coin"""
    coin_map = {
        'BTC': 'bitcoin',
        'XRP': 'ripple',
        'SOL': 'solana',
        'ETH': 'ethereum'
    }
    
    coin_id = coin_map.get(coin.upper(), coin.lower())
    
    url = f"{BASE_URL}/simple/price"
    params = {
        'ids': coin_id,
        'vs_currencies': 'usd',
        'include_24hr_change': 'true'
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/advanced-analysis/<coin>', methods=['GET'])
def advanced_analysis(coin):
    """Advanced analysis with correlation matrix and multiple scoring methods"""
    
    coin_id = COIN_MAP.get(coin.upper(), coin.lower())
    
    # Fetch historical data
    df = get_historical_data(coin_id, days=30)
    
    if df is None or len(df) < 50:
        error_msg = 'Unable to fetch data from CoinGecko API. '
        if df is None:
            error_msg += 'This may be due to rate limiting. Please wait a moment and try again.'
        else:
            error_msg += 'Insufficient data received.'
        return jsonify({'error': error_msg}), 500
    
    prices = df['price'].values
    volumes = df['volume'].values
    current_price = prices[-1]
    
    # Calculate price change for volume analysis
    price_change = (prices[-1] - prices[-5]) / prices[-5] * 100 if len(prices) >= 5 else 0
    
    # Compute indicator time series for correlation analysis
    indicator_df = compute_indicator_time_series(df)
    
    # Compute correlation matrix
    correlation_matrix = compute_correlation_matrix(indicator_df)
    
    # Get current indicator values
    macd_full = calculate_macd(prices)
    bb_full = calculate_bollinger_bands(prices)
    volume_analysis = analyze_volume(volumes, prices)
    ema_value = calculate_ema(prices, period=20)
    
    current_values = {
        'RSI': calculate_rsi(prices),
        'MACD': macd_full['histogram'],
        'MACD_Signal': macd_full['signal'],
        'Bollinger': (current_price - bb_full['lower']) / (bb_full['upper'] - bb_full['lower']) if (bb_full['upper'] - bb_full['lower']) != 0 else 0.5,
        'EMA': current_price / ema_value,  # EMA ratio (price/EMA), not EMA value
        'Volume': volume_analysis['volume_ratio']
    }
    
    # Compute all scoring methods
    all_results = compute_all_methods(indicator_df, current_values, correlation_matrix, price_change)
    
    # Find strong correlations
    strong_corrs = find_strong_correlations(correlation_matrix, threshold=0.3)
    
    # Prepare correlation matrix for JSON
    corr_dict = correlation_matrix.to_dict()
    
    # Get individual signals
    individual_signals = all_results['individual_signals']
    
    # Prepare result
    result = {
        'coin': coin.upper(),
        'coin_id': coin_id,
        'timestamp': datetime.now().isoformat(),
        'current_price': float(current_price),
        'current_indicators': {
            'RSI': float(current_values['RSI']),
            'MACD': float(current_values['MACD']),
            'Bollinger': float(current_values['Bollinger']),
            'EMA': float(current_values['EMA']),
            'Volume': float(current_values['Volume'])
        },
        'correlation_matrix': corr_dict,
        'strong_correlations': strong_corrs,
        'methods': {
            'simple_weighted': {
                'score': all_results['simple_weighted']['score'],
                'recommendation': get_signal_description(all_results['simple_weighted']['score']),
                'normalized_signals': all_results['simple_weighted']['normalized_signals']
            },
            'correlation_adjusted': {
                'score': all_results['correlation_adjusted']['score'],
                'recommendation': get_signal_description(all_results['correlation_adjusted']['score']),
                'weights': all_results['correlation_adjusted']['weights']
            },
            'mahalanobis': {
                'score': all_results['mahalanobis']['score'],
                'recommendation': get_signal_description(all_results['mahalanobis']['score']),
                'distances': all_results['mahalanobis']['distances']
            },
            'pca_composite': {
                'score': all_results['pca_composite']['score'],
                'recommendation': get_signal_description(all_results['pca_composite']['score']),
                'factors': all_results['pca_composite']['factors']
            },
            'individual_signals': {
                'RSI': {
                    'signal': float(normalize_indicator_to_signal(current_values['RSI'], 'RSI')),
                    'recommendation': get_signal_description(float(normalize_indicator_to_signal(current_values['RSI'], 'RSI')))
                },
                'MACD': {
                    'signal': float(normalize_indicator_to_signal(current_values['MACD'], 'MACD')),
                    'recommendation': get_signal_description(float(normalize_indicator_to_signal(current_values['MACD'], 'MACD')))
                },
                'Bollinger': {
                    'signal': float(normalize_indicator_to_signal(current_values['Bollinger'], 'Bollinger')),
                    'recommendation': get_signal_description(float(normalize_indicator_to_signal(current_values['Bollinger'], 'Bollinger')))
                },
                'EMA': {
                    'signal': float(normalize_indicator_to_signal(current_values['EMA'], 'EMA')),
                    'recommendation': get_signal_description(float(normalize_indicator_to_signal(current_values['EMA'], 'EMA')))
                },
                'Volume': {
                    'signal': float(normalize_indicator_to_signal(current_values['Volume'], 'Volume')),
                    'recommendation': get_signal_description(float(normalize_indicator_to_signal(current_values['Volume'], 'Volume')))
                }
            }
        },
        'consensus': {
            'scores': [
                all_results['simple_weighted']['score'],
                all_results['correlation_adjusted']['score'],
                all_results['mahalanobis']['score']
            ],
            'average_score': float(np.mean([
                all_results['simple_weighted']['score'],
                all_results['correlation_adjusted']['score'],
                all_results['mahalanobis']['score']
            ])),
            'agreement': len(set([
                get_signal_description(all_results['simple_weighted']['score']),
                get_signal_description(all_results['correlation_adjusted']['score']),
                get_signal_description(all_results['mahalanobis']['score'])
            ])) == 1
        }
    }
    
    return jsonify(result)


@app.route('/api/indicator-history/<coin>', methods=['GET'])
def indicator_history(coin):
    """Return 10-day history of normalized indicators and composite methods"""
    
    coin_id = COIN_MAP.get(coin.upper(), coin.lower())
    
    df = get_historical_data(coin_id, days=30)
    if df is None or len(df) < 50:
        error_msg = 'Unable to fetch data from CoinGecko API for indicator history.'
        return jsonify({'error': error_msg}), 500
    
    indicator_df = compute_indicator_time_series(df)
    if indicator_df.empty:
        return jsonify({'error': 'Not enough data to compute indicators'}), 500
    
    correlation_matrix = compute_correlation_matrix(indicator_df)
    
    # Align timestamps with indicator_df (drop rows removed by rolling calculations)
    aligned_prices = df.iloc[-len(indicator_df):].reset_index(drop=True)
    
    hours_10_days = 10 * 24
    history_len = min(len(indicator_df), hours_10_days)
    start_idx = len(indicator_df) - history_len
    
    history = []
    price_series = aligned_prices['price'].values
    
    for idx in range(start_idx, len(indicator_df)):
        row = indicator_df.iloc[idx]
        timestamp = aligned_prices.iloc[idx]['timestamp']
        
        current_values = row.to_dict()
        
        # Approximate 5-period price change for volume signal context
        if idx >= 5:
            prev_price = price_series[idx - 5]
            price_change = ((price_series[idx] - prev_price) / prev_price) * 100 if prev_price != 0 else 0
        else:
            price_change = 0
        
        methods = compute_all_methods(indicator_df, current_values, correlation_matrix, price_change)
        
        normalized_indicators = {
            'RSI': float(normalize_indicator_to_signal(row['RSI'], 'RSI')),
            'MACD': float(normalize_indicator_to_signal(row['MACD'], 'MACD')),
            'Bollinger': float(normalize_indicator_to_signal(row['Bollinger'], 'Bollinger')),
            'EMA': float(normalize_indicator_to_signal(row['EMA'], 'EMA')),
            'Volume': float(normalize_indicator_to_signal(row['Volume'], 'Volume'))
        }
        
        history.append({
            'timestamp': timestamp.isoformat() if hasattr(timestamp, 'isoformat') else str(timestamp),
            'indicators': normalized_indicators,
            'methods': {
                'simple_weighted': methods['simple_weighted']['score'],
                'correlation_adjusted': methods['correlation_adjusted']['score'],
                'mahalanobis': methods['mahalanobis']['score'],
                'pca_composite': methods['pca_composite']['score']
            }
        })
    
    return jsonify({
        'coin': coin.upper(),
        'coin_id': coin_id,
        'history': history
    })

@app.route('/api/price-history/<coin>', methods=['GET'])
def get_price_history(coin):
    """Get historical price data for charting"""
    
    coin_id = COIN_MAP.get(coin.upper(), coin.lower())
    
    # Fetch historical data
    df = get_historical_data(coin_id, days=30)
    
    if df is None or len(df) < 50:
        error_msg = 'Unable to fetch price history from CoinGecko API. '
        if df is None:
            error_msg += 'This may be due to rate limiting. Please wait a moment and try again.'
        else:
            error_msg += 'Insufficient data received.'
        return jsonify({'error': error_msg}), 500
    
    # Prepare data for frontend
    price_data = []
    for _, row in df.iterrows():
        timestamp = row['timestamp']
        # Handle timestamp - could be datetime or already ISO string
        if hasattr(timestamp, 'isoformat'):
            timestamp_str = timestamp.isoformat()
        elif isinstance(timestamp, (int, float)):
            # Unix timestamp in milliseconds
            timestamp_str = datetime.fromtimestamp(timestamp / 1000).isoformat()
        else:
            timestamp_str = str(timestamp)
        
        price_data.append({
            'timestamp': timestamp_str,
            'price': float(row['price']),
            'volume': float(row['volume'])
        })
    
    result = {
        'coin': coin.upper(),
        'coin_id': coin_id,
        'data_points': len(price_data),
        'period_days': 30,
        'price_history': price_data,
        'current_price': float(df['price'].iloc[-1]),
        'min_price': float(df['price'].min()),
        'max_price': float(df['price'].max()),
        'price_change_24h': float(((df['price'].iloc[-1] - df['price'].iloc[-24]) / df['price'].iloc[-24] * 100) if len(df) >= 24 else 0)
    }
    
    return jsonify(result)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    print("Starting Crypto Analysis API Server...")
    print("Available at: http://localhost:8000")
    app.run(debug=True, port=8000)
