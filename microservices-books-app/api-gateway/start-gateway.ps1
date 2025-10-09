# API Gateway Startup Script for Windows

Write-Host "🌐 Starting API Gateway..." -ForegroundColor Green
Write-Host "📍 Navigating to API Gateway directory..." -ForegroundColor Yellow

# Navigate to API Gateway directory
Set-Location "C:\Users\Asus\Desktop\books\microservices-books-app\api-gateway\ApiGateway"

# Check if we're in the right directory
if (!(Test-Path "ApiGateway.csproj")) {
    Write-Host "❌ Error: ApiGateway.csproj not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the correct directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Found ApiGateway.csproj" -ForegroundColor Green
Write-Host "🔧 Starting API Gateway on port 5000..." -ForegroundColor Blue

# Start the service
dotnet run --urls="http://localhost:5000"

Read-Host "Press Enter to exit"