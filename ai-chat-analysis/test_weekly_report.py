#!/usr/bin/env python3
"""
Test the weekly mentor report endpoint with realistic project chat data.
"""

import requests
import json
from datetime import datetime, timedelta

# Generate realistic project chat data
def generate_project_chats():
    """Generate realistic project discussion messages with timestamps"""
    base_time = datetime.now() - timedelta(days=7)
    
    messages = []
    
    # Day 1 - Project kickoff
    messages.extend([
        {"username": "Alice", "text": "I've set up the authentication module using JWT. Need to implement refresh tokens next.", "timestamp": (base_time + timedelta(hours=1)).isoformat()},
        {"username": "Bob", "text": "Great! I'll work on the database schema for user profiles.", "timestamp": (base_time + timedelta(hours=2)).isoformat()},
        {"username": "Charlie", "text": "Sounds good team!", "timestamp": (base_time + timedelta(hours=2, minutes=15)).isoformat()},
    ])
    
    # Day 2 - Active development
    messages.extend([
        {"username": "Alice", "text": "Completed the refresh token implementation. Also added rate limiting to prevent brute force attacks.", "timestamp": (base_time + timedelta(days=1, hours=10)).isoformat()},
        {"username": "Bob", "text": "Database schema is ready. Created tables for users, sessions, and audit logs with proper indexes.", "timestamp": (base_time + timedelta(days=1, hours=11)).isoformat()},
        {"username": "David", "text": "I'm working on the API documentation. Should we use OpenAPI 3.0?", "timestamp": (base_time + timedelta(days=1, hours=12)).isoformat()},
        {"username": "Alice", "text": "Yes, OpenAPI 3.0 is perfect. Make sure to document all endpoints with examples.", "timestamp": (base_time + timedelta(days=1, hours=12, minutes=30)).isoformat()},
        {"username": "Eve", "text": "Hi everyone!", "timestamp": (base_time + timedelta(days=1, hours=14)).isoformat()},
    ])
    
    # Day 3 - Problem solving
    messages.extend([
        {"username": "Frank", "text": "I'm getting an error when trying to connect to the database. Connection timeout.", "timestamp": (base_time + timedelta(days=2, hours=9)).isoformat()},
        {"username": "Bob", "text": "Check your connection string. Make sure the host and port are correct.", "timestamp": (base_time + timedelta(days=2, hours=9, minutes=15)).isoformat()},
        {"username": "Alice", "text": "Also verify that your IP is whitelisted in the database firewall rules.", "timestamp": (base_time + timedelta(days=2, hours=9, minutes=20)).isoformat()},
        {"username": "Frank", "text": "Fixed it! Was a firewall issue. Thanks Alice and Bob!", "timestamp": (base_time + timedelta(days=2, hours=9, minutes=45)).isoformat()},
        {"username": "David", "text": "API documentation is 70% complete. Added interactive examples for authentication endpoints.", "timestamp": (base_time + timedelta(days=2, hours=15)).isoformat()},
    ])
    
    # Day 4 - Code reviews and testing
    messages.extend([
        {"username": "Alice", "text": "I've opened a pull request for the authentication module. Please review when you can.", "timestamp": (base_time + timedelta(days=3, hours=10)).isoformat()},
        {"username": "Bob", "text": "Reviewing your PR now. The code looks clean and well-structured.", "timestamp": (base_time + timedelta(days=3, hours=11)).isoformat()},
        {"username": "Bob", "text": "Left some comments about error handling in edge cases. Otherwise looks great!", "timestamp": (base_time + timedelta(days=3, hours=11, minutes=30)).isoformat()},
        {"username": "Alice", "text": "Thanks for the review! Addressing the comments now with better error handling.", "timestamp": (base_time + timedelta(days=3, hours=12)).isoformat()},
        {"username": "Charlie", "text": "How's it going?", "timestamp": (base_time + timedelta(days=3, hours=14)).isoformat()},
        {"username": "Eve", "text": "Good progress!", "timestamp": (base_time + timedelta(days=3, hours=14, minutes=10)).isoformat()},
    ])
    
    # Day 5 - Integration and deployment
    messages.extend([
        {"username": "Alice", "text": "Updated the PR with your suggestions. Added comprehensive unit tests covering edge cases.", "timestamp": (base_time + timedelta(days=4, hours=9)).isoformat()},
        {"username": "Bob", "text": "Perfect! Approving the PR now. Great work on the tests.", "timestamp": (base_time + timedelta(days=4, hours=10)).isoformat()},
        {"username": "David", "text": "Finished the API documentation. All endpoints are documented with request/response examples.", "timestamp": (base_time + timedelta(days=4, hours=11)).isoformat()},
        {"username": "Alice", "text": "Merged the authentication module to main. Setting up CI/CD pipeline next.", "timestamp": (base_time + timedelta(days=4, hours=14)).isoformat()},
        {"username": "Frank", "text": "Working on the frontend login form. Integrating with the new auth API.", "timestamp": (base_time + timedelta(days=4, hours=15)).isoformat()},
    ])
    
    # Day 6 - Testing and bug fixes
    messages.extend([
        {"username": "Frank", "text": "Frontend authentication is working! Login and logout flows are smooth.", "timestamp": (base_time + timedelta(days=5, hours=10)).isoformat()},
        {"username": "Alice", "text": "CI/CD pipeline is configured. Automated tests run on every commit and auto-deploy on merge.", "timestamp": (base_time + timedelta(days=5, hours=11)).isoformat()},
        {"username": "Bob", "text": "Found a bug in the session management. Working on a fix.", "timestamp": (base_time + timedelta(days=5, hours=13)).isoformat()},
        {"username": "Alice", "text": "Let me know if you need help debugging. I can pair program if needed.", "timestamp": (base_time + timedelta(days=5, hours=13, minutes=15)).isoformat()},
        {"username": "Bob", "text": "Thanks Alice! Fixed the session bug. Was a race condition in concurrent requests.", "timestamp": (base_time + timedelta(days=5, hours=15)).isoformat()},
        {"username": "Charlie", "text": "Great teamwork everyone!", "timestamp": (base_time + timedelta(days=5, hours=16)).isoformat()},
    ])
    
    # Day 7 - Final integration
    messages.extend([
        {"username": "Alice", "text": "Deployed to staging environment. Everything is running smoothly.", "timestamp": (base_time + timedelta(days=6, hours=10)).isoformat()},
        {"username": "David", "text": "Tested all API endpoints in staging. Everything works as documented.", "timestamp": (base_time + timedelta(days=6, hours=11)).isoformat()},
        {"username": "Frank", "text": "Frontend integration testing complete. UI is responsive and user-friendly.", "timestamp": (base_time + timedelta(days=6, hours=12)).isoformat()},
        {"username": "Bob", "text": "Database performance looks excellent. Query response times are under 50ms.", "timestamp": (base_time + timedelta(days=6, hours=13)).isoformat()},
        {"username": "Alice", "text": "Excellent work team! We completed all tasks for this sprint ahead of schedule.", "timestamp": (base_time + timedelta(days=6, hours=14)).isoformat()},
        {"username": "Eve", "text": "Congrats team!", "timestamp": (base_time + timedelta(days=6, hours=14, minutes=30)).isoformat()},
        {"username": "Charlie", "text": "Well done everyone! See you next week.", "timestamp": (base_time + timedelta(days=6, hours=15)).isoformat()},
    ])
    
    return messages

def display_weekly_report(report):
    """Display the weekly report in a formatted way"""
    print("\n" + "="*100)
    print(f"📊 WEEKLY MENTOR REPORT - {report['report_period']}")
    print("="*100)
    
    # Overview Section
    print(f"\n{'📈 OVERVIEW':-<100}")
    print(f"  Total Messages: {report['total_messages']}")
    print(f"  Total Participants: {report['total_participants']}")
    print(f"  Overall Sentiment: {report['overall_sentiment']:.3f} {'😊' if report['overall_sentiment'] > 0.1 else '😐' if report['overall_sentiment'] > -0.1 else '😟'}")
    print(f"  Project Momentum: {report['project_momentum']} {'🔥' if report['project_momentum'] == 'Strong' else '⚡' if report['project_momentum'] == 'Moderate' else '📉'}")
    
    # Activity Summary
    print(f"\n{'📝 ACTIVITY SUMMARY':-<100}")
    print(f"  {report['activity_summary']}")
    
    # Top Contributors
    print(f"\n{'🏆 TOP CONTRIBUTORS (Ranked by Technical Contribution)':-<100}")
    print(f"  {'Rank':<6} {'Name':<15} {'Tech Score':<12} {'Code Msgs':<12} {'Problems Solved':<16} {'Helped Others':<15} {'Quality':<10} {'Active':<8}")
    print(f"  {'-'*98}")
    
    for i, contributor in enumerate(report['top_contributors'], 1):
        active_icon = "✅" if contributor['is_active_contributor'] else "❌"
        quality_icon = "🌟" if contributor['contribution_quality'] == "High" else "⭐" if contributor['contribution_quality'] == "Medium" else "💫"
        
        print(f"  {i:<6} {contributor['username']:<15} {contributor['technical_contribution_score']:<12.2f} "
              f"{contributor['code_related_messages']:<12} {contributor['problem_solving_count']:<16} "
              f"{contributor['help_given_count']:<15} {quality_icon} {contributor['contribution_quality']:<7} {active_icon}")
    
    # Technical Topics
    if report['technical_topics']:
        print(f"\n{'🔧 TECHNICAL TOPICS DISCUSSED':-<100}")
        for topic in report['technical_topics']:
            print(f"  • {topic}")
    
    # Key Discussions
    if report['key_discussions']:
        print(f"\n{'💬 KEY DISCUSSIONS & UPDATES':-<100}")
        for discussion in report['key_discussions']:
            print(f"  • {discussion}")
    
    # Recommendations
    print(f"\n{'💡 MENTOR RECOMMENDATIONS':-<100}")
    for rec in report['recommendations']:
        print(f"  • {rec}")
    
    print(f"\n{'='*100}\n")

def main():
    BASE_URL = "http://localhost:8000"
    
    print("\n🚀 GENERATING WEEKLY MENTOR REPORT")
    print("="*100)
    
    # Generate realistic chat data
    messages = generate_project_chats()
    print(f"✓ Generated {len(messages)} realistic project messages")
    
    # Call the weekly report endpoint
    print(f"✓ Analyzing conversations with advanced NLP...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/weekly_report",
            json={"messages": messages}
        )
        response.raise_for_status()
        report = response.json()
        
        # Display the report
        display_weekly_report(report)
        
        # Show technical keywords for top contributor
        if report['top_contributors']:
            top = report['top_contributors'][0]
            if top['technical_keywords_used']:
                print(f"🔍 Technical Keywords Used by Top Contributor ({top['username']}):")
                print(f"   {', '.join(top['technical_keywords_used'])}\n")
        
        print("✅ Report generation complete!\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to the server.")
        print("   Please make sure the server is running: python main.py\n")
    except Exception as e:
        print(f"\n❌ Error: {e}\n")

if __name__ == "__main__":
    main()
