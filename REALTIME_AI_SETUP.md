# Real-Time AI Recommendations Setup Guide

## Overview
Your project now has **real-time AI-powered recommendations** using Google's Gemini API. The system analyzes actual project progress, task completion patterns, team collaboration, and deadlines to provide intelligent, context-aware suggestions.

## Features Implemented

### 1. **Real-Time AI Recommendations** ✨
- Analyzes project health based on actual task data
- Monitors team velocity and completion rates
- Provides specific, actionable next steps
- Identifies risks and potential blockers
- Predicts timeline and completion estimates
- **Uses Google Gemini AI** for intelligent analysis

### 2. **Deadline Alert System** 🚨
- Monitors all task deadlines every 6 hours
- Identifies overdue tasks automatically
- Alerts for tasks due in 24-48 hours
- Sends notifications to team leads
- Console logging of all alerts
- Optional email notifications

### 3. **Personalized Member Recommendations** 👤
- Individual task prioritization for each member
- Personal deadline alerts
- Workload analysis
- Next task suggestions based on urgency

## Required Setup

### Step 1: Install Required Package

```bash
cd "c:\Users\om\OneDrive\Documents\Mini Project\server"
npm install @google/generative-ai nodemailer
```

### Step 2: Get Google Gemini API Key

1. **Visit Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. **Copy** the generated API key

### Step 3: Configure Environment Variables

Edit `server/.env` file and add your Gemini API key:

```env
# Google Gemini AI Configuration
GEMINI_API_KEY=your_actual_api_key_here

# Deadline Alert Service
ENABLE_DEADLINE_ALERTS=true

# Email Alerts (Optional)
EMAIL_ALERTS_ENABLED=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

**Important**: Replace `your_actual_api_key_here` with the API key you got from Google AI Studio.

### Step 4: (Optional) Enable Email Alerts

If you want to receive email notifications for deadlines:

1. **Use Gmail** (or configure another SMTP service)
2. **Enable 2-Factor Authentication** on your Google account
3. **Create an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and generate password
4. **Update .env**:
   ```env
   EMAIL_ALERTS_ENABLED=true
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_character_app_password
   ```

## How It Works

### Real-Time Analysis Flow

```
1. User requests recommendations
   ↓
2. System fetches:
   - All project tasks (status, deadlines, assignments)
   - Recent chat messages (team activity)
   - Project timeline and completion data
   ↓
3. Calculates metrics:
   - Completion percentage
   - Team velocity (tasks/week)
   - Overdue count
   - Time to deadline
   - Estimated completion date
   ↓
4. Sends to Gemini AI:
   - Project context
   - Team metrics
   - Recent communication
   - Current risks
   ↓
5. Gemini generates:
   - Summary of project status
   - Next 3-5 steps to take
   - Risk analysis with severity levels
   - Deadline alerts for urgent tasks
   - Team assignment suggestions
   - Process improvements
   - Timeline prediction
   ↓
6. Returns structured JSON response
```

### Deadline Alert Flow

```
Every 6 hours:
1. Check all incomplete tasks
2. Find tasks due within 48 hours
3. Categorize by urgency:
   - Overdue (CRITICAL)
   - Due in 24h (CRITICAL)
   - Due in 48h (HIGH)
4. Group by project
5. Log to console
6. (Optional) Send emails to team leads
```

## API Endpoints

### 1. Get Project Recommendations
```http
GET /api/projects/:projectId/recommendations
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "recommendations": {
    "summary": "Project is 45% complete and on track...",
    "nextSteps": [
      "Complete AI integration task due in 2 days",
      "Assign 3 unassigned tasks to team members",
      "Focus on critical path tasks for deadline"
    ],
    "risks": [
      {
        "risk": "2 tasks are overdue",
        "severity": "HIGH",
        "mitigation": "Re-evaluate deadlines or increase capacity"
      }
    ],
    "deadlineAlerts": [
      {
        "task": "Build AI service",
        "deadline": "2025-11-19",
        "daysRemaining": 2,
        "urgency": "HIGH",
        "assignedTo": "username"
      }
    ],
    "teamSuggestions": [...],
    "processImprovements": [...],
    "timelinePrediction": {
      "onTrack": true,
      "estimatedCompletion": "Estimated 14 days...",
      "confidence": "MEDIUM",
      "reasoning": "Current velocity suggests on-time completion"
    },
    "metrics": {
      "totalTasks": 20,
      "completedTasks": 9,
      "completionPercentage": 45,
      "weeklyVelocity": 3,
      "overdueTasks": 2,
      "daysToDeadline": 30,
      "estimatedDaysToComplete": 25
    }
  },
  "aiEnabled": true,
  "generatedAt": "2025-11-17T..."
}
```

### 2. Get Personal Recommendations
```http
GET /api/projects/:projectId/my-recommendations
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "recommendations": {
    "personalStats": {
      "totalAssigned": 5,
      "completed": 2,
      "inProgress": 1,
      "todo": 2,
      "overdue": 0
    },
    "recommendedTasks": [
      {
        "title": "Integrate AI service",
        "deadline": "2025-11-19",
        "urgency": "HIGH",
        "daysToDeadline": 2
      }
    ],
    "alerts": [],
    "suggestion": "Focus on \"Integrate AI service\" - HIGH priority"
  }
}
```

## Testing the System

### 1. Start the Server
```bash
cd server
node server.js
```

You should see:
```
✅ Server listening on port 5000
✅ Connected to MongoDB
🚀 Starting Deadline Alert Service...
✅ Deadline Alert Service started (checking every 360 minutes)
```

### 2. Test Recommendations Endpoint

```bash
# Get your auth token first (login)
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"your@email.com\",\"password\":\"yourpassword\"}"

# Use the token to get recommendations
curl -X GET http://localhost:5000/api/projects/<projectId>/recommendations -H "Authorization: Bearer <your_token>"
```

### 3. Check Deadline Alerts

Look for console output every 6 hours:
```
🔍 Checking for approaching deadlines...
⚠️ Found 5 tasks with approaching or overdue deadlines

📊 Project: Test Project Alpha (TEST123)
   - Overdue: 1
   - Due in 24h: 2
   - Due in 48h: 2

📢 DEADLINE ALERT:
Project: Test Project Alpha

🚨 OVERDUE TASKS:
   - "Fix security bug" (12h overdue) - username

⏰ DUE IN 24 HOURS:
   - "Build AI service" (18h remaining) - username
```

## Fallback Behavior

**If Gemini API is not configured** or unavailable:
- System automatically falls back to rule-based recommendations
- Still provides next steps, risks, and deadline alerts
- Uses project metrics and heuristics
- No AI-generated insights, but fully functional

## What Makes This Real-Time?

1. **Live Data**: Fetches current tasks, deadlines, and chat messages from database
2. **Calculated Metrics**: Computes velocity, completion rates on-the-fly
3. **Dynamic Analysis**: Gemini analyzes fresh data every request
4. **No Hardcoding**: All recommendations based on actual project state
5. **Continuous Monitoring**: Deadline alerts check every 6 hours automatically

## Monitoring and Logs

### Recommendation Logs
```
✅ Generating recommendations for project: 673a...
📊 Metrics: 20 tasks, 45% complete, velocity: 3 tasks/week
🤖 Sending context to Gemini AI...
✅ Received AI recommendations
```

### Alert Service Logs
```
🔍 Checking for approaching deadlines...
⚠️ Found 5 tasks with approaching or overdue deadlines
📢 DEADLINE ALERT: [details]
✅ Email alert sent to team@example.com
```

## Customization

### Adjust Alert Frequency
Edit `server/services/deadlineAlerts.js`:
```javascript
this.checkInterval = 6 * 60 * 60 * 1000; // 6 hours
// Change to: 1 * 60 * 60 * 1000 for hourly checks
```

### Modify Alert Thresholds
```javascript
// Currently alerts for tasks due within 48 hours
const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
// Change to 7 days: + 7 * 24 * 60 * 60 * 1000
```

### Customize Gemini Prompt
Edit `server/utils/geminiAI.js` → `generateRecommendations()` method to modify the AI prompt.

## Troubleshooting

### "AI recommendations not working"
- Check if GEMINI_API_KEY is set in .env
- Verify API key is valid at https://makersuite.google.com/
- Check console for errors
- System will fallback to rule-based if Gemini fails

### "No deadline alerts appearing"
- Ensure ENABLE_DEADLINE_ALERTS=true in .env
- Check if you have tasks with deadlines in next 48 hours
- View console logs for alert activity
- Service runs every 6 hours by default

### "Email alerts not sending"
- Verify EMAIL_ALERTS_ENABLED=true
- Check EMAIL_USER and EMAIL_PASS are correct
- Ensure using Gmail App Password (not regular password)
- Check Gmail security settings

## Next Steps

1. **Install packages**: `npm install @google/generative-ai nodemailer`
2. **Get Gemini API key**: https://makersuite.google.com/app/apikey
3. **Update .env** with your API key
4. **Restart server**: `node server.js`
5. **Test recommendations**: Access dashboard and view AI recommendations
6. **Monitor alerts**: Check console for deadline notifications

## Support

If you need help:
- Check console logs for errors
- Verify environment variables are set
- Test with a project that has tasks with deadlines
- Ensure MongoDB is running
- Check that Gemini API key is valid

---

**Your AI recommendation system is now ready! 🚀**

The system will provide real-time, intelligent recommendations based on actual project data, not hardcoded values.
