# AI Chat Analysis Feature

This folder contains the AI-powered chat analysis system for weekly mentor reports.

## Quick Start

```bash
# Navigate to this folder
cd ai-chat-analysis

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Start the server
python main.py
```

## Test the System

```bash
# Run the comprehensive test
python test_weekly_report.py

# Or quick local test
python test_direct.py
```

## Documentation

- **README.md** - Overview and features
- **USAGE_GUIDE.md** - Complete usage instructions
- **main.py** - FastAPI server with all endpoints
- **test_*.py** - Various test scripts

## API Endpoints

- `POST /weekly_report` - Generate mentor report (main feature)
- `POST /analyze` - Basic sentiment analysis
- `POST /analyze_users` - User participation ranking
- `GET /` - Health check

## Integration

See USAGE_GUIDE.md for detailed integration examples with WhatsApp, Slack, etc.

## Features

✅ Fully functional (no hardcoded data)
✅ Advanced NLP analysis
✅ Automatic contributor identification
✅ Weekly mentor reports
✅ Runs completely offline (no API keys needed)
