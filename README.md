# Mini Project - Project & Task Management System

A full-stack collaborative project management system with role-based dashboards, real-time notifications, and team invitations built with React, Node.js, Express, MongoDB, Socket.IO, and Material-UI. Teams can create projects, invite members, assign tasks, track progress, and monitor team collaboration with comprehensive analytics.

## ✨ Features

### Authentication & Authorization
- 🔐 User registration and login with JWT authentication
- 👥 Role-based access control (Admin/Team Lead, Team Members, Mentor)
- 🔄 Auto-redirect to role-specific dashboards after login
- 🎨 Modern glassmorphism UI with gradient backgrounds

### Team Management & Invitations
- 📧 **Email-based Team Invitations**: Send invitations directly from the dashboard
- 🔔 **Real-time Notifications**: Instant invitation alerts via Socket.IO
- 👥 **Role Selection**: Invite as Team Member or Mentor
- ✅ **Accept/Decline System**: Manage invitations from notification center
- ⏰ **Auto-expiry**: Invitations automatically expire after 7 days
- 🔒 **Permission-based**: Only Team Leads and Mentors can send invitations

### Project Management
- 📁 Create projects with unique auto-generated team codes
- 🤝 Join projects using team codes (unlimited character length)
- 📩 Receive and manage project invitations
- 👨‍💼 Automatic role-based assignment (members/mentors)
- 📊 View all projects you're part of
- 🔔 Notification bell showing pending invitations count

### Task Management
- ✅ Create and assign tasks to team members
- 📝 Task details with title, description, deadline
- 🎯 Three status categories: To Do, In Progress, Done
- 🎯 Update task status with real-time UI updates
- 📋 View tasks categorized by status (Kanban-style)
- 🎨 Color-coded status chips and modern glassmorphism cards

### Role-Based Dashboards

#### Main Dashboard (Unified Project View)
- 🏠 **Centralized Project Hub**: View all projects you're involved in from one place
- 🎯 **Role Identification**: Automatically shows your role in each project (Team Lead, Member, Mentor)
- 📊 **Project Cards**: Clean, responsive Material-UI cards with glassmorphism design
- 👥 **Team Information**: See team lead, member count, and mentor count at a glance
- 🏆 **Weekly Contribution Display**: Each project card shows:
  - Top contributor for the last 7 days
  - Message count and calculated points
  - Visual indicators with goldenrod accents
- 🌟 **Most Active Person Banner**: Prominent display showing:
  - Champion across all projects
  - Total messages, active projects, and total points
  - Glassmorphism design with trophy icon
- 💬 **Unified Chat Integration**: Access ProjectChatWindow directly from cards
- 🔔 **Unread Message Badges**: Visual indicators for new messages per project
- 🔍 **View Details**: Comprehensive project information dialog with:
  - Complete team member list with avatars and emails
  - Full mentor roster
  - Project description and team code
  - Your role highlighted
- 🔙 **Navigation**: Easy return to your role-specific dashboard
- 📱 **Responsive Design**: Mobile-friendly grid layout (1-3 columns)
- ⚡ **Granular API**: Secure `/api/projects/user-projects` endpoint with role detection

#### Team Member Dashboard
- 📊 Kanban board with three columns (To Do, In Progress, Done) with modern glassmorphism
- ✏️ Update task status via dropdown
- 📈 View all assigned tasks with project details
- 🎨 Modern gradient UI with smooth transitions
- 📉 **Burndown Chart**: Visual project progress tracking
- � **Integrated Chat**: ProjectChatWindow component for real-time team communication
- 🔔 **Chat Notifications**: Browser notifications and unread badges for new messages
- �🔔 **Join Team by Code**: Enter any length team code to join projects
- 📬 **Accept Invitations**: View and manage received invitations
- ❌ **No Invite Permission**: Cannot invite others (restricted to Team Leads and Mentors)
- 🏠 **Go to Main Dashboard**: Quick navigation to unified project view

#### Mentor Dashboard
- 📊 View all projects being mentored
- 🔍 Drill-down into project details with tabs:
  - **Tasks Tab**: Complete task list with status, assignee, deadlines
  - **Contribution Metrics Tab**: Individual performance analytics
  - **Burndown Chart Tab**: Visual project progress tracking
  - **Team Chat Tab**: ProjectChatWindow for real-time messaging
  - **Chat Analysis Tab**: Communication health monitoring with 7-day metrics
- 📊 Visual progress bars and completion rates
- 📈 Team member performance comparison
- ✅ **Invite Team Members/Mentors**: Send email invitations to join projects
- 🔍 **Check Chat Health**: Analyze team communication patterns and engagement
- 💬 **Real-time Chat Notifications**: Instant alerts for new messages
- 📬 Real-time invitation notifications
- 🏠 **Go to Main Dashboard**: Quick navigation to unified project view

#### Admin/Team Lead Dashboard
- 🎛️ Create projects and manage team
- 📝 Create and assign tasks to members
- 👥 View team composition and roles
- ✅ **Invite Team Members/Mentors**: Send invitations with role selection
- 💬 **Integrated Chat**: ProjectChatWindow in project detail dialogs
- 🔔 **Real-time Notifications**: Chat alerts and invitation updates
- 📊 Project metrics and team analytics
- 🤖 **AI Project Recommendations**: Real-time insights and deadline alerts
- 🔔 Notification center for incoming invitations
- 🏠 **Go to Main Dashboard**: Quick navigation to unified project view

### Analytics & Metrics
- 📊 Project completion statistics
- 👤 Individual contribution tracking
- 📈 Task completion rates per member
- 🎯 Performance ranking by completion rate
- 📉 Task distribution by status
- 📉 **Burndown Chart Visualization**: 
  - Ideal burndown line (linear projection from start to end)
  - Actual remaining tasks line (based on task completion dates)
  - Project timeline with start/end dates
  - Daily progress tracking
  - Statistics summary (total, completed, remaining tasks, progress %)
- 💬 **Chat Health Analysis**: 
  - Message frequency tracking
  - Member participation rates
  - Communication pattern analysis
  - Engagement metrics

### 🤖 Real-Time AI Recommendations (NEW!)
- 🎯 **Intelligent Project Analysis**: Real-time analysis of project health using actual MongoDB data
- ⏰ **Automatic Deadline Monitoring**: Background service runs every 6 hours detecting approaching/overdue tasks
- 🚨 **Smart Risk Assessment**: Identifies project risks with severity levels (HIGH/MEDIUM/LOW) and mitigation strategies
- 📋 **Prioritized Action Items**: AI-generated next steps based on project state, deadlines, and team capacity
- 👥 **Team Collaboration Insights**: Workload distribution suggestions and unassigned task alerts
- 🔧 **Process Improvement Recommendations**: Workflow optimization tips and best practices
- 📅 **Timeline Predictions**: Estimates completion dates with confidence levels and "At Risk" flags
- 📊 **Comprehensive Metrics Dashboard**: Completion %, velocity, overdue tasks, team activity
- 🔔 **Deadline Alert Categories**:
  - 🚨 CRITICAL: Overdue tasks
  - ⚠️ HIGH: Due within 24 hours
  - ℹ️ MEDIUM: Due within 48 hours
- 🔄 **NOT Hardcoded**: All recommendations generated from live project data analysis
- 🎨 **Google Gemini AI Integration**: With intelligent rule-based fallback system

### Real-Time Features
- 🔔 **Instant Notifications**: Socket.IO powered real-time updates
- 📧 **Live Invitation Alerts**: Notifications appear without page refresh
- 💬 **Unified Project Chat**: Real-time messaging within projects with:
  - Cross-dashboard integration (works in all dashboards)
  - Live typing indicators
  - Message deletion (own messages only)
  - Online presence tracking
  - Auto-scroll to latest messages
  - Message timestamps with relative time display
- � **Weekly Contribution Tracking**: 7-day rolling window analysis showing:
  - Top contributors per project with point system
  - Most active person overall across all projects
  - Message count and activity metrics
  - Bonus points for high activity (10+, 20+, 50+ messages)
- �👥 **Online Presence**: See who's currently active in projects
- 🔄 **Auto-sync**: Project updates reflect immediately across all users
- 🏆 **Gamification**: Point-based contributor ranking with achievement indicators

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19.0.0
- **UI Library:** Material-UI (MUI) 7.3.5
- **Routing:** React Router DOM 7.9.5
- **HTTP Client:** Axios 1.13.2
- **Charts:** Chart.js 4.5.1, react-chartjs-2 5.3.1
- **Real-time:** Socket.IO Client 4.8.1
- **Icons:** Material Icons

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5.1.0
- **Database:** MongoDB with Mongoose 8.19.3
- **Authentication:** JWT (jsonwebtoken), bcryptjs
- **Real-time:** Socket.IO 4.8.1
- **AI Integration:** Google Generative AI (Gemini) 0.21.0
- **Email:** Nodemailer 6.9.16
- **Dev Tools:** nodemon 3.1.10, dotenv 17.2.3, cors 2.8.5

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Spurthi-019/MiniProject.git
cd MiniProject
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Create server/.env file
echo MONGODB_URI='mongodb://localhost:27017/projectsync_db' > server/.env
echo JWT_SECRET='your-strong-secret-key-here' >> server/.env
echo PORT=5000 >> server/.env
echo ENABLE_DEADLINE_ALERTS=true >> server/.env
echo GEMINI_API_KEY= >> server/.env
```

### 3. Frontend Setup
```bash
# Navigate to client folder
cd client

# Install frontend dependencies
npm install

# Go back to root
cd ..
```

### 4. Start the Application

**Option 1: Run both servers separately**

Terminal 1 (Backend):
```bash
cd server
node server.js
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

**Option 2: Quick start with npm scripts**
```bash
# Backend (from root)
npm run dev

# Frontend (from client folder)
cd client
npm start
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## 🧪 Testing the Application

### Quick Test with Sample Data

Run the automated test data script:
```powershell
.\setup-test-data.ps1
```

This creates:
- 4 test users (1 Admin, 2 Team Members, 1 Mentor)
- 1 project with team code
- 6 sample tasks assigned to members

### Test Accounts
| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@example.com | password123 | Admin/Team Lead | Can create projects and tasks |
| bob@example.com | password123 | Team Member | Has 2 assigned tasks |
| sarah@example.com | password123 | Mentor | Monitors project progress |

### Manual Testing Flow

1. **Register Users**
   - Go to `http://localhost:3000`
   - Click "Register here"
   - Create accounts with different roles

2. **Create a Project (Admin)**
   - Login as Admin/Team Lead
   - Note the 6-digit team code

3. **Join Project (Members/Mentors)**
   - Login as Team Member or Mentor
   - Use team code to join project

4. **Create Tasks (Admin)**
   - Admin creates tasks
   - Assigns tasks to team members

5. **Test Dashboards**
   - **Team Member**: View and update task status
   - **Mentor**: View metrics and contribution analytics
   - **Admin**: Manage projects and tasks

For detailed testing instructions, see `TESTING_GUIDE.md` or `QUICK_TEST_GUIDE.md`

## 📡 API Documentation

### Authentication Routes (`/api/auth`)

#### Register a User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "alice",
  "email": "alice@example.com",
  "password": "pass123",
  "role": "Admin/Team Lead"  // Optional: "Team Members" (default), "Mentor"
}
```
**Note:** First user registered automatically becomes "Admin/Team Lead"

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "login": "alice@example.com",  // username or email
  "password": "pass123"
}
```
**Response:** Returns JWT token

### Chat Routes (`/api/chat`)

#### Send Message
```http
POST /api/chat/:projectId/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello team! Great progress today."
}
```
**Response:** Returns created message and sends real-time notifications to all project members
**Features:**
- Sends browser notifications to offline members
- Emits Socket.IO event to online members
- Includes sender info and timestamp

#### Get Project Messages
```http
GET /api/chat/:projectId/messages?limit=100&before=messageId
Authorization: Bearer <token>
```
**Query Params:**
- `limit` (optional): Number of messages to fetch (default: 50)
- `before` (optional): Message ID for pagination

**Response:** Returns messages in chronological order with sender details

#### Delete Message
```http
DELETE /api/chat/messages/:messageId
Authorization: Bearer <token>
```
**Response:** Soft deletes the message (only sender can delete own messages)

#### Get Chat Metrics
```http
GET /api/projects/:projectId/chat-metrics
Authorization: Bearer <token>
```
**Response:** Returns 7-day chat analysis including:
- `totalMessages`: Total message count
- `topContributors`: Array of top 3 contributors with message counts
- `metrics.summary`: Detailed statistics (messages per day, activity rate, etc.)
- `metrics.allMemberActivity`: Complete activity breakdown for all participants
- `metrics.insights`: AI-generated communication insights

**Note:** Always analyzes the last 7 days, includes team leads, members, and mentors

### Project Routes (`/api/projects`)

#### Create Project (Admin/Team Lead only)
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description"
}
```
**Response:** Returns project with auto-generated 6-digit `teamCode`

#### Join Project
```http
POST /api/projects/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "teamCode": "543210"
}
```
**Behavior:** 
- Mentor role → added to `mentors` array
- Other roles → added to `members` array

#### Send Invitation (Team Lead/Mentor only)
```http
POST /api/projects/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "project-id",
  "email": "colleague@example.com",
  "role": "Team Member"  // "Team Member" or "Mentor"
}
```
**Response:** Returns invitation details and sends real-time notification to invitee
**Note:** Invitation expires after 7 days

#### Get Project Recommendations (NEW!)
```http
GET /api/projects/:projectId/recommendations
Authorization: Bearer <token>
```
**Response:** Returns comprehensive AI-generated recommendations including:
- `summary`: Project health overview
- `nextSteps`: Prioritized action items (array)
- `risks`: Risk assessment with severity and mitigation strategies
- `deadlineAlerts`: Tasks categorized by urgency (CRITICAL/HIGH/MEDIUM)
- `teamSuggestions`: Collaboration improvement tips
- `processImprovements`: Workflow optimization recommendations
- `timelinePrediction`: Completion estimates with confidence levels
- `metrics`: Comprehensive project metrics (completion %, velocity, overdue tasks, etc.)
- `source`: "gemini-ai" or "rule-based" (indicates AI engine used)

**Example Response:**
```json
{
  "summary": "Project is 33% complete but at risk. 1 overdue tasks require immediate attention.",
  "nextSteps": [
    "Immediately address 1 overdue task(s)",
    "Prioritize 2 task(s) due in the next 7 days",
    "Complete 2 in-progress task(s) before starting new work"
  ],
  "risks": [
    {
      "risk": "1 task(s) are overdue",
      "severity": "HIGH",
      "mitigation": "Re-evaluate deadlines or increase team capacity"
    }
  ],
  "deadlineAlerts": [
    {
      "task": "Design Database Schema",
      "deadline": "2025-11-15",
      "daysRemaining": -2,
      "urgency": "CRITICAL",
      "assignedTo": "Unassigned"
    }
  ],
  "teamSuggestions": ["Distribute unassigned tasks evenly among team members"],
  "processImprovements": ["Use task dependencies to identify critical path"],
  "timelinePrediction": {
    "onTrack": false,
    "estimatedCompletion": "Cannot estimate completion time",
    "confidence": "LOW",
    "reasoning": "Project is at risk due to overdue tasks"
  },
  "metrics": {
    "totalTasks": 6,
    "completedTasks": 2,
    "completionPercentage": 33,
    "overdueTasks": 1,
    "weeklyVelocity": 0,
    "unassignedTasks": 4
  }
}
```

**Features:**
- Real-time analysis of project data from MongoDB
- Automatic deadline categorization (CRITICAL < 0 days, HIGH < 1 day, MEDIUM < 2 days)
- Intelligent risk assessment with specific mitigation strategies
- NOT hardcoded - analyzes actual project state
- Background deadline service runs every 6 hours
- Google Gemini AI integration with rule-based fallback

#### Get My Invitations
```http
GET /api/projects/invitations
Authorization: Bearer <token>
```
**Response:** Returns all pending invitations for the logged-in user's email

#### Accept Invitation
```http
POST /api/projects/invitations/:invitationId/accept
Authorization: Bearer <token>
```
**Response:** Adds user to project and updates invitation status to "accepted"

#### Decline Invitation
```http
POST /api/projects/invitations/:invitationId/decline
Authorization: Bearer <token>
```
**Response:** Updates invitation status to "declined"

### Task Routes (`/api/tasks`)

#### Create Task (Team Lead only)
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Implement login feature",
  "description": "Add JWT authentication",
  "status": "To Do",           // "To Do", "In Progress", "Done"
  "assignedTo": "user-id",      // Optional
  "project": "project-id",
  "deadline": "2025-12-01"      // Optional
}
```

#### Get Project Tasks
```http
GET /api/tasks/project/:projectId
Authorization: Bearer <token>
```
**Response:** Returns all tasks for the project (sorted newest first)

#### Get My Tasks
```http
GET /api/tasks/my-tasks
Authorization: Bearer <token>
```
**Response:** Returns all tasks assigned to the authenticated user

#### Update Task Status
```http
PUT /api/tasks/:taskId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Done"  // "To Do", "In Progress", "Done"
}
```

#### Get My Projects
```http
GET /api/projects/my-projects
Authorization: Bearer <token>
```
**Response:** Returns all projects where user is team lead, member, or mentor

#### Get User Projects (Granular Access)
```http
GET /api/projects/user-projects
Authorization: Bearer <token>
```
**Response:** Returns all projects with granular role detection
- Automatically detects user's role in each project
- Includes `userRoleInProject` field (Team Lead, Member, or Mentor)
- Populates full team lead, members, and mentors details
- Sorted by creation date (newest first)

**Example Response:**
```json
{
  "message": "User projects retrieved successfully",
  "count": 3,
  "projects": [
    {
      "_id": "...",
      "name": "E-Commerce Website",
      "description": "Online shopping platform",
      "teamCode": "443266",
      "teamLead": {
        "_id": "...",
        "username": "admin_john",
        "email": "admin@example.com",
        "role": "Admin/Team Lead"
      },
      "members": [...],
      "mentors": [...],
      "userRoleInProject": "Team Lead"
    }
  ]
}
```

#### Get Project Metrics
```http
GET /api/projects/:projectId/metrics
Authorization: Bearer <token>
```
**Response:** Returns project statistics and individual contribution metrics

#### Get Burndown Chart Data
```http
GET /api/projects/:projectId/burndown-data
Authorization: Bearer <token>
```
**Response:** Returns burndown chart data with:
- `totalInitialTasks`: Total number of tasks in the project
- `currentRemainingTasks`: Number of tasks not yet completed
- `completedTasks`: Number of completed tasks
- `projectStartDate`: Project/earliest task creation date
- `projectEndDate`: Latest task deadline or current date
- `burndownData`: Array of `{date, remainingTasks}` objects for daily tracking

**Example Response:**
```json
{
  "message": "Burn-down data retrieved successfully",
  "totalInitialTasks": 10,
  "currentRemainingTasks": 4,
  "completedTasks": 6,
  "projectStartDate": "2025-01-15",
  "projectEndDate": "2025-02-15",
  "burndownData": [
    {"date": "2025-01-15", "remainingTasks": 10},
    {"date": "2025-01-16", "remainingTasks": 9},
    {"date": "2025-01-17", "remainingTasks": 7},
    ...
  ]
}
```

#### Get All Users (Debug)
```http
GET /api/auth/users
```
**Response:** Returns all registered users (for testing/debugging)

## Database Models

### User
- `username` (unique, required)
- `email` (unique, required)
- `password` (hashed with bcrypt)
- `role` (enum: Admin/Team Lead, Team Members, Mentor)

### Project
- `name` (required)
- `description`
- `teamCode` (unique, 6-digit, auto-generated)
- `teamLead` (User reference)
- `members` (array of User references)
- `mentors` (array of User references)
- `startDate` (Date, default: Date.now) - For timeline tracking
- `endDate` (Date) - Project deadline
- `status` (enum: planning, active, completed, on-hold, default: active)

### Task
- `title` (required)
- `description`
- `status` (enum: To Do, In Progress, Done)
- `assignedTo` (User reference, optional)
- `project` (Project reference, required)
- `deadline` (Date, optional)
- Timestamps: `createdAt`, `updatedAt`
- **Indexes**: Compound index on `{project, status}` for fast queries

### Message
- `project` (Project reference, required)
- `sender` (User reference, required)
- `content` (required)
- Timestamps: `createdAt`, `updatedAt`

### Invitation
- `project` (Project reference, required)
- `email` (required)
- `role` (enum: Team Members, Mentor)
- `invitedBy` (User reference, required)
- `status` (enum: pending, accepted, declined, expired)
- Timestamps: `createdAt`, `updatedAt`
- **TTL Index**: Auto-expires after 7 days (604800 seconds)
- **Indexes**: Compound index on `{email, status}` for efficient queries

## 🎯 Use Cases

### For Team Leads
1. Create projects and generate team codes
2. Invite members and mentors using team codes
3. Create and assign tasks to team members
4. Track project progress and task completion
5. Monitor team workload distribution

### For Team Members
1. Join projects using team codes
2. View all assigned tasks in organized columns
3. Update task status as work progresses
4. See task deadlines and priorities
5. Track personal task completion

### For Mentors
1. Join projects as mentors using team codes
2. Monitor multiple projects simultaneously
3. View detailed task lists for each project
4. Analyze individual contribution metrics
5. Identify team members who need support
6. Track overall project health and progress

## 🔄 Workflow

```
1. Admin registers → Auto-assigned "Admin/Team Lead" role (if first user)
   OR selects role during registration
   ↓
2. Admin creates project → System generates unique 6-digit team code
   ↓
3. Team members/mentors register → Join project using team code
   ↓
4. Admin creates tasks → Assigns to team members with deadlines
   ↓
5. Team members work on tasks → Update status (To Do → In Progress → Done)
   ↓
6. Mentor monitors progress → Views metrics and provides guidance
   ↓
7. Project completion → Analytics show individual contributions
```

## 🐛 Troubleshooting

### Backend Issues
**Server won't start:**
- Ensure MongoDB is running
- Check `.env` file exists in `server/` folder
- Verify port 5000 is not in use

**Database connection error:**
- Confirm MongoDB URI is correct
- Check MongoDB service is running: `Get-Service MongoDB`

### Frontend Issues
**Can't reach backend:**
- Verify backend is running on port 5000
- Check proxy setting in `client/package.json`: `"proxy": "http://localhost:5000"`

**Login/Register not working:**
- Open browser console for error messages
- Verify backend is running and accessible
- Check network tab for API responses

### Common Errors
**"Invalid credentials":**
- Verify correct email/password
- Passwords are case-sensitive

**"You do not have access to this project":**
- Ensure user has joined the project
- Verify correct team code was used

**"Only the team lead can create tasks":**
- Only the user who created the project can create tasks
- Verify you're logged in as the project creator

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Admin/Team Lead** | ✅ Create projects<br>✅ Create & assign tasks<br>✅ Invite team members/mentors<br>✅ View all team analytics |
| **Team Members** | ✅ Join projects via code<br>✅ Accept/decline invitations<br>✅ View & update own tasks<br>❌ Cannot invite others<br>❌ Cannot check chat health |
| **Mentor** | ✅ Join projects as mentor<br>✅ Invite team members/mentors<br>✅ Check chat health<br>✅ View project metrics<br>✅ Monitor team progress |

## 📁 Project Structure

```
Mini Project/
├── client/                          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProjectChatWindow.js     # Reusable chat component
│   │   │   ├── BurndownChart.js         # Burndown chart visualization
│   │   │   ├── ChatAnalysisReport.js    # Chat health analysis
│   │   │   └── RecommendationWidget.js  # AI recommendations
│   │   ├── pages/
│   │   │   ├── Login.js            # Login page
│   │   │   ├── Register.js         # Registration page
│   │   │   ├── Dashboard.js        # Main dashboard router
│   │   │   ├── MainDashboard.js         # Unified project view with chat metrics
│   │   │   ├── TeamMemberDashboard.js   # Team member view
│   │   │   ├── MentorDashboard.js       # Mentor view with metrics
│   │   │   └── AdminDashboard.js        # Admin/Team lead view
│   │   ├── App.js                  # App component with routing
│   │   └── index.js                # Entry point
│   ├── package.json
│   └── README.md
├── server/
│   ├── models/
│   │   ├── User.js                 # User schema with bcrypt
│   │   ├── Project.js              # Project schema with teamCode, startDate, endDate
│   │   ├── Task.js                 # Task schema with status
│   │   ├── Message.js              # Chat message schema
│   │   └── Invitation.js           # Invitation schema with TTL
│   ├── routes/
│   │   ├── auth.js                 # Auth routes (register, login, users)
│   │   ├── project.js              # Project routes (create, join, metrics, recommendations)
│   │   ├── task.js                 # Task routes (create, get, update status)
│   │   └── chat.js                 # Chat routes (send, get messages, delete)
│   ├── utils/
│   │   ├── geminiAI.js             # AI recommendation engine (515 lines)
│   │   ├── chatAnalysis.js         # 7-day chat metrics and insights
│   │   └── aiAnalysis.js           # Project health analysis
│   ├── services/
│   │   └── deadlineAlerts.js       # Background deadline monitoring (runs every 6 hours)
│   ├── authMiddleware.js           # JWT verification & role authorization
│   ├── server.js                   # Express app with Socket.IO + Deadline Service
│   ├── showRecommendations.js      # Demo script for AI recommendations
│   ├── quickTest.js                # Quick functionality test
│   └── .env                        # Environment variables
├── create-test-data.ps1            # Test data creation script
├── setup-test-data.ps1             # Simplified test data script
├── AI_RECOMMENDATIONS_README.md    # Complete AI features documentation
├── CHANGES_SUMMARY.md              # Summary of all recent changes
├── TESTING_GUIDE.md                # Comprehensive testing guide
├── QUICK_TEST_GUIDE.md             # Quick testing reference
├── package.json                    # Backend dependencies
├── .gitignore
└── README.md
```

## Testing Examples (PowerShell)

```powershell
# 1. Register first user (becomes Admin/Team Lead)
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/register" -Body '{"username":"alice","email":"alice@example.com","password":"pass123"}' -ContentType "application/json"

# 2. Login and save token
$response = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Body '{"login":"alice@example.com","password":"pass123"}' -ContentType "application/json"
$token = $response.token
$headers = @{ Authorization = "Bearer $token" }

# 3. Create a project
$project = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/projects" -Headers $headers -Body '{"name":"My Project","description":"Test project"}' -ContentType "application/json"
$teamCode = $project.project.teamCode
$projectId = $project.project._id

# 4. Create a task
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/tasks" -Headers $headers -Body "{`"title`":`"Setup backend`",`"project`":`"$projectId`",`"status`":`"In Progress`"}" -ContentType "application/json"

# 5. Get all tasks for project
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/tasks/project/$projectId" -Headers $headers

# 6. Get AI Recommendations (NEW!)
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/projects/$projectId/recommendations" -Headers $headers

# 7. Test AI Recommendations Script
cd server
node showRecommendations.js    # Comprehensive feature demonstration
node quickTest.js              # Quick functionality test
```

### Testing AI Recommendations

The system includes dedicated test scripts to demonstrate real-time AI features:

**Comprehensive Demo:**
```bash
cd server
node showRecommendations.js
```
This displays:
- Project metrics (completion %, velocity, overdue tasks)
- Deadline alerts with urgency levels
- Risk assessment with mitigation strategies
- Prioritized next steps
- Team collaboration suggestions
- Process improvements
- Timeline predictions

**Quick Test:**
```bash
cd server
node quickTest.js
```
Verifies API functionality and shows sample recommendations.

**Expected Output:**
```
📊 PROJECT METRICS
  Completion:    33%
  Tasks:         2/6
  Velocity:      0 tasks/week
  Overdue:       1

⚠️ DEADLINE ALERTS
  🚨 CRITICAL: Design Database Schema (2 days overdue)
  ⚠️ HIGH: Implement Shopping Cart (Due in 1 day)

🚨 PROJECT RISKS
  1. [HIGH] 1 task(s) are overdue
     💡 Mitigation: Re-evaluate deadlines

📋 NEXT STEPS (PRIORITIZED)
  1. Immediately address 1 overdue task(s)
  2. Prioritize 2 task(s) due in the next 7 days
  3. Complete 2 in-progress task(s)
```

```powershell
# Legacy testing examples
# 1. Register first user (becomes Admin/Team Lead)
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/register" -Body '{"username":"alice","email":"alice@example.com","password":"pass123"}' -ContentType "application/json"

# 2. Login and save token
$response = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Body '{"login":"alice@example.com","password":"pass123"}' -ContentType "application/json"
$token = $response.token
$headers = @{ Authorization = "Bearer $token" }

# 3. Create a project
$project = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/projects" -Headers $headers -Body '{"name":"My Project","description":"Test project"}' -ContentType "application/json"
$teamCode = $project.project.teamCode
$projectId = $project.project._id

# 4. Create a task
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/tasks" -Headers $headers -Body "{`"title`":`"Setup backend`",`"project`":`"$projectId`",`"status`":`"In Progress`"}" -ContentType "application/json"

# 5. Get all tasks for project
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/tasks/project/$projectId" -Headers $headers
```

## 🎨 User Interface Features

### Material-UI Components
- Responsive design with Grid layout
- AppBar with user info and logout
- Card-based layouts for projects and tasks
- Color-coded status chips (warning, info, success)
- Progress bars for completion tracking
- Dialog modals for detailed views
- Tab navigation for different views
- Loading spinners and error alerts

### Dashboard Features
- **Kanban Board**: Drag-and-drop style task organization
- **Status Updates**: Dropdown selectors for easy status changes
- **Real-time Updates**: Immediate UI refresh after actions
- **Metrics Visualization**: Tables with progress bars and percentages
- **Responsive Layout**: Works on desktop, tablet, and mobile

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token-based authentication
- ✅ Protected routes with authMiddleware
- ✅ Role-based authorization with `authorize()` helper
- ✅ Token expiration (7 days)
- ✅ Environment variables for sensitive data
- ✅ `.env` excluded from git
- ✅ CORS enabled for cross-origin requests
- ✅ Input validation on backend
- ✅ Duplicate username/email checking

## 🚀 Deployment

### Backend Deployment (Render/Heroku)
1. Set environment variables on hosting platform
2. Update MongoDB URI to production database
3. Deploy from GitHub repository

### Frontend Deployment (Vercel/Netlify)
1. Build production bundle: `npm run build`
2. Deploy `build` folder
3. Update API base URL to production backend

### Environment Variables Required
```env
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-strong-secret-key>
PORT=5000
ENABLE_DEADLINE_ALERTS=true
GEMINI_API_KEY=<your-gemini-api-key> (optional - system uses rule-based fallback)
EMAIL_ALERTS_ENABLED=false (optional)
```

## 📊 Database Schema

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

**Spurthi**
- GitHub: [@Spurthi-019](https://github.com/Spurthi-019)
- Repository: [MiniProject](https://github.com/Spurthi-019/MiniProject)

## 🙏 Acknowledgments

- Material-UI for the beautiful component library
- MongoDB for the flexible database solution
- Express.js for the robust backend framework
- React team for the amazing frontend library

---

## 🤖 AI Chat Analysis Service (Python/FastAPI)

The project includes an intelligent NLP-powered chat analysis service for generating weekly mentor reports. This service analyzes project group chats to provide actionable insights.

### Features
- ✨ **Advanced NLP Analysis**: Identifies technical vs casual conversations, problem-solving, and helping behavior
- 🎯 **Smart Contribution Scoring**: Technical contribution metrics (0-100 score) with quality classification
- 📊 **Weekly Mentor Reports**: Comprehensive activity summaries with ranked contributors and recommendations

### Quick Start (Python Service)
```bash
# Setup virtual environment
cd ai-analysis-service  # or wherever the Python service is located
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Start the server
python main.py
```

### API Endpoint
```bash
POST http://localhost:8000/weekly_report
```

For full AI service documentation, see the **AI Chat Analysis** section in the Python service directory.

---

**Built with ❤️ using the MERN stack + AI/NLP**
