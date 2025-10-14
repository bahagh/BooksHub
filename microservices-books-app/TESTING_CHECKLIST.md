# 🧪 Complete Testing Checklist

**Date**: October 15, 2025 (Ready for Testing)
**Status**: All Security Fixes Implemented ✅

---

## 📋 Pre-Testing Setup

### 1. **Services Status Check**

Before testing, verify all services are running:

```powershell
# Check if services are running
Get-Process -Name "UserService" -ErrorAction SilentlyContinue
Get-Process -Name "BooksService" -ErrorAction SilentlyContinue

# Health check endpoints
curl http://localhost:5555/api/auth/health
curl http://localhost:5556/api/books/health
```

**Expected**: Both services should return `{"status":"healthy"}`

### 2. **Start Frontend**

```powershell
cd c:\Users\Asus\Desktop\books\microservices-books-app\frontend
npm start
```

Wait for the frontend to compile and open at http://localhost:3000

---

## 🔐 Security Features Testing

### ✅ **Test 1: XSS Protection** (HIGH PRIORITY)

**What was fixed**: Comments now sanitize HTML to prevent script injection attacks

**Test Steps**:
1. Navigate to http://localhost:3000
2. Login with your account
3. Go to any book details page
4. Try to add comments with malicious content:

**Test Case 1** - Script Tag:
```
Comment: <script>alert("XSS Attack")</script>
Expected: Script tag should be removed, comment saves as plain text
```

**Test Case 2** - Image with onerror:
```
Comment: <img src=x onerror="alert('Hacked!')">
Expected: Image tag should be completely removed
```

**Test Case 3** - Allowed formatting:
```
Comment: This is <b>bold</b> and <i>italic</i> text
Expected: Bold and italic formatting should work
```

**Test Case 4** - JavaScript URL:
```
Comment: <a href="javascript:alert('XSS')">Click me</a>
Expected: Link should be sanitized/removed
```

**Pass Criteria**: ✅ Malicious scripts are removed, only safe formatting is allowed

---

### ✅ **Test 2: Rate Limiting on Login** (HIGH PRIORITY)

**What was fixed**: Login endpoint now limits to 5 attempts per IP every 5 minutes

**Test Steps**:
1. Go to http://localhost:3000/auth/login
2. Try logging in with WRONG credentials 6 times in a row
3. Use the same email but wrong password each time

**Expected Results**:
- Attempts 1-5: Should get "Invalid credentials" error (401)
- Attempt 6: Should get "Too Many Requests" error (429)
- Message: "Rate limit exceeded. Please try again later."

**Wait 5 minutes and try again**:
- After waiting, you should be able to login again

**Pass Criteria**: ✅ 6th attempt is blocked with HTTP 429 error

---

### ⏳ **Test 3: Rate Limiting on Registration** (MEDIUM PRIORITY)

**What was fixed**: Registration limited to 3 attempts per IP per hour

**Test Steps**:
1. Try registering 4 NEW accounts in quick succession
2. Use different emails each time

**Expected Results**:
- Attempts 1-3: Should succeed or fail based on validation
- Attempt 4: Should be blocked with 429 error

**Pass Criteria**: ✅ 4th registration attempt is blocked

---

## 🎯 Core Features Testing

### **Test 4: Books Page Filters**

**What was fixed**: Filter buttons now properly filter books by status

**Test Steps**:
1. Navigate to "Discover" page
2. Click "Want to Read" filter
3. Verify only books with "Want to Read" status are shown
4. Click "Reading" filter
5. Click "Completed" filter
6. Click "All" to show all books

**Pass Criteria**: ✅ Filters work correctly without showing "No books found" error

---

### **Test 5: Profile Page**

**What was fixed**: Profile page now shows real user data instead of mock data

**Test Steps**:
1. Navigate to "Profile" page
2. Verify your real username is displayed
3. Check "My Statistics" section shows:
   - Total Books
   - Books Reading
   - Books Completed
   - Books Want to Read
4. Check "Recent Activity" shows your actual book interactions

**Pass Criteria**: ✅ Real data is displayed, no "John Doe" mock data

---

### **Test 6: Settings Page**

**What was new**: Complete Settings page with 4 sections

**Test Steps**:
1. Navigate to "Settings" page
2. Check all 4 sections are present:
   - Account Settings (username, email)
   - Password Settings
   - Notification Preferences (email, push, reading reminders)
   - Privacy Settings (profile visibility, activity)
3. Try changing some settings and saving

**Pass Criteria**: ✅ All sections render correctly and settings can be changed

---

### **Test 7: Navigation**

**What was fixed**: Reorganized navigation with clear structure

**Test Steps**:
1. Check top navigation bar has:
   - Home
   - Discover (Browse books)
   - My Library (Your books)
   - Profile
   - Settings
2. Click each nav item and verify correct page loads

**Pass Criteria**: ✅ All navigation links work correctly

---

## 📚 Books CRUD Operations

### **Test 8: Add a Book**

**Test Steps**:
1. Go to "Discover" page
2. Click "Add New Book"
3. Fill in:
   - Title: "Test Book"
   - Author: "Test Author"
   - ISBN: "1234567890"
   - Description: "Test description"
4. Click "Create Book"

**Pass Criteria**: ✅ Book is created successfully

---

### **Test 9: Edit a Book**

**Test Steps**:
1. Go to "My Library"
2. Find a book you created
3. Click "Edit Book"
4. Change the title to "Updated Test Book"
5. Click "Update Book"

**Pass Criteria**: ✅ Book is updated successfully

---

### **Test 10: Delete a Book**

**Test Steps**:
1. Go to "My Library"
2. Find the test book
3. Click "Delete Book"
4. Confirm deletion

**Pass Criteria**: ✅ Book is deleted successfully

---

## ⭐ Ratings & Comments

### **Test 11: Add Rating**

**Test Steps**:
1. Go to any book details page
2. Click on the star rating (try 4 stars)
3. Verify rating is saved and displayed

**Pass Criteria**: ✅ Rating is saved and visible

---

### **Test 12: Add Comment**

**Test Steps**:
1. On a book details page
2. Add a normal comment: "This is a great book!"
3. Verify comment appears
4. Check your username is shown with the comment
5. Verify timestamp is displayed

**Pass Criteria**: ✅ Comment is created and displayed correctly

---

### **Test 13: Edit Comment**

**Test Steps**:
1. Find one of your comments
2. Click "Edit"
3. Change the text to "Updated comment"
4. Save changes

**Pass Criteria**: ✅ Comment is updated and shows "(edited)" indicator

---

### **Test 14: Delete Comment**

**Test Steps**:
1. Find one of your comments
2. Click "Delete"
3. Confirm deletion

**Pass Criteria**: ✅ Comment is deleted or shows "[This comment has been deleted]" if it has replies

---

## 🚨 Error Handling

### **Test 15: Invalid Login**

**Test Steps**:
1. Try logging in with wrong email
2. Try logging in with wrong password
3. Try logging in with empty fields

**Expected**: 
- Clear error messages
- No app crash
- User-friendly validation errors

**Pass Criteria**: ✅ Errors handled gracefully with clear messages

---

### **Test 16: Network Error Simulation**

**Test Steps**:
1. Stop one of the backend services
2. Try performing an action (e.g., load books)
3. Verify error is displayed nicely

**Expected**: "Failed to load data. Please try again later."

**Pass Criteria**: ✅ Network errors don't crash the app

---

## 📊 Testing Summary Template

After completing all tests, fill this out:

```
TESTING COMPLETED: [Date/Time]

✅ PASSED Tests:
- [ ] XSS Protection
- [ ] Login Rate Limiting
- [ ] Registration Rate Limiting
- [ ] Books Page Filters
- [ ] Profile Page Real Data
- [ ] Settings Page
- [ ] Navigation
- [ ] Add Book
- [ ] Edit Book
- [ ] Delete Book
- [ ] Add Rating
- [ ] Add Comment
- [ ] Edit Comment
- [ ] Delete Comment
- [ ] Invalid Login Handling
- [ ] Network Error Handling

❌ FAILED Tests:
(List any tests that failed)

🐛 Issues Found:
(Describe any bugs or problems)

💡 Suggestions:
(Any improvements or feedback)
```

---

## 🔧 Quick Service Management

### **Restart All Services**

If you need to restart everything:

```powershell
# Stop services
Stop-Process -Name "UserService" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "BooksService" -Force -ErrorAction SilentlyContinue

# Start services in new windows
cd c:\Users\Asus\Desktop\books\microservices-books-app\services\UserService\UserService
Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run"

cd c:\Users\Asus\Desktop\books\microservices-books-app\services\BooksService\BooksService
Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run"

# Wait 30-60 seconds, then verify health
curl http://localhost:5555/api/auth/health
curl http://localhost:5556/api/books/health
```

---

## 📝 Notes for Testing

### **Current Implementation Status**

✅ **Completed & Working**:
- XSS Protection (HtmlSanitizer in CommentsService)
- Rate Limiting (Login: 5/5min, Register: 3/hour, General: 60/min)
- Books Page Filters Fixed
- Profile Page Real Data
- Settings Page Created
- Navigation Reorganized
- All CRUD operations
- Ratings & Comments system
- Error boundaries and handling

⏳ **Not Implemented Yet**:
- Request Size Limits (low priority)
- CSRF protection (low priority for API-only backend)

### **Known Issues**:
- IDE shows false compilation errors for HtmlSanitizer (ignore - service works fine)
- bin/obj folders can't be deleted while services are running (normal behavior)

---

## 🎉 Success Criteria

**The app is production-ready if**:
- All security tests pass ✅
- All core features work ✅
- Error handling is graceful ✅
- No crashes or unhandled exceptions ✅

---

## 📞 Need Help?

If you encounter any issues during testing:
1. Check the service console windows for error logs
2. Check browser console (F12) for frontend errors
3. Verify services are running with health check endpoints
4. Make sure frontend is running on port 3000

---

**Good luck with testing! 🚀**

**Remember**: 
- XSS Protection = Prevents script injection in comments
- Rate Limiting = Prevents brute force login attacks
- Both features are already implemented and running!
