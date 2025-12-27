#!/bin/bash

# MineSentry Setup Script

set -e

echo "======================================"
echo "MineSentry Setup Script"
echo "======================================"
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo ""
    echo "Creating virtual environment..."
    python3 -m venv venv
else
    echo "Virtual environment already exists"
fi

# Activate virtual environment
echo ""
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo ""
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "Creating .env file from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "Please edit .env file with your configuration"
    else
        echo "Warning: .env.example not found"
    fi
else
    echo ".env file already exists"
fi

# Initialize database
echo ""
echo "Initializing database..."
python init_db.py

echo ""
echo "======================================"
echo "Setup complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Bitcoin RPC credentials"
echo "2. Activate virtual environment: source venv/bin/activate"
echo "3. Start the API server: python api.py"
echo "4. Visit http://localhost:8000/docs for API documentation"
echo ""

