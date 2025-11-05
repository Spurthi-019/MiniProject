# Mini Project - Project & Task Management System

A collaborative project management system built with Node.js, Express, MongoDB, and JWT authentication. Teams can create projects, assign tasks, and manage team members with role-based access control.

## Features

- 🔐 User authentication (register/login with JWT)
- 👥 Role-based access control (Admin/Team Lead, Team Members, Mentor)
- 📁 Project management with unique team codes
- ✅ Task creation and assignment
- 🔒 Protected routes with middleware
- 📊 MongoDB database with Mongoose ODM

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken), bcryptjs
- **Dev Tools:** nodemon, dotenv, cors

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Spurthi-019/MiniProject.git
   cd MiniProject
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create `server/.env` file:
   ```env
   MONGODB_URI='mongodb://localhost:27017/projectsync_db'
   JWT_SECRET='your-strong-secret-key-here'
   PORT=5000
   ```

4. **Start MongoDB** (ensure MongoDB is running locally or update the URI)

5. **Run the application:**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will run on `http://localhost:5000`

## API Documentation

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

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Admin/Team Lead** | Create projects, create tasks, assign tasks |
| **Team Members** | Join projects, view tasks, update own tasks |
| **Mentor** | Join projects as mentor, view tasks, provide guidance |

## Project Structure

```
Mini Project/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── project.js
│   │   └── task.js
│   ├── authMiddleware.js
│   ├── server.js
│   └── .env
├── package.json
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

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Protected routes with authMiddleware
- ✅ Role-based authorization
- ✅ Environment variables for sensitive data
- ✅ `.env` excluded from git

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT

## Contact

Repository: [https://github.com/Spurthi-019/MiniProject](https://github.com/Spurthi-019/MiniProject)
