@echo off
REM Configure git to use credential manager and push to GitHub
REM After running this, paste your Personal Access Token when prompted

cd /d "%~dp0"

REM Set credential helper to store credentials
git config --global credential.helper wincred

REM Attempt push - it will prompt for credentials
echo Attempting to push to GitHub...
echo When prompted, use your GitHub username and Personal Access Token as password
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✓ Success! Your code has been pushed to GitHub!
    echo Visit: https://github.com/MitanshuSarode1/Tooplo1
) else (
    echo.
    echo ✗ Push failed. Please check:
    echo   - Your Personal Access Token is valid
    echo   - You copied it correctly
    echo   - The repository exists and is accessible
)
pause
