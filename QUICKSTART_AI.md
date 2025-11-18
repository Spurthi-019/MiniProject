# 🚀 Quick Start: Real-Time AI Recommendations

## What You Need to Do

### 1. Get Google Gemini API Key (FREE) 🆓

**Visit**: https://makersuite.google.com/app/apikey

1. Sign in with your Google account
2. Click **"Create API Key"** or **"Get API Key"**
3. Copy the API key (looks like: `AIzaSyA...`)

### 2. Add API Key to .env File

Open `server/.env` and replace the placeholder:

```env
GEMINI_API_KEY=AIzaSyA_your_actual_api_key_here
```

**Important**: Use YOUR actual API key from step 1!

### 3. Restart the Server

```bash
cd server
node server.js
```

You should see:
```
✅ Server listening on port 5000
✅ Connected to MongoDB
🚀 Starting Deadline Alert Service...
```

### 4. Test the System

```bash
# In a new terminal:
cd server
node testRecommendations.js
```

You'll see detailed AI recommendations based on your project data!

## That's It! 🎉

Your real-time AI recommendation system is now active. 

## What It Does

✅ **Analyzes** project progress in real-time  
✅ **Monitors** task deadlines and alerts team members  
✅ **Recommends** next steps based on current progress  
✅ **Predicts** if project will finish on time  
✅ **Identifies** risks and blockers automatically  
✅ **Suggests** task assignments and workload distribution  

## API Endpoints Ready to Use

### Get Project Recommendations
```
GET /api/projects/:projectId/recommendations
```

### Get Personal Task Recommendations
```
GET /api/projects/:projectId/my-recommendations
```

## Optional: Enable Email Alerts 📧

If you want deadline alerts via email:

1. Enable 2FA on your Gmail account
2. Create App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:
   ```env
   EMAIL_ALERTS_ENABLED=true
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_char_app_password
   ```

## Need Help?

Read the full guide: `REALTIME_AI_SETUP.md`

---

**Note**: The system works WITHOUT Gemini API key (uses rule-based fallback), but AI recommendations are much better with Gemini enabled! 🤖
