#!/bin/bash

# UPI-Guard Deployment Script
# This script helps deploy the application to production

set -e

echo "🚀 Starting UPI-Guard Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing."
    echo "   Important: Set a secure POSTGRES_PASSWORD!"
    read -p "Press Enter after editing .env file..."
fi

# Load environment variables
source .env

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ Port $port is already in use. Please stop the service using this port."
        return 1
    fi
    return 0
}

# Check required ports
echo "🔍 Checking port availability..."
check_port 80 || exit 1
check_port 443 || exit 1
check_port 8000 || exit 1
check_port 5432 || exit 1

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p nginx/ssl
mkdir -p logs

# Build and start services
echo "🏗️  Building and starting services..."

# Use docker compose or docker-compose based on availability
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Pull latest images
echo "📦 Pulling latest images..."
$COMPOSE_CMD pull

# Build custom images
echo "🔨 Building application images..."
$COMPOSE_CMD build --no-cache

# Start services
echo "🚀 Starting services..."
$COMPOSE_CMD up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
for service in postgres redis backend frontend; do
    if $COMPOSE_CMD ps | grep -q "$service.*healthy\|$service.*Up"; then
        echo "✅ $service is running"
    else
        echo "❌ $service is not healthy"
        $COMPOSE_CMD logs $service
    fi
done

# Run database migrations
echo "🗄️  Running database migrations..."
$COMPOSE_CMD exec backend python -c "
from app.db.database import engine, Base
Base.metadata.create_all(bind=engine)
print('Database tables created successfully!')
"

# Create test users
echo "👥 Creating test users..."
$COMPOSE_CMD exec backend python -c "
from app.db.database import SessionLocal
from app.db.models import User
import uuid

db = SessionLocal()

users_data = [
    {
        'full_name': 'Alice Johnson',
        'email': 'alice@demo.com',
        'mobile': '+91 98765 43210',
        'upi_id': 'alice@secureupi',
        'balance': 50000.00,
        'verified': True,
        'role': 'user'
    },
    {
        'full_name': 'Bob Smith',
        'email': 'bob@demo.com',
        'mobile': '+91 87654 32109',
        'upi_id': 'bob@secureupi',
        'balance': 75000.00,
        'verified': True,
        'role': 'user'
    },
    {
        'full_name': 'Admin User',
        'email': 'admin@demo.com',
        'mobile': '+91 98765 12345',
        'upi_id': 'admin@secureupi',
        'balance': 100000.00,
        'verified': True,
        'role': 'admin'
    }
]

for user_data in users_data:
    existing = db.query(User).filter(User.email == user_data['email']).first()
    if not existing:
        user_id = str(uuid.uuid4())
        qr_code = f\"upi://pay?pa={user_data['upi_id']}&pn={user_data['full_name'].replace(' ', '%20')}&mc=0000&tid={user_id[:8]}\"
        
        db_user = User(
            id=user_id,
            full_name=user_data['full_name'],
            email=user_data['email'],
            mobile=user_data['mobile'],
            upi_id=user_data['upi_id'],
            qr_code=qr_code,
            balance=user_data['balance'],
            verified=user_data['verified'],
            role=user_data['role']
        )
        db.add(db_user)
        print(f\"Created user: {user_data['full_name']} ({user_data['email']})\")

db.commit()
db.close()
print('Test users created successfully!')
"

# Display deployment information
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Service Status:"
$COMPOSE_CMD ps
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "   Health Check: http://localhost:8000/health"
echo ""
echo "👤 Test Users:"
echo "   alice@demo.com (alice@secureupi) - ₹50,000"
echo "   bob@demo.com (bob@secureupi) - ₹75,000"
echo "   admin@demo.com (admin@secureupi) - ₹100,000"
echo ""
echo "🔧 Management Commands:"
echo "   View logs: $COMPOSE_CMD logs -f [service]"
echo "   Stop services: $COMPOSE_CMD down"
echo "   Restart services: $COMPOSE_CMD restart"
echo "   Update services: $COMPOSE_CMD pull && $COMPOSE_CMD up -d"
echo ""
echo "📁 Important Files:"
echo "   Configuration: .env"
echo "   Docker Compose: docker-compose.yml"
echo "   Logs: ./logs/"
echo "   SSL Certificates: ./nginx/ssl/"
echo ""
echo "🔒 Security Notes:"
echo "   1. Change default passwords in .env"
echo "   2. Add SSL certificates for HTTPS"
echo "   3. Configure firewall rules"
echo "   4. Set up monitoring and backups"
echo "   5. Review CORS origins in .env"
echo ""
echo "✅ UPI-Guard is now live!"
