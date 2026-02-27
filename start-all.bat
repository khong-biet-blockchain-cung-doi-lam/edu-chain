@echo off
echo ====================================================
echo     EDUCHAIN - Khoi dong tat ca Server
echo ====================================================
echo.

REM Start Backend (port 5001)
echo [1/5] Khoi dong Backend (port 5001)...
start "Backend" cmd /k "cd /D c:\backend-backup\backend && python run.py"
timeout /t 3 >nul

REM Start Login Form (port 3000)
echo [2/5] Khoi dong Login Form (port 3000)...
start "Login Form" cmd /k "cd /D c:\backend-backup\frontend\login-form && npm start"
timeout /t 2 >nul

REM Start Organizations Portal (port 5003)
echo [3/5] Khoi dong Organizations Portal (port 5003)...
start "Organizations" cmd /k "cd /D c:\backend-backup\frontend\organizations && npm run dev"
timeout /t 2 >nul

REM Start Admin Portal (port 5004)
echo [4/5] Khoi dong Admin Portal (port 5004)...
start "Admin" cmd /k "cd /D c:\backend-backup\frontend\admin && npm run dev"
timeout /t 2 >nul

REM Start Student Portal (port 5005)
echo [5/5] Khoi dong Student Portal (port 5005)...
start "Student" cmd /k "cd /D c:\backend-backup\frontend\student && npm run dev"
timeout /t 2 >nul

REM Start Lecturer Portal (port 5006)
echo [6/6] Khoi dong Lecturer Portal (port 5006)...
start "Lecturer" cmd /k "cd /D c:\backend-backup\frontend\lecturer && npm run dev"

echo.
echo ====================================================
echo  Tat ca server da duoc khoi dong!
echo.
echo  Backend API:     http://localhost:5001
echo  Login Form:      http://localhost:3000
echo  Organizations:   http://localhost:5003
echo  Admin:           http://localhost:5004
echo  Student:         http://localhost:5005
echo  Lecturer:        http://localhost:5006
echo ====================================================
echo.
echo Vao http://localhost:3000 de dang nhap!
pause
