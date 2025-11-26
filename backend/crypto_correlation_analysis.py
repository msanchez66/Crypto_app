#!/usr/bin/env python3
"""
Advanced Crypto Correlation Analysis
Combines multiple basic indicators using 5 different scoring methods
"""

import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from scipy.spatial.distance import mahalanobis
from scipy.linalg import inv
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from datetime import datetime
import time
import warnings
warnings.filterwarnings('ignore')

# Import from correlation_analysis module
from correlation_analysis import (
    compute_indicator_time_series,
    compute_correlation_matrix,
    compute_all_methods,
    find_strong_correlations,
    get_signal_description,
    normalize_indicator_to_signal
)

# CoinGecko API
BASE_URL = "https://api.coingecko.com/api/v3"

def get_historical_data(coin_id='bitcoin', days=30):
    """Fetch historical crypto data from CoinGecko API"""
    url = f"{BASE_URL}/coins/{coin_id}/market_chart"
    params = {
        'vs_currency': 'usd',
        'days': days
        # Note: interval='hourly' requires Enterprise plan
        # Free tier automatically returns hourly data for days 2-90
    }
    
    try:
        print(f"Fetching data for {coin_id}...")
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        # Convert to DataFrame
        prices = data['prices']
        volumes = data['total_volumes']
        
        df = pd.DataFrame(prices, columns=['timestamp', 'price'])
        df['volume'] = [v[1] for v in volumes]
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        
        print(f"✅ Fetched {len(df)} data points")
        return df
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return None


def create_bar_chart(all_results, current_values, output_file='crypto_signals_comparison.png'):
    """Create horizontal bar chart showing all signals"""
    
    # Prepare data for chart
    labels = []
    values = []
    recommendations = []
    colors = []
    
    # Individual indicators
    individual = all_results['individual_signals']
    for indicator in ['RSI', 'MACD', 'Bollinger', 'EMA', 'Volume']:
        signal = individual.get(indicator, 0)
        labels.append(indicator)
        values.append(signal)
        recommendations.append(get_signal_description(signal))
        colors.append('green' if signal > 0 else 'red' if signal < 0 else 'gray')
    
    # Composite methods
    labels.append('Simple Weighted')
    values.append(all_results['simple_weighted']['score'])
    recommendations.append(all_results['simple_weighted']['recommendation'])
    colors.append('green' if all_results['simple_weighted']['score'] > 0 else 'red' if all_results['simple_weighted']['score'] < 0 else 'gray')
    
    labels.append('Correlation-Adjusted')
    values.append(all_results['correlation_adjusted']['score'])
    recommendations.append(all_results['correlation_adjusted']['recommendation'])
    colors.append('green' if all_results['correlation_adjusted']['score'] > 0 else 'red' if all_results['correlation_adjusted']['score'] < 0 else 'gray')
    
    labels.append('Mahalanobis')
    values.append(all_results['mahalanobis']['score'])
    recommendations.append(all_results['mahalanobis']['recommendation'])
    colors.append('green' if all_results['mahalanobis']['score'] > 0 else 'red' if all_results['mahalanobis']['score'] < 0 else 'gray')
    
    labels.append('PCA Composite')
    values.append(all_results['pca_composite']['score'])
    recommendations.append(all_results['pca_composite']['recommendation'])
    colors.append('green' if all_results['pca_composite']['score'] > 0 else 'red' if all_results['pca_composite']['score'] < 0 else 'gray')
    
    # PCA Factors (normalized for display)
    pca_factors = all_results['pca_composite']['factors']
    labels.append('PCA Factor 1 (Momentum)')
    values.append(pca_factors['PC1'] / 10)
    recommendations.append('POSITIVE' if pca_factors['PC1'] > 0 else 'NEGATIVE')
    colors.append('green' if pca_factors['PC1'] > 0 else 'red')
    
    labels.append('PCA Factor 2 (Volatility)')
    values.append(pca_factors['PC2'] / 10)
    recommendations.append('POSITIVE' if pca_factors['PC2'] > 0 else 'NEGATIVE')
    colors.append('green' if pca_factors['PC2'] > 0 else 'red')
    
    labels.append('PCA Factor 3 (Trend)')
    values.append(pca_factors['PC3'] / 10)
    recommendations.append('POSITIVE' if pca_factors['PC3'] > 0 else 'NEGATIVE')
    colors.append('green' if pca_factors['PC3'] > 0 else 'red')
    
    # Create figure
    fig, ax = plt.subplots(figsize=(12, 10))
    
    # Create bars
    y_pos = np.arange(len(labels))
    bars = ax.barh(y_pos, values, color=colors, alpha=0.7, edgecolor='black', linewidth=0.5)
    
    # Add zero line
    ax.axvline(x=0, color='black', linestyle='--', linewidth=1, alpha=0.5)
    
    # Add value labels on bars
    for i, (bar, value, rec) in enumerate(zip(bars, values, recommendations)):
        width = bar.get_width()
        if abs(width) > 0.05:  # Only show label if bar is visible
            label_x = width + (0.05 if width > 0 else -0.05)
            ax.text(label_x, bar.get_y() + bar.get_height()/2,
                   f'{value:.3f} ({rec})',
                   ha='left' if width > 0 else 'right',
                   va='center', fontsize=9, fontweight='bold')
    
    # Customize plot
    ax.set_yticks(y_pos)
    ax.set_yticklabels(labels)
    ax.set_xlabel('Signal Strength (BUY ← → SELL)', fontsize=12, fontweight='bold')
    ax.set_title('Crypto Trading Signals - All Methods Comparison', fontsize=14, fontweight='bold', pad=20)
    ax.set_xlim(-1.1, 1.1)
    ax.grid(axis='x', alpha=0.3, linestyle='--')
    
    # Add legend
    buy_patch = mpatches.Patch(color='green', label='BUY Signal', alpha=0.7)
    sell_patch = mpatches.Patch(color='red', label='SELL Signal', alpha=0.7)
    hold_patch = mpatches.Patch(color='gray', label='HOLD Signal', alpha=0.7)
    ax.legend(handles=[buy_patch, sell_patch, hold_patch], loc='upper right')
    
    plt.tight_layout()
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    print(f"\n✅ Chart saved as: {output_file}")
    plt.show()
    
    return fig


def print_correlation_matrix(correlation_matrix):
    """Print correlation matrix with formatting"""
    print("\n" + "="*70)
    print("CORRELATION MATRIX")
    print("="*70)
    print(correlation_matrix.round(3))
    print("="*70)


def print_strong_correlations(strong_corrs):
    """Print strong correlations detected"""
    if strong_corrs:
        print("\n📊 Strong Correlations Detected:")
        for corr in strong_corrs[:5]:  # Top 5
            strength = "strong" if abs(corr['correlation']) > 0.7 else "moderate"
            print(f"   - {corr['indicator1']} ↔ {corr['indicator2']}: {corr['correlation']:.3f} ({strength})")


def print_current_indicators(current_values):
    """Print current indicator values"""
    print("\n" + "="*70)
    print("INDICATOR VALUES (Current)")
    print("="*70)
    print(f"RSI: {current_values['RSI']:.2f}")
    print(f"MACD: {current_values['MACD']:.2f}")
    print(f"Bollinger: {current_values['Bollinger']:.2f}")
    print(f"EMA: {current_values['EMA']:.2f}")
    print(f"Volume: {current_values['Volume']:.2f}")
    print("="*70)


def print_all_signals(all_results):
    """Print all computed signals"""
    print("\n" + "="*70)
    print("SIGNALS FROM ALL METHODS")
    print("="*70)
    
    print("\n📊 Individual Indicators:")
    individual = all_results['individual_signals']
    for indicator in ['RSI', 'MACD', 'Bollinger', 'EMA', 'Volume']:
        signal = individual.get(indicator, 0)
        rec = get_signal_description(signal)
        symbol = '+' if signal > 0 else '' if signal < 0 else ' '
        print(f"   - {indicator}: {symbol}{signal:.3f} ({rec})")
    
    print("\n🔬 Composite Methods:")
    print(f"   - Simple Weighted: {all_results['simple_weighted']['score']:+.3f} ({all_results['simple_weighted']['recommendation']})")
    print(f"   - Correlation-Adjusted: {all_results['correlation_adjusted']['score']:+.3f} ({all_results['correlation_adjusted']['recommendation']})")
    print(f"   - Mahalanobis: {all_results['mahalanobis']['score']:+.3f} ({all_results['mahalanobis']['recommendation']})")
    print(f"   - PCA Composite: {all_results['pca_composite']['score']:+.3f} ({all_results['pca_composite']['recommendation']})")
    
    print("\n🔍 PCA Factors:")
    factors = all_results['pca_composite']['factors']
    print(f"   - Factor 1 (Momentum): {factors['PC1']:+.3f}")
    print(f"   - Factor 2 (Volatility): {factors['PC2']:+.3f}")
    print(f"   - Factor 3 (Trend): {factors['PC3']:+.3f}")
    print("="*70)


def compute_consensus(all_results):
    """Compute consensus across all methods"""
    scores = [
        all_results['simple_weighted']['score'],
        all_results['correlation_adjusted']['score'],
        all_results['mahalanobis']['score'],
        all_results['pca_composite']['score']
    ]
    
    avg_score = np.mean(scores)
    recommendations = [
        all_results['simple_weighted']['recommendation'],
        all_results['correlation_adjusted']['recommendation'],
        all_results['mahalanobis']['recommendation'],
        all_results['pca_composite']['recommendation']
    ]
    
    unique_recs = set(recommendations)
    agreement = len(unique_recs) == 1
    
    # Count positive vs negative
    positive_count = sum(1 for s in scores if s > 0.2)
    negative_count = sum(1 for s in scores if s < -0.2)
    neutral_count = len(scores) - positive_count - negative_count
    
    return {
        'average_score': avg_score,
        'recommendation': get_signal_description(avg_score),
        'agreement': agreement,
        'positive_count': positive_count,
        'negative_count': negative_count,
        'neutral_count': neutral_count
    }


def main():
    """Main execution function"""
    start_time = time.time()
    
    print("="*70)
    print("CRYPTO CORRELATION ANALYSIS")
    print("="*70)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Step 1: Fetch historical data
    step_time = time.time()
    coin_id = 'bitcoin'  # Can be changed
    df = get_historical_data(coin_id, days=30)
    if df is None:
        print("❌ Failed to fetch data. Exiting.")
        return
    
    print(f"⏱️  Data fetching: {time.time() - step_time:.2f}s")
    
    # Step 2: Compute indicator time series
    step_time = time.time()
    indicator_df = compute_indicator_time_series(df)
    print(f"✅ Computed {len(indicator_df)} indicator data points")
    print(f"⏱️  Indicator computation: {time.time() - step_time:.2f}s")
    
    # Step 3: Compute correlation matrix
    step_time = time.time()
    correlation_matrix = compute_correlation_matrix(indicator_df)
    print(f"⏱️  Correlation matrix: {time.time() - step_time:.2f}s")
    
    # Step 4: Get current values
    prices = df['price'].values
    volumes = df['volume'].values
    price_change = (prices[-1] - prices[-5]) / prices[-5] * 100 if len(prices) >= 5 else 0
    
    # Calculate current indicator values using correlation_analysis functions
    from correlation_analysis import calculate_rsi_series, calculate_macd_series, calculate_bollinger_position_series, calculate_ema_ratio_series, calculate_volume_ratio_series
    
    rsi_series = calculate_rsi_series(prices)
    macd_series = calculate_macd_series(prices)
    bb_series = calculate_bollinger_position_series(prices)
    ema_series = calculate_ema_ratio_series(prices)
    vol_series = calculate_volume_ratio_series(volumes)
    
    current_rsi = rsi_series[-1]
    current_macd_hist = macd_series[-1]
    # For MACD, we need signal line - use simple approach
    macd_signal = np.mean(macd_series[-9:]) if len(macd_series) >= 9 else macd_series[-1]
    current_bb = bb_series[-1]
    current_ema = ema_series[-1]
    current_vol = vol_series[-1]
    
    current_values = {
        'RSI': current_rsi,
        'MACD': current_macd_hist,
        'MACD_Signal': macd_signal,
        'Bollinger': current_bb,
        'EMA': current_ema,
        'Volume': current_vol
    }
    
    # Step 5: Compute all methods
    step_time = time.time()
    all_results = compute_all_methods(indicator_df, current_values, correlation_matrix, price_change)
    print(f"⏱️  All methods computation: {time.time() - step_time:.2f}s")
    
    # Step 6: Print results
    print_correlation_matrix(correlation_matrix)
    
    strong_corrs = find_strong_correlations(correlation_matrix, threshold=0.3)
    print_strong_correlations(strong_corrs)
    
    print_current_indicators(current_values)
    
    print_all_signals(all_results)
    
    # Step 7: Compute consensus
    consensus = compute_consensus(all_results)
    print("\n" + "="*70)
    print("CONSENSUS")
    print("="*70)
    print(f"Average Score: {consensus['average_score']:+.3f}")
    print(f"Recommendation: {consensus['recommendation']}")
    print(f"Methods Agreement: {'HIGH ✓' if consensus['agreement'] else 'MIXED'}")
    print(f"   - Positive signals: {consensus['positive_count']}/4")
    print(f"   - Negative signals: {consensus['negative_count']}/4")
    print(f"   - Neutral signals: {consensus['neutral_count']}/4")
    print("="*70)
    
    # Step 8: Create visualization
    step_time = time.time()
    create_bar_chart(all_results, current_values)
    print(f"⏱️  Visualization: {time.time() - step_time:.2f}s")
    
    # Final summary
    total_time = time.time() - start_time
    print(f"\n✅ Analysis complete in {total_time:.2f} seconds")
    print(f"Ended at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)


if __name__ == '__main__':
    main()

