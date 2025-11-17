# Test chat data for project discussion
# Simulating a real project group chat with 50 messages

test_messages = [
    {"username": "Alice", "text": "Hey team! I've finished the user authentication module. It's ready for review."},
    {"username": "Bob", "text": "Great work Alice! I'll review it this afternoon."},
    {"username": "Charlie", "text": "I'm working on the database schema. Should have it done by EOD."},
    {"username": "Alice", "text": "The authentication uses JWT tokens and includes refresh token functionality."},
    {"username": "David", "text": "Sounds good. Are we using bcrypt for password hashing?"},
    {"username": "Alice", "text": "Yes, bcrypt with salt rounds set to 10. Very secure."},
    {"username": "Eve", "text": "I've deployed the staging environment. Everyone can test there now."},
    {"username": "Bob", "text": "Perfect timing Eve. I'll test the auth module there."},
    {"username": "Charlie", "text": "The database will have users, projects, and tasks tables with proper foreign keys."},
    {"username": "Alice", "text": "Make sure to add indexes on frequently queried columns for better performance."},
    {"username": "Frank", "text": "I'm stuck on the frontend routing. Can someone help?"},
    {"username": "Bob", "text": "Sure Frank, what's the issue? Are you using React Router?"},
    {"username": "Frank", "text": "Yes, but the protected routes aren't working properly."},
    {"username": "Alice", "text": "You need to check for the JWT token in localStorage before rendering protected components."},
    {"username": "Frank", "text": "Ah I see! Let me try that approach. Thanks Alice!"},
    {"username": "Charlie", "text": "Database schema is complete. Pushing to the feature branch now."},
    {"username": "David", "text": "I'll handle the API documentation. Using Swagger for this."},
    {"username": "Eve", "text": "Great! Make sure all endpoints are well documented with examples."},
    {"username": "Bob", "text": "Reviewed Alice's code. Looks excellent! Just minor comments on variable naming."},
    {"username": "Alice", "text": "Thanks Bob! I'll address those comments right away."},
    {"username": "Charlie", "text": "Should we add migrations for the database changes?"},
    {"username": "Alice", "text": "Absolutely. Use Alembic for database migrations. Very important for production."},
    {"username": "David", "text": "API docs are 60% done. Will finish tomorrow."},
    {"username": "Eve", "text": "The CI/CD pipeline is configured. Auto-deploys on merge to main."},
    {"username": "Frank", "text": "Protected routes are working now! Moving on to the dashboard UI."},
    {"username": "Bob", "text": "I'm working on the task management endpoints. CRUD operations for tasks."},
    {"username": "Alice", "text": "Bob, make sure to add proper authorization. Users should only see their own tasks."},
    {"username": "Bob", "text": "Good point Alice. I'll add role-based access control."},
    {"username": "Charlie", "text": "Migration files created. Testing them on local database first."},
    {"username": "David", "text": "Does anyone have preference for API versioning? /v1/ or /api/v1/?"},
    {"username": "Alice", "text": "I prefer /api/v1/ - it's clearer and more standard in the industry."},
    {"username": "Eve", "text": "Agreed with Alice. Let's go with /api/v1/ for consistency."},
    {"username": "Frank", "text": "Dashboard UI is looking great! Added charts for project analytics."},
    {"username": "Bob", "text": "Nice work Frank! Can you add filters by date range?"},
    {"username": "Frank", "text": "Already done! You can filter by today, this week, this month, or custom range."},
    {"username": "Charlie", "text": "Migrations tested successfully. Database schema is solid now."},
    {"username": "Alice", "text": "Excellent progress everyone! We're ahead of schedule."},
    {"username": "David", "text": "API documentation is now complete. Check it out on /docs endpoint."},
    {"username": "Eve", "text": "I've added automated testing to the CI pipeline. Unit and integration tests."},
    {"username": "Bob", "text": "Task endpoints are complete with full RBAC. Ready for testing."},
    {"username": "Alice", "text": "I'll write comprehensive tests for the authentication module tomorrow."},
    {"username": "Frank", "text": "Should we add dark mode to the UI? Users might appreciate it."},
    {"username": "Charlie", "text": "Good idea! Dark mode is very popular nowadays."},
    {"username": "Alice", "text": "Frank, yes please add dark mode. Make it toggleable with saved preference."},
    {"username": "David", "text": "I'm starting work on error handling middleware. Standardized error responses."},
    {"username": "Eve", "text": "Make sure to log all errors to our monitoring service for debugging."},
    {"username": "Bob", "text": "Team, we should schedule a code review session for Friday."},
    {"username": "Alice", "text": "Perfect idea Bob. Friday 2 PM works for me."},
    {"username": "Charlie", "text": "I'm available Friday afternoon. See you all then!"},
    {"username": "Frank", "text": "This has been a really productive week. Great teamwork everyone!"}
]

if __name__ == "__main__":
    print(f"Total messages: {len(test_messages)}")
    
    # Count messages per user
    from collections import Counter
    user_counts = Counter(msg["username"] for msg in test_messages)
    
    print("\nMessages per user:")
    for user, count in user_counts.most_common():
        print(f"  {user}: {count} messages")
