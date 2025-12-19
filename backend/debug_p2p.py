from database import supabase, process_p2p_transfer

def debug():
    print("--- Debugging P2P ---")
    
    # 1. Check Bob's Balance
    bob = supabase.table('users').select("*").eq('email', 'bob@example.com').execute()
    if bob.data:
        print(f"Bob's Balance: {bob.data[0]['balance']}")
    else:
        print("Bob not found!")

    # 2. Check Last Transaction
    txs = supabase.table('transactions').select("*").order('timestamp', desc=True).limit(1).execute()
    if txs.data:
        tx = txs.data[0]
        print(f"Last Tx: Amount={tx['amount']}, UPI_ID={tx['upi_id']}, Status={tx['status']}")
    
    # 3. Simulate P2P Transfer manually
    print("Simulating manual transfer of 50 to Bob...")
    success = process_p2p_transfer("sender_dummy_id", 50, "bob@example.com")
    print(f"Manual Transfer Result: {success}")
    
    # 4. Check Balance Again
    bob = supabase.table('users').select("*").eq('email', 'bob@example.com').execute()
    print(f"Bob's New Balance: {bob.data[0]['balance']}")

if __name__ == "__main__":
    debug()
