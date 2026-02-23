import pandas as pd
import numpy as np
import time
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.ensemble import IsolationForest
import xgboost as xgb
import pickle
import joblib

# Stage 1: Prepare UPI Transaction Dataset (Synthetic)
def generate_synthetic_data(n_samples=20000):
    np.random.seed(42)
    
    # 95% Normal, 5% Fraud
    n_fraud = int(n_samples * 0.05)
    n_normal = n_samples - n_fraud
    
    # Normal transactions
    normal_amounts = np.random.lognormal(mean=np.log(500), sigma=1.0, size=n_normal)
    normal_time = np.random.randint(6, 23, size=n_normal) # Daytime mostly
    normal_location_mismatch = np.random.choice([0, 1], size=n_normal, p=[0.95, 0.05])
    normal_new_receiver = np.random.choice([0, 1], size=n_normal, p=[0.8, 0.2])
    normal_velocity = np.random.randint(1, 4, size=n_normal)
    
    # Fraud transactions (anomalous patterns)
    fraud_amounts = np.random.lognormal(mean=np.log(15000), sigma=1.5, size=n_fraud)
    fraud_time = np.random.choice([0, 1, 2, 3, 4, 5, 23], size=n_fraud) # Nighttime mostly
    fraud_location_mismatch = np.random.choice([0, 1], size=n_fraud, p=[0.2, 0.8])
    fraud_new_receiver = np.random.choice([0, 1], size=n_fraud, p=[0.1, 0.9])
    fraud_velocity = np.random.randint(5, 15, size=n_fraud)
    
    # Combine datasets
    amounts = np.concatenate([normal_amounts, fraud_amounts])
    times = np.concatenate([normal_time, fraud_time])
    location_mismatches = np.concatenate([normal_location_mismatch, fraud_location_mismatch])
    new_receivers = np.concatenate([normal_new_receiver, fraud_new_receiver])
    velocities = np.concatenate([normal_velocity, fraud_velocity])
    
    is_fraud = np.concatenate([np.zeros(n_normal), np.ones(n_fraud)])
    
    df = pd.DataFrame({
        'amount': amounts,
        'hour_of_day': times,
        'location_mismatch': location_mismatches,
        'is_new_receiver': new_receivers,
        'velocity_1h': velocities,
        'is_fraud': is_fraud
    })
    
    # Shuffle
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    return df

print("1. Preparing UPI Transaction Dataset (Synthetic)...")
df = generate_synthetic_data(20000)
print(f"Dataset generated. Shape: {df.shape}")
print(df['is_fraud'].value_counts())

# Features and target
X = df.drop('is_fraud', axis=1)
y = df['is_fraud']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)


# Stage 2: Train Fraud Detection Models
print("\n2. Training Models...")

# Model A: Rule Engine (Simple Heuristics)
def rule_engine_predict(X):
    predictions = []
    for _, row in X.iterrows():
        # Heuristics for fraud
        if (row['amount'] > 10000 and row['is_new_receiver'] == 1) or \
           (row['location_mismatch'] == 1 and row['velocity_1h'] > 5) or \
           (row['hour_of_day'] < 6 and row['amount'] > 5000):
            predictions.append(1)
        else:
            predictions.append(0)
    return np.array(predictions)

print("--- Rule Engine Evaluation ---")
start_time = time.time()
y_pred_rule = rule_engine_predict(X_test)
rule_engine_time = time.time() - start_time
print(classification_report(y_test, y_pred_rule))
print(f"Rule Engine Training Time: No training needed (Inference time: {rule_engine_time:.4f}s)")

# Model B: Isolation Forest (Unsupervised Anomaly Detection)
print("\n--- Isolation Forest Evaluation ---")
# Contamination set to roughly our fraud proportion (0.05)
iso_forest = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)

start_time = time.time()
iso_forest.fit(X_train)
iso_train_time = time.time() - start_time

# Predict returns 1 for inliers, -1 for outliers. Convert to 0 for normal, 1 for fraud.
y_pred_iso_raw = iso_forest.predict(X_test)
y_pred_iso = np.where(y_pred_iso_raw == -1, 1, 0)

print(classification_report(y_test, y_pred_iso))


# Model C: XGBoost (Supervised Learning)
print("\n--- XGBoost Evaluation ---")
# Compute scale_pos_weight for imbalanced classes
scale_pos_weight = len(y_train[y_train == 0]) / len(y_train[y_train == 1])

xgb_model = xgb.XGBClassifier(
    n_estimators=150,
    max_depth=5,
    learning_rate=0.1,
    scale_pos_weight=scale_pos_weight,
    random_state=42,
    eval_metric='logloss'
)

start_time = time.time()
xgb_model.fit(X_train, y_train)
xgb_train_time = time.time() - start_time
y_pred_xgb = xgb_model.predict(X_test)

print(classification_report(y_test, y_pred_xgb))


# Stage 3: Evaluate Model Performance
print("\n3. Evaluating the Best Model Performance (XGBoost)...")
acc = accuracy_score(y_test, y_pred_xgb)
cm = confusion_matrix(y_test, y_pred_xgb)
print(f"XGBoost Accuracy: {acc:.4f}")
print("Confusion Matrix:")
print(cm)

print("\n--- Training Time Summary ---")
print(f"Isolation Forest ({len(X_train)} rows) ~ {iso_train_time:.2f} seconds")
print(f"XGBoost ({len(X_train)} rows) ~ {xgb_train_time:.2f} seconds")
print(f"Rule Engine Training Time: No training needed")


# Stage 4: Save Trained Model as fraud_model.pkl
print("\n4. Saving trained XGBoost model to fraud_model.pkl...")

model_info = {
    'model': xgb_model,
    'features': list(X.columns),
    'description': 'XGBoost UPI Fraud Detection Model'
}

joblib.dump(model_info, 'fraud_model.pkl')
print("Model saved successfully as 'fraud_model.pkl'.")
