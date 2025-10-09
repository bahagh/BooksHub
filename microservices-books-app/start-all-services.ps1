# Master Startup Script - Launches all services in separate windows

Write-Host "🚀 Starting BookHub Microservices Platform..." -ForegroundColor Green
Write-Host "This will open separate terminal windows for each service" -ForegroundColor Yellow

$basePath = "C:\Users\Asus\Desktop\books\microservices-books-app"

# Start Frontend in new Command Prompt window
Write-Host "▶️ Starting Frontend (React)..." -ForegroundColor Magenta
Start-Process cmd -ArgumentList "/k", "cd /d `"$basePath\frontend`" && npm start"

Start-Sleep -Seconds 3

# Start UserService in new Command Prompt window
Write-Host "▶️ Starting UserService..." -ForegroundColor Blue
Start-Process cmd -ArgumentList "/k", "cd /d `"$basePath\services\UserService\UserService`" && dotnet run --urls=http://localhost:5555"

Start-Sleep -Seconds 2

# Start BooksService in new Command Prompt window  
Write-Host "▶️ Starting BooksService..." -ForegroundColor Blue
Start-Process cmd -ArgumentList "/k", "cd /d `"$basePath\services\BooksService\BooksService`" && dotnet run --urls=http://localhost:5556"

Start-Sleep -Seconds 2

# Start API Gateway in new Command Prompt window
Write-Host "▶️ Starting API Gateway..." -ForegroundColor Blue
Start-Process cmd -ArgumentList "/k", "cd /d `"$basePath\api-gateway\ApiGateway`" && dotnet run --urls=http://localhost:5000"

Write-Host ""
Write-Host "🎉 All services are starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Service URLs:" -ForegroundColor Yellow
Write-Host "   🔐 UserService:  http://localhost:5555" -ForegroundColor White
Write-Host "   📚 BooksService: http://localhost:5556" -ForegroundColor White
Write-Host "   🌐 API Gateway:  http://localhost:5000" -ForegroundColor White
Write-Host "   🎨 Frontend:     http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "⏱️ Wait 30-60 seconds for all services to fully start" -ForegroundColor Cyan
Write-Host "🔍 Check each terminal window for startup status" -ForegroundColor Cyan

Read-Host "Press Enter to close this window"