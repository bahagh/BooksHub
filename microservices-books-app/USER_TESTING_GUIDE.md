# 🧪 User Testing Guide# 📖 Books App - User Testing Guide

**Date:** October 14, 2025  

**Tester:** User  This guide provides step-by-step instructions for testing the Books App as an end user.

**Purpose:** Verify all currently accessible features work correctly

## 🚀 Prerequisites

---

Before testing, ensure:

## 📋 Pre-Testing Checklist- ✅ PostgreSQL is running (database: `books`)

- ✅ Both services are started

### ✅ Services Status- ✅ Frontend is started (optional for API testing)

Before testing, verify all services are running:

---

```powershell

# Check processes:## 📋 Quick Start

# ✅ UserService: http://localhost:5555

# ✅ BooksService: http://localhost:5556### Option 1: Using PowerShell Script (Recommended)

# ✅ Frontend: http://localhost:3000

``````powershell

cd 'c:\Users\Asus\Desktop\books\microservices-books-app'

Open browser and check:.\start-all-services.ps1

- [ ] Frontend loads: http://localhost:3000```

- [ ] Can see login/register page

- [ ] No console errors (F12 → Console tab)This will:

- Stop any existing services

---- Start UserService on port 5555

- Start BooksService on port 5556

## 🔐 Test Suite 1: Authentication & User Management- Verify both services are responding



### Test 1.1: User Registration ✅### Option 2: Manual Start

**URL:** http://localhost:3000/register

**Terminal 1 - UserService:**

**Steps:**```powershell

1. Click "Register" or navigate to `/register`cd 'c:\Users\Asus\Desktop\books\microservices-books-app\services\UserService\UserService'

2. Fill in the form:dotnet run

   - First Name: `Test````

   - Last Name: `User`

   - Email: `testuser@example.com` (use unique email)**Terminal 2 - BooksService:**

   - Password: `Test@1234` (min 8 chars, upper, lower, number, special)```powershell

   - Confirm Password: `Test@1234`cd 'c:\Users\Asus\Desktop\books\microservices-books-app\services\BooksService\BooksService'

3. Click "Register" buttondotnet run

```

**Expected Results:**

- ✅ Form validates password strength (shows indicator)---

- ✅ Registration succeeds

- ✅ Redirected to `/login` or `/dashboard`## 🧪 Testing Scenarios

- ✅ No error messages

### Test 1: User Registration

**Actual Results:**

- [ ] ✅ PASS**Endpoint:** `POST http://localhost:5555/api/Auth/register`

- [ ] ❌ FAIL - Describe issue: _______________

**PowerShell Test:**

---```powershell

$body = @{

### Test 1.2: User Login ✅    username = "johndoe"

**URL:** http://localhost:3000/login    email = "johndoe@example.com"

    password = "SecurePass123!"

**Steps:**    firstName = "John"

1. Navigate to `/login`    lastName = "Doe"

2. Enter credentials:} | ConvertTo-Json

   - Email: `testuser@example.com`

   - Password: `Test@1234`$response = Invoke-WebRequest -Uri "http://localhost:5555/api/Auth/register" `

3. Click "Login" button    -Method POST `

    -Body $body `

**Expected Results:**    -ContentType "application/json"

- ✅ Login succeeds

- ✅ Redirected to `/dashboard`Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green

- ✅ User name appears in navbar$result = $response.Content | ConvertFrom-Json

- ✅ JWT token stored in localStorageWrite-Host "User ID: $($result.data.user.id)" -ForegroundColor Cyan

- ✅ No console errorsWrite-Host "Token received: $($result.data.token.Substring(0, 50))..." -ForegroundColor Yellow



**Actual Results:**# Save token for next tests

- [ ] ✅ PASS$global:authToken = $result.data.token

- [ ] ❌ FAIL - Describe issue: _______________```



**Console Check:****Expected Result:**

Open DevTools (F12) → Console:- ✅ Status Code: 200

- Should see: `✅ Login successful`- ✅ Response includes: userId, username, email, token

- Should NOT see: `❌` or error messages- ✅ Token should be a long JWT string



------



### Test 1.3: Forgot Password ✅### Test 2: User Login

**URL:** http://localhost:3000/forgot-password

**Endpoint:** `POST http://localhost:5555/api/Auth/login`

**Steps:**

1. Click "Forgot Password?" link on login page**PowerShell Test:**

2. Enter email: `testuser@example.com````powershell

3. Click "Send Reset Link" button$body = @{

4. Check email inbox    email = "johndoe@example.com"

    password = "SecurePass123!"

**Expected Results:**} | ConvertTo-Json

- ✅ Success message: "Password reset link sent to your email"

- ✅ Email received with reset link (check spam folder)$response = Invoke-WebRequest -Uri "http://localhost:5555/api/Auth/login" `

- ✅ No error messages    -Method POST `

    -Body $body `

**Actual Results:**    -ContentType "application/json"

- [ ] ✅ PASS

- [ ] ❌ FAIL - Describe issue: _______________Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green

$result = $response.Content | ConvertFrom-Json

**Email Details:**Write-Host "User: $($result.data.user.username)" -ForegroundColor Cyan

- From: `ghrissi389@gmail.com`Write-Host "Email: $($result.data.user.email)" -ForegroundColor Cyan

- Subject: Password reset or similarWrite-Host "Token: $($result.data.token.Substring(0, 50))..." -ForegroundColor Yellow

- Contains link: `http://localhost:3000/reset-password?token=...`

# Save token for next tests

**Note:** If using Outlook email, emails should arrive (Gmail SMTP configured)$global:authToken = $result.data.token

```

---

**Expected Result:**

### Test 1.4: Reset Password ✅- ✅ Status Code: 200

**URL:** Obtained from email link- ✅ Response includes: user details and JWT token

- ✅ Token is valid and can be used for authenticated requests

**Steps:**

1. Click link in password reset email---

2. Should open: `http://localhost:3000/reset-password?token=...`

3. Enter new password: `NewPass@1234`### Test 3: Get Current User (JWT Validation)

4. Confirm password: `NewPass@1234`

5. Click "Reset Password" button**Endpoint:** `GET http://localhost:5555/api/Auth/me`



**Expected Results:****PowerShell Test:**

- ✅ Password reset succeeds```powershell

- ✅ Success message displayed$headers = @{

- ✅ Redirected to `/login`    "Authorization" = "Bearer $global:authToken"

- ✅ Can login with new password}



**Actual Results:**$response = Invoke-WebRequest -Uri "http://localhost:5555/api/Auth/me" `

- [ ] ✅ PASS    -Method GET `

- [ ] ❌ FAIL - Describe issue: _______________    -Headers $headers



---Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green

$result = $response.Content | ConvertFrom-Json

### Test 1.5: Change Password (Profile) ✅Write-Host "Username: $($result.data.username)" -ForegroundColor Cyan

**URL:** http://localhost:3000/profileWrite-Host "Email: $($result.data.email)" -ForegroundColor Cyan

Write-Host "User ID: $($result.data.id)" -ForegroundColor Cyan

**Prerequisites:** Must be logged in```



**Steps:****Expected Result:**

1. Navigate to `/profile`- ✅ Status Code: 200

2. Scroll to "Change Password" section- ✅ Response includes: id, username, email, firstName, lastName

3. Fill in form:- ✅ JWT is validated successfully

   - Current Password: `NewPass@1234` (from previous test)

   - New Password: `Test@1234`---

   - Confirm New Password: `Test@1234`

4. Click "Change Password" button### Test 4: Browse Books (Public Access)



**Expected Results:****Endpoint:** `GET http://localhost:5556/api/Books`

- ✅ Password changed successfully

- ✅ Success message displayed**PowerShell Test:**

- ✅ Can logout and login with new password```powershell

$response = Invoke-WebRequest -Uri "http://localhost:5556/api/Books" `

**Actual Results:**    -Method GET

- [ ] ✅ PASS

- [ ] ❌ FAIL - Describe issue: _______________Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green

$result = $response.Content | ConvertFrom-Json

---Write-Host "Total Books: $($result.data.items.Count)" -ForegroundColor Cyan



### Test 1.6: Logout ✅if ($result.data.items.Count -gt 0) {

**Location:** Navbar (top-right)    Write-Host "`nFirst 3 Books:" -ForegroundColor Yellow

    $result.data.items | Select-Object -First 3 | ForEach-Object {

**Steps:**        Write-Host "  • $($_.title) by $($_.author)" -ForegroundColor White

1. Click "Logout" button in navbar (top-right corner)    }

2. Confirm logout if prompted} else {

    Write-Host "No books in database yet" -ForegroundColor Yellow

**Expected Results:**}

- ✅ Logged out successfully```

- ✅ Redirected to `/login`

- ✅ JWT token removed from localStorage**Expected Result:**

- ✅ Cannot access protected pages (redirects to login)- ✅ Status Code: 200

- ✅ Returns paginated list of books

**Actual Results:**- ✅ No authentication required

- [ ] ✅ PASS

- [ ] ❌ FAIL - Describe issue: _______________---



---### Test 5: Create a Book (Authenticated)



## 📚 Test Suite 2: Books Browsing & Display**Endpoint:** `POST http://localhost:5556/api/Books`



### Test 2.1: View Books List ✅ **CRITICAL TEST****PowerShell Test:**

**URL:** http://localhost:3000/books```powershell

$headers = @{

**Steps:**    "Authorization" = "Bearer $global:authToken"

1. Login first (if not already logged in)}

2. Navigate to `/books`

3. Wait for page to load$book = @{

4. Open DevTools (F12) → Console tab    isbn = "978-0-123456-78-9"

    title = "Test Book: Mastering PowerShell"

**Expected Results:**    author = "John Doe"

- ✅ Page loads without errors    publisher = "Tech Publishing"

- ✅ Console shows: `✅ GET /api/books - 200` (NOT 404)    publicationYear = 2024

- ✅ Books are displayed in grid layout    genre = "Technology"

  - **OR** "No books found" message if database is empty    language = "English"

- ✅ Page has search bar, genre filter, sort dropdown    pageCount = 350

- ✅ No red error messages    description = "A comprehensive guide to PowerShell scripting and automation."

    coverImageUrl = "https://example.com/covers/powershell.jpg"

**Actual Results:**    availableCopies = 5

- [ ] ✅ PASS - Books loaded    totalCopies = 5

- [ ] ⚠️ PARTIAL - Page loads but "No books found"} | ConvertTo-Json

- [ ] ❌ FAIL - 404 errors still appearing

$response = Invoke-WebRequest -Uri "http://localhost:5556/api/Books" `

**Console Logs:**    -Method POST `

```    -Headers $headers `

Write any console messages here:    -Body $book `

    -ContentType "application/json"



Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green

$result = $response.Content | ConvertFrom-Json

Write-Host "Book Created!" -ForegroundColor Green

```Write-Host "  ID: $($result.data.id)" -ForegroundColor Cyan

Write-Host "  Title: $($result.data.title)" -ForegroundColor Cyan

**Screenshots:** (Take screenshot if any errors)Write-Host "  ISBN: $($result.data.isbn)" -ForegroundColor Cyan



---# Save book ID for next tests

$global:bookId = $result.data.id

### Test 2.2: Search Books ✅```

**URL:** http://localhost:3000/books

**Expected Result:**

**Prerequisites:** Must have books in database- ✅ Status Code: 201

- ✅ Book is created and returned with ID

**Steps:**- ✅ JWT authentication works cross-service

1. On books page, locate search bar at top

2. Type: `test` (or any book title/author from your database)**❌ Known Issue:** Currently returns 401 Unauthorized - JWT cross-service validation failing

3. Wait for results to update (may auto-search or need to press Enter)

---

**Expected Results:**

- ✅ Search executes### Test 6: Get Book by ID

- ✅ Results update to show matching books

- ✅ Console shows: `✅ GET /api/books?search=test - 200`**Endpoint:** `GET http://localhost:5556/api/Books/{id}`

- ✅ Only matching books displayed

**PowerShell Test:**

**Actual Results:**```powershell

- [ ] ✅ PASSif ($global:bookId) {

- [ ] ❌ FAIL - Describe issue: _______________    $response = Invoke-WebRequest -Uri "http://localhost:5556/api/Books/$global:bookId" `

        -Method GET

---

    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green

### Test 2.3: Filter by Genre ✅    $result = $response.Content | ConvertFrom-Json

**URL:** http://localhost:3000/books    Write-Host "Title: $($result.data.title)" -ForegroundColor Cyan

    Write-Host "Author: $($result.data.author)" -ForegroundColor Cyan

**Prerequisites:** Must have books with different genres    Write-Host "ISBN: $($result.data.isbn)" -ForegroundColor Cyan

} else {

**Steps:**    Write-Host "No book ID available. Run Test 5 first." -ForegroundColor Yellow

1. On books page, locate genre dropdown}

2. Click dropdown to see genre options```

3. Select a genre (e.g., "Fiction", "Science", etc.)

4. Wait for results to update**Expected Result:**

- ✅ Status Code: 200

**Expected Results:**- ✅ Returns complete book details

- ✅ Dropdown shows list of genres- ✅ No authentication required

- ✅ Filter executes

- ✅ Console shows: `✅ GET /api/books?genre=Fiction - 200`---

- ✅ Only books of selected genre displayed

### Test 7: Update Book (Authenticated)

**Actual Results:**

- [ ] ✅ PASS**Endpoint:** `PUT http://localhost:5556/api/Books/{id}`

- [ ] ❌ FAIL - Describe issue: _______________

**PowerShell Test:**

---```powershell

if ($global:bookId) {

### Test 2.4: Sort Books ✅    $headers = @{

**URL:** http://localhost:3000/books        "Authorization" = "Bearer $global:authToken"

    }

**Prerequisites:** Must have multiple books

    $update = @{

**Steps:**        isbn = "978-0-123456-78-9"

1. On books page, locate sort dropdown        title = "Test Book: Advanced PowerShell"

2. Try each sort option:        author = "John Doe"

   - [ ] Title (A-Z)        publisher = "Tech Publishing"

   - [ ] Author (A-Z)        publicationYear = 2024

   - [ ] Newest First        genre = "Technology"

   - [ ] Rating (Highest)        language = "English"

3. Verify order changes after each selection        pageCount = 450

        description = "An UPDATED comprehensive guide to PowerShell."

**Expected Results:**        coverImageUrl = "https://example.com/covers/powershell-updated.jpg"

- ✅ Sort dropdown shows all options        availableCopies = 3

- ✅ Books reorder based on selection        totalCopies = 5

- ✅ Console shows: `✅ GET /api/books?sortBy=title - 200`    } | ConvertTo-Json



**Actual Results:**    $response = Invoke-WebRequest -Uri "http://localhost:5556/api/Books/$global:bookId" `

- [ ] ✅ PASS        -Method PUT `

- [ ] ❌ FAIL - Describe issue: _______________        -Headers $headers `

        -Body $update `

---        -ContentType "application/json"



### Test 2.5: Pagination/Load More ✅    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green

**URL:** http://localhost:3000/books    Write-Host "Book Updated!" -ForegroundColor Green

} else {

**Prerequisites:** Must have more than 10 books    Write-Host "No book ID available. Run Test 5 first." -ForegroundColor Yellow

}

**Steps:**```

1. Scroll to bottom of books page

2. Look for "Load More" button**Expected Result:**

3. Click "Load More" button- ✅ Status Code: 200

4. Wait for more books to load- ✅ Book is updated

- ✅ JWT authentication works

**Expected Results:**

- ✅ "Load More" button appears if more books available---

- ✅ More books load when clicked

- ✅ Button disappears if no more books### Test 8: Search Books



**Actual Results:****Endpoint:** `GET http://localhost:5556/api/Books/search?query=powershell`

- [ ] ✅ PASS

- [ ] ⚠️ N/A - Less than 10 books in database**PowerShell Test:**

- [ ] ❌ FAIL - Describe issue: _______________```powershell

$response = Invoke-WebRequest -Uri "http://localhost:5556/api/Books/search?query=powershell" `

---    -Method GET



### Test 2.6: Click on Book ✅Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green

**URL:** http://localhost:3000/books$result = $response.Content | ConvertFrom-Json

Write-Host "Search Results: $($result.data.items.Count)" -ForegroundColor Cyan

**Prerequisites:** Must have at least one book

$result.data.items | ForEach-Object {

**Steps:**    Write-Host "  • $($_.title) by $($_.author)" -ForegroundColor White

1. On books page, click on any book card}

2. Should navigate to book details page```



**Expected Results:****Expected Result:**

- ✅ Navigates to `/books/:id` (id is book's GUID)- ✅ Status Code: 200

- ✅ Book details page loads- ✅ Returns books matching "powershell"

- ⚠️ Page currently shows placeholder (expected, not implemented yet)- ✅ Search works across title, author, ISBN



**Actual Results:**---

- [ ] ✅ PASS - Navigated to details page

- [ ] ❌ FAIL - Error or didn't navigate### Test 9: Password Reset Request



**Current State:** Book details page is intentionally empty (placeholder). This is expected behavior and will be implemented in Phase 1.**Endpoint:** `POST http://localhost:5555/api/Auth/forgot-password`



---**PowerShell Test:**

```powershell

### Test 2.7: Book Card Display ✅$body = @{

**URL:** http://localhost:3000/books    email = "johndoe@example.com"

} | ConvertTo-Json

**Prerequisites:** Must have books in database

$response = Invoke-WebRequest -Uri "http://localhost:5555/api/Auth/forgot-password" `

**Visual Inspection - Each book card should show:**    -Method POST `

- [ ] Book title    -Body $body `

- [ ] Author name    -ContentType "application/json"

- [ ] Genre badge

- [ ] Description (truncated)Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green

- [ ] Average rating (stars)$result = $response.Content | ConvertFrom-Json

- [ ] View countWrite-Host "Message: $($result.message)" -ForegroundColor Cyan

- [ ] Comment countWrite-Host "Reset Token: $($result.data.resetToken)" -ForegroundColor Yellow

- [ ] "Read More" or similar button

# Save token for Test 10

**Actual Results:**$global:resetToken = $result.data.resetToken

- [ ] ✅ PASS - All info displayed```

- [ ] ⚠️ PARTIAL - Some info missing

- [ ] ❌ FAIL - Cards not displaying correctly**Expected Result:**

- ✅ Status Code: 200

**Missing/Incorrect Fields:** _______________- ✅ Reset token is generated

- ✅ Email would be sent (in development, token is returned in response)

---

---

## 🔍 Test Suite 3: Dashboard & Profile

### Test 10: Password Reset Completion

### Test 3.1: Dashboard Access ✅

**URL:** http://localhost:3000/dashboard**Endpoint:** `POST http://localhost:5555/api/Auth/reset-password`



**Prerequisites:** Must be logged in**PowerShell Test:**

```powershell

**Steps:**if ($global:resetToken) {

1. Navigate to `/dashboard`    $body = @{

2. Verify page loads        token = $global:resetToken

        newPassword = "NewSecurePass456!"

**Expected Results:**    } | ConvertTo-Json

- ✅ Dashboard loads

- ⚠️ Shows placeholder/mock data (expected, not connected yet)    $response = Invoke-WebRequest -Uri "http://localhost:5555/api/Auth/reset-password" `

- ✅ Page displays user stats, recommendations, recent books        -Method POST `

- ✅ No errors        -Body $body `

        -ContentType "application/json"

**Actual Results:**

- [ ] ✅ PASS    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green

- [ ] ❌ FAIL - Describe issue: _______________    $result = $response.Content | ConvertFrom-Json

    Write-Host "Message: $($result.message)" -ForegroundColor Green

**Note:** Dashboard currently shows mock data. This is expected behavior and will be connected to real APIs later.} else {

    Write-Host "No reset token available. Run Test 9 first." -ForegroundColor Yellow

---}

```

### Test 3.2: Profile Page Access ✅

**URL:** http://localhost:3000/profile**Expected Result:**

- ✅ Status Code: 200

**Prerequisites:** Must be logged in- ✅ Password is changed

- ✅ User can login with new password

**Steps:**

1. Navigate to `/profile`---

2. Verify page loads

3. Check displayed information### Test 11: Login with New Password



**Expected Results:****Endpoint:** `POST http://localhost:5555/api/Auth/login`

- ✅ Profile page loads

- ✅ Shows user's name and email**PowerShell Test:**

- ✅ Shows "Change Password" section```powershell

- ⚠️ Statistics may show zeros (expected if no activity)$body = @{

    email = "johndoe@example.com"

**Actual Results:**    password = "NewSecurePass456!"

- [ ] ✅ PASS} | ConvertTo-Json

- [ ] ❌ FAIL - Describe issue: _______________

$response = Invoke-WebRequest -Uri "http://localhost:5555/api/Auth/login" `

---    -Method POST `

    -Body $body `

## 🐛 Test Suite 4: Error Scenarios    -ContentType "application/json"



### Test 4.1: Invalid Login ❌Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green

**URL:** http://localhost:3000/loginWrite-Host "✅ Login successful with new password!" -ForegroundColor Green

```

**Steps:**

1. Try to login with wrong password**Expected Result:**

2. Email: `testuser@example.com`- ✅ Status Code: 200

3. Password: `WrongPassword123`- ✅ Login successful with new password

- ✅ New JWT token is generated

**Expected Results:**

- ❌ Login fails---

- ✅ Error message displayed: "Invalid credentials" or similar

- ✅ No crash or white screen## 🔧 Complete Test Suite Script

- ✅ Can try again

Run all tests with this single command:

**Actual Results:**

- [ ] ✅ PASS```powershell

- [ ] ❌ FAIL - Describe issue: _______________cd 'c:\Users\Asus\Desktop\books\microservices-books-app'

.\run-complete-tests.ps1

---```



### Test 4.2: Empty Database ⚠️---

**URL:** http://localhost:3000/books

## 📊 Test Results Summary

**Steps:**

1. Navigate to books page (assuming database is empty)| Test # | Feature | Expected | Status |

|--------|---------|----------|--------|

**Expected Results:**| 1 | User Registration | ✅ 200 OK | ✅ PASS |

- ✅ Page loads without errors| 2 | User Login | ✅ 200 OK | ✅ PASS |

- ✅ Shows "No books found" message| 3 | Get Current User | ✅ 200 OK | ✅ PASS |

- ✅ Does NOT show 404 errors in console| 4 | Browse Books | ✅ 200 OK | ✅ PASS |

- ✅ Search/filter controls still visible| 5 | Create Book | ✅ 201 Created | ❌ FAIL (401) |

| 6 | Get Book | ✅ 200 OK | ⚠️ BLOCKED |

**Actual Results:**| 7 | Update Book | ✅ 200 OK | ⚠️ BLOCKED |

- [ ] ✅ PASS| 8 | Search Books | ✅ 200 OK | ✅ PASS |

- [ ] ❌ FAIL - Describe issue: _______________| 9 | Password Reset Request | ✅ 200 OK | ✅ PASS |

| 10 | Password Reset Complete | ✅ 200 OK | ✅ PASS |

---| 11 | Login New Password | ✅ 200 OK | ✅ PASS |



### Test 4.3: Network Errors 🔴**Current Status:** 8/11 tests passing, 1 failing (JWT cross-service), 2 blocked

**Steps:**

1. Stop BooksService (Ctrl+C in terminal)---

2. Try to access books page

3. Restart BooksService## 🐛 Known Issues



**Expected Results:**### Issue #1: JWT Cross-Service Validation

- ❌ Request fails (expected)**Status:** 🔴 CRITICAL - Blocking user testing

- ✅ Error message displayed to user

- ✅ No crash or white screen**Description:** JWT tokens generated by UserService are rejected by BooksService with 401 Unauthorized.

- ✅ Error is user-friendly (not technical)

**Impact:** Users cannot create, update, or delete books (all authenticated book operations fail).

**Actual Results:**

- [ ] ✅ PASS**Tests Affected:**

- [ ] ❌ FAIL - Describe issue: _______________- Test 5: Create Book

- Test 7: Update Book

---- Test 12: Delete Book (not shown)



### Test 4.4: Protected Routes 🔒**Root Cause:** Under investigation

**Steps:**- JWT configuration identical in both services

1. Logout completely- Token validates successfully in UserService

2. Try to access: http://localhost:3000/dashboard- Token rejected by BooksService

3. Try to access: http://localhost:3000/profile

**Workaround:** None currently

**Expected Results:**

- ✅ Redirected to `/login` automatically**Priority:** P0 - Must fix before proceeding with feature improvements

- ✅ Cannot access protected pages without login

---

**Actual Results:**

- [ ] ✅ PASS## 🎯 Next Steps After Testing

- [ ] ❌ FAIL - Describe issue: _______________

Once all tests pass:

---

1. ✅ **Phase 1: API Gateway** (3-4 hours)

## 📊 Test Results Summary   - Centralize routing with Ocelot

   - Single entry point for frontend

### Overall Status:   - Rate limiting and request aggregation

- [ ] ✅ ALL TESTS PASSED - Ready to proceed

- [ ] ⚠️ MOST TESTS PASSED - Minor issues2. ✅ **Phase 2: UI/UX Enhancements** (6-8 hours)

- [ ] ❌ MAJOR ISSUES - Needs fixes   - Advanced search with filters

   - Book details modal

### Critical Issues Found:   - User dashboard improvements

1. _______________________________________________

2. _______________________________________________3. ✅ **Phase 3: Security & Performance** (4-6 hours)

3. _______________________________________________   - Rate limiting per user

   - Request logging and monitoring

### Non-Critical Issues:   - Performance optimizations

1. _______________________________________________

2. _______________________________________________4. ✅ **Phase 4: Book Ratings & Reviews** (8-10 hours)

   - Rating system (1-5 stars)

### Observations:   - Review creation and moderation

- Database Status: [ ] Has books  [ ] Empty   - Rating aggregation

- API Routing: [ ] Working (200 responses)  [ ] Not working (404 errors)

- Authentication: [ ] Working  [ ] Issues---

- Overall UX: [ ] Good  [ ] Needs improvement

## 📞 Support

---

If you encounter issues:

## 🎯 What to Do Based on Results

1. Check service logs in console windows

### Scenario A: Everything Works ✅2. Verify PostgreSQL is running

If all tests pass and books are loading:3. Check JWT token is being sent correctly

4. Review error messages for clues

**Next Steps:**

1. ✅ Authentication working perfectly---

2. ✅ Books API routing fixed

3. ✅ Frontend displaying data correctly## 🎉 Happy Testing!



**Recommended Next Action:**This guide ensures comprehensive testing of all current features. Follow the tests in order for best results.

→ **Proceed to Phase 1: Implement Book Details Page**

   - Display full book information**Estimated Testing Time:** 15-20 minutes for complete suite

   - Show ratings, comments (UI components)
   - Add edit/delete buttons (for book owner)

---

### Scenario B: Books API Still 404 ❌
If console shows `❌ GET /api/books - 404`:

**Debug Steps:**
1. Verify BooksService is running: http://localhost:5556/api/books/health
2. Check frontend is reloaded (hard refresh: Ctrl+Shift+R)
3. Clear browser cache
4. Check `frontend/src/services/api.ts` - should have dual clients
5. Check `frontend/src/services/booksService.ts` - should import `booksApi as api`

**If still failing:** Report exact console error for further debugging

---

### Scenario C: Database is Empty ⚠️
If "No books found" message appears:

**Options:**

**Option 1: Add books via Postman/API**
```bash
# Get JWT token first (from login response or localStorage)
POST http://localhost:5556/api/books
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0-7432-7356-5",
  "genre": "Fiction",
  "description": "A classic American novel",
  "content": "In my younger and more vulnerable years...",
  "publicationYear": 1925
}
```

**Option 2: Implement Create Book Form First**
→ Build the UI to create books (Phase 4)
→ Then users can add books through the UI

**Recommended:** Option 1 (quick test data) → Then Option 2 (full feature)

---

### Scenario D: Authentication Issues 🔐
If login/register not working:

**Debug Steps:**
1. Check UserService running: http://localhost:5555/api/auth/health
2. Check console for specific error messages
3. Verify password meets requirements (8+ chars, upper, lower, number, special)
4. Try different email address
5. Check browser localStorage for tokens

**If still failing:** Report exact error message

---

## 📝 Testing Checklist Summary

### ✅ Currently Testable:
- [x] User Registration
- [x] User Login
- [x] User Logout
- [x] Forgot Password
- [x] Reset Password
- [x] Change Password
- [x] View Books List
- [x] Search Books
- [x] Filter Books by Genre
- [x] Sort Books
- [x] Navigate to Book Details
- [x] Dashboard Access
- [x] Profile Access

### ❌ Not Yet Testable (Missing UI):
- [ ] Create New Book
- [ ] Edit Book
- [ ] Delete Book
- [ ] View Full Book Details
- [ ] Rate a Book
- [ ] Comment on Book
- [ ] View Book Analytics

---

## 🚀 After Testing is Complete

### Report Your Results:
Please provide:
1. ✅ / ❌ for each test suite
2. Console error messages (if any)
3. Screenshots of any issues
4. Database status (empty or has books)
5. Any unexpected behavior

### Next Steps Decision:
Based on your testing results, we'll:
1. Fix any critical issues found
2. Add test data if database is empty
3. Proceed to implementing missing features (Book Details, Ratings, Comments)

---

**Tester Name:** _______________  
**Date Completed:** _______________  
**Total Time Spent:** _______________  
**Overall Experience:** ⭐⭐⭐⭐⭐ (Rate 1-5 stars)

**Comments/Feedback:**
_______________________________________________________
_______________________________________________________
_______________________________________________________

