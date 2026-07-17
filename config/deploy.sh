#!/bin/bash

# ACT COIN Platform - Quick Deployment Script
# This script builds and deploys the full platform

set -e

echo "🪙 ACT COIN Platform Deployment"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Check Node.js version
print_status "Checking Node.js version..."
node --version
if [ $(node -v | cut -d'.' -f1 | tr -d 'v') -lt 16 ]; then
    print_error "Node.js 16+ required"
    exit 1
fi

# Install dependencies
print_status "Installing backend dependencies..."
cd backend
npm install

print_status "Installing frontend dependencies..."
cd ../frontend
npm install

# Build frontend
print_status "Building frontend..."
npm run build

# Return to backend directory
cd ../backend

echo ""
echo "================================"
echo "✅ Build Complete!"
echo "================================"
echo ""
echo "🚀 To start the server:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "📍 Server will run at: http://localhost:3001"
echo ""
echo "🔗 Frontend built at: frontend/dist/"
echo ""
