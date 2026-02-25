# UPI-Guard Deployment Guide

## 🚀 Quick Deployment

### Prerequisites
- Docker & Docker Compose installed
- Ports 80, 443, 8000, 5432 available
- At least 2GB RAM available

### 1. Clone and Setup
```bash
git clone <repository-url>
cd UPI-Guard
cp .env.example .env
# Edit .env with your configuration
```

### 2. Deploy
```bash
./deploy.sh
```

## 📋 Configuration

### Environment Variables (.env)
```bash
# Database
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://upiguard:password@postgres:5432/upiguard

# Application
ENVIRONMENT=production
ADMIN_EMAILS=admin@upiguard.com,security@upiguard.com

# URLs
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

## 🏗️ Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Nginx     │    │  Frontend   │    │   Backend   │
│  (Port 80)  │────│  (React)    │────│ (FastAPI)   │
│  (Port 443) │    │             │    │ (Port 8000) │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
                                        ┌─────────────┐
                                        │ PostgreSQL  │
                                        │ (Port 5432) │
                                        └─────────────┘
```

## 🛡️ Security Features

### Built-in Security
- ✅ Rate limiting (API: 10 req/s, Auth: 1 req/s)
- ✅ Security headers (CSP, XSS protection, etc.)
- ✅ SSL/TLS support
- ✅ Container non-root users
- ✅ Health checks
- ✅ Network isolation

## 📊 Monitoring

### Health Checks
```bash
# Frontend
curl http://localhost/

# Backend
curl http://localhost:8000/health

# Database
docker exec upiguard-postgres pg_isready -U upiguard
```

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

## 🚀 Ready to Deploy!

Run the deployment script:
```bash
./deploy.sh
```

This will:
- Build all Docker images
- Start PostgreSQL, Redis, Backend, and Frontend
- Create database tables
- Set up test users
- Configure Nginx load balancer
- Perform health checks

**🎉 Your UPI-Guard application will be live at http://localhost**
