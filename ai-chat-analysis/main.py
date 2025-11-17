# Python script: main.py
# This file creates an AI analysis service for project group chats.

# --- 1. All Necessary Imports ---
# Import FastAPI and Uvicorn
from fastapi import FastAPI
import uvicorn

# Import BaseModel and List from Pydantic
from pydantic import BaseModel
from typing import List

# Import SentimentIntensityAnalyzer from vaderSentiment.sentiment
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Import spacy
import spacy

# Import pipeline from transformers
from transformers import pipeline

# Import Counter from collections
from collections import Counter, defaultdict

# Import warnings to ignore specific transformer warnings
import warnings

# Import datetime for weekly report tracking
from datetime import datetime, timedelta
from typing import Dict, Optional

# --- 2. Suppress Warnings ---
# Suppress the specific transformers warning about model length
warnings.filterwarnings("ignore", message=".*sequence length is longer than.*")



# --- 3. Pydantic Data Models (Define API data shape) ---

# Create a Pydantic model 'ChatMessage'
# It should have two fields: 'username' (a string) and 'text' (a string)
class ChatMessage(BaseModel):
    username: str
    text: str
    timestamp: Optional[str] = None  # ISO format timestamp

# Create a Pydantic model 'AnalysisInput'
# It should have one field: 'messages' (a List of ChatMessage models)
class AnalysisInput(BaseModel):
    messages: List[ChatMessage]

# Create a Pydantic model 'WeeklyReport' (this will be our output)
# It should have:
# 'overall_sentiment' (a float)
# 'top_keywords' (a List of strings)
# 'ai_summary' (a string)
class WeeklyReport(BaseModel):
    overall_sentiment: float
    top_keywords: List[str]
    ai_summary: str

# Create a Pydantic model for individual user statistics
class UserStats(BaseModel):
    username: str
    message_count: int
    word_count: int
    avg_sentiment: float
    participation_score: float
    rank: int

# Create a Pydantic model for user ranking report
class UserRankingReport(BaseModel):
    total_messages: int
    total_users: int
    user_rankings: List[UserStats]
    most_active_user: str
    top_contributors: List[str]

# New models for advanced analysis
class ContributionMetrics(BaseModel):
    username: str
    technical_contribution_score: float
    code_related_messages: int
    problem_solving_count: int
    help_given_count: int
    question_count: int
    avg_message_length: float
    technical_keywords_used: List[str]
    contribution_quality: str  # "High", "Medium", "Low"
    is_active_contributor: bool
    
class WeeklyMentorReport(BaseModel):
    report_period: str
    total_messages: int
    total_participants: int
    overall_sentiment: float
    project_momentum: str  # "Strong", "Moderate", "Weak"
    top_contributors: List[ContributionMetrics]
    key_discussions: List[str]
    technical_topics: List[str]
    recommendations: List[str]
    activity_summary: str

# --- 4. Load AI Models (Global variables) ---
# These models are loaded once when the app starts.

# Load the VADER sentiment analyzer
sia = SentimentIntensityAnalyzer()

# Load the 'en_core_web_sm' spaCy model
nlp = spacy.load("en_core_web_sm")

# Load the 'summarization' pipeline from transformers
# Use the 't5-small' model, which is a good balance of size and performance
summarizer = pipeline("summarization", model="t5-small")

# --- Helper Functions for Advanced Analysis ---

def classify_message_type(text: str, doc) -> Dict[str, bool]:
    """
    Classify message type using NLP analysis.
    Returns dict with boolean flags for different message types.
    """
    text_lower = text.lower()
    
    # Technical keywords indicating actual work
    technical_keywords = [
        'code', 'function', 'class', 'method', 'api', 'endpoint', 'database', 
        'query', 'bug', 'fix', 'implement', 'deploy', 'test', 'error', 'debug',
        'pull request', 'commit', 'merge', 'branch', 'review', 'algorithm',
        'optimize', 'refactor', 'module', 'component', 'feature', 'schema',
        'migration', 'authentication', 'authorization', 'frontend', 'backend',
        'server', 'client', 'framework', 'library', 'package', 'dependency',
        'build', 'compile', 'run', 'execute', 'configuration', 'setup'
    ]
    
    # Problem-solving indicators
    problem_solving = [
        'issue', 'problem', 'solution', 'fix', 'resolve', 'debug', 'error',
        'crash', 'fail', 'work', 'broken', 'stuck', 'help', 'solve'
    ]
    
    # Helping indicators
    helping_phrases = [
        "i'll help", "let me", "i can", "sure", "i'll review", "i'll check",
        "i'll fix", "i'll do", "i've done", "completed", "finished", "ready"
    ]
    
    # Question indicators
    question_words = ['how', 'what', 'why', 'when', 'where', 'which', 'can', 'should', 'could']
    
    is_technical = any(keyword in text_lower for keyword in technical_keywords)
    is_problem_solving = any(word in text_lower for word in problem_solving)
    is_helping = any(phrase in text_lower for phrase in helping_phrases)
    is_question = text.strip().endswith('?') or any(text_lower.startswith(q) for q in question_words)
    
    # Extract technical keywords actually used
    used_keywords = [kw for kw in technical_keywords if kw in text_lower]
    
    return {
        'is_technical': is_technical,
        'is_problem_solving': is_problem_solving,
        'is_helping': is_helping,
        'is_question': is_question,
        'technical_keywords': used_keywords
    }

def calculate_contribution_quality(metrics: Dict) -> str:
    """
    Determine contribution quality based on metrics.
    """
    score = metrics['technical_score']
    
    if score >= 70:
        return "High"
    elif score >= 40:
        return "Medium"
    else:
        return "Low"

def analyze_user_contributions(messages: List[ChatMessage]) -> List[ContributionMetrics]:
    """
    Deeply analyze each user's contributions using NLP.
    """
    user_data = defaultdict(lambda: {
        'messages': [],
        'technical_count': 0,
        'problem_solving_count': 0,
        'help_given_count': 0,
        'question_count': 0,
        'word_counts': [],
        'technical_keywords': set()
    })
    
    # Analyze each message
    for msg in messages:
        doc = nlp(msg.text)
        classification = classify_message_type(msg.text, doc)
        
        user_data[msg.username]['messages'].append(msg.text)
        user_data[msg.username]['word_counts'].append(len(msg.text.split()))
        
        if classification['is_technical']:
            user_data[msg.username]['technical_count'] += 1
            user_data[msg.username]['technical_keywords'].update(classification['technical_keywords'])
        
        if classification['is_problem_solving']:
            user_data[msg.username]['problem_solving_count'] += 1
        
        if classification['is_helping']:
            user_data[msg.username]['help_given_count'] += 1
        
        if classification['is_question']:
            user_data[msg.username]['question_count'] += 1
    
    # Calculate metrics for each user
    contributions = []
    
    for username, data in user_data.items():
        total_messages = len(data['messages'])
        
        # Technical contribution score (0-100)
        technical_ratio = data['technical_count'] / total_messages if total_messages > 0 else 0
        problem_solving_ratio = data['problem_solving_count'] / total_messages if total_messages > 0 else 0
        help_ratio = data['help_given_count'] / total_messages if total_messages > 0 else 0
        
        # Weighted score
        technical_score = (
            (technical_ratio * 50) +  # 50% weight on technical content
            (problem_solving_ratio * 30) +  # 30% weight on problem solving
            (help_ratio * 20)  # 20% weight on helping others
        )
        
        avg_msg_length = sum(data['word_counts']) / len(data['word_counts']) if data['word_counts'] else 0
        
        # Determine if user is an active contributor (not just chatting)
        is_active = (
            data['technical_count'] >= 2 or  # At least 2 technical messages
            (technical_ratio >= 0.3 and total_messages >= 3)  # Or 30% technical with 3+ messages
        )
        
        contribution_quality = calculate_contribution_quality({'technical_score': technical_score})
        
        contributions.append(ContributionMetrics(
            username=username,
            technical_contribution_score=round(technical_score, 2),
            code_related_messages=data['technical_count'],
            problem_solving_count=data['problem_solving_count'],
            help_given_count=data['help_given_count'],
            question_count=data['question_count'],
            avg_message_length=round(avg_msg_length, 1),
            technical_keywords_used=list(data['technical_keywords'])[:10],  # Top 10
            contribution_quality=contribution_quality,
            is_active_contributor=is_active
        ))
    
    # Sort by technical contribution score
    contributions.sort(key=lambda x: x.technical_contribution_score, reverse=True)
    
    return contributions

# --- 5. Create FastAPI App ---
# Create the main FastAPI application instance
app = FastAPI()

# --- 6. API Endpoints ---

# Create a GET endpoint at '/' for a health check
# It should return a simple JSON object: {"status": "ok"}
@app.get("/")
def health_check():
    return {"status": "ok"}

# Create a POST endpoint at '/analyze'
# It will accept 'AnalysisInput' data
# It will return a 'WeeklyReport'
@app.post("/analyze", response_model=WeeklyReport)
def analyze_chat(data: AnalysisInput):
    # --- 7. Analysis Logic (Inside the endpoint) ---

    # 1. Combine all message texts into one single block of text
    full_text = " ".join([msg.text for msg in data.messages])

    # Handle edge case: if no text is provided, return a default report
    if not full_text.strip():
        return WeeklyReport(
            overall_sentiment=0.0,
            top_keywords=[],
            ai_summary="No messages to analyze."
        )

    # 2. Sentiment Analysis (VADER)
    # Get the 'compound' score from VADER's polarity_scores
    sentiment_score = sia.polarity_scores(full_text)['compound']

    # 3. Keyword Extraction (spaCy)
    # Process the full text with the spaCy model
    doc = nlp(full_text)

    # Create a list of keywords:
    # A token is a keyword if it's not a stop word,
    # not punctuation, and is an alphabetical character.
    # Use the lowercase lemma (root form) of the word.
    keywords = [
        token.lemma_.lower() 
        for token in doc 
        if not token.is_stop and not token.is_punct and token.is_alpha
    ]
    
    # Use Counter to find the 5 most common keywords
    top_keywords = [word for word, count in Counter(keywords).most_common(5)]

    # 4. Summarization (Transformers)
    # Generate a summary. Set max_length to 100 and min_length to 25.
    # Ensure text is not too short for the summarizer
    if len(full_text.split()) > 30:
        summary_result = summarizer(full_text, max_length=100, min_length=25, do_sample=False)
        ai_summary = summary_result[0]['summary_text']
    else:
        ai_summary = full_text[:200]  # Use first 200 chars if text is too short

    # 5. Return the final report
    return WeeklyReport(
        overall_sentiment=sentiment_score,
        top_keywords=top_keywords,
        ai_summary=ai_summary
    )

# Create a POST endpoint at '/analyze_users' to rank users by participation
@app.post("/analyze_users", response_model=UserRankingReport)
def analyze_user_participation(data: AnalysisInput):
    """
    Analyze and rank users based on their participation in the chat.
    Considers message count, word count, and sentiment to calculate participation score.
    """
    
    if not data.messages:
        return UserRankingReport(
            total_messages=0,
            total_users=0,
            user_rankings=[],
            most_active_user="None",
            top_contributors=[]
        )
    
    # Group messages by user
    user_messages = {}
    for msg in data.messages:
        if msg.username not in user_messages:
            user_messages[msg.username] = []
        user_messages[msg.username].append(msg.text)
    
    # Calculate statistics for each user
    user_stats_list = []
    
    for username, messages in user_messages.items():
        message_count = len(messages)
        
        # Calculate word count
        word_count = sum(len(msg.split()) for msg in messages)
        
        # Calculate average sentiment for this user
        user_text = " ".join(messages)
        avg_sentiment = sia.polarity_scores(user_text)['compound']
        
        # Calculate participation score
        # Formula: (message_count * 10) + (word_count * 0.5) + (positive sentiment bonus)
        sentiment_bonus = max(0, avg_sentiment * 20)  # 0-20 bonus for positive sentiment
        participation_score = (message_count * 10) + (word_count * 0.5) + sentiment_bonus
        
        user_stats_list.append({
            "username": username,
            "message_count": message_count,
            "word_count": word_count,
            "avg_sentiment": round(avg_sentiment, 3),
            "participation_score": round(participation_score, 2)
        })
    
    # Sort by participation score (descending)
    user_stats_list.sort(key=lambda x: x["participation_score"], reverse=True)
    
    # Add rank to each user
    ranked_users = []
    for rank, stats in enumerate(user_stats_list, start=1):
        ranked_users.append(UserStats(
            username=stats["username"],
            message_count=stats["message_count"],
            word_count=stats["word_count"],
            avg_sentiment=stats["avg_sentiment"],
            participation_score=stats["participation_score"],
            rank=rank
        ))
    
    # Identify most active user and top 3 contributors
    most_active = ranked_users[0].username if ranked_users else "None"
    top_contributors = [user.username for user in ranked_users[:3]]
    
    return UserRankingReport(
        total_messages=len(data.messages),
        total_users=len(user_messages),
        user_rankings=ranked_users,
        most_active_user=most_active,
        top_contributors=top_contributors
    )

# Create a POST endpoint for weekly mentor report
@app.post("/weekly_report", response_model=WeeklyMentorReport)
def generate_weekly_mentor_report(data: AnalysisInput):
    """
    Generate a comprehensive weekly report for mentors.
    Analyzes who is actually working vs just chatting, identifies key discussions,
    and provides actionable insights.
    """
    
    if not data.messages:
        return WeeklyMentorReport(
            report_period="No data",
            total_messages=0,
            total_participants=0,
            overall_sentiment=0.0,
            project_momentum="Weak",
            top_contributors=[],
            key_discussions=[],
            technical_topics=[],
            recommendations=["No activity to analyze"],
            activity_summary="No messages received this week."
        )
    
    # Analyze user contributions
    contributions = analyze_user_contributions(data.messages)
    
    # Calculate overall sentiment
    full_text = " ".join([msg.text for msg in data.messages])
    overall_sentiment = sia.polarity_scores(full_text)['compound']
    
    # Extract key technical topics using NLP
    doc = nlp(full_text)
    
    # Extract nouns and proper nouns as potential topics
    topics = []
    for chunk in doc.noun_chunks:
        if len(chunk.text.split()) <= 3 and chunk.text.lower() not in ['team', 'everyone', 'anyone']:
            topics.append(chunk.text)
    
    # Count topic frequency
    topic_counter = Counter(topics)
    technical_topics = [topic for topic, count in topic_counter.most_common(10) if count >= 2]
    
    # Identify key discussions (sentences with high information content)
    key_discussions = []
    important_keywords = ['complete', 'finish', 'implement', 'deploy', 'ready', 'done', 'issue', 'problem', 'solution']
    
    for msg in data.messages:
        if any(keyword in msg.text.lower() for keyword in important_keywords):
            if len(msg.text) > 30:  # Meaningful length
                key_discussions.append(f"{msg.username}: {msg.text[:100]}..." if len(msg.text) > 100 else f"{msg.username}: {msg.text}")
    
    # Limit to top 5 key discussions
    key_discussions = key_discussions[:5]
    
    # Determine project momentum
    active_contributors = [c for c in contributions if c.is_active_contributor]
    technical_message_ratio = sum(c.code_related_messages for c in contributions) / len(data.messages)
    
    if technical_message_ratio >= 0.5 and len(active_contributors) >= 3:
        momentum = "Strong"
    elif technical_message_ratio >= 0.3 or len(active_contributors) >= 2:
        momentum = "Moderate"
    else:
        momentum = "Weak"
    
    # Generate recommendations
    recommendations = []
    
    # Check for inactive users
    inactive_users = [c.username for c in contributions if not c.is_active_contributor and c.code_related_messages == 0]
    if inactive_users:
        recommendations.append(f"Users with minimal technical contribution: {', '.join(inactive_users[:3])}. Consider checking their progress.")
    
    # Check if there are enough problem solvers
    problem_solvers = [c for c in contributions if c.problem_solving_count >= 2]
    if len(problem_solvers) < 2:
        recommendations.append("Limited problem-solving activity detected. Team may need more troubleshooting support.")
    
    # Check for collaboration
    helpers = [c for c in contributions if c.help_given_count >= 2]
    if len(helpers) >= 2:
        recommendations.append(f"Good collaboration! {', '.join([h.username for h in helpers[:3]])} actively helping others.")
    else:
        recommendations.append("Limited peer support observed. Encourage more team collaboration.")
    
    # Check sentiment
    if overall_sentiment < -0.1:
        recommendations.append("Team sentiment is somewhat negative. May indicate frustration or blockers.")
    elif overall_sentiment > 0.3:
        recommendations.append("Positive team sentiment detected! Team morale seems high.")
    
    # Check activity level
    if len(data.messages) < 20:
        recommendations.append("Communication volume is low. Encourage more status updates and discussions.")
    
    if not recommendations:
        recommendations.append("Team is performing well. Continue current practices.")
    
    # Generate activity summary using AI
    summary_text = f"This week, the team exchanged {len(data.messages)} messages with {len(contributions)} participants. "
    summary_text += f"Technical discussions accounted for {int(technical_message_ratio * 100)}% of conversations. "
    
    if active_contributors:
        top_3 = [c.username for c in active_contributors[:3]]
        summary_text += f"Top contributors: {', '.join(top_3)}. "
    
    summary_text += f"Project momentum is {momentum.lower()} with "
    summary_text += f"{'positive' if overall_sentiment > 0.1 else 'neutral' if overall_sentiment > -0.1 else 'concerning'} team sentiment."
    
    # Determine report period
    report_period = f"Week of {datetime.now().strftime('%B %d, %Y')}"
    
    return WeeklyMentorReport(
        report_period=report_period,
        total_messages=len(data.messages),
        total_participants=len(contributions),
        overall_sentiment=round(overall_sentiment, 3),
        project_momentum=momentum,
        top_contributors=contributions[:5],  # Top 5 contributors
        key_discussions=key_discussions,
        technical_topics=technical_topics[:8],
        recommendations=recommendations,
        activity_summary=summary_text
    )

# --- 8. Uvicorn run command ---
# This block allows running the app directly with 'python main.py'
# However, for development, 'uvicorn main:app --reload' is better.
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
