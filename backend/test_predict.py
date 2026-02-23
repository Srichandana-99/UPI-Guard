import httpx
import asyncio
import time

API_URL = "http://localhost:8000/api/v1/predict"

async def test_scenario(name, payload, expected_status):
    print(f"\n--- Testing Scenario: {name} ---")
    start = time.time()
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(API_URL, json=payload)
            response.raise_for_status()
            data = response.json()
            latency = time.time() - start
            
            print(f"Status: {response.status_code}")
            print(f"Latency: {latency * 1000:.2f} ms")
            print(f"Risk Score: {data['risk_score']}")
            print(f"Risk Level: {data['risk_level']}")
            print(f"Decision: {data['decision']}")
            
            if data['risk_factors']:
                print(f"Risk Factors: {', '.join(data['risk_factors'])}")
                
            assert data['decision'] == expected_status, f"Expected {expected_status}, got {data['decision']}"
            print(f"✅ PASS: {name}")
                
        except Exception as e:
            print(f"❌ FAIL: {name} - Error: {e}")


async def main():
    # Scenario 1: Normal transaction (True Negative)
    normal_payload = {
        "user_id": "usr_test1",
        "transaction_id": "txn_normal",
        "amount": 200,
        "receiver_upi_id": "merchant@bank",
        "sender_upi_id": "usr_test1@bank",
        "hour_of_day": 14,
        "location_mismatch": 0,
        "is_new_receiver": 0,
        "velocity_1h": 1
    }
    
    # Scenario 2: High-value anomaly (True Positive)
    high_value_payload = {
        "user_id": "usr_test2",
        "transaction_id": "txn_highval",
        "amount": 55000,
        "receiver_upi_id": "scam@bank",
        "sender_upi_id": "usr_test2@bank",
        "hour_of_day": 12,
        "location_mismatch": 0,
        "is_new_receiver": 1,
        "velocity_1h": 1
    }
    
    # Scenario 3: High-velocity & suspicious hours anomaly (True Positive)
    velocity_payload = {
        "user_id": "usr_test3",
        "transaction_id": "txn_vel",
        "amount": 1500,
        "receiver_upi_id": "unknown@crypto",
        "sender_upi_id": "usr_test3@bank",
        "hour_of_day": 3,
        "location_mismatch": 1,
        "is_new_receiver": 1,
        "velocity_1h": 12
    }

    try:
        await test_scenario("Normal Transaction", normal_payload, "Approve")
        await test_scenario("High-Value Transfer", high_value_payload, "Block")
        await test_scenario("High-Velocity & Night Transfer", velocity_payload, "Block")
    except AssertionError as e:
        print(e)
        
    print("\nTest Suite Completed.")

if __name__ == "__main__":
    asyncio.run(main())
