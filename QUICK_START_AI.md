# 🚀 Quick Start Guide - AI-Powered Chat Analysis

## Start All Services (4 Terminals Required)

### Terminal 1: Start MongoDB
```powershell
# Make sure MongoDB is running
# Usually starts automatically as a Windows service
```

### Terminal 2: Start AI Service (Python FastAPI) 🤖
```powershell
cd "c:\Users\om\OneDrive\Documents\Mini Project\server"
.\start-ai-service.ps1
```
Wait for: `✅ Starting FastAPI server on http://localhost:8000`

### Terminal 3: Start Express Backend
```powershell
cd "c:\Users\om\OneDrive\Documents\Mini Project\server"
node server.js
```
Wait for: `Server running on port 5000`

### Terminal 4: Start React Frontend
```powershell
cd "c:\Users\om\OneDrive\Documents\Mini Project\client"
npm start
```
Wait for: Browser opens at `http://localhost:3000`

## Test the Integration

1. **Login** to your account
2. **Navigate** to Main Dashboard
3. **Click** on any project with chat messages
4. **Open** the Chat Analysis tab
5. **See** AI-powered insights! 🎉

You should now see:
- ✅ Technical Contribution Scores (0-100)
- ✅ Quality Rankings (High/Medium/Low)
- ✅ Sentiment Analysis
- ✅ Project Momentum
- ✅ AI Recommendations

## Troubleshooting

### AI Service Won't Start?
```powershell
cd "c:\Users\om\OneDrive\Documents\Mini Project\ai-chat-analysis"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python main.py
```

### "AI Service not available"?
- Check if AI service is running on port 8000
- Test with: `curl http://localhost:8000/`
- Should return: `{"status":"ok"}`

### No AI Insights in Frontend?
- Ensure you have chat messages in the last 7 days
- Check browser console for errors
- Verify `aiEnabled: true` in API response

## What's Working Now?

✅ **Express Backend** → Connects to Python AI service via HTTP
✅ **Python AI Service** → Advanced NLP analysis with spaCy, VADER, Transformers
✅ **Automatic Fallback** → Works even if AI service is offline
✅ **Real-time Analysis** → Every chat analysis request uses AI when available
✅ **Enhanced Metrics** → Technical scores, quality rankings, sentiment

## Files Modified

- `server/utils/chatAnalysis.js` - Now calls AI service
- `server/utils/aiServiceClient.js` - NEW: AI service connector
- `server/.env` - Added AI_SERVICE_URL config
- `server/start-ai-service.ps1` - NEW: AI startup script

## API Flow

```
Frontend Request → Express Backend → AI Service (Python)
                         ↓                    ↓
                   MongoDB Messages    NLP Analysis
                         ↓                    ↓
                   Basic Metrics  ←   AI Insights
                         ↓
                Frontend Response (Enhanced with AI)
```

---

**🎉 Your MERN project now has AI superpowers!**
