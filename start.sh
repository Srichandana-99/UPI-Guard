#!/bin/bash

# UPI-Guard Setup and Run Script

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting UPI-Guard Local Environment ===${NC}\n"

# 1. Setup Backend
echo -e "${GREEN}[1/4] Setting up Python Backend...${NC}"
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install requirements
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Start backend in the background
echo -e "${GREEN}[2/4] Starting FastAPI Server...${NC}"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Go back to root
cd ..

# 2. Setup Frontend
echo -e "\n${GREEN}[3/4] Setting up React Frontend...${NC}"
cd frontend

# Install node modules if they don't exist
if [ ! -d "node_modules" ]; then
    echo "Installing NPM dependencies..."
    npm install
fi

# Start frontend
echo -e "${GREEN}[4/4] Starting Vite Development Server...${NC}"
npm run dev &
FRONTEND_PID=$!

echo -e "\n${BLUE}==========================================${NC}"
echo -e "${GREEN}✅ Both servers are running!${NC}"
echo -e "Backend:  http://localhost:8000"
echo -e "Frontend: http://localhost:5173"
echo -e "\n${BLUE}Press Ctrl+C to stop both servers.${NC}"
echo -e "${BLUE}==========================================${NC}"

# Handle Ctrl+C to kill both processes
trap "echo -e '\n${BLUE}Shutting down servers...${NC}'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

# Keep script running
wait
