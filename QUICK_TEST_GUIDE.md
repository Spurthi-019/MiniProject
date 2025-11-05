# Quick Test Guide - Use Your Existing Data

## Current Database Status

You have:
- **1 Project**: "E-Commerce Website" (Team Code: 443266)
- **6 Tasks**: Already created and assigned
- **7 Users**: Ready to test

---

## Test Accounts (Use These!)

### Option 1: Test with NEW users created by script

| Role | Email | Password | Status |
|------|-------|----------|--------|
| **Admin** | admin@example.com | password123 | ✅ Has project with tasks |
| **Team Member** | bob@example.com | password123 | ✅ In project with tasks |
| **Mentor** | sarah@example.com | password123 | ✅ In project as mentor |

### Option 2: Test with YOUR original users

| Role | Email | Password | Status |
|------|-------|----------|--------|
| **Admin** | alice@example.com | pass123 | ⚠️ No project yet |
| **Team Member** | john@example.com | ? | ⚠️ Need to join project |
| **Mentor** | spurthipujar2@gmail.com | ? | ⚠️ Need to join project |
| **Mentor** | druv@example.com | ? | ⚠️ Need to join project |

---

## 🚀 RECOMMENDED: Test with Option 1 (Script-created users)

These users already have a complete setup with project and tasks!

### Test 1: Team Member Dashboard (Bob)

1. Go to: http://localhost:3000/login
2. Login:
   ```
   Email: bob@example.com
   Password: password123
   ```
3. **You should see:**
   - Team Member Dashboard
   - **Tasks categorized by status:**
     - To Do: (empty)
     - In Progress: Setup Backend API
     - Done: Payment Integration
   - **My Projects section**: E-Commerce Website (Code: 443266)

4. **Test status update:**
   - Find "Setup Backend API" in "In Progress"
   - Change status to "Done"
   - Should move to Done column with success message

### Test 2: Mentor Dashboard (Sarah)

1. Logout and login:
   ```
   Email: sarah@example.com
   Password: password123
   ```
2. **You should see:**
   - Mentor Dashboard
   - "Projects I'm Mentoring" with 1 project card

3. **Click "View Details & Metrics":**
   - **Tasks Tab**: Shows 6 tasks, completion stats
   - **Contribution Metrics Tab**: Shows Bob's performance

### Test 3: Admin Dashboard (admin_john)

1. Logout and login:
   ```
   Email: admin@example.com
   Password: password123
   ```
2. **You should see:**
   - Admin/Team Lead Dashboard
   - Welcome message and placeholder cards

---

## 🔧 If You Want to Use YOUR Original Users

You need to add them to the project first. Here's how:

### Step 1: Get your passwords

If you don't remember passwords for john, spurthi, or druv, you'll need to register new users.

### Step 2: Join the existing project (Team Code: 443266)

For **johndoe** (Team Member):
```powershell
$johnToken = (Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Body (ConvertTo-Json @{login='john@example.com'; password='YOUR_PASSWORD'}) -ContentType "application/json").token

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/projects/join" -Headers @{Authorization="Bearer $johnToken"} -Body (ConvertTo-Json @{teamCode='443266'}) -ContentType "application/json"
```

For **spurthi** (Mentor):
```powershell
$spurthiToken = (Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Body (ConvertTo-Json @{login='spurthipujar2@gmail.com'; password='YOUR_PASSWORD'}) -ContentType "application/json").token

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/projects/join" -Headers @{Authorization="Bearer $spurthiToken"} -Body (ConvertTo-Json @{teamCode='443266'}) -ContentType "application/json"
```

### Step 3: Assign tasks to johndoe

```powershell
$adminToken = (Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Body (ConvertTo-Json @{login='admin@example.com'; password='password123'}) -ContentType "application/json").token

$projectId = "690b9adfbaaa5bb11a817f5b"
$johnId = "690b61d437275d9311cbb37d"

# Create a task for John
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/tasks" -Headers @{Authorization="Bearer $adminToken"} -Body (ConvertTo-Json @{
    title='Test Task for John'
    description='Testing task assignment'
    status='To Do'
    assignedTo=$johnId
    project=$projectId
    deadline='2025-11-30'
}) -ContentType "application/json"
```

---

## ✅ EASIEST WAY: Just test with these 3 users

1. **bob@example.com / password123** - Team Member with tasks
2. **sarah@example.com / password123** - Mentor monitoring project
3. **admin@example.com / password123** - Admin who created project

These are fully set up and ready to test all dashboard features!

---

## 📊 What to Test

### Team Member (Bob):
- ✅ See tasks in 3 columns (To Do, In Progress, Done)
- ✅ Update task status using dropdown
- ✅ See project information

### Mentor (Sarah):
- ✅ View project list
- ✅ Click to drill down into project details
- ✅ View all tasks in Tasks tab
- ✅ View contribution metrics in Metrics tab
- ✅ See completion rates and progress bars

### Admin (admin_john):
- ✅ Access admin dashboard
- ✅ See admin-specific options

---

## 🎯 Quick Commands

**See all users:**
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/auth/users"
```

**See all projects:**
```powershell
$token = (Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Body (ConvertTo-Json @{login='admin@example.com'; password='password123'}) -ContentType "application/json").token
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/projects/my-projects" -Headers @{Authorization="Bearer $token"}
```

**See all tasks:**
```powershell
$projectId = "690b9adfbaaa5bb11a817f5b"
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/tasks/project/$projectId" -Headers @{Authorization="Bearer $token"}
```
