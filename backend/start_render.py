#!/usr/bin/env python3
"""
Render-specific startup script for UPI-Guard backend
"""

import os
import uvicorn
from app.main import app

if __name__ == "__main__":
    # Render provides the PORT environment variable
    port = int(os.environ.get("PORT", 8000))
    
    # Start the server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Disable reload in production
        workers=1,     # Single worker for free tier
        log_level="info"
    )
