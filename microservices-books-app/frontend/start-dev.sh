#!/bin/bash
# React Frontend Startup Script

echo "🚀 Starting React Frontend Development Server..."
echo "📍 Working Directory: $(pwd)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the frontend directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔧 Starting development server..."
npm start