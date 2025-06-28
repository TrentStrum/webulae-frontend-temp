@echo off
echo 🚀 Copying frontend files for bolt.new setup...

echo.
echo 📁 Files that will be copied:
echo   - app/ folder
echo   - components/ folder  
echo   - hooks/ folder
echo   - lib/ folder
echo   - public/ folder
echo   - All configuration files
echo.

echo ⚠️  IMPORTANT: Make sure you have:
echo    1. Created a new GitHub repository
echo    2. Cloned it to a local folder
echo    3. This script is in the frontend directory
echo.

set /p REPO_PATH="Enter the path to your cloned repository: "

if not exist "%REPO_PATH%" (
    echo ❌ Repository path not found: %REPO_PATH%
    pause
    exit /b 1
)

echo.
echo 📋 Copying files to %REPO_PATH%...

:: Copy directories
xcopy /E /I /Y "app" "%REPO_PATH%\app"
xcopy /E /I /Y "components" "%REPO_PATH%\components"
xcopy /E /I /Y "hooks" "%REPO_PATH%\hooks"
xcopy /E /I /Y "lib" "%REPO_PATH%\lib"
xcopy /E /I /Y "public" "%REPO_PATH%\public"

:: Copy individual files
copy "package.json" "%REPO_PATH%\"
copy "package-lock.json" "%REPO_PATH%\"
copy "next.config.js" "%REPO_PATH%\"
copy "tailwind.config.js" "%REPO_PATH%\"
copy "tsconfig.json" "%REPO_PATH%\"
copy "tsconfig.jest.json" "%REPO_PATH%\"
copy "jest.config.ts" "%REPO_PATH%\"
copy "jest.setup.ts" "%REPO_PATH%\"
copy "eslint.config.mjs" "%REPO_PATH%\"
copy "components.json" "%REPO_PATH%\"
copy "next-env.d.ts" "%REPO_PATH%\"
copy "postcss.config.js" "%REPO_PATH%\"
copy ".env.example" "%REPO_PATH%\"
copy "README.md" "%REPO_PATH%\"
copy "middleware.ts" "%REPO_PATH%\"

echo.
echo ✅ Files copied successfully!
echo.
echo 📝 Next steps:
echo    1. Navigate to %REPO_PATH%
echo    2. Commit and push the files to GitHub
echo    3. Go to bolt.new and deploy your repository
echo    4. Set environment variables in bolt.new
echo    5. Start your backend locally: cd python_service ^&^& python main.py
echo.

pause 