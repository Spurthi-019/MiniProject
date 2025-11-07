const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../authMiddleware');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { analyzeProjectHealth, getPrioritizedTasks } = require('../utils/aiAnalysis');

/**
 * Generate a unique 6-digit teamCode
 */
const generateUniqueTeamCode = async () => {
  let teamCode;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate random 6-digit code (100000 to 999999)
    teamCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Check if it already exists
    const existing = await Project.findOne({ teamCode });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique team code after multiple attempts');
  }

  return teamCode;
};

// POST /api/projects - Create a new project (Admin/Team Lead only)
// Body: { name, description? }
router.post('/', authMiddleware, authorize('Admin/Team Lead'), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    // Generate unique 6-digit teamCode
    const teamCode = await generateUniqueTeamCode();

    // Create project with authenticated user as teamLead
    const project = new Project({
      name: name.trim(),
      description: description || '',
      teamCode,
      teamLead: req.user.id,
      members: [],
      mentors: []
    });

    await project.save();

    // Populate teamLead info for response
    await project.populate('teamLead', 'username email role');

    return res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (err) {
    console.error('Create project error:', err);
    if (err.message.includes('unique team code')) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Server error creating project' });
  }
});

// POST /api/projects/join - Join a project using teamCode
// Body: { teamCode }
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { teamCode } = req.body;

    if (!teamCode || !teamCode.trim()) {
      return res.status(400).json({ message: 'Team code is required' });
    }

    // Find project by teamCode
    const project = await Project.findOne({ teamCode: teamCode.trim() });
    if (!project) {
      return res.status(404).json({ message: 'Project not found with this team code' });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user is already the team lead
    if (project.teamLead.toString() === userId) {
      return res.status(400).json({ message: 'You are already the team lead of this project' });
    }

    // Check if user is already a member
    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'You are already a member of this project' });
    }

    // Check if user is already a mentor
    if (project.mentors.includes(userId)) {
      return res.status(400).json({ message: 'You are already a mentor of this project' });
    }

    // Add user based on their role
    if (userRole === 'Mentor') {
      project.mentors.push(userId);
    } else {
      // 'Team Members' or 'Admin/Team Lead' join as members
      project.members.push(userId);
    }

    await project.save();

    // Populate all user references for response
    await project.populate('teamLead members mentors', 'username email role');

    return res.status(200).json({
      message: `Successfully joined project as ${userRole === 'Mentor' ? 'mentor' : 'member'}`,
      project
    });
  } catch (err) {
    console.error('Join project error:', err);
    return res.status(500).json({ message: 'Server error joining project' });
  }
});

// GET /api/projects/my-projects - Get all projects the user is part of
router.get('/my-projects', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all projects where user is team lead, member, or mentor
    const projects = await Project.find({
      $or: [
        { teamLead: userId },
        { members: userId },
        { mentors: userId }
      ]
    })
      .populate('teamLead', 'username email role')
      .populate('members', 'username email role')
      .populate('mentors', 'username email role')
      .sort({ createdAt: -1 }); // newest first

    return res.status(200).json({
      message: 'Projects retrieved successfully',
      count: projects.length,
      projects
    });
  } catch (err) {
    console.error('Get my projects error:', err);
    return res.status(500).json({ message: 'Server error fetching projects' });
  }
});

// GET /api/projects/:projectId/metrics - Get project metrics including individual contributions
router.get('/:projectId/metrics', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find project and verify access
    const project = await Project.findById(projectId)
      .populate('teamLead', 'username email role')
      .populate('members', 'username email role')
      .populate('mentors', 'username email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access (team lead, member, or mentor)
    const userId = req.user.id;
    const isTeamLead = project.teamLead._id.toString() === userId;
    const isMember = project.members.some(m => m._id.toString() === userId);
    const isMentor = project.mentors.some(m => m._id.toString() === userId);

    if (!isTeamLead && !isMember && !isMentor) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    // Get all tasks for this project
    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'username email role');

    // Calculate individual contribution metrics
    const contributionMetrics = {};
    
    // Initialize metrics for all team members (including team lead)
    const allMembers = [project.teamLead, ...project.members];
    allMembers.forEach(member => {
      contributionMetrics[member._id.toString()] = {
        userId: member._id,
        username: member.username,
        email: member.email,
        role: member.role,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        completionRate: 0
      };
    });

    // Count tasks for each member
    tasks.forEach(task => {
      if (task.assignedTo) {
        const assignedId = task.assignedTo._id.toString();
        if (contributionMetrics[assignedId]) {
          contributionMetrics[assignedId].totalTasks++;
          
          if (task.status === 'Done') {
            contributionMetrics[assignedId].completedTasks++;
          } else if (task.status === 'In Progress') {
            contributionMetrics[assignedId].inProgressTasks++;
          } else if (task.status === 'To Do') {
            contributionMetrics[assignedId].todoTasks++;
          }
        }
      }
    });

    // Calculate completion rates
    Object.keys(contributionMetrics).forEach(memberId => {
      const metrics = contributionMetrics[memberId];
      if (metrics.totalTasks > 0) {
        metrics.completionRate = Math.round((metrics.completedTasks / metrics.totalTasks) * 100);
      }
    });

    // Convert to array and sort by completion rate
    const metricsArray = Object.values(contributionMetrics).sort((a, b) => b.completionRate - a.completionRate);

    // Overall project statistics
    const projectStats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'Done').length,
      inProgressTasks: tasks.filter(t => t.status === 'In Progress').length,
      todoTasks: tasks.filter(t => t.status === 'To Do').length,
      totalMembers: allMembers.length,
      completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100) : 0
    };

    return res.status(200).json({
      message: 'Project metrics retrieved successfully',
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        teamCode: project.teamCode,
        teamLead: project.teamLead,
        members: project.members,
        mentors: project.mentors
      },
      projectStats,
      contributionMetrics: metricsArray
    });
  } catch (err) {
    console.error('Get project metrics error:', err);
    return res.status(500).json({ message: 'Server error fetching project metrics' });
  }
});

// GET /api/projects/:projectId/burndown-data - Get burn-down chart data for a project
router.get('/:projectId/burndown-data', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find project and verify access
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access (team lead, member, or mentor)
    const userId = req.user.id;
    const isTeamLead = project.teamLead.toString() === userId;
    const isMember = project.members.some(m => m.toString() === userId);
    const isMentor = project.mentors.some(m => m.toString() === userId);

    if (!isTeamLead && !isMember && !isMentor) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    // Get all tasks for this project
    const tasks = await Task.find({ project: projectId }).sort({ createdAt: 1 });

    if (tasks.length === 0) {
      return res.status(200).json({
        message: 'No tasks found for this project',
        burndownData: [],
        totalInitialTasks: 0
      });
    }

    // Total initial tasks
    const totalInitialTasks = tasks.length;

    // Determine the project start date (earliest task creation or project creation)
    const projectStartDate = new Date(Math.min(
      project.createdAt.getTime(),
      tasks[0].createdAt.getTime()
    ));

    // Determine the end date (latest deadline or current date)
    const taskDeadlines = tasks
      .filter(t => t.deadline)
      .map(t => new Date(t.deadline).getTime());
    
    const latestDeadline = taskDeadlines.length > 0 
      ? Math.max(...taskDeadlines) 
      : Date.now();
    
    const projectEndDate = new Date(Math.max(latestDeadline, Date.now()));

    // Create a map to track when tasks were completed
    const taskCompletionMap = new Map();
    tasks.forEach(task => {
      if (task.status === 'Done' && task.updatedAt) {
        const completionDate = new Date(task.updatedAt).toISOString().split('T')[0];
        taskCompletionMap.set(completionDate, (taskCompletionMap.get(completionDate) || 0) + 1);
      }
    });

    // Generate daily data points from start to end
    const burndownData = [];
    let currentDate = new Date(projectStartDate);
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const endDate = new Date(projectEndDate);
    endDate.setHours(23, 59, 59, 999); // Set to end of day

    let remainingTasks = totalInitialTasks;
    const currentTime = new Date();

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Only process dates up to today
      if (currentDate <= currentTime) {
        // Calculate tasks completed on this date
        const completedOnThisDate = taskCompletionMap.get(dateStr) || 0;
        
        // Update remaining tasks
        if (completedOnThisDate > 0) {
          remainingTasks -= completedOnThisDate;
        }

        burndownData.push({
          date: dateStr,
          remainingTasks: Math.max(0, remainingTasks)
        });
      } else {
        // For future dates, project the ideal burn-down line
        // (This helps visualize where the project should be)
        burndownData.push({
          date: dateStr,
          remainingTasks: Math.max(0, remainingTasks),
          projected: true
        });
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate current completion status
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const currentRemainingTasks = totalInitialTasks - completedTasks;

    return res.status(200).json({
      message: 'Burn-down data retrieved successfully',
      totalInitialTasks,
      currentRemainingTasks,
      completedTasks,
      projectStartDate: projectStartDate.toISOString().split('T')[0],
      projectEndDate: projectEndDate.toISOString().split('T')[0],
      burndownData
    });
  } catch (err) {
    console.error('Get burn-down data error:', err);
    return res.status(500).json({ message: 'Server error fetching burn-down data' });
  }
});

// GET /api/projects/:projectId/health-analysis - Analyze project health and identify risks
router.get('/:projectId/health-analysis', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find project and verify access
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access (team lead, member, or mentor)
    const userId = req.user.id;
    const isTeamLead = project.teamLead.toString() === userId;
    const isMember = project.members.some(m => m.toString() === userId);
    const isMentor = project.mentors.some(m => m.toString() === userId);

    if (!isTeamLead && !isMember && !isMentor) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    // Perform health analysis
    const analysis = await analyzeProjectHealth(projectId);

    return res.status(200).json({
      message: 'Project health analysis completed',
      analysis
    });
  } catch (err) {
    console.error('Get project health analysis error:', err);
    return res.status(500).json({ message: 'Server error analyzing project health' });
  }
});

// GET /api/projects/:projectId/prioritized-tasks - Get prioritized task list
router.get('/:projectId/prioritized-tasks', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Find project and verify access
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access (team lead, member, or mentor)
    const userId = req.user.id;
    const isTeamLead = project.teamLead.toString() === userId;
    const isMember = project.members.some(m => m.toString() === userId);
    const isMentor = project.mentors.some(m => m.toString() === userId);

    if (!isTeamLead && !isMember && !isMentor) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    // Get prioritized tasks
    const prioritizedTasks = await getPrioritizedTasks(projectId, limit);

    return res.status(200).json({
      message: 'Prioritized tasks retrieved successfully',
      count: prioritizedTasks.length,
      tasks: prioritizedTasks
    });
  } catch (err) {
    console.error('Get prioritized tasks error:', err);
    return res.status(500).json({ message: 'Server error fetching prioritized tasks' });
  }
});

// GET /api/projects/:projectId/recommendations - Get AI-powered project recommendations
router.get('/:projectId/recommendations', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const suggestedTasksLimit = parseInt(req.query.limit) || 5;

    // Find project and verify access
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access (team lead, member, or mentor)
    const userId = req.user.id;
    const isTeamLead = project.teamLead.toString() === userId;
    const isMember = project.members.some(m => m.toString() === userId);
    const isMentor = project.mentors.some(m => m.toString() === userId);

    if (!isTeamLead && !isMember && !isMentor) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    // Get health analysis for delay warnings
    const healthAnalysis = await analyzeProjectHealth(projectId);

    // Get prioritized tasks for next suggested tasks
    const prioritizedTasks = await getPrioritizedTasks(projectId, suggestedTasksLimit);

    // Prepare next suggested tasks
    const nextSuggestedTasks = prioritizedTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      deadline: task.deadline,
      assignedTo: task.assignedTo,
      priorityLevel: task.priorityLevel,
      reasons: task.reasons
    }));

    // Prepare project delay warning
    const hasDelayRisk = healthAnalysis.isAtRisk;
    const delayWarning = {
      isDelayed: hasDelayRisk,
      riskLevel: healthAnalysis.riskLevel,
      message: hasDelayRisk 
        ? `⚠️ Project is at ${healthAnalysis.riskLevel} risk of delays. ${healthAnalysis.riskFactors.join('. ')}`
        : '✅ Project is on track with no significant delay risks.',
      riskFactors: healthAnalysis.riskFactors,
      recommendations: healthAnalysis.recommendations
    };

    // Additional insights
    const insights = {
      urgentTasksCount: healthAnalysis.urgentTasks.length,
      teamVelocity: healthAnalysis.healthMetrics.teamVelocity,
      completionPercentage: healthAnalysis.healthMetrics.completionPercentage,
      estimatedDaysToComplete: healthAnalysis.healthMetrics.estimatedDaysToComplete
    };

    return res.status(200).json({
      message: 'Project recommendations generated successfully',
      projectId,
      projectName: healthAnalysis.projectName,
      nextSuggestedTasks,
      projectDelayWarning: delayWarning,
      insights,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Get project recommendations error:', err);
    return res.status(500).json({ message: 'Server error generating project recommendations' });
  }
});

module.exports = router;
