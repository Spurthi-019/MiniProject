# AI Chat Analysis Service Startup Script (Windows)
# This script sets up and runs the Python AI service

Write-Host "🤖 Starting AI Chat Analysis Service..." -ForegroundColor Cyan

# Navigate to AI service directory
$aiServicePath = Join-Path $PSScriptRoot "..\ai-chat-analysis"
Set-Location $aiServicePath

# Check if virtual environment exists
if (!(Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install/update dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

# Download spaCy model if not present
Write-Host "🧠 Checking spaCy model..." -ForegroundColor Yellow
python -c "import spacy; spacy.load('en_core_web_sm')" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "📥 Downloading spaCy model..." -ForegroundColor Yellow
    python -m spacy download en_core_web_sm
}

# Start the service
Write-Host "`n✅ Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
Write-Host "📊 AI Service ready for chat analysis!" -ForegroundColor Green
Write-Host ""
python main.py
