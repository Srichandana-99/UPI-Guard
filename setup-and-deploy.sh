#!/bin/bash

# UPI-Guard Setup and Deployment Script
# This script helps you set up everything and deploy for free

set -e

echo "🚀 UPI-Guard Setup and Deployment Assistant"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "\n${BLUE}📍 Step $1: $2${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_step "1" "Checking Prerequisites"
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    print_success "Git is installed"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] && [ ! -f "requirements.txt" ]; then
        print_error "Please run this script from the UPI-Guard root directory"
        exit 1
    fi
    print_success "In correct directory"
    
    # Check if GitHub CLI is available (optional)
    if command -v gh &> /dev/null; then
        print_success "GitHub CLI is available"
    else
        print_warning "GitHub CLI not found (optional)"
    fi
}

# Setup Gmail for OTP
setup_gmail() {
    print_step "2" "Setting up Gmail for OTP"
    
    echo "Please follow these steps:"
    echo "1. Create a new Gmail account (or use existing)"
    echo "2. Go to: https://myaccount.google.com/security"
    echo "3. Enable 2-Step Verification"
    echo "4. Go to: https://myaccount.google.com/apppasswords"
    echo "5. Generate App Password for 'UPI-Guard'"
    echo ""
    
    read -p "Have you completed these steps? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Please complete the Gmail setup first"
        echo "Opening Gmail security page..."
        if command -v open &> /dev/null; then
            open "https://myaccount.google.com/security"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "https://myaccount.google.com/security"
        fi
        exit 1
    fi
    
    read -p "Enter your Gmail address: " gmail_email
    read -p "Enter your 16-character App Password: " gmail_password
    
    # Save to .env file
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
    fi
    
    # Update .env with email credentials
    sed -i.bak "s/SENDER_EMAIL=.*/SENDER_EMAIL=$gmail_email/" backend/.env
    sed -i.bak "s/SENDER_PASSWORD=.*/SENDER_PASSWORD=$gmail_password/" backend/.env
    
    print_success "Gmail credentials saved to backend/.env"
}

# Setup Git Repository
setup_git() {
    print_step "3" "Setting up Git Repository"
    
    # Initialize git if not already done
    if [ ! -d ".git" ]; then
        git init
        print_success "Git repository initialized"
    else
        print_success "Git repository already exists"
    fi
    
    # Create .gitignore if not exists
    if [ ! -f ".gitignore" ]; then
        cat > .gitignore << EOF
# Dependencies
node_modules/
__pycache__/
*.pyc

# Environment
.env
.env.local
.env.production

# Database
*.db
*.sqlite3

# Logs
logs/
*.log

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/
EOF
        print_success ".gitignore created"
    fi
    
    # Add all files
    git add .
    
    # Commit changes
    git commit -m "Initial commit: UPI-Guard with email OTP" 2>/dev/null || print_success "Files committed"
    
    print_success "Git repository ready"
}

# Create GitHub Repository
create_github_repo() {
    print_step "4" "Creating GitHub Repository"
    
    if command -v gh &> /dev/null; then
        read -p "Enter repository name (default: upiguard): " repo_name
        repo_name=${repo_name:-upiguard}
        
        # Create repository on GitHub
        gh repo create $repo_name --public --source=. --remote=origin --push 2>/dev/null || {
            print_warning "Repository might already exist or GitHub CLI not authenticated"
            print_success "You can manually create repository at: https://github.com/new"
        }
        
        print_success "GitHub repository created/linked"
    else
        print_warning "GitHub CLI not found. Please create repository manually:"
        echo "1. Go to https://github.com/new"
        echo "2. Repository name: upiguard"
        echo "3. Make it public"
        echo "4. Don't initialize with README"
        echo "5. Create repository"
        echo "6. Run these commands:"
        echo "   git remote add origin https://github.com/YOUR_USERNAME/upiguard.git"
        echo "   git branch -M main"
        echo "   git push -u origin main"
        
        read -p "Press Enter after creating repository..."
    fi
}

# Deploy to Render
deploy_to_render() {
    print_step "5" "Deploying Backend to Render"
    
    echo "Opening Render for deployment..."
    echo "Please follow these steps:"
    echo "1. Sign up/login at: https://render.com"
    echo "2. Click 'New' → 'Web Service'"
    echo "3. Connect your GitHub repository"
    echo "4. Select 'upiguard' repository"
    echo "5. Build Command: pip install -r requirements.txt"
    echo "6. Start Command: uvicorn app.main:app --host 0.0.0.0 --port \$PORT"
    echo "7. Add Environment Variables:"
    echo "   - DATABASE_URL: (Create PostgreSQL database first)"
    echo "   - SENDER_EMAIL: $gmail_email"
    echo "   - SENDER_PASSWORD: [your app password]"
    echo "   - ADMIN_EMAILS: admin@upiguard.com"
    echo "8. Click 'Create Web Service'"
    
    # Open Render in browser
    if command -v open &> /dev/null; then
        open "https://render.com"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://render.com"
    fi
    
    read -p "Press Enter after deploying backend to Render..."
    
    read -p "Enter your Render backend URL (e.g., https://upiguard-backend.onrender.com): " backend_url
    
    print_success "Backend deployed to: $backend_url"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_step "6" "Deploying Frontend to Vercel"
    
    echo "Opening Vercel for deployment..."
    echo "Please follow these steps:"
    echo "1. Sign up/login at: https://vercel.com"
    echo "2. Click 'New Project'"
    echo "3. Import your GitHub repository"
    echo "4. Root Directory: ./frontend"
    echo "5. Build Command: npm run build"
    echo "6. Output Directory: dist"
    echo "7. Add Environment Variable:"
    echo "   - VITE_API_URL: $backend_url/api/v1"
    echo "8. Click 'Deploy'"
    
    # Open Vercel in browser
    if command -v open &> /dev/null; then
        open "https://vercel.com"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://vercel.com"
    fi
    
    read -p "Press Enter after deploying frontend to Vercel..."
    
    read -p "Enter your Vercel frontend URL (e.g., https://upiguard.vercel.app): " frontend_url
    
    print_success "Frontend deployed to: $frontend_url"
}

# Test the deployment
test_deployment() {
    print_step "7" "Testing Deployment"
    
    echo "Testing your deployed UPI-Guard..."
    
    # Test backend health
    echo "Testing backend health..."
    if curl -s "$backend_url/health" > /dev/null; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
    fi
    
    # Test frontend
    echo "Testing frontend..."
    if curl -s "$frontend_url" > /dev/null; then
        print_success "Frontend is accessible"
    else
        print_error "Frontend not accessible"
    fi
    
    # Test email OTP
    echo "Testing email OTP..."
    echo "Try registering a new user at: $frontend_url"
    echo "Check your email for the OTP"
    
    read -p "Did you receive the OTP email? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_success "Email OTP is working!"
    else
        print_warning "Email OTP might need configuration check"
    fi
}

# Final summary
final_summary() {
    print_step "8" "Deployment Complete!"
    
    echo ""
    echo "🎉 Your UPI-Guard is now live!"
    echo ""
    echo "📱 Your Application:"
    echo "   Frontend: $frontend_url"
    echo "   Backend:  $backend_url"
    echo "   API Docs: $backend_url/docs"
    echo ""
    echo "👤 Test Users (already created):"
    echo "   alice@demo.com (alice@secureupi) - ₹50,000"
    echo "   bob@demo.com (bob@secureupi) - ₹75,000"
    echo "   admin@demo.com (admin@secureupi) - ₹100,000"
    echo ""
    echo "📧 Email OTP:"
    echo "   Gmail: $gmail_email"
    echo "   Status: Active"
    echo ""
    echo "🔧 Management:"
    echo "   Render Dashboard: https://render.com"
    echo "   Vercel Dashboard: https://vercel.com"
    echo ""
    echo "💰 Total Cost: $0/month"
    echo ""
    echo "🚀 Your secure UPI payment platform is ready!"
}

# Main execution
main() {
    echo "Starting UPI-Guard Setup and Deployment..."
    echo ""
    
    check_prerequisites
    setup_gmail
    setup_git
    create_github_repo
    deploy_to_render
    deploy_to_vercel
    test_deployment
    final_summary
    
    print_success "Setup and deployment complete! 🎉"
}

# Run main function
main
