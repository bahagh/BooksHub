# UserService Startup Script for Windows

Write-Host "🚀 Starting UserService..." -ForegroundColor Green
Write-Host "📍 Navigating to UserService directory..." -ForegroundColor Yellow

# Navigate to UserService directory
Set-Location "C:\Users\Asus\Desktop\books\microservices-books-app\services\UserService\UserService"

# Check if we're in the right directory
if (!(Test-Path "UserService.csproj")) {
    Write-Host "❌ Error: UserService.csproj not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the correct directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Found UserService.csproj" -ForegroundColor Green
Write-Host "🔧 Starting UserService on port 5555..." -ForegroundColor Blue

# Start the service
dotnet run --urls="http://localhost:5555"

Read-Host "Press Enter to exit"