@echo off
REM Script chạy tests trên Docker (Windows)
REM Usage: run_docker_tests.bat

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║  Running Test Suite on Docker                     ║
echo ║  Account ^& Password Generation from Excel         ║
echo ╚════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0\.."

REM Build image
echo 📦 Building Docker image...
docker build -t edu-chain-test -f docker\Dockerfile.test .

echo.
echo 🐳 Running tests in Docker container...
docker run --rm edu-chain-test

if errorlevel 1 (
    echo.
    echo ❌ Tests failed!
    exit /b 1
) else (
    echo.
    echo ✅ Tests completed successfully!
    exit /b 0
)
