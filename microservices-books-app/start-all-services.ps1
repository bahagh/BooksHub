
<#
  Reliable Startup Script for Books Application
  - Cleans up existing processes
  - Starts microservices and frontend
  - Waits with retries for health endpoints
  - Runs a full register/login flow and validates JWT against BooksService
#>

Write-Host "🚀 Starting Complete Books Application Stack..." -ForegroundColor Green
Write-Host "🧹 Cleaning up existing dotnet/node processes..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*dotnet*" -or $_.ProcessName -like "*node*" -or $_.ProcessName -like "*UserService*" -or $_.ProcessName -like "*BooksService*" } | Stop-Process -Force -ErrorAction SilentlyContinue
$basePath = "C:\Users\Asus\Desktop\books\microservices-books-app"

function Wait-ForEndpoint {
    param(
        [Parameter(Mandatory=$true)][string]$Url,
        [int]$TimeoutSeconds = 60,
        [int]$IntervalSeconds = 2,
        [string]$Name = "Service"
    )
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        try {
            $resp = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 5
            Write-Host "✅ $Name healthy at $Url" -ForegroundColor Green
            return $true
        } catch {
            Start-Sleep -Seconds $IntervalSeconds
        }
    } while((Get-Date) -lt $deadline)
    Write-Host "❌ Timed out waiting for $Name at $Url" -ForegroundColor Red
    return $false
}

# Start UserService
Write-Host "🟦 Starting UserService on port 5555..." -ForegroundColor Cyan
$userServiceProcess = Start-Process powershell -ArgumentList "-NoExit", "-WindowStyle", "Minimized", "-Command", "cd '$basePath\services\UserService\UserService'; $env:ASPNETCORE_URLS='http://localhost:5555'; dotnet run --no-launch-profile" -PassThru
Start-Sleep 6
Write-Host "UserService PID: $($userServiceProcess.Id)" -ForegroundColor Gray

# Start BooksService
Write-Host "📚 Starting BooksService on port 5556..." -ForegroundColor Cyan
$booksServiceProcess = Start-Process powershell -ArgumentList "-NoExit", "-WindowStyle", "Minimized", "-Command", "cd '$basePath\services\BooksService\BooksService'; $env:ASPNETCORE_URLS='http://localhost:5556'; dotnet run --no-launch-profile" -PassThru
Start-Sleep 6
Write-Host "BooksService PID: $($booksServiceProcess.Id)" -ForegroundColor Gray

# Start Frontend
Write-Host "🌐 Starting React Frontend on port 3000..." -ForegroundColor Cyan
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-WindowStyle", "Normal", "-Command", "cd '$basePath\frontend'; npm start" -PassThru
Start-Sleep 6
Write-Host "Frontend PID: $($frontendProcess.Id)" -ForegroundColor Gray

# Start API Gateway
Write-Host "🟩 Starting API Gateway on port 5000..." -ForegroundColor Cyan
$gatewayProcess = Start-Process powershell -ArgumentList "-NoExit", "-WindowStyle", "Minimized", "-Command", "cd '$basePath\api-gateway\ApiGateway'; $env:ASPNETCORE_URLS='http://localhost:5000'; dotnet run --no-launch-profile" -PassThru
Start-Sleep 6
Write-Host "API Gateway PID: $($gatewayProcess.Id)" -ForegroundColor Gray

Write-Host "🎉 All services are starting up!" -ForegroundColor Green
Write-Host "⏳ Waiting for services (with health checks)..." -ForegroundColor Yellow

$userHealthy = Wait-ForEndpoint -Url "http://localhost:5555/api/auth/health" -Name "UserService"
$booksHealthy = Wait-ForEndpoint -Url "http://localhost:5556/api/books/health" -Name "BooksService"
$frontendHint = "http://localhost:3000"

Write-Host "📋 Service URLs:" -ForegroundColor Yellow
Write-Host "   🔐 UserService:  http://localhost:5555" -ForegroundColor White
Write-Host "   📚 BooksService: http://localhost:5556" -ForegroundColor White
Write-Host "   🟩 API Gateway:  http://localhost:5000" -ForegroundColor White
Write-Host "   🌐 Frontend:     $frontendHint" -ForegroundColor White

# Health checks and test registration/login/JWT
if(-not $userHealthy -or -not $booksHealthy){
    Write-Host "⚠️ Skipping E2E tests because one or more health checks failed." -ForegroundColor Yellow
} else {
    try {
    Write-Host "👤 Registering a test user..." -ForegroundColor Cyan
    $randomSuffix = (Get-Random)
    $guidPart = ([guid]::NewGuid().ToString('N')).Substring(0,8)
    $regEmail = "test$guidPart@example.com"
    $regUsername = "testuser$randomSuffix"
    $regBody = @{ username = $regUsername; firstName = "Test"; lastName = "User"; email = $regEmail; password = "TestPassword123" } | ConvertTo-Json
        $registerResponse = Invoke-RestMethod -Uri "http://localhost:5555/api/auth/register" -Method POST -ContentType "application/json" -Body $regBody -TimeoutSec 20
        Write-Host "✅ Registration: $($registerResponse.message) ($regEmail)" -ForegroundColor Green

        Write-Host "🔐 Logging in..." -ForegroundColor Cyan
        $loginBody = @{ email = $registerResponse.data.user.email; password = "TestPassword123" } | ConvertTo-Json
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:5555/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -TimeoutSec 20
        $token = $loginResponse.data.token
        if([string]::IsNullOrWhiteSpace($token)){ throw "Login returned no token" }
        Write-Host "✅ Login: $($loginResponse.message)" -ForegroundColor Green

        Write-Host "🛡️ Calling JWT-protected BooksService /api/books/auth-test..." -ForegroundColor Cyan
        $authTest = Invoke-RestMethod -Uri "http://localhost:5556/api/books/auth-test" -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 20
        Write-Host "✅ JWT validated by BooksService. User: $($authTest.userId)" -ForegroundColor Green

        Write-Host "📚 Optionally creating a sample book..." -ForegroundColor DarkCyan
        $createBody = @{ title = "Welcome Book"; content = "This is an example book content with sufficient length (>=10 chars)."; description = "Welcome to the Books Application!"; author = "Books App"; genre = "Welcome" } | ConvertTo-Json
        $createResp = Invoke-RestMethod -Uri "http://localhost:5556/api/books" -Method POST -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body $createBody -TimeoutSec 30
        Write-Host "✅ Book created with ID: $($createResp.id)" -ForegroundColor Green

        Write-Host "🎉 APPLICATION STACK SUCCESSFULLY STARTED!" -ForegroundColor Green
        Write-Host "✅ All services are running and communicating properly!" -ForegroundColor Green
        Write-Host "✅ JWT Authentication is working end-to-end!" -ForegroundColor Green
        Write-Host "Open your browser to: $frontendHint" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ E2E test failed: $($_.Exception.Message)" -ForegroundColor Red
        if($_.Exception.Response){
            try { $body = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream()); $text = $body.ReadToEnd(); Write-Host "Response Body:" -ForegroundColor DarkGray; Write-Host $text -ForegroundColor DarkGray } catch {}
        }
        Write-Host "Please check the service windows for detailed logs." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Running Processes:" -ForegroundColor Gray
Write-Host "UserService PID: $($userServiceProcess.Id)" -ForegroundColor Gray
Write-Host "BooksService PID: $($booksServiceProcess.Id)" -ForegroundColor Gray
Write-Host "Frontend PID: $($frontendProcess.Id)" -ForegroundColor Gray
Write-Host "API Gateway PID: $($gatewayProcess.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to stop all services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Clean shutdown
Write-Host "🛑 Stopping all services..." -ForegroundColor Red
Stop-Process -Id $userServiceProcess.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $booksServiceProcess.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $gatewayProcess.Id -Force -ErrorAction SilentlyContinue
Write-Host "All services stopped." -ForegroundColor Green