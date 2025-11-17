# Chat Analysis Service - Weekly Mentor Reports

An intelligent chat analysis system that uses NLP to analyze project group chats and generate comprehensive weekly reports for mentors.

## Features

✨ **Advanced NLP Analysis**
- Identifies technical vs casual conversations
- Detects problem-solving activities
- Recognizes helping behavior
- Analyzes sentiment and team morale

🎯 **Smart Contribution Scoring**
- Technical contribution metrics (0-100 score)
- Quality classification (High/Medium/Low)
- Active contributor identification
- Multi-factor analysis (not just message count)

📊 **Weekly Mentor Reports**
- Comprehensive activity summaries
- Ranked contributor lists
- Key technical discussions
- Project momentum assessment
- Actionable recommendations

## API Endpoints

### 1. Health Check
```bash
GET /
```

### 2. Basic Chat Analysis
```bash
POST /analyze
```
Returns overall sentiment, keywords, and AI summary.

### 3. User Participation Ranking
```bash
POST /analyze_users
```
Ranks users by participation with detailed metrics.

### 4. **Weekly Mentor Report** (Main Feature)
```bash
POST /weekly_report
```
Generates comprehensive weekly report with:
- Who is actually working vs just chatting
- Technical contribution scores
- Problem-solving activities
- Team collaboration metrics
- Actionable insights for mentors

## Installation

1. **Setup Virtual Environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Download spaCy Model**
```bash
python -m spacy download en_core_web_sm
```

## Usage

### Start the Server
```bash
python main.py
```

The server will run on `http://localhost:8000`

### Generate Weekly Report

**Option 1: Using the test script**
```bash
python test_weekly_report.py
```

**Option 2: Using curl**
```bash
curl -X POST http://localhost:8000/weekly_report \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "username": "Alice",
        "text": "Completed the authentication module with JWT implementation",
        "timestamp": "2025-11-17T10:00:00"
      },
      {
        "username": "Bob",
        "text": "Great work! I reviewed the code and it looks solid.",
        "timestamp": "2025-11-17T11:00:00"
      }
    ]
  }'
```

**Option 3: Interactive API Docs**
Visit `http://localhost:8000/docs` for Swagger UI

## How It Works

### 1. Message Classification
The system uses NLP to classify each message:
- **Technical**: Contains code, implementation, or project-specific keywords
- **Problem-Solving**: Discusses issues, bugs, or solutions
- **Helping**: Offers assistance or completes tasks
- **Question**: Asks for help or clarification

### 2. Contribution Scoring
Each user gets a technical contribution score (0-100) based on:
- **50%**: Technical message ratio
- **30%**: Problem-solving activities
- **20%**: Helping others

### 3. Quality Assessment
- **High Quality (70-100)**: Active technical contributor
- **Medium Quality (40-69)**: Moderate contribution
- **Low Quality (0-39)**: Minimal technical input

### 4. Recommendations
The system generates actionable recommendations:
- Identifies inactive users
- Highlights collaboration issues
- Detects team sentiment problems
- Suggests areas for improvement

## Example Report Output

```
================================================================================
📊 WEEKLY MENTOR REPORT - Week of November 17, 2025
================================================================================

📈 OVERVIEW
  Total Messages: 38
  Total Participants: 7
  Overall Sentiment: 0.456 😊
  Project Momentum: Strong 🔥

📝 ACTIVITY SUMMARY
  This week, the team exchanged 38 messages with 7 participants. Technical 
  discussions accounted for 68% of conversations. Top contributors: Alice, 
  Bob, David. Project momentum is strong with positive team sentiment.

🏆 TOP CONTRIBUTORS (Ranked by Technical Contribution)
  Rank   Name            Tech Score   Code Msgs    Problems Solved  Helped Others   Quality    Active
  --------------------------------------------------------------------------------------------------
  1      Alice           82.45        9            3                4               🌟 High    ✅
  2      Bob             74.32        8            2                3               🌟 High    ✅
  3      David           61.20        6            1                1               ⭐ Medium  ✅

💡 MENTOR RECOMMENDATIONS
  • Good collaboration! Alice, Bob actively helping others.
  • Positive team sentiment detected! Team morale seems high.
  • Team is performing well. Continue current practices.
```

## Data Model

### ChatMessage
```python
{
  "username": str,
  "text": str,
  "timestamp": str (optional, ISO format)
}
```

### WeeklyMentorReport
```python
{
  "report_period": str,
  "total_messages": int,
  "total_participants": int,
  "overall_sentiment": float,
  "project_momentum": str,  # "Strong", "Moderate", "Weak"
  "top_contributors": List[ContributionMetrics],
  "key_discussions": List[str],
  "technical_topics": List[str],
  "recommendations": List[str],
  "activity_summary": str
}
```

## Integration Guide

### Collecting Chat Data
Integrate with your chat platform (Slack, Discord, WhatsApp, etc.) to collect messages:

```python
messages = []
for chat_msg in your_chat_platform.get_messages(days=7):
    messages.append({
        "username": chat_msg.author,
        "text": chat_msg.content,
        "timestamp": chat_msg.created_at.isoformat()
    })

# Send to analysis API
response = requests.post(
    "http://localhost:8000/weekly_report",
    json={"messages": messages}
)
report = response.json()
```

### Automated Weekly Reports
Use a cron job or scheduler to generate reports automatically:

```bash
# Run every Sunday at 6 PM
0 18 * * 0 /path/to/venv/bin/python /path/to/generate_report.py
```

## Technical Stack

- **FastAPI**: High-performance web framework
- **spaCy**: Advanced NLP for text analysis
- **VADER**: Sentiment analysis
- **Transformers**: AI-powered summarization
- **PyTorch**: Machine learning backend

## Contributing

Feel free to enhance the system:
- Add more sophisticated NLP models
- Improve contribution scoring algorithms
- Add visualization features
- Create integrations with popular chat platforms

## License

MIT License - feel free to use for your projects!

## Support

For issues or questions, please check the API documentation at `/docs` or review the example scripts.

---

**Built with ❤️ using AI and NLP**
