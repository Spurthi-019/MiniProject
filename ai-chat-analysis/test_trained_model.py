"""
Test the trained AI model with synthetic chat data
"""
import requests
import csv
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000"

def load_sample_messages(count=100):
    """Load sample messages from CSV"""
    messages = []
    with open('synthetic_chats.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if i >= count:
                break
            messages.append({
                "username": row['sender_username'],
                "text": row['text'],
                "timestamp": row['timestamp']
            })
    return messages

def test_health_check():
    """Test health check and training status"""
    print("\n" + "="*60)
    print("🏥 HEALTH CHECK & TRAINING STATUS")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/")
    data = response.json()
    
    print(f"Status: {data['status']}")
    print(f"Trained: {'✅ Yes' if data['trained'] else '❌ No'}")
    print(f"Training messages: {data['training_messages']:,}")
    
    return data['trained']

def test_training_stats():
    """Test training statistics endpoint"""
    print("\n" + "="*60)
    print("📊 TRAINING STATISTICS")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/training_stats")
    data = response.json()
    
    print(f"Total training messages: {data['total_training_messages']:,}")
    print(f"Average message length: {data['avg_message_length']:.1f} words")
    print(f"\nPatterns learned:")
    for pattern_type, count in data['patterns_learned'].items():
        print(f"  - {pattern_type}: {count}")
    
    print(f"\nTop technical keywords:")
    print(f"  {', '.join(data['top_keywords'][:10])}")
    print(f"\nActive users in training data: {data['active_users_in_training']}")

def test_weekly_report(message_count=100):
    """Test weekly mentor report with sample data"""
    print("\n" + "="*60)
    print(f"📋 WEEKLY MENTOR REPORT (analyzing {message_count} messages)")
    print("="*60)
    
    messages = load_sample_messages(message_count)
    
    response = requests.post(
        f"{BASE_URL}/weekly_report",
        json={"messages": messages}
    )
    
    if response.status_code != 200:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        return
    
    data = response.json()
    
    print(f"\n📅 Report Period: {data['report_period']}")
    print(f"📊 Total Messages: {data['total_messages']}")
    print(f"👥 Total Participants: {data['total_participants']}")
    print(f"😊 Overall Sentiment: {data['overall_sentiment']:.3f}")
    print(f"🚀 Project Momentum: {data['project_momentum']}")
    print(f"✅ Tasks Completed: {data['tasks_completed']}")
    print(f"🚧 Blockers Reported: {data['blockers_reported']}")
    print(f"📝 Progress Updates: {data['progress_updates']}")
    print(f"🤝 Collaboration Score: {data['collaboration_score']:.1f}/100")
    
    print(f"\n🏆 TOP CONTRIBUTORS:")
    for i, contributor in enumerate(data['top_contributors'][:3], 1):
        print(f"\n  {i}. {contributor['username']}")
        print(f"     Technical Score: {contributor['technical_contribution_score']:.1f}/100")
        print(f"     Quality: {contributor['contribution_quality']}")
        print(f"     Code Messages: {contributor['code_related_messages']}")
        print(f"     Problem Solving: {contributor['problem_solving_count']}")
        print(f"     Help Given: {contributor['help_given_count']}")
        if contributor['technical_keywords_used']:
            print(f"     Keywords: {', '.join(contributor['technical_keywords_used'][:5])}")
    
    print(f"\n🔑 KEY DISCUSSIONS:")
    for discussion in data['key_discussions'][:5]:
        print(f"  • {discussion}")
    
    print(f"\n🔬 TECHNICAL TOPICS:")
    print(f"  {', '.join(data['technical_topics'][:8])}")
    
    print(f"\n💡 RECOMMENDATIONS:")
    for rec in data['recommendations']:
        print(f"  • {rec}")
    
    print(f"\n📝 ACTIVITY SUMMARY:")
    print(f"  {data['activity_summary']}")

def test_user_ranking(message_count=50):
    """Test user participation ranking"""
    print("\n" + "="*60)
    print(f"👥 USER PARTICIPATION RANKING ({message_count} messages)")
    print("="*60)
    
    messages = load_sample_messages(message_count)
    
    response = requests.post(
        f"{BASE_URL}/analyze_users",
        json={"messages": messages}
    )
    
    data = response.json()
    
    print(f"\nTotal Messages: {data['total_messages']}")
    print(f"Total Users: {data['total_users']}")
    print(f"Most Active: {data['most_active_user']}")
    print(f"\nTop 5 Rankings:")
    
    for user in data['user_rankings'][:5]:
        print(f"\n  #{user['rank']} {user['username']}")
        print(f"     Messages: {user['message_count']}, Words: {user['word_count']}")
        print(f"     Sentiment: {user['avg_sentiment']:.3f}")
        print(f"     Participation Score: {user['participation_score']:.1f}")

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("🧪 TESTING ENHANCED AI CHAT ANALYSIS SERVICE")
    print("="*60)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Test health check
        is_trained = test_health_check()
        
        if not is_trained:
            print("\n❌ Model is not trained! Make sure synthetic_chats.csv exists.")
            return
        
        # Test training stats
        test_training_stats()
        
        # Test weekly report with different sample sizes
        test_weekly_report(message_count=100)
        
        # Test user ranking
        test_user_ranking(message_count=80)
        
        print("\n" + "="*60)
        print("✅ ALL TESTS COMPLETED SUCCESSFULLY!")
        print("="*60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to AI service.")
        print("Make sure the service is running on http://localhost:8000")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_all_tests()
