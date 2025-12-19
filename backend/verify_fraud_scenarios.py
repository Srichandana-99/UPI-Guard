from fraud_engine import check_fraud
import random
import string

print("--- Starting Fraud Detection Verification ---")

# 1. Test Normal Case
print("\n1. Testing Normal Transaction (500 INR)")
is_fraud, risk_score, reason = check_fraud(500.0, "user@upi")
print(f"Result: Fraud={is_fraud}, Risk={risk_score}, Reason={reason}")

# 2. Test High Value
print("\n2. Testing High Value Transaction (1,00,000 INR)")
is_fraud, risk_score, reason = check_fraud(100000.0, "richuser@upi")
print(f"Result: Fraud={is_fraud}, Risk={risk_score}, Reason={reason}")

# 3. Test Suspicious Patterns (Fuzzing)
print("\n3. Fuzzing to find Fraud Case...")
found_fraud = False
for i in range(50):
    # Generate random UPI
    random_upi = ''.join(random.choices(string.ascii_lowercase, k=8)) + "@upi"
    # Random High Amount
    amount = random.randint(10000, 500000)
    
    is_fraud, risk_score, reason = check_fraud(float(amount), random_upi)
    
    if is_fraud:
        print(f"!!! FRAUD DETECTED !!!")
        print(f"Input: Amount={amount}, UPI={random_upi}")
        print(f"Reason: {reason}")
        print(f"Risk Score: {risk_score}")
        found_fraud = True
        break

if not found_fraud:
    print("\nNo fraud detected in random samples. The model might be very conservative or features need tuning.")
