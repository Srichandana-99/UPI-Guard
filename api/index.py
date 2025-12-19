import sys
import os

# Add the 'backend' directory to sys.path explicitly
# This ensures imports like 'import fraud_engine' working inside main.py resolve correctly
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
sys.path.append(backend_path)

from backend.main import app

# Vercel expects a variable named 'app' to be the ASGI/WSGI application
