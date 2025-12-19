import sys
import os

# Add the parent directory to sys.path so 'backend' module can be found
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app

# Vercel expects a variable named 'app' to be the ASGI/WSGI application
