# Project Recommendations API Endpoint

## Overview
The `/api/projects/:projectId/recommendations` endpoint provides AI-powered project recommendations by combining health analysis and task prioritization data. It returns next suggested tasks and project delay warnings in a single, comprehensive response.

## Endpoint Details

### Request
```
GET /api/projects/:projectId/recommendations
```

**Authentication:** Required (JWT Bearer token)

**Parameters:**
- `projectId` (path parameter, required) - The MongoDB ObjectId of the project
- `limit` (query parameter, optional) - Number of suggested tasks to return (default: 5)

**Example Request:**
```bash
GET /api/projects/690c085b7b553f23520556c4/recommendations?limit=5
Authorization: Bearer <your-jwt-token>
```

### Response

**Success Response (200 OK):**
```json
{
  "message": "Project recommendations generated successfully",
  "projectId": "690c085b7b553f23520556c4",
  "projectName": "Test Project for Burndown",
  "nextSuggestedTasks": [
    {
      "id": "690c087e7b553f23520556cc",
      "title": "Task 2",
      "description": "Second task",
      "status": "In Progress",
      "deadline": "2025-11-09T02:31:26.000Z",
      "assignedTo": null,
      "priorityLevel": "CRITICAL",
      "reasons": [
        "Due within 3 days",
        "Already in progress",
        "Unassigned"
      ]
    },
    {
      "id": "690c087e7b553f23520556c8",
      "title": "Task 1",
      "description": "First task",
      "status": "To Do",
      "deadline": "2025-11-11T02:31:26.000Z",
      "assignedTo": null,
      "priorityLevel": "MEDIUM",
      "reasons": [
        "Due within 7 days",
        "Unassigned"
      ]
    }
  ],
  "projectDelayWarning": {
    "isDelayed": true,
    "riskLevel": "MEDIUM",
    "message": "⚠️ Project is at MEDIUM risk of delays. 2 tasks are unassigned (100% of remaining work)",
    "riskFactors": [
      "2 tasks are unassigned (100% of remaining work)"
    ],
    "recommendations": [
      "Assign 2 unassigned task(s) to team members"
    ]
  },
  "insights": {
    "urgentTasksCount": 1,
    "teamVelocity": 1,
    "completionPercentage": 33,
    "estimatedDaysToComplete": 2
  },
  "generatedAt": "2025-11-07T04:37:47.903Z"
}
```

**Error Responses:**

- **404 Not Found:**
  ```json
  {
    "message": "Project not found"
  }
  ```

- **403 Forbidden:**
  ```json
  {
    "message": "You do not have access to this project"
  }
  ```

- **500 Internal Server Error:**
  ```json
  {
    "message": "Server error generating project recommendations"
  }
  ```

## Response Fields Explained

### nextSuggestedTasks (Array)
Prioritized list of tasks that should be worked on next, ordered by priority score.

**Fields:**
- `id` - Task ID
- `title` - Task title
- `description` - Task description
- `status` - Current task status ("To Do", "In Progress", "Done")
- `deadline` - Task deadline (ISO 8601 format)
- `assignedTo` - User object or null if unassigned
  - `id` - User ID
  - `username` - Username
  - `email` - User email
- `priorityLevel` - CRITICAL / HIGH / MEDIUM / LOW
- `reasons` - Array of strings explaining why this task is prioritized

### projectDelayWarning (Object)
Comprehensive delay risk assessment for the project.

**Fields:**
- `isDelayed` (boolean) - Whether project is at risk of delays
- `riskLevel` - LOW / MEDIUM / HIGH
- `message` - Human-readable warning message with emoji indicator
- `riskFactors` - Array of specific risk factors identified
- `recommendations` - Array of actionable recommendations

### insights (Object)
Quick metrics for project overview.

**Fields:**
- `urgentTasksCount` - Number of tasks with nearest deadlines
- `teamVelocity` - Average tasks completed per day
- `completionPercentage` - Percentage of completed tasks
- `estimatedDaysToComplete` - Estimated days to complete remaining work

## Priority Levels

Tasks are scored and categorized into priority levels:

- **CRITICAL** (Score > 70): Overdue tasks or due within 24 hours
- **HIGH** (Score 60-70): Due within 3 days
- **MEDIUM** (Score 40-60): Due within 7 days
- **LOW** (Score < 40): No immediate deadline or far future

## Risk Levels

Projects are assessed for risk based on multiple factors:

- **LOW**: Project on track, no significant concerns
- **MEDIUM**: 1-2 risk factors identified
- **HIGH**: 3+ risk factors, significant delay risk

### Common Risk Factors:
- Tasks unassigned beyond 30% threshold
- Estimated completion time exceeds deadline
- Overdue tasks present
- Team velocity below optimal threshold (< 0.3 tasks/day)

## Use Cases

### 1. Dashboard Display
Use this endpoint to show recommended next actions and delay warnings on team/mentor dashboards.

### 2. Email Notifications
Generate weekly summary emails with project status and recommended focus areas.

### 3. Mobile App Quick View
Provide quick project overview with actionable insights for mobile users.

### 4. Automated Alerts
Trigger notifications when `isDelayed` changes from false to true.

### 5. Team Planning
Use suggested tasks list for sprint planning or daily standups.

## Testing

### PowerShell Example:
```powershell
# Login and get token
$body = @{login='alice@example.com'; password='pass123'} | ConvertTo-Json
$loginResp = Invoke-RestMethod -Method Post -Uri 'http://localhost:5000/api/auth/login' -Body $body -ContentType 'application/json'
$token = $loginResp.token

# Get recommendations
$projectId = '690c085b7b553f23520556c4'
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:5000/api/projects/$projectId/recommendations?limit=5" -Headers $headers | ConvertTo-Json -Depth 10
```

### cURL Example:
```bash
# Login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"alice@example.com","password":"pass123"}' \
  | jq -r '.token')

# Get recommendations
curl -X GET "http://localhost:5000/api/projects/690c085b7b553f23520556c4/recommendations?limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  | jq
```

## Implementation Notes

- Combines data from `analyzeProjectHealth()` and `getPrioritizedTasks()` utility functions
- Access control verifies user is team lead, member, or mentor
- Default limit of 5 suggested tasks (configurable via query parameter)
- Generates human-readable messages with emoji indicators
- All dates in ISO 8601 format
- Response includes timestamp for cache invalidation

## Related Endpoints

- `GET /api/projects/:projectId/health-analysis` - Detailed health analysis only
- `GET /api/projects/:projectId/prioritized-tasks` - Prioritized tasks only
- `GET /api/projects/:projectId/burndown-data` - Burndown chart data

---

**Last Updated:** November 7, 2025
**Version:** 1.0
**Status:** ✅ Fully Tested and Production Ready
