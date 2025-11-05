# Simple PowerShell Script to Create Test Data
# Ensure both servers are running before executing this script

$baseUrl = "http://localhost:5000/api"

Write-Host "===== Creating Test Data =====" -ForegroundColor Cyan

# Step 1: Register Admin
Write-Host "`n[1/7] Registering Admin..." -ForegroundColor Yellow
try {
    $adminReg = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/register" -Body (ConvertTo-Json @{username='admin_john'; email='admin@example.com'; password='password123'; role='Admin/Team Lead'}) -ContentType "application/json"
    $adminToken = $adminReg.token
    Write-Host "Admin registered: admin@example.com" -ForegroundColor Green
} catch {
    $adminLogin = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -Body (ConvertTo-Json @{login='admin@example.com'; password='password123'}) -ContentType "application/json"
    $adminToken = $adminLogin.token
    Write-Host "Admin already exists, logged in" -ForegroundColor Yellow
}

# Step 2: Register Alice
Write-Host "`n[2/7] Registering Team Member Alice..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/register" -Body (ConvertTo-Json @{username='member_alice'; email='alice@example.com'; password='password123'; role='Team Members'}) -ContentType "application/json" | Out-Null
    Write-Host "Alice registered: alice@example.com" -ForegroundColor Green
} catch {
    Write-Host "Alice already exists" -ForegroundColor Yellow
}

# Step 3: Register Bob
Write-Host "`n[3/7] Registering Team Member Bob..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/register" -Body (ConvertTo-Json @{username='member_bob'; email='bob@example.com'; password='password123'; role='Team Members'}) -ContentType "application/json" | Out-Null
    Write-Host "Bob registered: bob@example.com" -ForegroundColor Green
} catch {
    Write-Host "Bob already exists" -ForegroundColor Yellow
}

# Step 4: Register Mentor
Write-Host "`n[4/7] Registering Mentor Sarah..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/register" -Body (ConvertTo-Json @{username='mentor_sarah'; email='sarah@example.com'; password='password123'; role='Mentor'}) -ContentType "application/json" | Out-Null
    Write-Host "Sarah registered: sarah@example.com" -ForegroundColor Green
} catch {
    Write-Host "Sarah already exists" -ForegroundColor Yellow
}

# Step 5: Create Project
Write-Host "`n[5/7] Creating project..." -ForegroundColor Yellow
$project = Invoke-RestMethod -Method Post -Uri "$baseUrl/projects" -Headers @{Authorization="Bearer $adminToken"} -Body (ConvertTo-Json @{name='E-Commerce Website'; description='Build a full-stack e-commerce platform'}) -ContentType "application/json"
$projectId = $project.project._id
$teamCode = $project.project.teamCode
Write-Host "Project created: E-Commerce Website" -ForegroundColor Green
Write-Host "Team Code: $teamCode" -ForegroundColor Cyan

# Step 6: Join Project
Write-Host "`n[6/7] Joining project..." -ForegroundColor Yellow

$aliceLogin = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -Body (ConvertTo-Json @{login='alice@example.com'; password='password123'}) -ContentType "application/json"
Invoke-RestMethod -Method Post -Uri "$baseUrl/projects/join" -Headers @{Authorization="Bearer $($aliceLogin.token)"} -Body (ConvertTo-Json @{teamCode=$teamCode}) -ContentType "application/json" | Out-Null
Write-Host "Alice joined project" -ForegroundColor Green

$bobLogin = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -Body (ConvertTo-Json @{login='bob@example.com'; password='password123'}) -ContentType "application/json"
Invoke-RestMethod -Method Post -Uri "$baseUrl/projects/join" -Headers @{Authorization="Bearer $($bobLogin.token)"} -Body (ConvertTo-Json @{teamCode=$teamCode}) -ContentType "application/json" | Out-Null
Write-Host "Bob joined project" -ForegroundColor Green

$sarahLogin = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -Body (ConvertTo-Json @{login='sarah@example.com'; password='password123'}) -ContentType "application/json"
Invoke-RestMethod -Method Post -Uri "$baseUrl/projects/join" -Headers @{Authorization="Bearer $($sarahLogin.token)"} -Body (ConvertTo-Json @{teamCode=$teamCode}) -ContentType "application/json" | Out-Null
Write-Host "Sarah joined as mentor" -ForegroundColor Green

# Step 7: Create Tasks
Write-Host "`n[7/7] Creating tasks..." -ForegroundColor Yellow

$users = Invoke-RestMethod -Method Get -Uri "$baseUrl/auth/users"
$alice = $users.users | Where-Object { $_.username -eq 'member_alice' }
$bob = $users.users | Where-Object { $_.username -eq 'member_bob' }

Invoke-RestMethod -Method Post -Uri "$baseUrl/tasks" -Headers @{Authorization="Bearer $adminToken"} -Body (ConvertTo-Json @{title='Design Database Schema'; description='Create ERD and define database structure'; status='To Do'; assignedTo=$alice._id; project=$projectId; deadline='2025-11-15'}) -ContentType "application/json" | Out-Null
Write-Host "Task created: Design Database Schema (To Do - Alice)" -ForegroundColor Green

Invoke-RestMethod -Method Post -Uri "$baseUrl/tasks" -Headers @{Authorization="Bearer $adminToken"} -Body (ConvertTo-Json @{title='Setup Backend API'; description='Initialize Express server and routes'; status='In Progress'; assignedTo=$bob._id; project=$projectId; deadline='2025-11-20'}) -ContentType "application/json" | Out-Null
Write-Host "Task created: Setup Backend API (In Progress - Bob)" -ForegroundColor Green

Invoke-RestMethod -Method Post -Uri "$baseUrl/tasks" -Headers @{Authorization="Bearer $adminToken"} -Body (ConvertTo-Json @{title='Create Frontend UI'; description='Design React components'; status='To Do'; assignedTo=$alice._id; project=$projectId; deadline='2025-11-25'}) -ContentType "application/json" | Out-Null
Write-Host "Task created: Create Frontend UI (To Do - Alice)" -ForegroundColor Green

Invoke-RestMethod -Method Post -Uri "$baseUrl/tasks" -Headers @{Authorization="Bearer $adminToken"} -Body (ConvertTo-Json @{title='Payment Integration'; description='Integrate Stripe payment gateway'; status='Done'; assignedTo=$bob._id; project=$projectId; deadline='2025-11-10'}) -ContentType "application/json" | Out-Null
Write-Host "Task created: Payment Integration (Done - Bob)" -ForegroundColor Green

Invoke-RestMethod -Method Post -Uri "$baseUrl/tasks" -Headers @{Authorization="Bearer $adminToken"} -Body (ConvertTo-Json @{title='Write Documentation'; description='Create API documentation'; status='Done'; assignedTo=$alice._id; project=$projectId; deadline='2025-11-08'}) -ContentType "application/json" | Out-Null
Write-Host "Task created: Write Documentation (Done - Alice)" -ForegroundColor Green

Invoke-RestMethod -Method Post -Uri "$baseUrl/tasks" -Headers @{Authorization="Bearer $adminToken"} -Body (ConvertTo-Json @{title='Implement Shopping Cart'; description='Build cart functionality'; status='In Progress'; assignedTo=$alice._id; project=$projectId; deadline='2025-11-18'}) -ContentType "application/json" | Out-Null
Write-Host "Task created: Implement Shopping Cart (In Progress - Alice)" -ForegroundColor Green

Write-Host "`n===== Test Data Created Successfully! =====" -ForegroundColor Green
Write-Host "`nLogin Credentials:" -ForegroundColor Cyan
Write-Host "Admin: admin@example.com / password123" -ForegroundColor White
Write-Host "Alice (Member): alice@example.com / password123 (4 tasks)" -ForegroundColor White
Write-Host "Bob (Member): bob@example.com / password123 (2 tasks)" -ForegroundColor White
Write-Host "Sarah (Mentor): sarah@example.com / password123" -ForegroundColor White
Write-Host "`nTeam Code: $teamCode" -ForegroundColor Cyan
Write-Host "`nOpen http://localhost:3000 to test!" -ForegroundColor Yellow
