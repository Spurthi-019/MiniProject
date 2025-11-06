# Mini Project - Project & Task Management System

A full-stack collaborative project management system with role-based dashboards built with React, Node.js, Express, MongoDB, and Material-UI. Teams can create projects, assign tasks, track progress, and monitor individual contributions with comprehensive analytics.

## ✨ Features

### Authentication & Authorization
- 🔐 User registration and login with JWT authentication
- 👥 Role-based access control (Admin/Team Lead, Team Members, Mentor)
- � Auto-redirect to role-specific dashboards after login

### Project Management
- 📁 Create projects with unique 6-digit team codes
- 🤝 Join projects using team codes
- 👨‍💼 Automatic role-based assignment (members/mentors)
- 📊 View all projects you're part of

### Task Management
- ✅ Create and assign tasks to team members
- 📝 Task details with title, description, deadline
- � Three status categories: To Do, In Progress, Done
- 🎯 Update task status with real-time UI updates
- 📋 View tasks categorized by status (Kanban-style)

### Role-Based Dashboards

#### Team Member Dashboard
- 📊 Kanban board with three columns (To Do, In Progress, Done)
- ✏️ Update task status via dropdown
- 📈 View all assigned tasks with project details
- 🎨 Color-coded status chips and progress indicators
- 📉 **Burndown Chart**: Visual project progress tracking with ideal vs. actual burndown lines

#### Mentor Dashboard
- � View all projects being mentored
- 🔍 Drill-down into project details with tabs:
  - **Tasks Tab**: Complete task list with status, assignee, deadlines
  - **Contribution Metrics Tab**: Individual performance analytics
  - **Burndown Chart Tab**: Visual project progress with ideal and actual task completion trends
- 📊 Visual progress bars and completion rates
- 📈 Team member performance comparison

#### Admin/Team Lead Dashboard
- 🎛️ Create projects and manage team
- 📝 Create and assign tasks to members
- 👥 View team composition and roles

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

### Task
- `title` (required)
- `description`
- `status` (enum: To Do, In Progress, Done)
- `assignedTo` (User reference, optional)
- `project` (Project reference, required)
- `deadline` (Date, optional)
- Timestamps: `createdAt`, `updatedAt`
- **Indexes**: Compound index on `{project, status}` for fast queries

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
| **Admin/Team Lead** | Create projects, create tasks, assign tasks |
| **Team Members** | Join projects, view tasks, update own tasks |
| **Mentor** | Join projects as mentor, view tasks, provide guidance |

## 📁 Project Structure

```
Mini Project/
├── client/                          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js            # Login page
│   │   │   ├── Register.js         # Registration page
│   │   │   ├── Dashboard.js        # Main dashboard router
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
│   │   ├── Project.js              # Project schema with teamCode
│   │   └── Task.js                 # Task schema with status
│   ├── routes/
│   │   ├── auth.js                 # Auth routes (register, login, users)
│   │   ├── project.js              # Project routes (create, join, metrics)
│   │   └── task.js                 # Task routes (create, get, update status)
│   ├── authMiddleware.js           # JWT verification & role authorization
│   ├── server.js                   # Express app entry point
│   └── .env                        # Environment variables
├── create-test-data.ps1            # Test data creation script
├── setup-test-data.ps1             # Simplified test data script
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

**Built with ❤️ using the MERN stack**
