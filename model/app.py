"""
UPI Fraud Detection API
Hugging Face Spaces deployment
"""

import gradio as gr
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List

# Load the trained model
try:
    model_info = joblib.load('fraud_model.pkl')
    model = model_info['model']
    features = model_info['features']
    print(f"✅ Model loaded successfully. Features: {features}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

def predict_fraud(amount: float, hour_of_day: int, location_mismatch: int, 
                  is_new_receiver: int, velocity_1h: int) -> Dict:
    """
    Predict fraud probability for a UPI transaction
    
    Args:
        amount: Transaction amount in rupees
        hour_of_day: Hour of transaction (0-23)
        location_mismatch: 1 if location is far from usual, 0 otherwise
        is_new_receiver: 1 if new recipient, 0 otherwise
        velocity_1h: Number of transactions in last hour
    
    Returns:
        Dictionary with fraud_probability, is_fraud, and confidence
    """
    if model is None:
        return {
            "error": "Model not loaded",
            "fraud_probability": 0.5,
            "is_fraud": False
        }
    
    try:
        # Create input dataframe
        input_data = pd.DataFrame({
            'amount': [float(amount)],
            'hour_of_day': [int(hour_of_day)],
            'location_mismatch': [int(location_mismatch)],
            'is_new_receiver': [int(is_new_receiver)],
            'velocity_1h': [int(velocity_1h)]
        })
        
        # Predict probability
        fraud_prob = model.predict_proba(input_data)[0][1]
        
        # Determine if fraud (threshold: 0.7)
        is_fraud = fraud_prob > 0.7
        
        # Confidence level
        if fraud_prob > 0.8 or fraud_prob < 0.2:
            confidence = "High"
        elif fraud_prob > 0.6 or fraud_prob < 0.4:
            confidence = "Medium"
        else:
            confidence = "Low"
        
        return {
            "fraud_probability": round(float(fraud_prob), 4),
            "is_fraud": bool(is_fraud),
            "confidence": confidence,
            "risk_level": "High" if fraud_prob > 0.7 else "Medium" if fraud_prob > 0.4 else "Low"
        }
    except Exception as e:
        return {
            "error": str(e),
            "fraud_probability": 0.5,
            "is_fraud": False
        }

def predict_from_features(features: List[float]) -> Dict:
    """
    API endpoint that accepts a list of features
    Used by Firebase Cloud Functions
    
    Args:
        features: [amount, hour_of_day, location_mismatch, is_new_receiver, velocity_1h]
    
    Returns:
        Dictionary with prediction results
    """
    if len(features) != 5:
        return {
            "error": "Expected 5 features",
            "fraud_probability": 0.5,
            "is_fraud": False
        }
    
    return predict_fraud(
        amount=features[0],
        hour_of_day=features[1],
        location_mismatch=features[2],
        is_new_receiver=features[3],
        velocity_1h=features[4]
    )

# Gradio interface for testing
with gr.Blocks(title="UPI Fraud Detection") as demo:
    gr.Markdown("""
    # 🛡️ UPI Fraud Detection System
    
    Predict fraud probability for UPI transactions using XGBoost ML model.
    
    **Features:**
    - Amount anomaly detection
    - Time-based analysis
    - Location verification
    - Recipient history check
    - Transaction velocity monitoring
    """)
    
    with gr.Row():
        with gr.Column():
            amount_input = gr.Number(
                label="💰 Transaction Amount (₹)",
                value=5000,
                info="Amount in Indian Rupees"
            )
            hour_input = gr.Slider(
                0, 23,
                step=1,
                label="🕐 Hour of Day",
                value=14,
                info="0 = Midnight, 12 = Noon, 23 = 11 PM"
            )
            location_input = gr.Radio(
                choices=[0, 1],
                label="📍 Location Mismatch",
                value=0,
                info="0 = Normal location, 1 = Unusual location"
            )
            receiver_input = gr.Radio(
                choices=[0, 1],
                label="👤 New Receiver",
                value=0,
                info="0 = Known recipient, 1 = New recipient"
            )
            velocity_input = gr.Slider(
                0, 15,
                step=1,
                label="⚡ Transaction Velocity",
                value=1,
                info="Number of transactions in last hour"
            )
            
            predict_btn = gr.Button("🔍 Predict Fraud", variant="primary")
        
        with gr.Column():
            output = gr.JSON(label="📊 Prediction Result")
            
            gr.Markdown("""
            ### 📈 Interpretation:
            - **fraud_probability**: 0.0 (safe) to 1.0 (fraud)
            - **is_fraud**: True if probability > 0.7
            - **confidence**: Model's confidence in prediction
            - **risk_level**: Overall risk assessment
            """)
    
    # Examples
    gr.Markdown("### 💡 Example Transactions:")
    gr.Examples(
        examples=[
            [5000, 14, 0, 0, 1, "Normal daytime transaction"],
            [50000, 2, 1, 1, 8, "High-risk: Large amount, odd hour, unusual location"],
            [1000, 10, 0, 0, 2, "Low-risk: Small amount, normal time"],
            [25000, 23, 0, 1, 5, "Medium-risk: Late night, new receiver"],
            [100000, 3, 1, 1, 10, "Very high-risk: All red flags"],
        ],
        inputs=[amount_input, hour_input, location_input, receiver_input, velocity_input, gr.Textbox(visible=False)],
        outputs=output,
        fn=predict_fraud,
        cache_examples=False
    )
    
    predict_btn.click(
        fn=predict_fraud,
        inputs=[amount_input, hour_input, location_input, receiver_input, velocity_input],
        outputs=output
    )
    
    gr.Markdown("""
    ---
    ### 🔗 API Usage
    
    **Endpoint:** `POST /predict`
    
    **Request:**
    ```json
    {
      "features": [5000, 14, 0, 0, 1]
    }
    ```
    
    **Response:**
    ```json
    {
      "fraud_probability": 0.15,
      "is_fraud": false,
      "confidence": "High",
      "risk_level": "Low"
    }
    ```
    
    **Features Order:**
    1. amount (float)
    2. hour_of_day (int, 0-23)
    3. location_mismatch (int, 0 or 1)
    4. is_new_receiver (int, 0 or 1)
    5. velocity_1h (int, 0-15)
    """)

# Launch the app
if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False
    )
