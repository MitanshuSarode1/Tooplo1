@echo off
cd /d "%~dp0"
echo Pushing code to GitHub...
git push -u origin main
if %errorlevel% equ 0 (
    echo.
    echo Success! Your code has been pushed to GitHub.
) else (
    echo.
    echo Error: Push failed. Please check your authentication.
    echo.
    echo To fix this, you may need to:
    echo 1. Create a Personal Access Token on GitHub
    echo 2. Use it as your password when prompted
    echo Or use: gh auth login
)
pause
