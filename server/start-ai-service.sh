#!/bin/bash

# AI Chat Analysis Service Startup Script
# This script sets up and runs the Python AI service

echo "🤖 Starting AI Chat Analysis Service..."

# Navigate to AI service directory
cd "$(dirname "$0")/../ai-chat-analysis"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Download spaCy model if not present
echo "🧠 Checking spaCy model..."
python3 -c "import spacy; spacy.load('en_core_web_sm')" 2>/dev/null || {
    echo "📥 Downloading spaCy model..."
    python3 -m spacy download en_core_web_sm
}

# Start the service
echo "✅ Starting FastAPI server on http://localhost:8000"
echo "📊 AI Service ready for chat analysis!"
echo ""
python3 main.py
