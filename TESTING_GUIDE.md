# 🧪 Complete Testing Guide for Project Management System

## ✅ Prerequisites
- ✓ Backend server running on http://localhost:5000
- ✓ Frontend React app running on http://localhost:3000
- ✓ MongoDB running locally

---

## 📋 Test Scenario Overview

We'll create:
- **1 Admin/Team Lead** - Creates projects and assigns tasks
- **2 Team Members** - Work on tasks
- **1 Mentor** - Monitors project progress

---

## Step 1: Register Test Users

### 1.1 Register Admin/Team Lead

1. Open browser: http://localhost:3000
2. Click "Register here"
3. Fill in the form:
   ```
   Username: admin_john
   Email: admin@example.com
   Password: password123
   Confirm Password: password123
   Role: Admin/Team Lead
   ```
4. Click "Register"
5. **Expected Result**: Redirected to Admin Dashboard
6. **Verify**: You see "Admin/Team Lead Dashboard" with options to create projects

### 1.2 Register Team Member #1

1. Click "Logout"
2. Click "Register here"
3. Fill in the form:
   ```
   Username: member_alice
   Email: alice@example.com
   Password: password123
   Confirm Password: password123
   Role: Team Member
   ```
4. Click "Register"
5. **Expected Result**: Redirected to Team Member Dashboard
6. **Verify**: You see "Team Member Dashboard" with empty tasks and projects

### 1.3 Register Team Member #2

1. Click "Logout"
2. Click "Register here"
3. Fill in the form:
   ```
   Username: member_bob
   Email: bob@example.com
   Password: password123
   Confirm Password: password123
   Role: Team Member
   ```
4. Click "Register"
5. **Expected Result**: Redirected to Team Member Dashboard

### 1.4 Register Mentor

1. Click "Logout"
2. Click "Register here"
3. Fill in the form:
   ```
   Username: mentor_sarah
   Email: sarah@example.com
   Password: password123
   Confirm Password: password123
   Role: Mentor
   ```
4. Click "Register"
5. **Expected Result**: Redirected to Mentor Dashboard
6. **Verify**: You see "Mentor Dashboard" with empty projects list

---

## Step 2: Create a Project (as Admin)

### 2.1 Login as Admin

1. If not already logged in, go to http://localhost:3000/login
2. Login with:
   ```
   Login: admin@example.com
   Password: password123
   ```

### 2.2 Create Project via API (Backend Testing)

Open PowerShell and run:

```powershell
# Get admin's token by logging in
$loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Body (ConvertTo-Json @{login='admin@example.com'; password='password123'}) -ContentType "application/json"

$token = $loginResponse.token

# Create a project
$projectResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/projects" -Headers @{Authorization="Bearer $token"} -Body (ConvertTo-Json @{name='E-Commerce Website'; description='Build a full-stack e-commerce platform'}) -ContentType "application/json"

# Display the project details and SAVE THE TEAM CODE
$projectResponse | ConvertTo-Json -Depth 3
```

**IMPORTANT**: Copy the `teamCode` from the response (it will be a 6-digit number like `123456`)

### 2.3 Verify Project Created

```powershell
# Get admin's projects
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/projects/my-projects" -Headers @{Authorization="Bearer $token"} | ConvertTo-Json -Depth 3
```

---

## Step 3: Join Project (Team Members and Mentor)

### 3.1 Team Member Alice Joins Project

```powershell
# Login as Alice
$aliceLogin = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Body (ConvertTo-Json @{login='alice@example.com'; password='password123'}) -ContentType "application/json"

$aliceToken = $aliceLogin.token

# Join project (replace 123456 with your actual team code)
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/projects/join" -Headers @{Authorization="Bearer $aliceToken"} -Body (ConvertTo-Json @{teamCode='123456'}) -ContentType "application/json" | ConvertTo-Json -Depth 3
```

### 3.2 Team Member Bob Joins Project

```powershell
# Login as Bob
$bobLogin = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Body (ConvertTo-Json @{login='bob@example.com'; password='password123'}) -ContentType "application/json"

$bobToken = $bobLogin.token

# Join project
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/projects/join" -Headers @{Authorization="Bearer $bobToken"} -Body (ConvertTo-Json @{teamCode='123456'}) -ContentType "application/json" | ConvertTo-Json -Depth 3
```

### 3.3 Mentor Sarah Joins Project

```powershell
# Login as Sarah
$sarahLogin = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Body (ConvertTo-Json @{login='sarah@example.com'; password='password123'}) -ContentType "application/json"

$sarahToken = $sarahLogin.token

# Join project
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/projects/join" -Headers @{Authorization="Bearer $sarahToken"} -Body (ConvertTo-Json @{teamCode='123456'}) -ContentType "application/json" | ConvertTo-Json -Depth 3
```

---

## Step 4: Create and Assign Tasks (as Admin)

### 4.1 Get Project ID

```powershell
# Get the project ID from admin's projects
$projects = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/projects/my-projects" -Headers @{Authorization="Bearer $token"}

$projectId = $projects.projects[0]._id

Write-Host "Project ID: $projectId"
```

### 4.2 Get User IDs

```powershell
# Get all users to find Alice and Bob's IDs
$users = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/auth/users"

$alice = $users.users | Where-Object { $_.username -eq 'member_alice' }
$bob = $users.users | Where-Object { $_.username -eq 'member_bob' }

Write-Host "Alice ID: $($alice._id)"
Write-Host "Bob ID: $($bob._id)"
```

### 4.3 Create Tasks

```powershell
# Task 1: Design Database Schema (assigned to Alice)
$task1 = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/tasks" -Headers @{Authorization="Bearer $token"} -Body (ConvertTo-Json @{
    title='Design Database Schema'
    description='Create ERD and define database structure'
    status='To Do'
    assignedTo=$alice._id
    project=$projectId
    deadline='2025-11-15'
}) -ContentType "application/json"

# Task 2: Setup Backend API (assigned to Bob)
$task2 = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/tasks" -Headers @{Authorization="Bearer $token"} -Body (ConvertTo-Json @{
    title='Setup Backend API'
    description='Initialize Express server and configure routes'
    status='In Progress'
    assignedTo=$bob._id
    project=$projectId
    deadline='2025-11-20'
}) -ContentType "application/json"

# Task 3: Create Frontend UI (assigned to Alice)
$task3 = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/tasks" -Headers @{Authorization="Bearer $token"} -Body (ConvertTo-Json @{
    title='Create Frontend UI'
    description='Design and implement React components'
    status='To Do'
    assignedTo=$alice._id
    project=$projectId
    deadline='2025-11-25'
}) -ContentType "application/json"

# Task 4: Payment Integration (assigned to Bob)
$task4 = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/tasks" -Headers @{Authorization="Bearer $token"} -Body (ConvertTo-Json @{
    title='Payment Integration'
    description='Integrate Stripe payment gateway'
    status='Done'
    assignedTo=$bob._id
    project=$projectId
    deadline='2025-11-10'
}) -ContentType "application/json"

# Task 5: Write Documentation (assigned to Alice)
$task5 = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/tasks" -Headers @{Authorization="Bearer $token"} -Body (ConvertTo-Json @{
    title='Write Documentation'
    description='Create API documentation and user guide'
    status='Done'
    assignedTo=$alice._id
    project=$projectId
    deadline='2025-11-08'
}) -ContentType "application/json"

Write-Host "✅ All 5 tasks created successfully!"
```

---

## Step 5: Test Team Member Dashboard

### 5.1 Login as Alice (Team Member)

1. Go to http://localhost:3000/login
2. Login with:
   ```
   Login: alice@example.com
   Password: password123
   ```

### 5.2 Verify Team Member Dashboard Features

**Expected to see:**
- ✅ Three columns: "To Do", "In Progress", "Done"
- ✅ Alice's tasks distributed across columns:
  - **To Do**: Design Database Schema, Create Frontend UI
  - **In Progress**: (empty initially)
  - **Done**: Write Documentation
- ✅ Each task shows title, description, project name, deadline
- ✅ Dropdown to update status on each task

### 5.3 Test Status Update

1. Find "Design Database Schema" task in "To Do" column
2. Click the dropdown "Update Status"
3. Select "In Progress"
4. **Expected Result**: Task moves to "In Progress" column with success message

### 5.4 Verify Projects Section

Scroll down to "My Projects" section
- **Expected to see**: "E-Commerce Website" project with team code
- Shows team lead name, member count, mentor count

---

## Step 6: Test Mentor Dashboard

### 6.1 Login as Sarah (Mentor)

1. Logout from Alice's account
2. Login with:
   ```
   Login: sarah@example.com
   Password: password123
   ```

### 6.2 Verify Mentor Dashboard Features

**Expected to see:**
- ✅ "Projects I'm Mentoring" section
- ✅ Card for "E-Commerce Website" project
- ✅ Shows team code, description, team lead, member counts

### 6.3 Test Drill-Down Feature

1. Click "View Details & Metrics" button on the project card
2. **Expected Result**: Dialog opens with two tabs

### 6.4 Test Tasks Tab

1. Verify "Tasks" tab is selected
2. **Expected to see**:
   - Project statistics: Total Tasks (5), To Do (1), In Progress (2), Done (2)
   - Completion rate progress bar (40% - 2 out of 5)
   - Table with all 5 tasks showing:
     - Task names
     - Color-coded status chips
     - Assigned members (Alice/Bob)
     - Deadlines

### 6.5 Test Contribution Metrics Tab

1. Click "Contribution Metrics" tab
2. **Expected to see table with**:
   - **admin_john** (Team Lead): Shows task counts if any assigned
   - **member_alice**: 3 total tasks, 1 completed, 2 to do, 33% completion rate
   - **member_bob**: 2 total tasks, 1 completed, 1 in progress, 50% completion rate
3. Visual progress bars for each member
4. Members sorted by completion rate

---

## Step 7: Test Admin Dashboard

### 7.1 Login as Admin

1. Logout from Sarah's account
2. Login with:
   ```
   Login: admin@example.com
   Password: password123
   ```

### 7.2 Verify Admin Dashboard (Current State)

**Expected to see:**
- ✅ "Admin/Team Lead Dashboard" title
- ✅ Welcome message with admin's info
- ✅ Cards for: Create Project, My Projects, Manage Tasks, Team Members

**Note**: The admin dashboard currently has placeholder buttons. Full implementation would include:
- Project creation dialog
- Task management interface
- Team member management

---

## 🎯 Summary of Test Results

### ✅ What Should Work:

1. **User Registration & Authentication**
   - All three roles can register
   - Auto-redirect to appropriate dashboard
   - Login/logout functionality

2. **Team Member Dashboard**
   - View tasks categorized by status
   - Update task status via dropdown
   - See project information
   - Real-time UI updates

3. **Mentor Dashboard**
   - View all mentored projects
   - Drill-down to see project tasks
   - View individual contribution metrics
   - Monitor team performance

4. **Project & Task Management (Backend)**
   - Create projects with unique team codes
   - Join projects using team codes
   - Create and assign tasks
   - Track task status

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch data"
**Solution**: Ensure both servers are running (backend on :5000, frontend on :3000)

### Issue: "You do not have access to this project"
**Solution**: Make sure users have joined the project using the correct team code

### Issue: Tasks not showing in Team Member Dashboard
**Solution**: Verify tasks are assigned to the logged-in user's ID

### Issue: Empty contribution metrics
**Solution**: Ensure tasks have been created and assigned to team members

---

## 📊 MongoDB Verification

To verify data in MongoDB Compass:

1. Connect to: `mongodb://localhost:27017`
2. Open database: `projectsync_db`
3. Check collections:
   - **users**: Should have 4 users (1 admin, 2 members, 1 mentor)
   - **projects**: Should have 1 project with teamCode
   - **tasks**: Should have 5 tasks with various statuses

---

## 🎉 Testing Complete!

You've successfully tested:
- ✅ User registration and role-based authentication
- ✅ Project creation and team joining
- ✅ Task assignment and status updates
- ✅ Team Member Dashboard with task management
- ✅ Mentor Dashboard with metrics and analytics
- ✅ Data persistence in MongoDB
