@echo off
cd /d "C:\Users\Asus\Desktop\books\microservices-books-app\frontend"
echo Starting React Development Server...
echo Current Directory: %CD%
if not exist package.json (
    echo ERROR: package.json not found!
    pause
    exit /b 1
)
echo Found package.json, starting server...
npm start
pause