# Books App - Complete Test Suite (Updated)
# Fixed all issues: book ID capture, search parameters, password reset flow

$ErrorActionPreference = "Stop"

# Global variables
$global:testUsername = "testuser$(Get-Random -Minimum 1000 -Maximum 9999)"
$global:testEmail = "$($global:testUsername)@test.com"
$global:testPassword = "TestPass123!"
$global:authToken = $null
$global:userId = $null
$global:bookId = $null

# Test results tracking
$global:testResults = @()
$global:passCount = 0
$global:failCount = 0

function Write-TestHeader {
    param([string]$testNum, [string]$testName)
    Write-Host "`n----------------------------------------" -ForegroundColor Cyan
    Write-Host "Test $testNum : $testName" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
}

function Write-TestResult {
    param([string]$testNum, [string]$testName, [bool]$passed, [string]$message)
    
    if ($passed) {
        Write-Host "[PASS] $testName" -ForegroundColor Green
        Write-Host "  → $message" -ForegroundColor Gray
        $global:passCount++
    } else {
        Write-Host "[FAIL] $testName" -ForegroundColor Red
        Write-Host "  → $message" -ForegroundColor Gray
        $global:failCount++
    }
    
    $global:testResults += @{
        Number = $testNum
        Name = $testName
        Passed = $passed
        Message = $message
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Books App - Complete Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# TEST 1: User Registration
Write-TestHeader "1" "User Registration"
try {
    $body = @{
        username = $global:testUsername
        email = $global:testEmail
        password = $global:testPassword
        firstName = "Test"
        lastName = "User"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:5555/api/Auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 10

    $result = $response.Content | ConvertFrom-Json
    $global:userId = $result.data.id
    
    Write-TestResult "1" "User Registration" $true "User ID: $($global:userId)"
} catch {
    Write-TestResult "1" "User Registration" $false "Error: $($_.Exception.Message)"
}

# TEST 2: User Login
Write-TestHeader "2" "User Login"
try {
    $loginBody = @{
        email = $global:testEmail
        password = $global:testPassword
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:5555/api/Auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -TimeoutSec 10

    $result = $response.Content | ConvertFrom-Json
    $global:authToken = $result.data.token
    
    Write-TestResult "2" "User Login" $true "Token: $($global:authToken.Substring(0, 30))..."
} catch {
    Write-TestResult "2" "User Login" $false "Error: $($_.Exception.Message)"
}

# TEST 3: Get Current User (JWT Validation)
Write-TestHeader "3" "Get Current User (JWT Validation)"
if ($global:authToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $global:authToken"
        }

        $response = Invoke-WebRequest -Uri "http://localhost:5555/api/Auth/me" `
            -Method GET `
            -Headers $headers `
            -TimeoutSec 10

        $result = $response.Content | ConvertFrom-Json
        Write-TestResult "3" "Get Current User" $true "Username: $($result.data.username)"
    } catch {
        Write-TestResult "3" "Get Current User" $false "Error: $($_.Exception.Message)"
    }
} else {
    Write-TestResult "3" "Get Current User" $false "Skipped - No auth token (Test 2 failed)"
}

# TEST 4: Browse Books (Public Access)
Write-TestHeader "4" "Browse Books (Public Access)"
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5556/api/Books/public?page=1&pageSize=10" `
        -Method GET `
        -TimeoutSec 10

    $result = $response.Content | ConvertFrom-Json
    Write-TestResult "4" "Browse Books" $true "Found $($result.totalCount) books"
} catch {
    Write-TestResult "4" "Browse Books" $false "Error: $($_.Exception.Message)"
}

# TEST 5: Create Book (Authenticated) - CRITICAL TEST
Write-TestHeader "5" "Create Book (Authenticated) - CRITICAL TEST"
if ($global:authToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $global:authToken"
        }

        $randomNum = Get-Random -Minimum 1000 -Maximum 9999
        $book = @{
            title = "Test Book $randomNum"
            content = "This is the content of test book $randomNum. It contains sufficient text to meet the minimum length requirement of at least 10 characters. This book was created during automated testing to verify the JWT authentication and book creation functionality."
            author = "Test Author"
            genre = "Technology"
            language = "en"
            description = "A test book created during automated testing to verify functionality."
            isPublic = $false
            tags = @("test", "automation", "book$randomNum")
        } | ConvertTo-Json

        $response = Invoke-WebRequest -Uri "http://localhost:5556/api/Books" `
            -Method POST `
            -Headers $headers `
            -Body $book `
            -ContentType "application/json" `
            -TimeoutSec 10

        $result = $response.Content | ConvertFrom-Json
        $global:bookId = $result.id
        
        if ($global:bookId) {
            Write-TestResult "5" "Create Book" $true "Book ID: $($global:bookId)"
        } else {
            Write-TestResult "5" "Create Book" $false "Book created but ID not found in response"
        }
    } catch {
        Write-TestResult "5" "Create Book" $false "Error: $($_.Exception.Message)"
    }
} else {
    Write-TestResult "5" "Create Book" $false "Skipped - No auth token (Test 2 failed)"
}

# TEST 6: Get Book by ID (Authenticated - book is private)
Write-TestHeader "6" "Get Book by ID"
if ($global:bookId -and $global:authToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $global:authToken"
        }
        
        $response = Invoke-WebRequest -Uri "http://localhost:5556/api/Books/$global:bookId" `
            -Method GET `
            -Headers $headers `
            -TimeoutSec 10

        $result = $response.Content | ConvertFrom-Json
        Write-TestResult "6" "Get Book by ID" $true "Retrieved book: $($result.title)"
    } catch {
        Write-TestResult "6" "Get Book by ID" $false "Error: $($_.Exception.Message)"
    }
} else {
    Write-TestResult "6" "Get Book by ID" $false "Skipped - No book ID or auth token"
}

# TEST 7: Update Book (Authenticated)
Write-TestHeader "7" "Update Book (Authenticated)"
if ($global:bookId -and $global:authToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $global:authToken"
        }

        $update = @{
            title = "Updated Test Book"
            content = "This is the UPDATED content of the test book. It has been modified to verify the update functionality works correctly with JWT authentication."
            author = "Updated Author"
            genre = "Technology"
            language = "en"
            description = "An UPDATED test book to verify update functionality."
            isPublic = $true
            tags = @("test", "updated", "automation")
        } | ConvertTo-Json

        $response = Invoke-WebRequest -Uri "http://localhost:5556/api/Books/$global:bookId" `
            -Method PUT `
            -Headers $headers `
            -Body $update `
            -ContentType "application/json" `
            -TimeoutSec 10

        Write-TestResult "7" "Update Book" $true "Book updated successfully"
    } catch {
        Write-TestResult "7" "Update Book" $false "Error: $($_.Exception.Message)"
    }
} else {
    Write-TestResult "7" "Update Book" $false "Skipped - No book ID or auth token"
}

# TEST 8: Search Books
Write-TestHeader "8" "Search Books"
try {
    # Use correct query parameters for BookSearchDto
    $response = Invoke-WebRequest -Uri "http://localhost:5556/api/Books/public?searchTerm=test&page=1&pageSize=10" `
        -Method GET `
        -TimeoutSec 10

    $result = $response.Content | ConvertFrom-Json
    Write-TestResult "8" "Search Books" $true "Found $($result.totalCount) books matching 'test'"
} catch {
    Write-TestResult "8" "Search Books" $false "Error: $($_.Exception.Message)"
}

# TEST 9: Password Reset Request
Write-TestHeader "9" "Password Reset Request"
try {
    $body = @{
        email = $global:testEmail
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:5555/api/Auth/forgot-password" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 10

    $result = $response.Content | ConvertFrom-Json
    Write-TestResult "9" "Password Reset Request" $true "Reset email sent (token in database)"
} catch {
    Write-TestResult "9" "Password Reset Request" $false "Error: $($_.Exception.Message)"
}

# TEST 10: Delete Book (Authenticated)
Write-TestHeader "10" "Delete Book (Authenticated)"
if ($global:bookId -and $global:authToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $global:authToken"
        }

        $response = Invoke-WebRequest -Uri "http://localhost:5556/api/Books/$global:bookId" `
            -Method DELETE `
            -Headers $headers `
            -TimeoutSec 10

        Write-TestResult "10" "Delete Book" $true "Book deleted successfully"
    } catch {
        Write-TestResult "10" "Delete Book" $false "Error: $($_.Exception.Message)"
    }
} else {
    Write-TestResult "10" "Delete Book" $false "Skipped - No book ID or auth token"
}

# TEST 11: Verify Book Deleted
Write-TestHeader "11" "Verify Book Deleted"
if ($global:bookId) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5556/api/Books/$global:bookId" `
            -Method GET `
            -TimeoutSec 10

        Write-TestResult "11" "Verify Book Deleted" $false "Book still exists (should be deleted)"
    } catch {
        # 404 is expected - book should be deleted
        if ($_.Exception.Message -like "*404*") {
            Write-TestResult "11" "Verify Book Deleted" $true "Book successfully deleted (404 returned)"
        } else {
            Write-TestResult "11" "Verify Book Deleted" $false "Error: $($_.Exception.Message)"
        }
    }
} else {
    Write-TestResult "11" "Verify Book Deleted" $false "Skipped - No book ID (Test 5 failed)"
}

# RESULTS SUMMARY
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $($global:passCount + $global:failCount)" -ForegroundColor White
Write-Host "Passed: $global:passCount" -ForegroundColor Green
Write-Host "Failed: $global:failCount" -ForegroundColor Red

$passRate = [math]::Round(($global:passCount / ($global:passCount + $global:failCount)) * 100, 1)
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })

Write-Host "`nDetailed Results:" -ForegroundColor White
Write-Host ""

foreach ($test in $global:testResults) {
    $status = if ($test.Passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($test.Passed) { "Green" } else { "Red" }
    Write-Host "$status Test $($test.Number): $($test.Name)" -ForegroundColor $color
}

Write-Host "`n========================================" -ForegroundColor Cyan
if ($global:failCount -eq 0) {
    Write-Host "All tests passed! System is fully functional." -ForegroundColor Green
} elseif ($passRate -ge 80) {
    Write-Host "Most tests passed. Minor issues detected." -ForegroundColor Yellow
} else {
    Write-Host "Multiple failures detected. System needs attention." -ForegroundColor Red
}

Write-Host "`nSee USER_TESTING_GUIDE.md for detailed test descriptions" -ForegroundColor Gray
Write-Host ""
