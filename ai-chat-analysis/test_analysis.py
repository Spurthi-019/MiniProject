#!/usr/bin/env python3
"""
Test script to analyze the project chat messages and rank users by participation.
"""

import requests
import json
from test_chat_data import test_messages

# API endpoint
BASE_URL = "http://localhost:8000"

def analyze_overall_chat():
    """Analyze overall chat sentiment and keywords"""
    print("=" * 80)
    print("OVERALL CHAT ANALYSIS")
    print("=" * 80)
    
    payload = {"messages": test_messages}
    
    try:
        response = requests.post(f"{BASE_URL}/analyze", json=payload)
        response.raise_for_status()
        result = response.json()
        
        print(f"\n📊 Overall Sentiment Score: {result['overall_sentiment']:.3f}")
        sentiment_label = "Positive" if result['overall_sentiment'] > 0 else "Negative" if result['overall_sentiment'] < 0 else "Neutral"
        print(f"   ({sentiment_label})")
        
        print(f"\n🔑 Top Keywords:")
        for i, keyword in enumerate(result['top_keywords'], 1):
            print(f"   {i}. {keyword}")
        
        print(f"\n📝 AI Summary:")
        print(f"   {result['ai_summary']}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        print("Make sure the server is running: python main.py")

def analyze_user_participation():
    """Analyze and rank users by participation"""
    print("\n" + "=" * 80)
    print("USER PARTICIPATION RANKING")
    print("=" * 80)
    
    payload = {"messages": test_messages}
    
    try:
        response = requests.post(f"{BASE_URL}/analyze_users", json=payload)
        response.raise_for_status()
        result = response.json()
        
        print(f"\n📈 Total Messages: {result['total_messages']}")
        print(f"👥 Total Users: {result['total_users']}")
        print(f"🏆 Most Active User: {result['most_active_user']}")
        print(f"⭐ Top 3 Contributors: {', '.join(result['top_contributors'])}")
        
        print(f"\n{'='*80}")
        print(f"{'Rank':<6} {'Username':<15} {'Messages':<12} {'Words':<10} {'Sentiment':<12} {'Score':<10}")
        print(f"{'='*80}")
        
        for user in result['user_rankings']:
            sentiment_emoji = "😊" if user['avg_sentiment'] > 0.1 else "😐" if user['avg_sentiment'] > -0.1 else "😟"
            print(f"{user['rank']:<6} {user['username']:<15} {user['message_count']:<12} {user['word_count']:<10} "
                  f"{sentiment_emoji} {user['avg_sentiment']:<9.3f} {user['participation_score']:<10.2f}")
        
        print(f"{'='*80}")
        
        # Additional insights
        print(f"\n💡 INSIGHTS:")
        top_user = result['user_rankings'][0]
        print(f"   • {top_user['username']} is leading with {top_user['message_count']} messages "
              f"and {top_user['word_count']} words!")
        
        avg_messages = result['total_messages'] / result['total_users']
        print(f"   • Average messages per user: {avg_messages:.1f}")
        
        # Find users above and below average
        above_avg = [u['username'] for u in result['user_rankings'] if u['message_count'] > avg_messages]
        print(f"   • Users above average activity: {', '.join(above_avg)}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        print("Make sure the server is running: python main.py")

def main():
    print("\n🚀 CHAT ANALYSIS SERVICE TEST")
    print(f"📝 Analyzing {len(test_messages)} messages from project discussion...\n")
    
    # Test overall analysis
    analyze_overall_chat()
    
    # Test user participation ranking
    analyze_user_participation()
    
    print("\n✅ Analysis complete!\n")

if __name__ == "__main__":
    main()
