from database import create_user, verify_user, get_user_balance, update_user_balance
import time

def test_flow():
    email = f"test_{int(time.time())}@example.com"
    password = "password123"
    name = "Test User"
    
    print(f"1. Creating user: {email}...")
    success = create_user(name, email, password)
    print(f"Create User result: {success}")
    
    if success:
        print("2. Verifying user...")
        user = verify_user(email, password)
        print(f"Verify User result: {user}")
        
        if user:
            print(f"User ID: {user.get('id')}")
            print(f"User Balance: {user.get('balance')}")
            
            print("3. Updating balance...")
            update_user_balance(user['id'], 9500.0)
            
            print("4. Checking new balance...")
            new_bal = get_user_balance(user['id'])
            print(f"New Balance: {new_bal}")
            
        else:
            print("❌ Verification failed!")
    else:
        print("❌ Creation failed!")

if __name__ == "__main__":
    test_flow()
