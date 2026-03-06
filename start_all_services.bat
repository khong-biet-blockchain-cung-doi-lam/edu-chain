@echo off
chcp 65001 >nul
echo Dang don dep cac cong bi treo (5001, 5003, 5004, 5005, 5006, 3000)...
for %%p in (5001 5003 5004 5005 5006 3000) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
)

echo Dang khoi dong Backend (Cong 5001)...
start "EduChain Backend" cmd /c "cd backend && ..\venv\Scripts\activate && python run.py"
timeout /t 2 /nobreak >nul

echo Dang khoi dong Admin (Cong 5004)...
start "EduChain Admin" cmd /c "cd frontend\admin && npm run dev"
timeout /t 2 /nobreak >nul

echo Dang khoi dong Organizations (Cong 5003)...
start "EduChain Org" cmd /c "cd frontend\organizations && npm run dev"
timeout /t 2 /nobreak >nul

echo Dang khoi dong Sinh vien (Cong 5005)...
start "EduChain Student" cmd /c "cd frontend\student && npm run dev"
timeout /t 2 /nobreak >nul

echo Dang khoi dong Giang vien (Cong 5006)...
start "EduChain Lecturer" cmd /c "cd frontend\lecturer && npm run dev"
timeout /t 2 /nobreak >nul

echo Dang khoi dong Form Dang nhap (Cong 3000)...
start "EduChain Login" cmd /c "cd frontend\login-form && npm start"

echo Hoan tat! 6 cua so terminal da duoc mo.
