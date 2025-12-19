import joblib
import pandas as pd
import numpy as np

# Load Model
try:
    model = joblib.load("model.pkl")
    print("Model loaded.")
except Exception as e:
    print(e)
    exit()

def test_vector(custom_overrides):
    # Base "Normal" Vector
    features = {
        "FailedAttempts": 0,
        "Longitude": 77.2090, 
        "TransactionType": 1, 
        "IPAddress": 12345, 
        "AvgTransactionAmount": 500.0, 
        "UnusualAmount": 0,
        "Day": 15,
        "BankName": 1, 
        "PhoneNumber": 9876543210,
        "Month": 12,
        "UnusualLocation": 0,
        "UserID": 101,
        "Amount": 500.0,
        "TransactionFrequency": 5,
        "NewDevice": 0,
        "MerchantCategory": 10,
        "TransactionID": 100000,
        "DeviceID": 50,
        "Weekday": 2,
        "Latitude": 28.6139,
        "Hour": 12
    }
    
    # Apply overrides
    features.update(custom_overrides)
    
    # DF
    columns = [
        'FailedAttempts', 'Longitude', 'TransactionType', 'IPAddress', 
        'AvgTransactionAmount', 'UnusualAmount', 'Day', 'BankName', 
        'PhoneNumber', 'Month', 'UnusualLocation', 'UserID', 'Amount', 
        'TransactionFrequency', 'NewDevice', 'MerchantCategory', 
        'TransactionID', 'DeviceID', 'Weekday', 'Latitude', 'Hour'
    ]
    df = pd.DataFrame([features], columns=columns)
    
    pred = model.predict(df)
    prob = model.predict_proba(df) if hasattr(model, "predict_proba") else "N/A"
    
    print(f"Overrides: {custom_overrides} -> Fraud: {pred[0]}, Prob: {prob}")
    return pred[0]

# Scenarios to Test
print("--- Probing Scenarios ---")

# 1. High Failed Attempts
test_vector({"FailedAttempts": 5})
test_vector({"FailedAttempts": 10})

# 2. Unusual Location + New Device
test_vector({"UnusualLocation": 1, "NewDevice": 1})

# 3. High Variance Amount
test_vector({"Amount": 100000.0, "AvgTransactionAmount": 500.0, "UnusualAmount": 1})

# 4. "Perfect Storm"
test_vector({
    "FailedAttempts": 10,
    "UnusualLocation": 1,
    "NewDevice": 1,
    "Amount": 500000.0,
    "AvgTransactionAmount": 100.0,
    "TransactionFrequency": 50
})
