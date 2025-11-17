# AI Chat Analysis Integration Guide

## Overview

The Python AI Chat Analysis service is now integrated with your Express backend, providing advanced NLP-powered insights for project chat analysis.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React Frontend │ ──────> │  Express Backend │ ──────> │ Python AI Service│
│   (Port 3000)   │         │   (Port 5000)    │         │   (Port 8000)    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │                             │
                                     ▼                             ▼
                            ┌─────────────────┐         ┌─────────────────┐
                            │    MongoDB      │         │  NLP Models:    │
                            │  (Port 27017)   │         │  - spaCy        │
                            └─────────────────┘         │  - VADER        │
                                                        │  - Transformers │
                                                        └─────────────────┘
```

## Features

### 🤖 AI-Powered Analysis
- **Sentiment Analysis**: VADER-based emotional tone detection
- **Keyword Extraction**: spaCy NLP for technical topic identification
- **Text Summarization**: Transformer-based AI summaries
- **Contribution Scoring**: Technical contribution metrics (0-100)
- **Quality Classification**: High/Medium/Low contributor ranking

### 📊 Weekly Mentor Reports
- Who is actually working vs just chatting
- Technical vs casual conversation classification
- Problem-solving activity tracking
- Team collaboration metrics
- Actionable recommendations

## Setup Instructions

### 1. Install Python Dependencies (One-Time Setup)

**Windows (PowerShell):**
```powershell
cd "c:\Users\om\OneDrive\Documents\Mini Project\ai-chat-analysis"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

**Linux/Mac:**
```bash
cd ai-chat-analysis
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 2. Start the Services

You need to run **3 services** for full functionality:

#### Terminal 1: MongoDB
```powershell
# Start MongoDB service (if not already running)
```

#### Terminal 2: AI Service (Python FastAPI)
```powershell
cd server
.\start-ai-service.ps1
```

This will start the AI service on `http://localhost:8000`

#### Terminal 3: Express Backend
```powershell
cd server
npm start
```

This will start the Express server on `http://localhost:5000`

#### Terminal 4: React Frontend
```powershell
cd client
npm start
```

This will start the React app on `http://localhost:3000`

## How It Works

### Automatic Fallback System

The Express backend automatically detects if the AI service is available:

1. **AI Service Available**: Uses advanced NLP analysis with contribution scoring
2. **AI Service Unavailable**: Falls back to basic chat metrics

### API Integration

The Express backend calls the Python AI service through `aiServiceClient.js`:

```javascript
// server/utils/chatAnalysis.js

// Basic chat analysis always runs
const basicMetrics = calculateBasicMetrics(messages);

// AI analysis attempts when service is available
if (await aiServiceClient.isAvailable()) {
  const aiReport = await aiServiceClient.generateWeeklyReport(messages);
  // Merge AI insights with basic metrics
}
```

### Data Flow

1. **Frontend** → Requests chat metrics via `/api/projects/:projectId/chat-metrics`
2. **Express** → Fetches messages from MongoDB
3. **Express** → Sends messages to Python AI service at `http://localhost:8000/weekly_report`
4. **Python AI** → Analyzes with NLP models (spaCy, VADER, Transformers)
5. **Python AI** → Returns comprehensive report with:
   - Technical contribution scores
   - Problem-solving metrics
   - Sentiment analysis
   - Key discussions
   - Actionable recommendations
6. **Express** → Merges AI insights with basic metrics
7. **Express** → Returns enhanced data to frontend
8. **Frontend** → Displays AI-powered insights in ChatAnalysisReport component

## API Endpoints

### Python AI Service (Port 8000)

#### 1. Health Check
```http
GET http://localhost:8000/
Response: {"status": "ok"}
```

#### 2. Basic Analysis
```http
POST http://localhost:8000/analyze
{
  "messages": [
    {"username": "Alice", "text": "Fixed the bug", "timestamp": "2025-11-17T10:00:00"}
  ]
}
```

#### 3. User Rankings
```http
POST http://localhost:8000/analyze_users
```

#### 4. Weekly Mentor Report (Main Feature)
```http
POST http://localhost:8000/weekly_report
{
  "messages": [...]
}
```

Returns:
- `technical_contribution_score`: 0-100 score per user
- `code_related_messages`: Count of technical messages
- `problem_solving_count`: Problem-solving activities
- `help_given_count`: Collaboration metrics
- `contribution_quality`: "High", "Medium", or "Low"
- `project_momentum`: "Strong", "Moderate", or "Weak"
- `recommendations`: Actionable insights for mentors

### Express Backend (Port 5000)

#### Get Chat Metrics (Enhanced with AI)
```http
GET /api/projects/:projectId/chat-metrics
Authorization: Bearer <token>
```

Returns enhanced metrics with AI insights when available:
```json
{
  "success": true,
  "totalMessages": 42,
  "topContributors": [...],
  "aiInsights": {
    "sentiment": 0.456,
    "momentum": "Strong",
    "technicalTopics": ["authentication", "database", "API"],
    "topContributors": [
      {
        "username": "Alice",
        "technicalScore": 82.5,
        "quality": "High",
        "isActive": true
      }
    ],
    "recommendations": [
      "Good collaboration detected!",
      "Positive team sentiment"
    ]
  },
  "aiEnabled": true
}
```

## Environment Variables

Add to `server/.env`:
```env
# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000
```

## Testing

### 1. Test AI Service Directly
```bash
cd ai-chat-analysis
python test_weekly_report.py
```

### 2. Test Integration
```bash
# Start all services (MongoDB, AI, Express, React)
# Then in browser:
http://localhost:3000/main
# Click on a project → Chat Analysis tab
```

### 3. Check AI Service Health
```bash
curl http://localhost:8000/
# Should return: {"status":"ok"}
```

## Troubleshooting

### AI Service Not Starting

**Error**: `ModuleNotFoundError: No module named 'fastapi'`
```bash
cd ai-chat-analysis
source venv/bin/activate  # or .\venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
```

**Error**: `Can't find model 'en_core_web_sm'`
```bash
python -m spacy download en_core_web_sm
```

### AI Service Connection Failed

1. **Check if service is running**:
   ```bash
   curl http://localhost:8000/
   ```

2. **Check Express logs**:
   ```
   AI Service not available: ECONNREFUSED
   ```
   → Start the AI service with `start-ai-service.ps1`

3. **Verify port 8000 is not in use**:
   ```powershell
   netstat -ano | findstr :8000
   ```

### Frontend Not Showing AI Insights

1. **Check browser console**: Look for API errors
2. **Check Express response**: Should have `aiEnabled: true`
3. **Verify messages exist**: AI analysis requires messages in the last 7 days

## Features by Component

### ChatAnalysisReport.js (Frontend)
- Displays AI-powered insights
- Shows technical contribution scores
- Visualizes sentiment and momentum
- Lists key discussions and recommendations

### chatAnalysis.js (Express Backend)
- Fetches messages from MongoDB
- Calls AI service via `aiServiceClient`
- Merges AI insights with basic metrics
- Handles graceful fallback

### aiServiceClient.js (Express Backend)
- Manages connection to Python AI service
- Formats messages for AI consumption
- Handles timeouts and errors
- Provides health check

### main.py (Python AI Service)
- NLP-based message classification
- Technical vs casual conversation detection
- Contribution scoring algorithm
- Weekly report generation

## Performance

- **Basic Analysis**: ~10-50ms (MongoDB query)
- **AI Analysis**: ~1-5 seconds (NLP processing)
- **Timeout**: 60 seconds (configurable in `aiServiceClient.js`)
- **Fallback**: Automatic to basic analysis if AI unavailable

## Production Deployment

### Option 1: Separate Servers
- Deploy Express to Heroku/Render
- Deploy Python AI to separate instance
- Update `AI_SERVICE_URL` in .env

### Option 2: Docker Compose
```yaml
version: '3'
services:
  express:
    build: ./server
    environment:
      - AI_SERVICE_URL=http://ai-service:8000
  
  ai-service:
    build: ./ai-chat-analysis
    ports:
      - "8000:8000"
```

## Benefits

✅ **Advanced NLP Analysis**: Identifies what users are actually working on
✅ **Technical Scoring**: 0-100 contribution metrics
✅ **Quality Classification**: High/Medium/Low contributor ranking
✅ **Actionable Insights**: Specific recommendations for mentors
✅ **Automatic Fallback**: Works even if AI service is offline
✅ **Scalable**: Separate AI service can be scaled independently
✅ **Extensible**: Easy to add more NLP features

## Next Steps

1. ✅ Start all 3 services (MongoDB, AI, Express)
2. ✅ Navigate to project chat in frontend
3. ✅ View AI-enhanced chat analysis
4. 🔧 Customize NLP models in `main.py`
5. 🔧 Add more AI features (predictions, alerts, etc.)

---

**Built with ❤️ using MERN + AI/NLP**
