# BooksService Startup Script for Windows

Write-Host "📚 Starting BooksService..." -ForegroundColor Green
Write-Host "📍 Navigating to BooksService directory..." -ForegroundColor Yellow

# Navigate to BooksService directory
Set-Location "C:\Users\Asus\Desktop\books\microservices-books-app\services\BooksService\BooksService"

# Check if we're in the right directory
if (!(Test-Path "BooksService.csproj")) {
    Write-Host "❌ Error: BooksService.csproj not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the correct directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Found BooksService.csproj" -ForegroundColor Green
Write-Host "🔧 Starting BooksService on port 5556..." -ForegroundColor Blue

# Start the service
dotnet run --urls="http://localhost:5556"

Read-Host "Press Enter to exit"