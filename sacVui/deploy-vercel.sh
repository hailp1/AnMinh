#!/bin/bash

# SacVui Charging Station App - Vercel Deployment Script
# This script prepares and deploys the app to Vercel

echo "🚀 SacVui Charging Station - Vercel Deployment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Error: Node.js version 16 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version check passed: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Navigate to client directory and install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

# Run build to test
echo "🔨 Testing production build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Go back to root
cd ..

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo ""
echo "📋 Deployment Configuration:"
echo "   - Framework: Other"
echo "   - Root Directory: ./"
echo "   - Build Command: npm run vercel-build"
echo "   - Output Directory: client/build"
echo "   - Install Command: npm install"
echo ""

# Deploy
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "✅ Your SacVui Charging Station app is now live on Vercel!"
    echo ""
    echo "📱 Test your deployment:"
    echo "   - Check responsive design on mobile"
    echo "   - Test user registration and login"
    echo "   - Verify station creation functionality"
    echo "   - Test GPS location services"
    echo ""
    echo "📊 Monitor your app:"
    echo "   - Vercel Dashboard: https://vercel.com/dashboard"
    echo "   - Analytics: Available in Vercel dashboard"
    echo "   - Logs: Real-time logs in Vercel dashboard"
else
    echo "❌ Deployment failed! Check the error messages above."
    exit 1
fi