@echo off
TITLE Leave Tracker Launcher

echo 🚀 Checking System Environment...

:: 1. Check for Node.js
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed!
    echo 👉 Opening download page...
    start https://nodejs.org/
    echo ⚠️ Please install Node.js and run this script again.
    pause
    exit
)
echo ✅ Node.js found.

:: 2. Check and Install Dependencies
IF NOT EXIST "node_modules" (
    echo 📦 Dependencies missing. Installing now (this may take a minute)...
    call npm install --legacy-peer-deps
    IF %ERRORLEVEL% NEQ 0 (
        echo ❌ Dependency installation failed.
        pause
        exit
    )
    echo ✅ Dependencies installed.
) ELSE (
    echo ✅ Dependencies already installed.
)

:: 3. Start Development Server
echo 🟢 Starting Leave Tracker...
echo 👉 Opening browser...
start http://localhost:3000

call npm run dev
pause
