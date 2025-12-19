import database
import traceback

def debug_signup():
    print("--- Debugging Signup ---")
    try:
        result = database.create_user("Debug User", "debug_crash@example.com", "password")
        print(f"Result: {result}")
    except Exception:
        print("CRASHED!")
        traceback.print_exc()

if __name__ == "__main__":
    debug_signup()
