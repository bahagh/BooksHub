# React Frontend Startup Script for Windows

Write-Host "Starting React Frontend Development Server..." -ForegroundColor Green
Write-Host "Working Directory: $(Get-Location)" -ForegroundColor Yellow

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Make sure you're in the frontend directory." -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Blue
    npm install
}

Write-Host "Starting development server..." -ForegroundColor Green
npm start