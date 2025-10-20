#!/bin/bash

echo "🍰 Welcome to SweetBite Setup! 🍰"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python v3.8 or higher."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL v8.0 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Frontend Setup
echo ""
echo "🚀 Setting up Frontend..."
echo "=========================="

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully!"
else
    echo "❌ Failed to install frontend dependencies."
    exit 1
fi

# Backend Setup
echo ""
echo "🐍 Setting up Backend..."
echo "========================"

# Navigate to backend directory
cd backend

# Create virtual environment
echo "🔧 Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install backend dependencies
echo "📦 Installing backend dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully!"
else
    echo "❌ Failed to install backend dependencies."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
SECRET_KEY=django-insecure-your-secret-key-here-change-this-in-production
DEBUG=True
DB_NAME=sweetbite_db
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
EOF
    echo "✅ .env file created! Please update it with your database and Stripe credentials."
fi

# Go back to root directory
cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo "================================"
echo ""
echo "📋 Next steps:"
echo "1. Update the .env file in the backend directory with your database credentials"
echo "2. Create the MySQL database: CREATE DATABASE sweetbite_db;"
echo "3. Run Django migrations: cd backend && python manage.py migrate"
echo "4. Create a superuser: python manage.py createsuperuser"
echo "5. Start the backend server: python manage.py runserver"
echo "6. Start the frontend server: npm start"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:8000"
echo "👨‍💼 Admin panel will be available at: http://localhost:8000/admin"
echo ""
echo "🍰 Enjoy SweetBite! 🍰"
