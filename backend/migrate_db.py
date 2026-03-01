"""
Database migration script to add password_hash and upi_pin_hash columns
Run this once to update existing database schema
"""
from sqlalchemy import text
from app.db.database import engine

def migrate():
    with engine.connect() as conn:
        try:
            # Add password_hash column if it doesn't exist
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS password_hash VARCHAR;
            """))
            print("✅ Added password_hash column")
            
            # Add upi_pin_hash column if it doesn't exist
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS upi_pin_hash VARCHAR;
            """))
            print("✅ Added upi_pin_hash column")
            
            conn.commit()
            print("✅ Migration completed successfully")
        except Exception as e:
            print(f"❌ Migration error: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate()
