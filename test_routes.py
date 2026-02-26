#!/usr/bin/env python3
"""
Test script to verify all API routes are working
"""

import requests
import sys

def test_backend_routes():
    """Test all backend routes"""
    base_url = "https://upi-guard-97x5.onrender.com"
    
    routes_to_test = [
        "/health",
        "/api/v1/auth/login",
        "/api/v1/auth/register", 
        "/api/v1/auth/verify-otp",
        "/api/v1/transaction/validate-upi",
        "/api/v1/transaction/transfer",
        "/api/v1/transaction/history/test@example.com",
        "/api/v1/admin/analytics",
        "/api/v1/admin/users",
        "/api/v1/admin/fraud-alerts",
        "/api/v1/location/test@example.com"
    ]
    
    print("🧪 Testing UPI-Guard Backend Routes")
    print(f"🌐 Base URL: {base_url}")
    print("=" * 50)
    
    for route in routes_to_test:
        try:
            response = requests.get(f"{base_url}{route}", timeout=10)
            status = "✅" if response.status_code == 200 else "❌"
            print(f"{status} {response.request.method if hasattr(response, 'request') else 'GET'} {route} - {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if 'status' in data:
                        print(f"    Response: {data.get('status', 'N/A')}")
                except:
                    print("    Response: Not JSON")
            
        except requests.exceptions.RequestException as e:
            print(f"❌ {route} - Error: {str(e)}")
    
    print("=" * 50)
    print("🎯 Test Complete!")

if __name__ == "__main__":
    test_backend_routes()
