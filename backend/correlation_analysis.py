"""
Advanced Crypto Analysis with Correlation Matrix and Multiple Scoring Methods
Computes indicators over time series and applies 5 different scoring methods

INDICATOR VALIDATION:
To verify calculations, compare with online platforms:
- RSI (14-period): Compare with TradingView, CoinGecko, or Binance
  Standard thresholds: <30 (oversold/BUY), >70 (overbought/SELL)
- MACD (12/26/9): Verify histogram values match TradingView
- Bollinger Bands (20-period, 2 std dev): Check band positions
- EMA (20-period): Compare with exponential moving average on TradingView
- Volume Analysis: Compare volume ratios with market data

All calculations follow industry-standard formulas (Wilder's RSI, Bollinger's method, etc.)
"""

import numpy as np
import pandas as pd
from scipy.spatial.distance import mahalanobis
from scipy.linalg import inv
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')


def calculate_rsi_series(prices, period=14):
    """Calculate RSI for entire time series"""
    deltas = np.diff(prices)
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    
    rsi = np.zeros_like(prices)
    rsi[:period] = 50.0  # Neutral for first period values
    
    # Initial average gain and loss
    avg_gain = np.mean(gains[:period])
    avg_loss = np.mean(losses[:period])
    
    if avg_loss == 0:
        rsi[period] = 100.0
    else:
        rs = avg_gain / avg_loss
        rsi[period] = 100.0 - (100.0 / (1.0 + rs))
    
    # Wilder's smoothing for remaining periods
    for i in range(period + 1, len(prices)):
        gain = gains[i - 1]
        loss = losses[i - 1]
        
        avg_gain = (avg_gain * (period - 1) + gain) / period
        avg_loss = (avg_loss * (period - 1) + loss) / period
        
        if avg_loss == 0:
            rsi[i] = 100.0
        else:
            rs = avg_gain / avg_loss
            rsi[i] = 100.0 - (100.0 / (1.0 + rs))
    
    return rsi


def calculate_macd_series(prices):
    """Calculate MACD histogram for entire time series"""
    exp1 = pd.Series(prices).ewm(span=12, adjust=False).mean()
    exp2 = pd.Series(prices).ewm(span=26, adjust=False).mean()
    macd = exp1 - exp2
    signal = macd.ewm(span=9, adjust=False).mean()
    histogram = macd - signal
    return histogram.values


def calculate_bollinger_position_series(prices, period=20):
    """Calculate Bollinger Band position for entire time series"""
    sma = pd.Series(prices).rolling(window=period).mean()
    std = pd.Series(prices).rolling(window=period).std()
    upper_band = sma + (std * 2)
    lower_band = sma - (std * 2)
    
    positions = np.zeros_like(prices)
    for i in range(period, len(prices)):
        band_width = upper_band.iloc[i] - lower_band.iloc[i]
        if band_width == 0:
            positions[i] = 0.5
        else:
            positions[i] = (prices[i] - lower_band.iloc[i]) / band_width
    
    return positions


def calculate_ema_ratio_series(prices, period=20):
    """Calculate EMA ratio for entire time series"""
    ema = pd.Series(prices).ewm(span=period, adjust=False).mean()
    ratios = prices / ema.values
    return ratios


def calculate_volume_ratio_series(volumes, period=20):
    """Calculate volume ratio for entire time series"""
    avg_volumes = pd.Series(volumes).rolling(window=period).mean()
    ratios = volumes / avg_volumes.values
    ratios = np.nan_to_num(ratios, nan=1.0, posinf=1.0, neginf=1.0)
    return ratios


def compute_indicator_time_series(df):
    """
    Compute all indicators for entire time series
    Returns DataFrame with columns: RSI, MACD, Bollinger, EMA, Volume
    """
    prices = df['price'].values
    volumes = df['volume'].values
    
    # Calculate all indicator series
    rsi_series = calculate_rsi_series(prices)
    macd_series = calculate_macd_series(prices)
    bb_series = calculate_bollinger_position_series(prices)
    ema_series = calculate_ema_ratio_series(prices)
    volume_series = calculate_volume_ratio_series(volumes)
    
    # Create DataFrame
    indicator_df = pd.DataFrame({
        'RSI': rsi_series,
        'MACD': macd_series,
        'Bollinger': bb_series,
        'EMA': ema_series,
        'Volume': volume_series
    })
    
    # Remove rows with NaN (from rolling windows)
    indicator_df = indicator_df.dropna().reset_index(drop=True)
    
    return indicator_df


def compute_correlation_matrix(indicator_df):
    """Compute correlation matrix for indicators"""
    return indicator_df.corr()


def normalize_indicator_to_signal(value, indicator_name):
    """
    Normalize individual indicator values to -1 to +1 scale
    Based on technical analysis literature:
    - RSI: Wilder (1978) - <30 oversold (BUY), >70 overbought (SELL)
    - MACD: Appel (2005) - positive histogram = bullish, negative = bearish
    - Bollinger: Bollinger (2001) - near lower band = oversold (BUY), near upper = overbought (SELL)
    - EMA: Price above EMA = bullish, below = bearish
    - Volume: High volume with price increase = bullish confirmation
    """
    # Convert to float if it's a Series or array
    if hasattr(value, 'iloc'):
        value = float(value.iloc[-1]) if len(value) > 0 else float(value)
    elif hasattr(value, '__len__') and not isinstance(value, str):
        value = float(value[-1]) if len(value) > 0 else float(value)
    else:
        value = float(value)
    
    if indicator_name == 'RSI':
        # RSI: 0-100 scale
        # Literature: RSI < 30 = oversold (BUY signal), RSI > 70 = overbought (SELL signal)
        # Normalize: <30 -> positive (BUY), >70 -> negative (SELL), 30-70 -> neutral
        if value < 30:
            # Oversold: map to positive (stronger oversold = higher positive)
            normalized = 1.0 - (value / 30.0)  # RSI 0 -> +1.0, RSI 30 -> 0.0
        elif value > 70:
            # Overbought: map to negative (stronger overbought = lower negative)
            normalized = -1.0 + ((100 - value) / 30.0)  # RSI 70 -> 0.0, RSI 100 -> -1.0
        else:
            # Neutral zone: linear interpolation
            normalized = (50 - value) / 50.0  # RSI 30 -> +0.4, RSI 50 -> 0, RSI 70 -> -0.4
        return float(np.clip(normalized, -1, 1))
    
    elif indicator_name == 'MACD':
        # MACD: Histogram value (can be positive or negative)
        # Literature: Positive histogram = bullish momentum, negative = bearish
        # Use tanh for smooth normalization
        return float(np.tanh(value / 100.0)) if value != 0 else 0.0
    
    elif indicator_name == 'Bollinger':
        # Bollinger: Position value 0-1 (0 = lower band, 1 = upper band)
        # Literature: Price near lower band (<0.2) = oversold (BUY), near upper (>0.8) = overbought (SELL)
        # Map: 0 -> +1 (BUY), 0.5 -> 0 (HOLD), 1 -> -1 (SELL)
        normalized = (0.5 - value) * 2.0
        return float(np.clip(normalized, -1, 1))
    
    elif indicator_name == 'EMA':
        # EMA: Ratio of price/EMA (typically 0.8-1.2 range)
        # Literature: Price > EMA = bullish, Price < EMA = bearish
        # Normalize: >1.0 -> positive, <1.0 -> negative
        return float(np.tanh((value - 1.0) * 2.0))
    
    elif indicator_name == 'Volume':
        # Volume: Ratio of recent/average volume (typically 0.5-2.0)
        # Literature: High volume (>1.5) with price increase = bullish confirmation
        # Normalize: >1.0 -> positive, <1.0 -> negative
        return float(np.tanh((value - 1.0)))
    
    return 0.0


def method1_simple_weighted(indicator_values):
    """Method 1: Simple Weighted Average"""
    weights = {
        'RSI': 0.25,
        'MACD': 0.25,
        'Bollinger': 0.20,
        'EMA': 0.15,
        'Volume': 0.15
    }
    
    normalized_signals = {}
    weighted_sum = 0
    
    # Only process main indicators (exclude helper values like MACD_Signal)
    main_indicators = ['RSI', 'MACD', 'Bollinger', 'EMA', 'Volume']
    
    for indicator in main_indicators:
        if indicator in indicator_values:
            value = indicator_values[indicator]
            normalized = normalize_indicator_to_signal(value, indicator)
            normalized_signals[indicator] = normalized
            weighted_sum += normalized * weights[indicator]
    
    return weighted_sum, normalized_signals


def method2_correlation_adjusted(indicator_values, correlation_matrix):
    """Method 2: Correlation-Adjusted Weights"""
    # For each indicator: weight = 1 / (sum of absolute correlations with others)
    indicators = ['RSI', 'MACD', 'Bollinger', 'EMA', 'Volume']
    weights = {}
    
    for indicator in indicators:
        corr_sum = 0
        for other in indicators:
            if indicator != other:
                corr_sum += abs(correlation_matrix.loc[indicator, other])
        weights[indicator] = 1 / (1 + corr_sum)  # Add 1 to avoid division by zero
    
    # Normalize weights to sum to 1
    total_weight = sum(weights.values())
    weights = {k: v / total_weight for k, v in weights.items()}
    
    # Compute weighted sum - only use main indicators
    weighted_sum = 0
    for indicator in indicators:
        if indicator in indicator_values:
            value = indicator_values[indicator]
            normalized = normalize_indicator_to_signal(value, indicator)
            weighted_sum += normalized * weights[indicator]
    
    return weighted_sum, weights


def method3_mahalanobis_distance(indicator_df, current_values):
    """Method 3: Mahalanobis Distance"""
    # Neutral point: [RSI=50, MACD=0, BB=0.5, EMA=1.0, Volume=1.0]
    neutral = np.array([50.0, 0.0, 0.5, 1.0, 1.0])
    
    # Bullish reference: [RSI=30, MACD=positive, BB=0.2, EMA=1.02, Volume=1.5]
    bullish = np.array([30.0, 10.0, 0.2, 1.02, 1.5])
    
    # Bearish reference: [RSI=70, MACD=negative, BB=0.8, EMA=0.98, Volume=0.5]
    bearish = np.array([70.0, -10.0, 0.8, 0.98, 0.5])
    
    # Get current indicator values as array
    current = np.array([
        current_values['RSI'],
        current_values['MACD'],
        current_values['Bollinger'],
        current_values['EMA'],
        current_values['Volume']
    ])
    
    # Compute covariance matrix from historical data
    indicator_array = indicator_df[['RSI', 'MACD', 'Bollinger', 'EMA', 'Volume']].values
    cov_matrix = np.cov(indicator_array.T)
    
    # Add small value to diagonal for numerical stability
    cov_matrix += np.eye(cov_matrix.shape[0]) * 1e-6
    
    try:
        inv_cov = inv(cov_matrix)
        
        # Compute distances
        dist_to_neutral = mahalanobis(current, neutral, inv_cov)
        dist_to_bullish = mahalanobis(current, bullish, inv_cov)
        dist_to_bearish = mahalanobis(current, bearish, inv_cov)
        
        # Signal based on distance difference
        distance_diff = dist_to_bearish - dist_to_bullish
        
        # Normalize to -1 to +1 scale
        max_possible_dist = max(dist_to_bullish, dist_to_bearish, dist_to_neutral)
        signal = np.tanh(distance_diff / (max_possible_dist + 1e-6))
        
        return signal, {
            'dist_to_neutral': float(dist_to_neutral),
            'dist_to_bullish': float(dist_to_bullish),
            'dist_to_bearish': float(dist_to_bearish)
        }
    except:
        # Fallback if covariance matrix is singular
        return 0.0, {'error': 'Cannot compute Mahalanobis distance'}


def method4_pca_based(indicator_df, current_values):
    """Method 4: PCA-Based Score"""
    # Standardize the data
    scaler = StandardScaler()
    indicator_array = indicator_df[['RSI', 'MACD', 'Bollinger', 'EMA', 'Volume']].values
    standardized = scaler.fit_transform(indicator_array)
    
    # Fit PCA
    pca = PCA(n_components=3)
    pca_scores = pca.fit_transform(standardized)
    
    # Transform current values
    current_array = np.array([[
        current_values['RSI'],
        current_values['MACD'],
        current_values['Bollinger'],
        current_values['EMA'],
        current_values['Volume']
    ]])
    current_standardized = scaler.transform(current_array)
    current_pc = pca.transform(current_standardized)[0]
    
    # Composite score from top PCs
    explained_variance = pca.explained_variance_ratio_
    
    # Literature (e.g., Jolliffe 2002; OECD Handbook on Constructing Composite Indicators) 
    # typically recommends aggregating standardized indicators using PCA loadings / scores 
    # weighted by the proportion of variance explained. We therefore compute a weighted
    # sum of the current PC scores using the explained variance ratios as weights.
    weighted_pc = np.dot(current_pc[:len(explained_variance)], explained_variance)
    
    # Normalize the weighted PC score to (-1, 1) using historical distribution
    # Use the standard deviation of historical weighted PC scores for proper scaling
    historical_weighted = np.array([np.dot(pca_scores[i, :len(explained_variance)], explained_variance) 
                                     for i in range(len(pca_scores))])
    std_weighted = np.std(historical_weighted)
    
    # Normalize using tanh with proper scaling to avoid saturation
    if std_weighted > 1e-6:
        normalized_score = np.tanh(weighted_pc / (std_weighted * 2.0))  # Scale by 2*std for better range
    else:
        normalized_score = 0.0
    
    # Normalize individual factor scores to -1 to +1 range using tanh
    # This makes them comparable to other normalized indicators
    pc1_normalized = np.tanh(current_pc[0] / (np.std(pca_scores[:, 0]) + 1e-6))
    pc2_normalized = np.tanh(current_pc[1] / (np.std(pca_scores[:, 1]) + 1e-6))
    pc3_normalized = np.tanh(current_pc[2] / (np.std(pca_scores[:, 2]) + 1e-6))
    
    # Individual factor scores (both raw and normalized)
    factor_scores = {
        'PC1': float(current_pc[0]),
        'PC2': float(current_pc[1]),
        'PC3': float(current_pc[2]),
        'PC1_normalized': float(pc1_normalized),
        'PC2_normalized': float(pc2_normalized),
        'PC3_normalized': float(pc3_normalized),
        'explained_variance': explained_variance.tolist()
    }
    
    return normalized_score, factor_scores


def method5_individual_signals(indicator_values, price_change=None):
    """Method 5: Individual Indicators (Raw Signals)"""
    signals = {}
    
    rsi = indicator_values['RSI']
    if rsi < 30:
        signals['RSI'] = 1.0  # BUY - Oversold
    elif rsi > 70:
        signals['RSI'] = -1.0  # SELL - Overbought
    else:
        signals['RSI'] = 0.0  # HOLD
    
    macd = indicator_values.get('MACD', 0)
    macd_signal = indicator_values.get('MACD_Signal', 0)
    # If MACD_Signal exists, use histogram for decision, else use MACD directly
    macd_hist = macd  # MACD is already histogram if passed from main analysis
    
    if macd_hist > 0:
        if 'MACD_Signal' in indicator_values and macd > macd_signal:
            signals['MACD'] = 1.0  # BUY
        elif 'MACD_Signal' not in indicator_values:
            signals['MACD'] = 1.0  # BUY (positive histogram)
        else:
            signals['MACD'] = 0.0  # HOLD
    elif macd_hist < 0:
        if 'MACD_Signal' in indicator_values and macd < macd_signal:
            signals['MACD'] = -1.0  # SELL
        elif 'MACD_Signal' not in indicator_values:
            signals['MACD'] = -1.0  # SELL (negative histogram)
        else:
            signals['MACD'] = 0.0  # HOLD
    else:
        signals['MACD'] = 0.0  # HOLD
    
    bb = indicator_values['Bollinger']
    if bb < 0.2:
        signals['Bollinger'] = 1.0  # BUY - Near lower band
    elif bb > 0.8:
        signals['Bollinger'] = -1.0  # SELL - Near upper band
    else:
        signals['Bollinger'] = 0.0  # HOLD
    
    ema = indicator_values['EMA']
    if ema > 1.02:
        signals['EMA'] = 1.0  # BUY - Above EMA
    elif ema < 0.98:
        signals['EMA'] = -1.0  # SELL - Below EMA
    else:
        signals['EMA'] = 0.0  # HOLD
    
    volume = indicator_values['Volume']
    if price_change:
        if volume > 1.5 and price_change > 0:
            signals['Volume'] = 1.0  # BUY - High volume uptrend
        elif volume > 1.5 and price_change < 0:
            signals['Volume'] = -1.0  # SELL - High volume downtrend
        else:
            signals['Volume'] = 0.0  # HOLD
    else:
        signals['Volume'] = 0.0  # HOLD - No price change data
    
    return signals


def get_signal_description(signal_value):
    """Convert signal value to recommendation text"""
    if signal_value >= 0.6:
        return "STRONG BUY"
    elif signal_value >= 0.2:
        return "BUY"
    elif signal_value <= -0.6:
        return "STRONG SELL"
    elif signal_value <= -0.2:
        return "SELL"
    else:
        return "HOLD"


def compute_all_methods(indicator_df, current_values, correlation_matrix, price_change=None):
    """
    Compute all 5 scoring methods and return results
    """
    results = {}
    
    # Method 1: Simple Weighted
    score1, normalized = method1_simple_weighted(current_values)
    results['simple_weighted'] = {
        'score': float(score1),
        'normalized_signals': {k: float(v) for k, v in normalized.items()}
    }
    
    # Method 2: Correlation-Adjusted
    score2, weights = method2_correlation_adjusted(current_values, correlation_matrix)
    results['correlation_adjusted'] = {
        'score': float(score2),
        'weights': {k: float(v) for k, v in weights.items()}
    }
    
    # Method 3: Mahalanobis
    score3, distances = method3_mahalanobis_distance(indicator_df, current_values)
    results['mahalanobis'] = {
        'score': float(score3),
        'distances': distances
    }
    
    # Method 4: PCA-Based
    score4, factors = method4_pca_based(indicator_df, current_values)
    results['pca_composite'] = {
        'score': float(score4),
        'factors': factors
    }
    
    # Method 5: Individual Signals
    individual = method5_individual_signals(current_values, price_change)
    results['individual_signals'] = {k: float(v) for k, v in individual.items()}
    
    return results


def find_strong_correlations(correlation_matrix, threshold=0.5):
    """Find indicator pairs with strong correlations"""
    strong_corrs = []
    indicators = correlation_matrix.index.tolist()
    
    for i, ind1 in enumerate(indicators):
        for j, ind2 in enumerate(indicators[i+1:], i+1):
            corr_value = correlation_matrix.loc[ind1, ind2]
            if abs(corr_value) >= threshold:
                strong_corrs.append({
                    'indicator1': ind1,
                    'indicator2': ind2,
                    'correlation': float(corr_value)
                })
    
    return strong_corrs

