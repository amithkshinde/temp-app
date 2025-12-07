#!/bin/bash

# One-Click Launcher for Leave Tracker (macOS/Linux)

echo "🚀 Checking System Environment..."

# 1. Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "👉 Opening download page: https://nodejs.org/"
    open "https://nodejs.org/" 2>/dev/null || xdg-open "https://nodejs.org/"
    echo "⚠️ Please install Node.js and run this script again."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"

# 2. Check and Install Dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Dependencies missing. Installing now (this may take a minute)..."
    npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
        echo "❌ Dependency installation failed."
        exit 1
    fi
    echo "✅ Dependencies installed."
else
    echo "✅ Dependencies already installed."
fi

# 3. Start Development Server
echo "🟢 Starting Leave Tracker..."
echo "👉 The app will open in your browser automatically in 5 seconds."

(sleep 5 && open "http://localhost:3000" 2>/dev/null || xdg-open "http://localhost:3000") &

npm run dev
