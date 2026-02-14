#!/bin/bash

# YouTube Clip Maker Deployment Script
# This script helps automate the deployment setup process

set -e  # Exit on any error

echo "🚀 YouTube Clip Maker - Deployment Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check prerequisites
echo
echo "🔍 Checking prerequisites..."

# Check for Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

# Check for npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_status "npm found: $NPM_VERSION"
else
    print_error "npm not found. Please install npm first."
    exit 1
fi

# Check for git
if command_exists git; then
    print_status "Git found"
else
    print_error "Git not found. Please install git first."
    exit 1
fi

# Determine project root
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
DEPLOY_DIR="$PROJECT_ROOT/deploy"

echo
echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Deploy configs: $DEPLOY_DIR"

# Check project structure
echo
echo "📂 Checking project structure..."

if [ -d "$PROJECT_ROOT/frontend" ]; then
    print_status "Frontend directory found"
else
    print_error "Frontend directory not found at $PROJECT_ROOT/frontend"
    exit 1
fi

if [ -d "$PROJECT_ROOT/backend" ]; then
    print_status "Backend directory found"
else
    print_error "Backend directory not found at $PROJECT_ROOT/backend"
    exit 1
fi

# Check for package.json files
if [ -f "$PROJECT_ROOT/frontend/package.json" ]; then
    print_status "Frontend package.json found"
else
    print_error "Frontend package.json not found"
    exit 1
fi

if [ -f "$PROJECT_ROOT/backend/package.json" ]; then
    print_status "Backend package.json found"
else
    print_error "Backend package.json not found"
    exit 1
fi

# Copy deployment configurations
echo
echo "📋 Setting up deployment configurations..."

# Copy Railway config to backend
if [ -f "$DEPLOY_DIR/railway.toml" ]; then
    cp "$DEPLOY_DIR/railway.toml" "$PROJECT_ROOT/backend/"
    print_status "Railway configuration copied to backend"
fi

if [ -f "$DEPLOY_DIR/Procfile" ]; then
    cp "$DEPLOY_DIR/Procfile" "$PROJECT_ROOT/backend/"
    print_status "Procfile copied to backend"
fi

# Copy Vercel config to frontend
if [ -f "$DEPLOY_DIR/vercel.json" ]; then
    cp "$DEPLOY_DIR/vercel.json" "$PROJECT_ROOT/frontend/"
    print_status "Vercel configuration copied to frontend"
fi

# Check if CORS is configured in backend
BACKEND_INDEX="$PROJECT_ROOT/backend/index.js"
if [ -f "$BACKEND_INDEX" ]; then
    if grep -q "cors" "$BACKEND_INDEX"; then
        print_status "CORS already configured in backend"
    else
        print_warning "CORS not found in backend/index.js - you may need to add it manually"
        echo "  See: $DEPLOY_DIR/cors-config.js for reference"
    fi
else
    print_warning "Backend index.js not found - create it and add CORS configuration"
fi

# Install dependencies
echo
echo "📦 Installing dependencies..."

echo "Installing frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
if npm install; then
    print_status "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

echo "Installing backend dependencies..."
cd "$PROJECT_ROOT/backend"
if npm install; then
    print_status "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Test builds
echo
echo "🔨 Testing builds..."

echo "Testing frontend build..."
cd "$PROJECT_ROOT/frontend"
if npm run build; then
    print_status "Frontend build successful"
else
    print_error "Frontend build failed"
    exit 1
fi

echo "Testing backend (if test script exists)..."
cd "$PROJECT_ROOT/backend"
if npm run test 2>/dev/null; then
    print_status "Backend tests passed"
else
    print_warning "Backend tests not available or failed"
fi

# Environment variables check
echo
echo "🔑 Environment Variables Setup"
echo "You need to set up the following environment variables:"
echo
echo "Railway (Backend):"
echo "  - REPLICATE_API_TOKEN"
echo "  - ANTHROPIC_API_KEY" 
echo "  - NODE_ENV=production"
echo "  - PORT=3001"
echo "  - FRONTEND_URL (update after Vercel deployment)"
echo
echo "Vercel (Frontend):"
echo "  - NEXT_PUBLIC_BACKEND_URL (update after Railway deployment)"
echo
print_info "See $DEPLOY_DIR/environment-variables.md for detailed instructions"

# Git status
echo
echo "📝 Git Status"
cd "$PROJECT_ROOT"

if [ -d ".git" ]; then
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes. Consider committing before deployment:"
        git status --short
    else
        print_status "Git working directory is clean"
    fi
else
    print_error "Not a git repository. Initialize git and push to GitHub before deploying:"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
    echo "  git remote add origin <your-github-repo>"
    echo "  git push -u origin main"
fi

# Final instructions
echo
echo "🎯 Next Steps:"
echo "============="
echo
echo "1. Ensure your code is pushed to GitHub"
echo
echo "2. Deploy Backend to Railway:"
echo "   - Go to https://railway.com"
echo "   - Create new project from GitHub"
echo "   - Set root directory to 'backend'"
echo "   - Add environment variables (see environment-variables.md)"
echo
echo "3. Deploy Frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import GitHub project"
echo "   - Set root directory to 'frontend'"
echo "   - Add NEXT_PUBLIC_BACKEND_URL environment variable"
echo
echo "4. Update CORS configuration:"
echo "   - Add Vercel URL to Railway's FRONTEND_URL and ALLOWED_ORIGINS"
echo "   - Redeploy Railway service"
echo
echo "5. Test deployment:"
echo "   - Visit your Vercel URL"
echo "   - Test file upload and processing"
echo "   - Check browser console for errors"
echo
echo "📚 Documentation:"
echo "   - Deployment Guide: $DEPLOY_DIR/README.md"
echo "   - Pricing Info: $DEPLOY_DIR/pricing-summary.md"  
echo "   - Checklist: $DEPLOY_DIR/deployment-checklist.md"
echo
print_status "Deployment setup complete! Follow the steps above to deploy your app."