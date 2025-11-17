#!/usr/bin/env python3
"""
Direct test of the weekly report functionality without HTTP server.
"""

import sys
sys.path.append('/home/abhishek/chat-analysis-service')

from main import analyze_user_contributions, ChatMessage
from datetime import datetime, timedelta
import json

# Generate test messages
def generate_test_messages():
    base_time = datetime.now() - timedelta(days=7)
    
    messages = [
        ChatMessage(username="Alice", text="I've set up the authentication module using JWT. Need to implement refresh tokens next."),
        ChatMessage(username="Bob", text="Great! I'll work on the database schema for user profiles."),
        ChatMessage(username="Charlie", text="Sounds good team!"),
        ChatMessage(username="Alice", text="Completed the refresh token implementation. Also added rate limiting to prevent brute force attacks."),
        ChatMessage(username="Bob", text="Database schema is ready. Created tables for users, sessions, and audit logs with proper indexes."),
        ChatMessage(username="David", text="I'm working on the API documentation. Should we use OpenAPI 3.0?"),
        ChatMessage(username="Alice", text="Yes, OpenAPI 3.0 is perfect. Make sure to document all endpoints with examples."),
        ChatMessage(username="Eve", text="Hi everyone!"),
        ChatMessage(username="Frank", text="I'm getting an error when trying to connect to the database. Connection timeout."),
        ChatMessage(username="Bob", text="Check your connection string. Make sure the host and port are correct."),
        ChatMessage(username="Alice", text="Also verify that your IP is whitelisted in the database firewall rules."),
        ChatMessage(username="Frank", text="Fixed it! Was a firewall issue. Thanks Alice and Bob!"),
        ChatMessage(username="David", text="API documentation is 70% complete. Added interactive examples for authentication endpoints."),
        ChatMessage(username="Alice", text="I've opened a pull request for the authentication module. Please review when you can."),
        ChatMessage(username="Bob", text="Reviewing your PR now. The code looks clean and well-structured."),
    ]
    
    return messages

print("\n🚀 TESTING WEEKLY REPORT ANALYSIS (Direct)")
print("="*100)

messages = generate_test_messages()
print(f"✓ Generated {len(messages)} test messages")

print(f"✓ Analyzing contributions...")
contributions = analyze_user_contributions(messages)

print(f"\n{'🏆 CONTRIBUTION ANALYSIS':-<100}")
print(f"  {'Rank':<6} {'Username':<15} {'Tech Score':<12} {'Code Msgs':<12} {'Problems':<12} {'Helped':<10} {'Quality':<10} {'Active':<8}")
print(f"  {'-'*98}")

for i, c in enumerate(contributions, 1):
    active_icon = "✅" if c.is_active_contributor else "❌"
    quality_icon = "🌟" if c.contribution_quality == "High" else "⭐" if c.contribution_quality == "Medium" else "💫"
    
    print(f"  {i:<6} {c.username:<15} {c.technical_contribution_score:<12.2f} "
          f"{c.code_related_messages:<12} {c.problem_solving_count:<12} "
          f"{c.help_given_count:<10} {quality_icon} {c.contribution_quality:<7} {active_icon}")
    
    if c.technical_keywords_used:
        keywords = ', '.join(c.technical_keywords_used[:5])
        print(f"         └─ Keywords: {keywords}")

print(f"\n{'='*100}")
print("✅ Analysis complete!\n")
