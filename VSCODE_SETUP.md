# 🚀 VS Code Setup Guide for SweetBite Bakery Management System

This guide will help you set up and run the SweetBite project in VS Code with all the necessary configurations.

## 📋 Prerequisites

Before starting, make sure you have:
- **VS Code** installed
- **Python 3.8+** installed
- **Node.js 14+** installed
- **MySQL** installed and running
- **Git** installed

## 🛠️ VS Code Extensions

Install these recommended extensions (they should auto-install when you open the project):

1. **Python** - Python language support
2. **Pylance** - Python language server
3. **Black Formatter** - Python code formatting
4. **Tailwind CSS IntelliSense** - Tailwind CSS support
5. **Prettier** - JavaScript/React formatting
6. **ESLint** - JavaScript linting
7. **Auto Rename Tag** - HTML/JSX tag renaming
8. **Path IntelliSense** - File path autocomplete

## 🚀 Quick Start

### Method 1: Using VS Code Tasks (Recommended)

1. **Open the project in VS Code**
   ```bash
   code .
   ```

2. **Install Dependencies**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Tasks: Run Task"
   - Select "Install Python Dependencies"
   - Then select "Install Node Dependencies"

3. **Set up Database**
   - Run task: "Django Migrate"
   - Run task: "Django Create Superuser" (optional)

4. **Start the Application**
   - Press `Ctrl+Shift+P`
   - Type "Tasks: Run Task"
   - Select "Launch Full Stack" (starts both backend and frontend)

### Method 2: Using Debug Configurations

1. **Open the project in VS Code**
2. **Go to Run and Debug** (Ctrl+Shift+D)
3. **Select "Launch Full Stack"** from the dropdown
4. **Press F5** or click the green play button

### Method 3: Manual Terminal Commands

1. **Open Terminal** (Ctrl+`)

2. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   python manage.py runserver
   ```

3. **Start Frontend** (Terminal 2):
   ```bash
   npm start
   ```

## 🔧 Project Structure

```
sweetbite-greatest/
├── .vscode/                 # VS Code configurations
│   ├── launch.json         # Debug configurations
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
├── package.json
└── README.md
```

## 🎯 Available VS Code Tasks

| Task Name | Description |
|-----------|-------------|
| **Start Django Backend** | Runs Django development server |
| **Start React Frontend** | Runs React development server |
| **Install Python Dependencies** | Installs Python packages |
| **Install Node Dependencies** | Installs Node.js packages |
| **Django Migrate** | Runs database migrations |
| **Django Create Superuser** | Creates admin user |
| **Launch Full Stack** | Starts both backend and frontend |

## 🐛 Debug Configurations

| Configuration | Description |
|---------------|-------------|
| **Django Backend** | Debug Django server with breakpoints |
| **React Frontend** | Debug React app with breakpoints |
| **Launch Full Stack** | Debug both applications simultaneously |

## 🔍 Troubleshooting

### Common Issues:

1. **Python Interpreter Not Found**
   - Press `Ctrl+Shift+P`
   - Type "Python: Select Interpreter"
   - Choose the Python interpreter from `backend/venv/Scripts/python.exe`

2. **Port Already in Use**
   - Kill existing processes on ports 3000 and 8000
   - Or use different ports in the configuration

3. **MySQL Connection Issues**
   - Ensure MySQL is running
   - Check the password in `backend/sweetbite_backend/settings.py`
   - Verify database exists: `sweetbite_db`

4. **Node Modules Issues**
   - Delete `node_modules` folder
   - Run "Install Node Dependencies" task

5. **Python Virtual Environment Issues**
   - Create new virtual environment:
     ```bash
     cd backend
     python -m venv venv
     venv\Scripts\activate
     pip install -r requirements.txt
     ```

## 🌐 Access URLs

Once running, access the application at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

## 📝 Development Tips

1. **Use the integrated terminal** for running commands
2. **Set breakpoints** in Python/JavaScript code for debugging
3. **Use the command palette** (Ctrl+Shift+P) for quick access to tasks
4. **Check the Problems panel** for linting errors
5. **Use the integrated Git** for version control

## 🎉 You're Ready!

Your SweetBite Bakery Management System is now set up in VS Code with:
- ✅ Full-stack debugging capabilities
- ✅ Automated task running
- ✅ Code formatting and linting
- ✅ IntelliSense and autocomplete
- ✅ Integrated terminal
- ✅ Git integration

Happy coding! 🍰✨

