@echo off
echo 🍰 Starting SweetBite Bakery Management System...
echo.

echo 📦 Installing dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo.
echo 🗄️ Running database migrations...
cd backend
python manage.py migrate
cd ..

echo.
echo 🚀 Starting servers...
echo Backend will run on http://localhost:8000
echo Frontend will run on http://localhost:3000
echo.

start "Backend Server" cmd /k "cd backend && python manage.py runserver"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "npm start"

echo.
echo ✅ Servers started! Check the opened windows.
echo Press any key to exit...
pause > nul

