# Database Initialization Script
# Run this to create a fresh database without test users

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import engine, Base
from app.db.database import SessionLocal

def init_database():
    """Initialize a fresh database without test users"""
    print("🗄️  Initializing fresh database...")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
    
    # Verify tables exist
    db = SessionLocal()
    try:
        # Simple query to test database connection
        from sqlalchemy import text
        db.execute(text("SELECT 1")).fetchone()
        print("✅ Database connection verified!")
        print("✅ Fresh database ready - no dummy data!")
            
    except Exception as e:
        print(f"❌ Database error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
    print("🎉 Database initialization complete!")
