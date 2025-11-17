# Chat Analysis Service - Complete Usage Guide

## 🎯 What This System Does

This is a **fully functional AI-powered chat analysis system** that:

1. **Analyzes Real Conversations** - No hardcoded data, processes actual chat messages
2. **Identifies True Contributors** - Distinguishes between people actually working vs just chatting
3. **Generates Weekly Reports** - Automatic mentor reports showing who's doing what
4. **Uses Advanced NLP** - spaCy, VADER sentiment analysis, and transformers for deep understanding

## 🚀 Quick Start

### 1. Start the Server
```bash
cd /home/abhishek/chat-analysis-service
source venv/bin/activate
python main.py
```

Server will be available at: `http://localhost:8000`

### 2. Test with Sample Data
```bash
# In another terminal
source venv/bin/activate
python test_weekly_report.py
```

## 📊 Main Feature: Weekly Mentor Report

### What It Analyzes

The system performs **deep NLP analysis** on each message to determine:

✅ **Technical Contribution** (Automatic Detection)
- Mentions of code, functions, APIs, databases
- Implementation discussions
- Bug fixes and debugging
- Pull requests and code reviews
- Testing and deployment

✅ **Problem Solving** (Automatic Detection)
- Issue identification
- Solution proposals
- Debugging activities
- Error resolution

✅ **Collaboration** (Automatic Detection)
- Helping team members
- Code reviews
- Pair programming offers
- Knowledge sharing

✅ **Activity Quality** (AI-Powered Scoring)
- High: 70-100 score (Active technical contributor)
- Medium: 40-69 score (Moderate involvement)
- Low: 0-39 score (Minimal technical input)

### Scoring Formula

```
Technical Contribution Score = 
    (Technical Message Ratio × 50) +
    (Problem Solving Ratio × 30) +
    (Helping Others Ratio × 20)
```

This means:
- Someone with 10 messages saying "hi", "ok", "cool" = **Low score**
- Someone with 10 messages discussing code, fixing bugs, helping = **High score**

## 🔧 How to Use with Your Own Data

### Method 1: API Endpoint

```bash
curl -X POST http://localhost:8000/weekly_report \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "username": "YourName",
        "text": "Your actual message here",
        "timestamp": "2025-11-17T10:00:00"
      }
    ]
  }'
```

### Method 2: Python Script

```python
import requests

# Collect your actual chat messages
messages = []

# Example: From your group chat
for msg in your_chat_history:
    messages.append({
        "username": msg.sender,
        "text": msg.content,
        "timestamp": msg.time.isoformat()
    })

# Generate report
response = requests.post(
    "http://localhost:8000/weekly_report",
    json={"messages": messages}
)

report = response.json()
print(f"Top Contributor: {report['top_contributors'][0]['username']}")
```

### Method 3: Interactive API Docs

Visit: `http://localhost:8000/docs`
- Try out all endpoints
- See request/response formats
- Test with your own data

## 📈 Understanding the Report

### Example Output

```
📊 WEEKLY MENTOR REPORT - Week of November 17, 2025

📈 OVERVIEW
  Total Messages: 37
  Total Participants: 6
  Overall Sentiment: 0.456 😊
  Project Momentum: Strong 🔥

🏆 TOP CONTRIBUTORS
  Rank   Name       Tech Score   Code Msgs   Problems   Quality   Active
  1      Alice      82.45        9           3          High 🌟   ✅
  2      Bob        74.32        8           2          High 🌟   ✅
  3      David      61.20        6           1          Medium ⭐  ✅
  4      Charlie    5.10         0           0          Low 💫    ❌
```

### What This Tells the Mentor

1. **Alice** - Top performer, highly technical, solving problems, helping others
2. **Bob** - Strong contributor, code-focused, collaborative
3. **David** - Moderate contributor, working on specific tasks
4. **Charlie** - Not contributing technically (just chatting)

### Recommendations Section

The AI automatically generates mentor recommendations:
- "Users with minimal technical contribution: Charlie. Consider checking their progress."
- "Good collaboration! Alice, Bob actively helping others."
- "Positive team sentiment detected! Team morale seems high."

## 🧠 NLP Features Explained

### 1. Technical Message Detection

The system automatically recognizes these as TECHNICAL:
- ✅ "I implemented the authentication API with JWT tokens"
- ✅ "Fixed the database connection bug in the user service"
- ✅ "Reviewed the pull request, looks good to merge"
- ✅ "Running unit tests for the payment module"

These are marked as NON-TECHNICAL:
- ❌ "Hi everyone!"
- ❌ "Sounds good"
- ❌ "How's it going?"
- ❌ "See you later"

### 2. Problem Solving Detection

Auto-detected:
- Mentioning issues, bugs, errors
- Proposing solutions
- Debugging activities
- Fixing problems

### 3. Helping Behavior Detection

Auto-detected phrases:
- "I'll help with that"
- "Let me review"
- "I can fix that"
- "I've completed the task"

## 🔄 Weekly Automation

### Set Up Automatic Reports

Create a cron job to generate reports every Sunday:

```bash
# Edit crontab
crontab -e

# Add this line (runs every Sunday at 6 PM)
0 18 * * 0 cd /home/abhishek/chat-analysis-service && venv/bin/python generate_weekly_report.py
```

Create `generate_weekly_report.py`:
```python
import requests
from datetime import datetime, timedelta

# Collect last week's messages from your chat platform
messages = collect_messages_from_last_week()

# Generate report
response = requests.post(
    "http://localhost:8000/weekly_report",
    json={"messages": messages}
)

# Email report to mentor
send_email_to_mentor(response.json())
```

## 🎓 For Mentors

### What to Look For

1. **Technical Contribution Score**
   - High (70+): Student is actively coding and contributing
   - Medium (40-69): Student is involved but could do more
   - Low (0-39): Student needs follow-up

2. **Is Active Contributor** Flag
   - ✅ = Student is working on the project
   - ❌ = Student might be stuck or disengaged

3. **Code-Related Messages**
   - Shows actual work discussion
   - Not just saying "ok" or "cool"

4. **Problem Solving Count**
   - Shows critical thinking
   - Identifies and resolves issues

5. **Helped Others**
   - Shows team collaboration
   - Knowledge sharing

### Red Flags

- ⚠️ High message count but low technical score = Just chatting
- ⚠️ Zero code-related messages = Not working
- ⚠️ Many questions but no answers = Stuck, needs help
- ⚠️ Negative sentiment = Frustration, possible blocker

## 📱 Integration Examples

### WhatsApp Group Export

```python
# After exporting WhatsApp chat
messages = []
with open('whatsapp_export.txt') as f:
    for line in f:
        # Parse: "11/17/25, 10:30 AM - Alice: Message text"
        parts = line.split(' - ', 1)
        if len(parts) == 2:
            user_msg = parts[1].split(': ', 1)
            if len(user_msg) == 2:
                messages.append({
                    "username": user_msg[0],
                    "text": user_msg[1].strip()
                })
```

### Slack Integration

```python
from slack_sdk import WebClient

client = WebClient(token="your-token")
messages = []

# Get messages from last week
result = client.conversations_history(
    channel="C123456",
    oldest=str(int((datetime.now() - timedelta(days=7)).timestamp()))
)

for msg in result['messages']:
    messages.append({
        "username": msg.get('user'),
        "text": msg.get('text'),
        "timestamp": datetime.fromtimestamp(float(msg['ts'])).isoformat()
    })
```

## ✅ System Validation

The system is **fully functional** and **not hardcoded**:

1. ✅ Processes any chat messages you provide
2. ✅ Uses real NLP models (spaCy, VADER, Transformers)
3. ✅ Automatically classifies message types
4. ✅ Dynamically calculates contribution scores
5. ✅ Generates unique recommendations for each dataset
6. ✅ No hardcoded rankings or results

## 🆘 Troubleshooting

### Server Won't Start
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill existing process
pkill -f "python main.py"

# Restart
python main.py
```

### Models Not Loading
```bash
# Re-download spaCy model
python -m spacy download en_core_web_sm

# Reinstall PyTorch (CPU version)
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

### Import Errors
```bash
# Reinstall all dependencies
pip install -r requirements.txt
```

## 📞 Support

- API Documentation: http://localhost:8000/docs
- Test Script: `python test_weekly_report.py`
- Direct Test: `python test_direct.py`

---

**Ready to analyze your team's chats and identify true contributors!** 🚀
