#!/bin/bash
# Setup script for AI Chat Analysis

echo "🚀 Setting up AI Chat Analysis..."

# Navigate to ai-chat-analysis folder
cd "$(dirname "$0")"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Download spaCy model
echo "🧠 Downloading spaCy English model..."
python -m spacy download en_core_web_sm

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start using:"
echo "  cd ai-chat-analysis"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""
