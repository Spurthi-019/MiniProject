const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../authMiddleware');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Invitation = require('../models/Invitation');
const { analyzeProjectHealth, getPrioritizedTasks } = require('../utils/aiAnalysis');
const { analyzeChatActivity, getChatActivityTrends } = require('../utils/chatAnalysis');
const geminiAI = require('../utils/geminiAI');

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

// POST /api/projects/invite - Send invitation to join a project
// Body: { projectId, email, role }
router.post('/invite', authMiddleware, async (req, res) => {
  try {
    const { projectId, email, role } = req.body;

    if (!projectId || !email || !role) {
      return res.status(400).json({ message: 'Project ID, email, and role are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate role
    if (!['Team Member', 'Mentor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "Team Member" or "Mentor"' });
    }

    // Find the project
    const project = await Project.findById(projectId)
      .populate('teamLead', 'username email')
      .populate('members', 'email')
      .populate('mentors', 'email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const userId = req.user.id;

    // Check if the user has permission to invite (team lead or member of the project)
    const isTeamLead = project.teamLead._id.toString() === userId;
    const isMember = project.members.some(m => m._id.toString() === userId);
    const isMentor = project.mentors.some(m => m._id.toString() === userId);

    if (!isTeamLead && !isMember && !isMentor) {
      return res.status(403).json({ message: 'You do not have permission to invite to this project' });
    }

    // Check if the person is already in the project
    const emailLower = email.toLowerCase().trim();
    
    if (project.teamLead.email.toLowerCase() === emailLower) {
      return res.status(400).json({ message: 'This person is already the team lead of this project' });
    }

    const isAlreadyMember = project.members.some(m => m.email.toLowerCase() === emailLower);
    const isAlreadyMentor = project.mentors.some(m => m.email.toLowerCase() === emailLower);

    if (isAlreadyMember || isAlreadyMentor) {
      return res.status(400).json({ message: 'This person is already part of the project' });
    }

    // Check if there's already a pending invitation
    const existingInvitation = await Invitation.findOne({
      project: projectId,
      email: emailLower,
      status: 'pending'
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'An invitation has already been sent to this email' });
    }

    // Create the invitation
    const invitation = new Invitation({
      project: projectId,
      email: emailLower,
      role: role,
      invitedBy: userId,
      status: 'pending'
    });

    await invitation.save();

    // Populate the invitation for the response
    await invitation.populate('project', 'name teamCode');
    await invitation.populate('invitedBy', 'username email');

    console.log('='.repeat(60));
    console.log('INVITATION CREATED');
    console.log('='.repeat(60));
    console.log(`To: ${email}`);
    console.log(`Project: ${project.name}`);
    console.log(`Role: ${role}`);
    console.log(`Team Code: ${project.teamCode}`);
    console.log(`Invited by: ${req.user.username} (${req.user.email})`);
    console.log(`Invitation ID: ${invitation._id}`);
    console.log('='.repeat(60));

    // Try to find the invited user and notify them via Socket.IO
    try {
      const User = require('../models/User');
      const invitedUser = await User.findOne({ email: emailLower });
      
      if (invitedUser) {
        const io = req.app.get('io');
        if (io) {
          // Emit to the invited user's personal room
          io.to(`user-${invitedUser._id}`).emit('new-invitation', {
            invitation: {
              _id: invitation._id,
              project: {
                _id: project._id,
                name: project.name,
                teamCode: project.teamCode,
                description: project.description
              },
              role: invitation.role,
              invitedBy: {
                username: req.user.username,
                email: req.user.email
              },
              createdAt: invitation.createdAt
            }
          });
          console.log(`🔔 Real-time notification sent to user ${invitedUser._id}`);
        }
      }
    } catch (notifyErr) {
      console.error('Failed to send real-time notification:', notifyErr);
      // Don't fail the request if notification fails
    }

    return res.status(201).json({
      message: `Invitation sent successfully to ${email}`,
      invitation: {
        _id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        projectName: project.name,
        teamCode: project.teamCode,
        invitedBy: invitation.invitedBy
      }
    });
  } catch (err) {
    console.error('Send invitation error:', err);
    return res.status(500).json({ message: 'Server error sending invitation' });
  }
});

// GET /api/projects/invitations - Get pending invitations for the logged-in user
router.get('/invitations', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();

    const invitations = await Invitation.find({
      email: userEmail,
      status: 'pending'
    })
      .populate('project', 'name teamCode description')
      .populate('invitedBy', 'username email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      invitations
    });
  } catch (err) {
    console.error('Get invitations error:', err);
    return res.status(500).json({ message: 'Server error fetching invitations' });
  }
});

// POST /api/projects/invitations/:invitationId/accept - Accept an invitation
router.post('/invitations/:invitationId/accept', authMiddleware, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userEmail = req.user.email.toLowerCase();
    const userId = req.user.id;

    const invitation = await Invitation.findById(invitationId)
      .populate('project', 'name teamCode');

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Verify the invitation is for this user
    if (invitation.email.toLowerCase() !== userEmail) {
      return res.status(403).json({ message: 'This invitation is not for you' });
    }

    // Check if already accepted or declined
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: `Invitation already ${invitation.status}` });
    }

    // Get the project
    const project = await Project.findById(invitation.project._id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is already in the project
    if (project.teamLead.toString() === userId) {
      return res.status(400).json({ message: 'You are already the team lead of this project' });
    }

    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'You are already a member of this project' });
    }

    if (project.mentors.includes(userId)) {
      return res.status(400).json({ message: 'You are already a mentor of this project' });
    }

    // Add user to the project based on invited role
    if (invitation.role === 'Mentor') {
      project.mentors.push(userId);
    } else {
      project.members.push(userId);
    }

    await project.save();

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    // Populate project details for response
    await project.populate('teamLead members mentors', 'username email role');

    return res.status(200).json({
      message: `Successfully joined ${project.name} as ${invitation.role}`,
      project
    });
  } catch (err) {
    console.error('Accept invitation error:', err);
    return res.status(500).json({ message: 'Server error accepting invitation' });
  }
});

// POST /api/projects/invitations/:invitationId/decline - Decline an invitation
router.post('/invitations/:invitationId/decline', authMiddleware, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userEmail = req.user.email.toLowerCase();

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Verify the invitation is for this user
    if (invitation.email.toLowerCase() !== userEmail) {
      return res.status(403).json({ message: 'This invitation is not for you' });
    }

    // Check if already accepted or declined
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: `Invitation already ${invitation.status}` });
    }

    // Update invitation status
    invitation.status = 'declined';
    await invitation.save();

    return res.status(200).json({
      message: 'Invitation declined successfully'
    });
  } catch (err) {
    console.error('Decline invitation error:', err);
    return res.status(500).json({ message: 'Server error declining invitation' });
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

// GET /api/projects/user-projects - Get all projects where the authenticated user is involved
// This route provides granular access by checking teamLead, members, and mentors fields
router.get('/user-projects', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Query projects where the current user's ID is in teamLead, members, or mentors
    const projects = await Project.find({
      $or: [
        { teamLead: userId },
        { members: { $in: [userId] } },
        { mentors: { $in: [userId] } }
      ]
    })
      .populate('teamLead', 'username email role')
      .populate('members', 'username email role')
      .populate('mentors', 'username email role')
      .sort({ createdAt: -1 }); // Sort by newest first

    // Add role information for each project to indicate user's role
    const projectsWithUserRole = projects.map(project => {
      const projectObj = project.toObject();
      
      // Determine user's role in this project
      let userRole = null;
      if (project.teamLead._id.toString() === userId) {
        userRole = 'Team Lead';
      } else if (project.members.some(member => member._id.toString() === userId)) {
        userRole = 'Member';
      } else if (project.mentors.some(mentor => mentor._id.toString() === userId)) {
        userRole = 'Mentor';
      }
      
      return {
        ...projectObj,
        userRoleInProject: userRole
      };
    });

    return res.status(200).json({
      message: 'User projects retrieved successfully',
      count: projectsWithUserRole.length,
      projects: projectsWithUserRole
    });
  } catch (err) {
    console.error('Get user projects error:', err);
    return res.status(500).json({ message: 'Server error fetching user projects' });
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

// GET /api/projects/:projectId/recommendations - Get AI-powered project recommendations (Real-time with Gemini)
router.get('/:projectId/recommendations', authMiddleware, async (req, res) => {
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

    // Generate real-time AI recommendations using Gemini
    const recommendations = await geminiAI.generateRecommendations(projectId);

    return res.status(200).json({
      success: true,
      message: 'AI-powered recommendations generated successfully',
      projectId,
      projectName: project.name,
      recommendations,
      aiEnabled: geminiAI.isAvailable(),
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Get project recommendations error:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      projectId: req.params.projectId
    });
    return res.status(500).json({ 
      message: 'Server error generating project recommendations',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /api/projects/:projectId/my-recommendations - Get personalized task recommendations for current user
router.get('/:projectId/my-recommendations', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Find project and verify access
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access
    const isTeamLead = project.teamLead.toString() === userId;
    const isMember = project.members.some(m => m.toString() === userId);
    const isMentor = project.mentors.some(m => m.toString() === userId);

    if (!isTeamLead && !isMember && !isMentor) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    // Generate personalized recommendations
    const personalRecommendations = await geminiAI.generateMemberRecommendations(projectId, userId);

    return res.status(200).json({
      success: true,
      message: 'Personal recommendations generated successfully',
      projectId,
      userId,
      recommendations: personalRecommendations,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Get personal recommendations error:', err);
    return res.status(500).json({ 
      message: 'Server error generating personal recommendations',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /api/projects/:projectId/chat-metrics - Get chat activity metrics for a project
// Always calculates over the last 7 days and includes total messages and top contributors
router.get('/:projectId/chat-metrics', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const daysBack = 7; // Always use 7 days for consistency

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is authorized to view this project
    const userId = req.user.id;
    const isMember = project.members.some(memberId => memberId.toString() === userId);
    const isTeamLead = project.teamLead.toString() === userId;
    const isMentor = project.mentors.some(mentorId => mentorId.toString() === userId);

    if (!isMember && !isTeamLead && !isMentor) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this project.' 
      });
    }

    // Analyze chat activity over the last 7 days
    const chatMetrics = await analyzeChatActivity(projectId, daysBack);

    if (!chatMetrics.success) {
      return res.status(500).json({ 
        message: chatMetrics.error || 'Failed to analyze chat metrics' 
      });
    }

    // Return the metrics with total messages and top contributors
    return res.status(200).json({
      message: 'Chat metrics retrieved successfully',
      projectId,
      projectName: project.name,
      daysAnalyzed: daysBack,
      totalMessages: chatMetrics.summary.totalMessages,
      topContributors: chatMetrics.topActiveMembers,
      metrics: chatMetrics,
      generatedAt: new Date().toISOString()
    });

  } catch (err) {
    console.error('Get chat metrics error:', err);
    return res.status(500).json({ 
      message: 'Server error retrieving chat metrics',
      error: err.message 
    });
  }
});

// GET /api/projects/:projectId/chat-trends - Get chat activity trends over time
router.get('/:projectId/chat-trends', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is authorized to view this project
    const userId = req.user.id;
    const isMember = project.members.some(memberId => memberId.toString() === userId);
    const isTeamLead = project.teamLead.toString() === userId;
    const isMentor = project.mentors.some(mentorId => mentorId.toString() === userId);

    if (!isMember && !isTeamLead && !isMentor) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this project.' 
      });
    }

    // Get chat activity trends
    const chatTrends = await getChatActivityTrends(projectId);

    if (!trends.success) {
      return res.status(500).json({ 
        message: trends.error || 'Failed to analyze chat trends' 
      });
    }

    // Return the trends
    return res.status(200).json({
      message: 'Chat trends retrieved successfully',
      projectId,
      projectName: project.name,
      trends,
      generatedAt: new Date().toISOString()
    });

  } catch (err) {
    console.error('Get chat trends error:', err);
    return res.status(500).json({ 
      message: 'Server error retrieving chat trends',
      error: err.message 
    });
  }
});

module.exports = router;
