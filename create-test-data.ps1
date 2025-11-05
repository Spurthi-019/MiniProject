# PowerShell Script to Create Test Data for Project Management System
# Run this after both backend and frontend servers are started

Write-Host "Creating Test Data for Project Management System" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Base URL
$baseUrl = "http://localhost:5000/api"

# Step 1: Register Users
Write-Host "Step 1: Registering test users..." -ForegroundColor Yellow

# Register Admin
Write-Host "  - Registering Admin (admin_john)..." -ForegroundColor Gray
try {
    $adminReg = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/register" `
        -Body (ConvertTo-Json @{
            username='admin_john'
            email='admin@example.com'
            password='password123'
            role='Admin/Team Lead'
        }) -ContentType "application/json"
    Write-Host "  ✅ Admin registered successfully" -ForegroundColor Green
    $adminToken = $adminReg.token
} catch {
    Write-Host "  ⚠️  Admin already exists, logging in..." -ForegroundColor Yellow
    $adminLogin = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" `
        -Body (ConvertTo-Json @{login='admin@example.com'; password='password123'}) `
        -ContentType "application/json"
    $adminToken = $adminLogin.token
}

# Register Team Member Alice
Write-Host "  - Registering Team Member (member_alice)..." -ForegroundColor Gray
try {
    $aliceReg = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/register" `
        -Body (ConvertTo-Json @{
            username='member_alice'
            email='alice@example.com'
            password='password123'
            role='Team Members'
        }) -ContentType "application/json"
    Write-Host "  ✅ Alice registered successfully" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Alice already exists" -ForegroundColor Yellow
}

# Register Team Member Bob
Write-Host "  - Registering Team Member (member_bob)..." -ForegroundColor Gray
try {
    $bobReg = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/register" `
        -Body (ConvertTo-Json @{
            username='member_bob'
            email='bob@example.com'
            password='password123'
            role='Team Members'
        }) -ContentType "application/json"
    Write-Host "  ✅ Bob registered successfully" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Bob already exists" -ForegroundColor Yellow
}

# Register Mentor Sarah
Write-Host "  - Registering Mentor (mentor_sarah)..." -ForegroundColor Gray
try {
    $sarahReg = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/register" `
        -Body (ConvertTo-Json @{
            username='mentor_sarah'
            email='sarah@example.com'
            password='password123'
            role='Mentor'
        }) -ContentType "application/json"
    Write-Host "  ✅ Sarah registered successfully" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Sarah already exists" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Create Project
Write-Host "🏗️  Step 2: Creating project..." -ForegroundColor Yellow

$project = Invoke-RestMethod -Method Post -Uri "$baseUrl/projects" `
    -Headers @{Authorization="Bearer $adminToken"} `
    -Body (ConvertTo-Json @{
        name='E-Commerce Website'
        description='Build a full-stack e-commerce platform with React and Node.js'
    }) -ContentType "application/json"

$projectId = $project.project._id
$teamCode = $project.project.teamCode

Write-Host "  ✅ Project created successfully!" -ForegroundColor Green
Write-Host "  📋 Project Name: $($project.project.name)" -ForegroundColor Cyan
Write-Host "  🔑 Team Code: $teamCode" -ForegroundColor Cyan
Write-Host "  🆔 Project ID: $projectId" -ForegroundColor Cyan
Write-Host ""

# Step 3: Join Project
Write-Host "👥 Step 3: Joining project..." -ForegroundColor Yellow

# Alice joins
$aliceLogin = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" `
    -Body (ConvertTo-Json @{login='alice@example.com'; password='password123'}) `
    -ContentType "application/json"
$aliceToken = $aliceLogin.token

Invoke-RestMethod -Method Post -Uri "$baseUrl/projects/join" `
    -Headers @{Authorization="Bearer $aliceToken"} `
    -Body (ConvertTo-Json @{teamCode=$teamCode}) `
    -ContentType "application/json" | Out-Null
Write-Host "  ✅ Alice joined the project" -ForegroundColor Green

# Bob joins
$bobLogin = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" `
    -Body (ConvertTo-Json @{login='bob@example.com'; password='password123'}) `
    -ContentType "application/json"
$bobToken = $bobLogin.token

Invoke-RestMethod -Method Post -Uri "$baseUrl/projects/join" `
    -Headers @{Authorization="Bearer $bobToken"} `
    -Body (ConvertTo-Json @{teamCode=$teamCode}) `
    -ContentType "application/json" | Out-Null
Write-Host "  ✅ Bob joined the project" -ForegroundColor Green

# Sarah joins as mentor
$sarahLogin = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" `
    -Body (ConvertTo-Json @{login='sarah@example.com'; password='password123'}) `
    -ContentType "application/json"
$sarahToken = $sarahLogin.token

Invoke-RestMethod -Method Post -Uri "$baseUrl/projects/join" `
    -Headers @{Authorization="Bearer $sarahToken"} `
    -Body (ConvertTo-Json @{teamCode=$teamCode}) `
    -ContentType "application/json" | Out-Null
Write-Host "  ✅ Sarah joined as mentor" -ForegroundColor Green
Write-Host ""

# Step 4: Get User IDs
Write-Host "🔍 Step 4: Getting user IDs..." -ForegroundColor Yellow

$users = Invoke-RestMethod -Method Get -Uri "$baseUrl/auth/users"
$alice = $users.users | Where-Object { $_.username -eq 'member_alice' }
$bob = $users.users | Where-Object { $_.username -eq 'member_bob' }

Write-Host "  ✅ User IDs retrieved" -ForegroundColor Green
Write-Host ""

# Step 5: Create Tasks
Write-Host "📋 Step 5: Creating tasks..." -ForegroundColor Yellow

# Task 1
Invoke-RestMethod -Method Post -Uri "$baseUrl/tasks" `
    -Headers @{Authorization="Bearer $adminToken"} `
    -Body (ConvertTo-Json @{
        title='Design Database Schema'
        description='Create ERD and define database structure for products, users, and orders'
        status='To Do'
        assignedTo=$alice._id
        project=$projectId
        deadline='2025-11-15'
    }) -ContentType "application/json" | Out-Null
Write-Host "  ✅ Task 1: Design Database Schema (To Do - Alice)" -ForegroundColor Green

# Task 2
Invoke-RestMethod -Method Post -Uri "$baseUrl/tasks" `
    -Headers @{Authorization="Bearer $adminToken"} `
    -Body (ConvertTo-Json @{
        title='Setup Backend API'
        description='Initialize Express server, configure routes and middleware'
        status='In Progress'
        assignedTo=$bob._id
        project=$projectId
        deadline='2025-11-20'
    }) -ContentType "application/json" | Out-Null
Write-Host "  ✅ Task 2: Setup Backend API (In Progress - Bob)" -ForegroundColor Green

# Task 3
Invoke-RestMethod -Method Post -Uri "$baseUrl/tasks" `
    -Headers @{Authorization="Bearer $adminToken"} `
    -Body (ConvertTo-Json @{
        title='Create Frontend UI'
        description='Design and implement React components for product catalog'
        status='To Do'
        assignedTo=$alice._id
        project=$projectId
        deadline='2025-11-25'
    }) -ContentType "application/json" | Out-Null
Write-Host "  ✅ Task 3: Create Frontend UI (To Do - Alice)" -ForegroundColor Green

# Task 4
Invoke-RestMethod -Method Post -Uri "$baseUrl/tasks" `
    -Headers @{Authorization="Bearer $adminToken"} `
    -Body (ConvertTo-Json @{
        title='Payment Integration'
        description='Integrate Stripe payment gateway for checkout process'
        status='Done'
        assignedTo=$bob._id
        project=$projectId
        deadline='2025-11-10'
    }) -ContentType "application/json" | Out-Null
Write-Host "  ✅ Task 4: Payment Integration (Done - Bob)" -ForegroundColor Green

# Task 5
Invoke-RestMethod -Method Post -Uri "$baseUrl/tasks" `
    -Headers @{Authorization="Bearer $adminToken"} `
    -Body (ConvertTo-Json @{
        title='Write Documentation'
        description='Create API documentation and user guide for the platform'
        status='Done'
        assignedTo=$alice._id
        project=$projectId
        deadline='2025-11-08'
    }) -ContentType "application/json" | Out-Null
Write-Host "  ✅ Task 5: Write Documentation (Done - Alice)" -ForegroundColor Green

# Task 6
Invoke-RestMethod -Method Post -Uri "$baseUrl/tasks" `
    -Headers @{Authorization="Bearer $adminToken"} `
    -Body (ConvertTo-Json @{
        title='Implement Shopping Cart'
        description='Build cart functionality with add, remove, and update features'
        status='In Progress'
        assignedTo=$alice._id
        project=$projectId
        deadline='2025-11-18'
    }) -ContentType "application/json" | Out-Null
Write-Host "  ✅ Task 6: Implement Shopping Cart (In Progress - Alice)" -ForegroundColor Green

Write-Host ""
Write-Host "=" -repeat 50 -ForegroundColor Cyan
Write-Host "🎉 Test Data Created Successfully!" -ForegroundColor Green
Write-Host "=" -repeat 50 -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "  • 4 Users registered (1 Admin, 2 Members, 1 Mentor)" -ForegroundColor White
Write-Host "  • 1 Project created: E-Commerce Website" -ForegroundColor White
Write-Host "  • Team Code: $teamCode" -ForegroundColor Cyan
Write-Host "  • 6 Tasks created and assigned" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "  2. Login with any of these accounts:" -ForegroundColor White
Write-Host ""
Write-Host "     Admin/Team Lead:" -ForegroundColor Cyan
Write-Host "       Email: admin@example.com" -ForegroundColor Gray
Write-Host "       Password: password123" -ForegroundColor Gray
Write-Host ""
Write-Host "     Team Member (Alice):" -ForegroundColor Cyan
Write-Host "       Email: alice@example.com" -ForegroundColor Gray
Write-Host "       Password: password123" -ForegroundColor Gray
Write-Host "       Tasks: 4 tasks (1 Done, 1 In Progress, 2 To Do)" -ForegroundColor Gray
Write-Host ""
Write-Host "     Team Member (Bob):" -ForegroundColor Cyan
Write-Host "       Email: bob@example.com" -ForegroundColor Gray
Write-Host "       Password: password123" -ForegroundColor Gray
Write-Host "       Tasks: 2 tasks (1 Done, 1 In Progress)" -ForegroundColor Gray
Write-Host ""
Write-Host "     Mentor (Sarah):" -ForegroundColor Cyan
Write-Host "       Email: sarah@example.com" -ForegroundColor Gray
Write-Host "       Password: password123" -ForegroundColor Gray
Write-Host "       Projects: 1 project to mentor" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed testing instructions, see TESTING_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
