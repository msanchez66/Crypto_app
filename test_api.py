#!/usr/bin/env python3
"""
Quick test script to verify the backend is working correctly
"""

import requests
import json
from time import sleep

BASE_URL = "http://localhost:8000/api"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check: PASSED")
            return True
        else:
            print(f"❌ Health check: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Health check: ERROR - {e}")
        return False

def test_price(coin="BTC"):
    """Test price endpoint"""
    print(f"\nTesting price endpoint for {coin}...")
    try:
        response = requests.get(f"{BASE_URL}/price/{coin}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Price check: PASSED")
            print(f"   Data: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"❌ Price check: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Price check: ERROR - {e}")
        return False

def test_analysis(coin="BTC"):
    """Test full analysis endpoint"""
    print(f"\nTesting analysis endpoint for {coin}...")
    print("(This may take 10-15 seconds...)")
    
    try:
        response = requests.get(f"{BASE_URL}/analyze/{coin}", timeout=30)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Analysis: PASSED")
            print(f"\n📊 Results for {coin}:")
            print(f"   Current Price: ${data['current_price']:,.2f}")
            print(f"   Composite Score: {data['composite']['score']:.3f}")
            print(f"   Recommendation: {data['composite']['recommendation']}")
            print(f"   Confidence: {data['composite']['confidence']:.1f}%")
            
            print(f"\n   Individual Indicators:")
            for name, indicator in data['indicators'].items():
                signal_map = {1: "BUY", 0: "HOLD", -1: "SELL"}
                signal = signal_map.get(indicator['signal'], "UNKNOWN")
                print(f"   - {name}: {signal} ({indicator['description']})")
            
            return True
        else:
            print(f"❌ Analysis: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Analysis: ERROR - {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("=" * 70)
    print("🔍 Crypto Trading API Test Suite")
    print("=" * 70)
    
    print("\n⚠️  Make sure the backend server is running:")
    print("   cd backend && python app.py")
    print("\nStarting tests in 3 seconds...\n")
    sleep(3)
    
    results = []
    
    # Test 1: Health check
    results.append(test_health())
    
    # Test 2: Price endpoint
    results.append(test_price("BTC"))
    
    # Test 3: Full analysis
    results.append(test_analysis("BTC"))
    
    # Summary
    print("\n" + "=" * 70)
    print(f"📊 Test Results: {sum(results)}/{len(results)} passed")
    print("=" * 70)
    
    if all(results):
        print("✅ All tests passed! The backend is working correctly.")
        print("\n🚀 Next steps:")
        print("   1. Open frontend/index.html in your browser")
        print("   2. Select a cryptocurrency")
        print("   3. View real-time analysis and signals")
    else:
        print("❌ Some tests failed. Please check:")
        print("   1. Is the backend server running? (python app.py)")
        print("   2. Is it listening on port 8000?")
        print("   3. Do you have internet connection? (API requires online access)")
        print("   4. Are all dependencies installed? (pip install -r requirements.txt)")

if __name__ == "__main__":
    run_all_tests()
