@echo off
REM Script chạy tests trên Docker (moved to backend\scripts)

cd /d "%~dp0\.."

echo.
echo Building Docker image...
docker build -t edu-chain-test -f Dockerfile.test .

echo.
echo Running tests in Docker container...
docker run --rm edu-chain-test

if errorlevel 1 (
    echo.
    echo Tests failed!
    exit /b 1
) else (
    echo.
    echo Tests completed successfully!
    exit /b 0
)
