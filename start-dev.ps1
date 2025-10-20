# SweetBite Bakery Management System - Development Startup Script
Write-Host "🍰 Starting SweetBite Bakery Management System..." -ForegroundColor Green
Write-Host ""

# Install Python dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
Set-Location backend
pip install -r requirements.txt
Set-Location ..

Write-Host ""

# Run database migrations
Write-Host "🗄️ Running database migrations..." -ForegroundColor Yellow
Set-Location backend
python manage.py migrate
Set-Location ..

Write-Host ""

# Start servers
Write-Host "🚀 Starting servers..." -ForegroundColor Green
Write-Host "Backend will run on http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend will run on http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; python manage.py runserver"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start"

Write-Host ""
Write-Host "✅ Servers started! Check the opened windows." -ForegroundColor Green
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

