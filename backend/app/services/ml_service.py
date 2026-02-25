import joblib
import pandas as pd
import pathlib

# Load the model globally to avoid loading it per request
BASE_DIR = pathlib.Path(__file__).parent.resolve()
MODEL_PATH = BASE_DIR / "fraud_model.pkl"

try:
    model_data = joblib.load(MODEL_PATH)
    xgb_model = model_data['model']
    feature_names = model_data['features']
    print(f"Successfully loaded XGBoost model from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model from {MODEL_PATH}: {e}")
    xgb_model = None
    feature_names = []

def evaluate_fraud_risk(transaction_data: dict) -> dict:
    """
    Evaluates fraud risk by calling the local XGBoost model loaded from disk.
    Expects dictionary containing model features: 
    amount, hour_of_day, location_mismatch, is_new_receiver, velocity_1h
    """
    # Extract features matching the synthetic dataset structure
    input_features = {
        'amount': [transaction_data.get('amount', 0)],
        'hour_of_day': [transaction_data.get('hour_of_day', 12)],
        'location_mismatch': [transaction_data.get('location_mismatch', 0)],
        'is_new_receiver': [transaction_data.get('is_new_receiver', 0)],
        'velocity_1h': [transaction_data.get('velocity_1h', 0)]
    }

    df = pd.DataFrame(input_features)
    
    fraud_prob = 0.0
    model_loaded = bool(xgb_model)
    if model_loaded:
        # Ensure columns match training order exactly (when available)
        if feature_names:
            df = df[feature_names]
        probabilities = xgb_model.predict_proba(df)[0]
        fraud_prob = float(probabilities[1])
    
    # Threshold for fraud ML probability
    is_fraud_ml = bool(model_loaded and fraud_prob > 0.5)

    risk_factors = []
    amount = transaction_data.get('amount', 0)
    is_new = transaction_data.get('is_new_receiver', 0)
    
    if amount > 10000:
        risk_factors.append("High amount")
    if transaction_data.get('location_mismatch') == 1:
        risk_factors.append("Location mismatch")
    if is_new == 1:
        risk_factors.append("New receiver")
    if transaction_data.get('hour_of_day', 12) < 6 or transaction_data.get('hour_of_day', 12) >= 23:
        risk_factors.append("Suspicious time")
    if transaction_data.get('velocity_1h', 0) > 5:
        risk_factors.append("High velocity")

    # Hybrid Rule Engine: Deterministic triggers
    is_fraud_rule = False
    if amount >= 50000 and is_new == 1:
        is_fraud_rule = True
        risk_factors.append("Critical amount to new receiver")
        
    is_fraudulent = is_fraud_ml or is_fraud_rule

    risk_level = "High" if is_fraudulent else ("Medium" if fraud_prob > 0.2 else "Low")
    decision = "Block" if is_fraudulent else ("Review" if risk_level == "Medium" else "Approve")

    return {
        "risk_score": round(fraud_prob, 4),
        "is_fraudulent": is_fraudulent,
        "risk_level": risk_level,
        "decision": decision,
        "risk_factors": risk_factors,
        "model_loaded": model_loaded
    }
