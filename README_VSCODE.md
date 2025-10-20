# 🍰 SweetBite Bakery Management System - VS Code Setup

## 🚀 Quick Start (3 Methods)

### Method 1: VS Code Tasks (Easiest)
1. Open project in VS Code: `code .`
2. Press `Ctrl+Shift+P` → "Tasks: Run Task" → "Launch Full Stack"
3. Wait for both servers to start
4. Open http://localhost:3000

### Method 2: VS Code Debug
1. Open project in VS Code: `code .`
2. Go to Run and Debug (Ctrl+Shift+D)
3. Select "Launch Full Stack"
4. Press F5

### Method 3: Command Line
```bash
# Install dependencies
npm run setup

# Start both servers
npm run dev
```

## 🛠️ VS Code Features

### ✅ Pre-configured
- **Debug Configurations**: Debug both Django and React
- **Tasks**: One-click server startup
- **Extensions**: Auto-install recommended extensions
- **Settings**: Optimized for Python + React development
- **IntelliSense**: Full autocomplete for both languages

### 🎯 Available Tasks (Ctrl+Shift+P → "Tasks: Run Task")
- **Launch Full Stack** - Start both backend and frontend
- **Start Django Backend** - Django server only
- **Start React Frontend** - React server only
- **Install Python Dependencies** - Install backend packages
- **Install Node Dependencies** - Install frontend packages
- **Django Migrate** - Run database migrations
- **Django Create Superuser** - Create admin user

### 🐛 Debug Configurations
- **Django Backend** - Debug with breakpoints
- **React Frontend** - Debug with breakpoints
- **Launch Full Stack** - Debug both simultaneously

## 📁 Project Structure
```
sweetbite-greatest/
├── .vscode/                 # VS Code configurations
│   ├── launch.json         # Debug settings
│   ├── tasks.json          # Build tasks
│   ├── settings.json       # Workspace settings
│   └── extensions.json     # Recommended extensions
├── backend/                # Django backend
│   ├── manage.py
│   ├── requirements.txt
│   └── sweetbite_backend/
├── src/                    # React frontend
│   ├── components/
│   ├── pages/
│   └── App.js
├── start-dev.bat          # Windows batch script
├── start-dev.ps1          # PowerShell script
└── package.json           # Node.js scripts
```

## 🌐 Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

## 🔧 Troubleshooting

### Python Issues
```bash
# If Python interpreter not found
Ctrl+Shift+P → "Python: Select Interpreter"
# Choose: ./backend/venv/Scripts/python.exe
```

### Port Issues
```bash
# Kill processes on ports 3000 and 8000
netstat -ano | findstr :3000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

### Database Issues
```bash
# Check MySQL is running
net start | findstr -i mysql

# Reset database
cd backend
python manage.py migrate
```

### Node Issues
```bash
# Clear node modules
rm -rf node_modules
npm install
```

## 🎉 You're Ready!

Your SweetBite project is now fully configured for VS Code development with:
- ✅ One-click startup
- ✅ Full debugging support
- ✅ Code formatting and linting
- ✅ IntelliSense and autocomplete
- ✅ Integrated terminal
- ✅ Git integration

Happy coding! 🍰✨

