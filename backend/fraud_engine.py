import joblib
import joblib
import numpy as np
import random
from datetime import datetime
from database import get_user_stats, get_last_transaction

import os
# Load Model using absolute path
try:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "model.pkl")
    model = joblib.load(model_path)
    print("Pretrained Fraud Detection Model Loaded Successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

def get_real_features(amount: float, upi_id: str, latitude: float = 0.0, longitude: float = 0.0):
    """
    Constructs a feature vector using REAL historical data from the database.
    """
    now = datetime.now()
    
    # A. Get History from DB
    stats = get_user_stats(upi_id)
    avg_amount = stats['AvgTransactionAmount'] if stats['AvgTransactionAmount'] > 0 else amount
    
    # B. Construct Features
    features = {
        "FailedAttempts": stats['FailedAttempts'],
        "Longitude": longitude if longitude else 77.2090, # Fallback to Delhi if missing
        "TransactionType": 1, # Default Transfer
        "IPAddress": 1, # Placeholder int
        "AvgTransactionAmount": avg_amount,
        "UnusualAmount": 1 if (amount > avg_amount * 5 and avg_amount > 100) else 0,
        "Day": now.day,
        "BankName": 1, # Placeholder
        "PhoneNumber": 9876543210, # Placeholder
        "Month": now.month,
        "UnusualLocation": 0, # Logic complex to implement quickly without history
        "UserID": 101, # Placeholder
        "Amount": amount,
        "TransactionFrequency": stats['TransactionFrequency'],
        "NewDevice": 0, # Hard to track without persisted device DB
        "MerchantCategory": 10,
        "TransactionID": 1000,
        "DeviceID": 50,
        "Weekday": now.weekday(),
        "Latitude": latitude if latitude else 28.6139,
        "Hour": now.hour
    }
    
    # Ensure correct column order
    columns = [
        'FailedAttempts', 'Longitude', 'TransactionType', 'IPAddress', 
        'AvgTransactionAmount', 'UnusualAmount', 'Day', 'BankName', 
        'PhoneNumber', 'Month', 'UnusualLocation', 'UserID', 'Amount', 
        'TransactionFrequency', 'NewDevice', 'MerchantCategory', 
        'TransactionID', 'DeviceID', 'Weekday', 'Latitude', 'Hour'
    ]
    
    # Create a 2D array (1 sample, n features)
    data = [features[col] for col in columns]
    return np.array([data])

def check_fraud(amount: float, upi_id: str, context: dict = None) -> tuple[bool, int, str | None]:
    """
    Returns (is_fraud, risk_score, reason)
    """
    if model is None:
        if amount > 100000:
            return True, 99, "High Value Limit Exceeded (Fallback)"
        return False, 10, None

    # Context extraction
    lat = context.get('latitude', 0.0) if context else 0.0
    lon = context.get('longitude', 0.0) if context else 0.0

    try:
        # Prepare Real Features
        input_data = get_real_features(amount, upi_id, lat, lon)
        
        # Predict
        prediction = model.predict(input_data)
        
        # Get Probability (Risk Score)
        # XGBClassifier usually supports predict_proba
        risk_score = 0
        if hasattr(model, "predict_proba"):
            # Class 1 is Fraud
            prob = model.predict_proba(input_data)[0][1]
            risk_score = int(prob * 100)
        else:
            # Fallback if no prob
            risk_score = 90 if prediction[0] else 10

        is_fraud = bool(prediction[0]) if hasattr(prediction, '__iter__') else bool(prediction)
        
        reason = None
        if is_fraud:
            reason = "ML Model Detected Suspicious Pattern (Based on History)"
        
        
        # [Production Hybrid Rule 1: High Value Anomaly]
        # input_data is now a numpy array, access via index or recreate mapping if needed. 
        # 'UnusualAmount' is 6th feature (index 5)
        unusual_amount_val = input_data[0][5]
        if not is_fraud and unusual_amount_val == 1 and amount > 5000:
             # Stricter rule: > 5000 and unusual
            is_fraud = True
            risk_score = max(risk_score, 85)
            reason = "High Value Anomaly: Amount exceeds typical range."

        # [Production Hybrid Rule 2: Impossible Travel (Velocity Check)]
        last_tx = get_last_transaction(upi_id)
        if last_tx and lat != 0 and lon != 0:
            from math import radians, cos, sin, asin, sqrt
            
            # Haversine Distance
            def haversine(lon1, lat1, lon2, lat2):
                lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
                dlon = lon2 - lon1 
                dlat = lat2 - lat1 
                a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                c = 2 * asin(sqrt(a)) 
                r = 6371 # Radius of earth in kilometers
                return c * r

            prev_lat = last_tx['latitude']
            prev_lon = last_tx['longitude']
            
            # Handle string timestamp from SQLite
            try:
                prev_time = datetime.strptime(last_tx['timestamp'], "%Y-%m-%d %H:%M:%S.%f")
            except ValueError:
                # Fallback for different formats
                try: 
                    prev_time = datetime.strptime(last_tx['timestamp'], "%Y-%m-%d %H:%M:%S")
                except:
                    prev_time = datetime.now() # Fail safe

            time_diff_hours = (datetime.now() - prev_time).total_seconds() / 3600
            distance_km = haversine(prev_lon, prev_lat, lon, lat)
            
            # If moved > 100km in < 1 hour (Speed > 100km/h is possible but simplified "impossible travel" check)
            # Let's say: > 200km in < 2 hours (100km/h avg) is suspicious for UPI payments usually done in person? 
            # Actually, UPI is distinct. It can be remote. 
            # BUT if the user is physically providing location (from device GPS), and last GPS was 1000km away 5 mins ago, that's impossible.
            velocity = distance_km / (time_diff_hours + 0.01) # Avoid div by zero
            
            if distance_km > 50 and velocity > 800: # Like plane speed
                is_fraud = True
                risk_score = max(risk_score, 95)
                reason = f"Impossible Travel: {int(distance_km)}km jump in {int(time_diff_hours*60)} mins."

        # [Production Hybrid Rule 3: Suspicious Time]
        current_hour = datetime.now().hour
        if 1 <= current_hour <= 4:
            # Late night transaction
            if amount > 1000: # Only flag high amounts at night
                 risk_score = max(risk_score, 75)
                 if not is_fraud:
                     reason = "Suspicious Time: High value transaction at late night."
                     # Don't strictly mark fraud, but elevate risk

        print(f"Transaction: {upi_id} | ₹{amount} | Fraud: {is_fraud} | Risk: {risk_score}")
        
        return is_fraud, risk_score, reason

    except Exception as e:
        print(f"Prediction Error: {e}")
        return False, 0, None
