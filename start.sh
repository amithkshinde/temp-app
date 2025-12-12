#!/bin/bash

echo "🚀 Starting Twist Open Leave Tracker..."

# 1. Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# 2. Database Setup (Generate Client, Push Schema, Seed Data)
echo "🗄️  Setting up Database (Prisma)..."
npx prisma generate
npx prisma db push --accept-data-loss
npx tsx prisma/seed.ts

# 3. Start Server
echo "✅ Setup Complete!"
echo "🌐 Starting Server at http://localhost:3000..."
npm run dev
