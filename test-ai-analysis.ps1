# AI Analysis Testing Script
# This script tests the AI-powered project health analysis and task prioritization features

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "   AI PROJECT HEALTH ANALYSIS - TESTING SCRIPT" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "[1/4] Logging in..." -ForegroundColor Yellow
$loginBody = @{
    login = "alice@example.com"
    password = "pass123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Method Post -Uri 'http://localhost:5000/api/auth/login' -Body $loginBody -ContentType 'application/json'
    $token = $loginResponse.token
    $headers = @{ Authorization = "Bearer $token" }
    Write-Host "   ✓ Login successful" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.user.username) ($($loginResponse.user.role))" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get Projects
Write-Host "[2/4] Fetching projects..." -ForegroundColor Yellow
try {
    $projectsResponse = Invoke-RestMethod -Method Get -Uri 'http://localhost:5000/api/projects/my-projects' -Headers $headers
    
    if ($projectsResponse.count -eq 0) {
        Write-Host "   ⚠ No projects found. Please create a project first." -ForegroundColor Yellow
        exit 0
    }
    
    $project = $projectsResponse.projects[0]
    $projectId = $project._id
    Write-Host "   ✓ Found $($projectsResponse.count) project(s)" -ForegroundColor Green
    Write-Host "   Testing with: $($project.name) (Code: $($project.teamCode))" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ✗ Failed to fetch projects: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Test Health Analysis
Write-Host "[3/4] Running AI Health Analysis..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/projects/$projectId/health-analysis" -Headers $headers
    $analysis = $healthResponse.analysis
    
    Write-Host "   ✓ Analysis completed" -ForegroundColor Green
    Write-Host ""
    Write-Host "   PROJECT HEALTH REPORT" -ForegroundColor Cyan
    Write-Host "   ---------------------" -ForegroundColor Cyan
    Write-Host "   Project: $($analysis.projectName)" -ForegroundColor White
    Write-Host "   Risk Status: $($analysis.riskLevel)" -ForegroundColor $(if ($analysis.isAtRisk) { "Red" } else { "Green" })
    Write-Host ""
    
    Write-Host "   Health Metrics:" -ForegroundColor White
    Write-Host "   - Total Tasks: $($analysis.healthMetrics.totalTasks)"
    $completionPct = $analysis.healthMetrics.completionPercentage
    Write-Host "   - Completed: $($analysis.healthMetrics.completedTasks) ($completionPct percent)"
    Write-Host "   - In Progress: $($analysis.healthMetrics.inProgressTasks)"
    Write-Host "   - To Do: $($analysis.healthMetrics.todoTasks)"
    Write-Host "   - Team Size: $($analysis.healthMetrics.teamSize)"
    Write-Host "   - Team Velocity: $($analysis.healthMetrics.teamVelocity) tasks/day"
    Write-Host "   - Est. Days to Complete: $($analysis.healthMetrics.estimatedDaysToComplete)"
    Write-Host ""
    
    if ($analysis.riskFactors.Count -gt 0) {
        Write-Host "   ⚠ Risk Factors:" -ForegroundColor Yellow
        foreach ($risk in $analysis.riskFactors) {
            Write-Host "   - $risk" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    if ($analysis.urgentTasks.Count -gt 0) {
        Write-Host "   🔥 Urgent Tasks:" -ForegroundColor Red
        foreach ($task in $analysis.urgentTasks) {
            $status = if ($task.isOverdue) { "OVERDUE" } else { "$($task.daysUntilDeadline) days left" }
            Write-Host "   - $($task.title): $status" -ForegroundColor $(if ($task.isOverdue) { "Red" } else { "White" })
        }
        Write-Host ""
    }
    
    Write-Host "   💡 Recommendations:" -ForegroundColor Cyan
    foreach ($rec in $analysis.recommendations) {
        Write-Host "   - $rec" -ForegroundColor Gray
    }
    Write-Host ""
    
} catch {
    Write-Host "   ✗ Health analysis failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Test Prioritized Tasks
Write-Host "[4/4] Fetching Prioritized Tasks..." -ForegroundColor Yellow
try {
    $priorityResponse = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/projects/$projectId/prioritized-tasks?limit=10" -Headers $headers
    
    Write-Host "   ✓ Retrieved $($priorityResponse.count) prioritized task(s)" -ForegroundColor Green
    Write-Host ""
    Write-Host "   TASK PRIORITY QUEUE" -ForegroundColor Cyan
    Write-Host "   -------------------" -ForegroundColor Cyan
    
    $rank = 1
    foreach ($task in $priorityResponse.tasks) {
        $color = switch ($task.priorityLevel) {
            "CRITICAL" { "Red" }
            "HIGH" { "Yellow" }
            "MEDIUM" { "White" }
            default { "Gray" }
        }
        
        Write-Host "   #$rank - [$($task.priorityLevel)] $($task.title)" -ForegroundColor $color
        Write-Host "       Status: $($task.status) | Score: $($task.priorityScore)" -ForegroundColor Gray
        Write-Host "       Reasons: $($task.reasons -join ', ')" -ForegroundColor Gray
        if ($task.assignedTo) {
            Write-Host "       Assigned to: $($task.assignedTo.username)" -ForegroundColor Gray
        } else {
            Write-Host "       ⚠ Unassigned" -ForegroundColor Yellow
        }
        Write-Host ""
        $rank++
    }
    
} catch {
    Write-Host "   ✗ Failed to fetch prioritized tasks: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "   ✓ ALL TESTS COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Endpoints Tested:" -ForegroundColor White
Write-Host "  - POST /api/auth/login" -ForegroundColor Gray
Write-Host "  - GET /api/projects/my-projects" -ForegroundColor Gray
Write-Host "  - GET /api/projects/health-analysis" -ForegroundColor Gray
Write-Host "  - GET /api/projects/prioritized-tasks" -ForegroundColor Gray
Write-Host ""
