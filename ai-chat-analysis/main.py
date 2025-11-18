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

# Import CSV for loading synthetic data
import csv
import os
from pathlib import Path

# Import re for pattern matching
import re

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
    tasks_completed: int  # New field
    blockers_reported: int  # New field
    progress_updates: int  # New field
    collaboration_score: float  # New field (0-100)

# --- 4. Load AI Models (Global variables) ---
# These models are loaded once when the app starts.

# Load the VADER sentiment analyzer
sia = SentimentIntensityAnalyzer()

# Load the 'en_core_web_sm' spaCy model
nlp = spacy.load("en_core_web_sm")

# Load the 'summarization' pipeline from transformers
# Commented out for faster startup - using simple summarization instead
# summarizer = pipeline("summarization", model="t5-small")
summarizer = None  # Will use simple text truncation

# --- Helper Functions for Advanced Analysis ---

# Global variables for trained patterns
TRAINED_PATTERNS = {
    'task_completion': [],
    'blockers': [],
    'progress_updates': [],
    'collaboration': []
}

# Statistics from training data
TRAINING_STATS = {
    'total_messages': 0,
    'avg_message_length': 0,
    'common_patterns': {},
    'user_activity_distribution': {}
}

def load_synthetic_data(csv_path: str = "synthetic_chats.csv") -> List[ChatMessage]:
    """
    Load synthetic chat data from CSV file for training.
    Returns list of ChatMessage objects.
    """
    messages = []
    csv_file = Path(__file__).parent / csv_path
    
    if not csv_file.exists():
        print(f"Warning: CSV file not found at {csv_file}")
        return messages
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                messages.append(ChatMessage(
                    username=row['sender_username'],
                    text=row['text'],
                    timestamp=row.get('timestamp')
                ))
        print(f"✅ Loaded {len(messages)} messages from {csv_path}")
    except Exception as e:
        print(f"Error loading CSV: {e}")
    
    return messages

def train_on_synthetic_data():
    """
    Train pattern recognition on synthetic data.
    Identifies common patterns for task completion, blockers, progress updates, etc.
    """
    global TRAINED_PATTERNS, TRAINING_STATS
    
    print("🎓 Training on synthetic data...")
    messages = load_synthetic_data()
    
    if not messages:
        print("⚠️  No training data available")
        return
    
    # Update training stats
    TRAINING_STATS['total_messages'] = len(messages)
    word_counts = [len(msg.text.split()) for msg in messages]
    TRAINING_STATS['avg_message_length'] = sum(word_counts) / len(word_counts)
    
    # Extract patterns using NLP
    task_completion_patterns = []
    blocker_patterns = []
    progress_patterns = []
    collaboration_patterns = []
    
    # Common technical terms distribution
    all_text = " ".join([msg.text for msg in messages[:1000]])  # Sample for performance
    doc = nlp(all_text)
    
    # Extract common patterns
    for msg in messages[:500]:  # Sample for training
        text_lower = msg.text.lower()
        
        # Task completion indicators
        if any(word in text_lower for word in ['completed', 'finished', 'done', 'merged', 'deployed', 'ready']):
            task_completion_patterns.append(text_lower)
        
        # Blocker indicators
        if any(word in text_lower for word in ['blocked', 'stuck', 'issue', 'problem', 'error', 'crash', 'fail']):
            blocker_patterns.append(text_lower)
        
        # Progress indicators
        if any(word in text_lower for word in ['working on', 'started', 'in progress', 'update', 'pushed']):
            progress_patterns.append(text_lower)
        
        # Collaboration indicators
        if any(word in text_lower for word in ['help', 'review', 'check', 'thanks', 'lgtm', 'looks good']):
            collaboration_patterns.append(text_lower)
    
    # Store patterns
    TRAINED_PATTERNS['task_completion'] = task_completion_patterns[:50]
    TRAINED_PATTERNS['blockers'] = blocker_patterns[:50]
    TRAINED_PATTERNS['progress_updates'] = progress_patterns[:50]
    TRAINED_PATTERNS['collaboration'] = collaboration_patterns[:50]
    
    # Extract common keywords
    keywords = [token.lemma_.lower() for token in doc if not token.is_stop and not token.is_punct and token.is_alpha]
    TRAINING_STATS['common_patterns'] = dict(Counter(keywords).most_common(30))
    
    # User activity distribution
    user_message_counts = Counter([msg.username for msg in messages])
    TRAINING_STATS['user_activity_distribution'] = dict(user_message_counts.most_common(20))
    
    print(f"✅ Training complete!")
    print(f"   - Task completion patterns: {len(TRAINED_PATTERNS['task_completion'])}")
    print(f"   - Blocker patterns: {len(TRAINED_PATTERNS['blockers'])}")
    print(f"   - Progress patterns: {len(TRAINED_PATTERNS['progress_updates'])}")
    print(f"   - Collaboration patterns: {len(TRAINED_PATTERNS['collaboration'])}")
    print(f"   - Common keywords tracked: {len(TRAINING_STATS['common_patterns'])}")

def enhanced_message_classification(text: str, doc) -> Dict:
    """
    Enhanced classification using trained patterns.
    """
    text_lower = text.lower()
    
    # Use trained patterns for better classification
    task_completion_score = sum(1 for pattern in TRAINED_PATTERNS['task_completion'] 
                                if any(word in text_lower for word in pattern.split()[:3]))
    
    blocker_score = sum(1 for pattern in TRAINED_PATTERNS['blockers'] 
                       if any(word in text_lower for word in pattern.split()[:3]))
    
    progress_score = sum(1 for pattern in TRAINED_PATTERNS['progress_updates'] 
                        if any(word in text_lower for word in pattern.split()[:3]))
    
    collaboration_score = sum(1 for pattern in TRAINED_PATTERNS['collaboration'] 
                             if any(word in text_lower for word in pattern.split()[:3]))
    
    # Original classification
    base_classification = classify_message_type(text, doc)
    
    # Enhanced with training
    base_classification['task_completed'] = task_completion_score > 0
    base_classification['has_blocker'] = blocker_score > 0
    base_classification['progress_update'] = progress_score > 0
    base_classification['collaboration'] = collaboration_score > 0
    
    return base_classification

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
    Deeply analyze each user's contributions using NLP and trained patterns.
    """
    user_data = defaultdict(lambda: {
        'messages': [],
        'technical_count': 0,
        'problem_solving_count': 0,
        'help_given_count': 0,
        'question_count': 0,
        'tasks_completed': 0,
        'blockers_reported': 0,
        'progress_updates': 0,
        'word_counts': [],
        'technical_keywords': set()
    })
    
    # Analyze each message with enhanced classification
    for msg in messages:
        doc = nlp(msg.text)
        classification = enhanced_message_classification(msg.text, doc)
        
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
        
        # Enhanced metrics from training
        if classification.get('task_completed'):
            user_data[msg.username]['tasks_completed'] += 1
        
        if classification.get('has_blocker'):
            user_data[msg.username]['blockers_reported'] += 1
        
        if classification.get('progress_update'):
            user_data[msg.username]['progress_updates'] += 1
    
    # Calculate metrics for each user
    contributions = []
    
    for username, data in user_data.items():
        total_messages = len(data['messages'])
        
        # Enhanced technical contribution score (0-100)
        technical_ratio = data['technical_count'] / total_messages if total_messages > 0 else 0
        problem_solving_ratio = data['problem_solving_count'] / total_messages if total_messages > 0 else 0
        help_ratio = data['help_given_count'] / total_messages if total_messages > 0 else 0
        completion_ratio = data['tasks_completed'] / total_messages if total_messages > 0 else 0
        
        # Weighted score with completion bonus
        technical_score = (
            (technical_ratio * 40) +  # 40% weight on technical content
            (problem_solving_ratio * 25) +  # 25% weight on problem solving
            (help_ratio * 15) +  # 15% weight on helping others
            (completion_ratio * 20)  # 20% weight on task completion
        )
        
        avg_msg_length = sum(data['word_counts']) / len(data['word_counts']) if data['word_counts'] else 0
        
        # Determine if user is an active contributor
        is_active = (
            data['tasks_completed'] >= 1 or  # Completed at least 1 task
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

# --- Startup Event: Train on synthetic data ---
@app.on_event("startup")
async def startup_event():
    """
    Run training on synthetic data when the service starts.
    """
    print("🚀 Starting AI Chat Analysis Service...")
    train_on_synthetic_data()
    print("✅ Service ready!")

# --- 6. API Endpoints ---

# Create a GET endpoint at '/' for a health check
# It should return a simple JSON object: {"status": "ok"}
@app.get("/")
def health_check():
    return {
        "status": "ok",
        "trained": len(TRAINED_PATTERNS['task_completion']) > 0,
        "training_messages": TRAINING_STATS.get('total_messages', 0)
    }

# Add endpoint to get training statistics
@app.get("/training_stats")
def get_training_stats():
    """
    Returns statistics about the trained model.
    """
    return {
        "total_training_messages": TRAINING_STATS.get('total_messages', 0),
        "avg_message_length": round(TRAINING_STATS.get('avg_message_length', 0), 2),
        "patterns_learned": {
            "task_completion": len(TRAINED_PATTERNS['task_completion']),
            "blockers": len(TRAINED_PATTERNS['blockers']),
            "progress_updates": len(TRAINED_PATTERNS['progress_updates']),
            "collaboration": len(TRAINED_PATTERNS['collaboration'])
        },
        "top_keywords": list(TRAINING_STATS.get('common_patterns', {}).keys())[:15],
        "active_users_in_training": len(TRAINING_STATS.get('user_activity_distribution', {}))
    }

# Add endpoint to manually retrain
@app.post("/retrain")
def retrain_model():
    """
    Manually trigger retraining on synthetic data.
    """
    train_on_synthetic_data()
    return {
        "status": "retrained",
        "training_messages": TRAINING_STATS.get('total_messages', 0)
    }

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

    # 4. Summarization (Simple - faster than Transformers)
    # Use simple text summarization instead of AI model
    if summarizer and len(full_text.split()) > 30:
        summary_result = summarizer(full_text, max_length=100, min_length=25, do_sample=False)
        ai_summary = summary_result[0]['summary_text']
    else:
        # Simple summarization: first 200 chars
        ai_summary = full_text[:200] + "..." if len(full_text) > 200 else full_text

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
    Generate a comprehensive weekly report for mentors using trained AI models.
    Analyzes who is actually working vs just chatting, identifies key discussions,
    tracks task completion, and provides actionable insights.
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
            activity_summary="No messages received this week.",
            tasks_completed=0,
            blockers_reported=0,
            progress_updates=0,
            collaboration_score=0.0
        )
    
    # Analyze user contributions with enhanced trained patterns
    contributions = analyze_user_contributions(data.messages)
    
    # Calculate overall sentiment
    full_text = " ".join([msg.text for msg in data.messages])
    overall_sentiment = sia.polarity_scores(full_text)['compound']
    
    # Track task completion, blockers, and progress using trained patterns
    tasks_completed = 0
    blockers_reported = 0
    progress_updates = 0
    collaboration_count = 0
    
    for msg in data.messages:
        doc = nlp(msg.text)
        classification = enhanced_message_classification(msg.text, doc)
        
        if classification.get('task_completed'):
            tasks_completed += 1
        if classification.get('has_blocker'):
            blockers_reported += 1
        if classification.get('progress_update'):
            progress_updates += 1
        if classification.get('collaboration'):
            collaboration_count += 1
    
    # Calculate collaboration score (0-100)
    collaboration_score = min(100, (collaboration_count / len(data.messages)) * 200)
    
    # Extract key technical topics using NLP
    doc = nlp(full_text)
    
    # Extract nouns and proper nouns as potential topics
    topics = []
    for chunk in doc.noun_chunks:
        if len(chunk.text.split()) <= 3 and chunk.text.lower() not in ['team', 'everyone', 'anyone', 'someone']:
            topics.append(chunk.text)
    
    # Count topic frequency and filter using trained patterns
    topic_counter = Counter(topics)
    technical_topics = []
    
    for topic, count in topic_counter.most_common(15):
        # Check if topic appears in training data common patterns
        topic_lower = topic.lower()
        if count >= 2 or topic_lower in TRAINING_STATS.get('common_patterns', {}):
            technical_topics.append(topic)
    
    technical_topics = technical_topics[:10]
    
    # Identify key discussions with enhanced pattern matching
    key_discussions = []
    important_keywords = [
        'complete', 'finish', 'implement', 'deploy', 'ready', 'done', 
        'issue', 'problem', 'solution', 'merged', 'pushed', 'reviewed',
        'blocked', 'stuck', 'error', 'working on', 'started'
    ]
    
    for msg in data.messages:
        msg_lower = msg.text.lower()
        # Check against important keywords and trained patterns
        if any(keyword in msg_lower for keyword in important_keywords):
            if len(msg.text) > 20:  # Meaningful length
                discussion_text = f"{msg.username}: {msg.text[:120]}..." if len(msg.text) > 120 else f"{msg.username}: {msg.text}"
                key_discussions.append(discussion_text)
    
    # Limit to top 8 key discussions
    key_discussions = key_discussions[:8]
    
    # Determine project momentum using trained insights
    active_contributors = [c for c in contributions if c.is_active_contributor]
    technical_message_ratio = sum(c.code_related_messages for c in contributions) / len(data.messages)
    completion_rate = tasks_completed / len(data.messages) if len(data.messages) > 0 else 0
    
    # Enhanced momentum calculation
    if technical_message_ratio >= 0.5 and len(active_contributors) >= 3 and tasks_completed >= 5:
        momentum = "Strong"
    elif (technical_message_ratio >= 0.3 or len(active_contributors) >= 2) and tasks_completed >= 2:
        momentum = "Moderate"
    else:
        momentum = "Weak"
    
    # Generate AI-powered recommendations based on training insights
    recommendations = []
    
    # Task completion analysis
    if tasks_completed == 0:
        recommendations.append("⚠️ No task completions detected this week. Team may need help with execution or clearer milestones.")
    elif tasks_completed < 3:
        recommendations.append(f"📊 Only {tasks_completed} task(s) completed. Consider reviewing workload distribution and blockers.")
    else:
        recommendations.append(f"✅ Good progress! {tasks_completed} task(s) completed this week.")
    
    # Blocker analysis
    if blockers_reported > 5:
        recommendations.append(f"🚧 {blockers_reported} blockers reported. Schedule a team sync to resolve impediments.")
    elif blockers_reported > 0:
        recommendations.append(f"⚠️ {blockers_reported} blocker(s) identified. Monitor resolution progress.")
    
    # Collaboration analysis
    if collaboration_score < 30:
        recommendations.append("🤝 Low collaboration detected. Encourage more peer reviews and team discussions.")
    elif collaboration_score > 60:
        recommendations.append(f"🌟 Excellent collaboration! Team is actively helping each other (score: {collaboration_score:.0f}/100).")
    
    # Check for inactive users
    inactive_users = [c.username for c in contributions if not c.is_active_contributor and c.code_related_messages == 0]
    if inactive_users and len(inactive_users) <= 5:
        recommendations.append(f"👥 Limited contribution from: {', '.join(inactive_users[:3])}. Follow up on their progress.")
    elif len(inactive_users) > 5:
        recommendations.append(f"👥 {len(inactive_users)} team members show minimal technical activity. Review task assignments.")
    
    # Check sentiment with context
    if overall_sentiment < -0.2:
        recommendations.append("😟 Team sentiment is negative. May indicate frustration, blockers, or low morale. Consider a team check-in.")
    elif overall_sentiment < 0:
        recommendations.append("😐 Team sentiment is slightly negative. Monitor for emerging issues.")
    elif overall_sentiment > 0.3:
        recommendations.append("😊 Positive team sentiment! Morale is high - great sign for productivity.")
    
    # Activity level analysis compared to training baseline
    avg_training_msgs = TRAINING_STATS.get('total_messages', 100) / 7  # Rough weekly average
    if len(data.messages) < avg_training_msgs * 0.3:
        recommendations.append(f"📉 Communication volume ({len(data.messages)} msgs) is below expected baseline. Encourage daily standups.")
    elif len(data.messages) > avg_training_msgs * 2:
        recommendations.append(f"📈 High communication volume ({len(data.messages)} msgs). Team is actively engaged!")
    
    # Progress update analysis
    if progress_updates < len(data.messages) * 0.1:
        recommendations.append("📝 Few progress updates detected. Encourage team to share status updates regularly.")
    
    # Technical topic diversity
    if len(technical_topics) < 3:
        recommendations.append("🔍 Limited technical topic diversity. Team may be focused on narrow scope or need more varied work.")
    
    # Default positive message if no issues
    if not recommendations:
        recommendations.append("✨ Team is performing well across all metrics. Maintain current practices!")
    
    # Generate comprehensive AI summary using training insights
    summary_parts = []
    
    # Opening statement
    summary_parts.append(f"This week, the team exchanged {len(data.messages)} messages with {len(contributions)} active participants.")
    
    # Technical activity
    tech_percentage = int(technical_message_ratio * 100)
    summary_parts.append(f"Technical discussions accounted for {tech_percentage}% of all conversations.")
    
    # Task completion
    if tasks_completed > 0:
        summary_parts.append(f"The team completed {tasks_completed} task(s) and reported {blockers_reported} blocker(s).")
    
    # Top contributors with specific contributions
    if active_contributors:
        top_3_names = [c.username for c in active_contributors[:3]]
        summary_parts.append(f"Top contributors: {', '.join(top_3_names)}.")
        
        # Highlight best contributor's metrics
        if active_contributors[0].technical_contribution_score > 50:
            best = active_contributors[0]
            summary_parts.append(
                f"{best.username} led with {best.code_related_messages} technical messages "
                f"and {best.help_given_count} helpful interactions."
            )
    
    # Momentum assessment
    summary_parts.append(
        f"Project momentum is {momentum.lower()} with "
        f"{'positive' if overall_sentiment > 0.1 else 'neutral' if overall_sentiment > -0.1 else 'concerning'} "
        f"team sentiment ({overall_sentiment:.2f})."
    )
    
    # Collaboration insight
    if collaboration_score > 50:
        summary_parts.append(f"Strong collaboration observed (score: {collaboration_score:.0f}/100).")
    
    # Areas of focus (technical topics)
    if technical_topics:
        summary_parts.append(f"Main focus areas: {', '.join(technical_topics[:5])}.")
    
    activity_summary = " ".join(summary_parts)
    
    # Determine report period with timestamp
    report_period = f"Week of {datetime.now().strftime('%B %d, %Y')}"
    
    return WeeklyMentorReport(
        report_period=report_period,
        total_messages=len(data.messages),
        total_participants=len(contributions),
        overall_sentiment=round(overall_sentiment, 3),
        project_momentum=momentum,
        top_contributors=contributions[:5],  # Top 5 contributors
        key_discussions=key_discussions,
        technical_topics=technical_topics,
        recommendations=recommendations,
        activity_summary=activity_summary,
        tasks_completed=tasks_completed,
        blockers_reported=blockers_reported,
        progress_updates=progress_updates,
        collaboration_score=round(collaboration_score, 2)
    )

# --- 8. Uvicorn run command ---
# This block allows running the app directly with 'python main.py'
# However, for development, 'uvicorn main:app --reload' is better.
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
