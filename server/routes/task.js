const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../authMiddleware');
const Task = require('../models/Task');
const Project = require('../models/Project');

// POST /api/tasks - Create a new task (Team Lead/Admin only)
// Body: { title, description?, status?, assignedTo?, project, deadline? }
router.post('/', authMiddleware, authorize('Admin/Team Lead'), async (req, res) => {
  try {
    const { title, description, status, assignedTo, project, deadline } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    if (!project) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    // Verify project exists and user is the team lead
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (projectDoc.teamLead.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the team lead can create tasks for this project' });
    }

    // If assignedTo is provided, verify they are a member or mentor of the project
    if (assignedTo) {
      const isMember = projectDoc.members.some(m => m.toString() === assignedTo);
      const isMentor = projectDoc.mentors.some(m => m.toString() === assignedTo);
      const isTeamLead = projectDoc.teamLead.toString() === assignedTo;

      if (!isMember && !isMentor && !isTeamLead) {
        return res.status(400).json({ message: 'Assigned user is not part of this project' });
      }
    }

    // Create task
    const task = new Task({
      title: title.trim(),
      description: description || '',
      status: status || 'To Do',
      assignedTo: assignedTo || null,
      project,
      deadline: deadline ? new Date(deadline) : null
    });

    await task.save();

    // Populate references for response
    await task.populate('assignedTo', 'username email role');
    await task.populate('project', 'name teamCode');

    return res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (err) {
    console.error('Create task error:', err);
    return res.status(500).json({ message: 'Server error creating task' });
  }
});

// GET /api/tasks/project/:projectId - Get all tasks for a specific project
router.get('/project/:projectId', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is part of the project (team lead, member, or mentor)
    const userId = req.user.id;
    const isTeamLead = project.teamLead.toString() === userId;
    const isMember = project.members.some(m => m.toString() === userId);
    const isMentor = project.mentors.some(m => m.toString() === userId);

    if (!isTeamLead && !isMember && !isMentor) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    // Fetch all tasks for this project
    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'username email role')
      .populate('project', 'name teamCode')
      .sort({ createdAt: -1 }); // newest first

    return res.status(200).json({
      message: 'Tasks retrieved successfully',
      count: tasks.length,
      tasks
    });
  } catch (err) {
    console.error('Get tasks error:', err);
    return res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

// GET /api/tasks/my-tasks - Get all tasks assigned to the authenticated user
router.get('/my-tasks', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all tasks assigned to this user
    const tasks = await Task.find({ assignedTo: userId })
      .populate('assignedTo', 'username email role')
      .populate('project', 'name teamCode')
      .sort({ createdAt: -1 }); // newest first

    return res.status(200).json({
      message: 'Tasks retrieved successfully',
      count: tasks.length,
      tasks
    });
  } catch (err) {
    console.error('Get my tasks error:', err);
    return res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

// PUT /api/tasks/:taskId/status - Update task status
router.put('/:taskId/status', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Validate status value
    const validStatuses = ['To Do', 'In Progress', 'Done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be: To Do, In Progress, or Done' });
    }

    // Find task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user is assigned to this task or is the team lead
    const userId = req.user.id;
    const project = await Project.findById(task.project);
    
    const isAssigned = task.assignedTo && task.assignedTo.toString() === userId;
    const isTeamLead = project && project.teamLead.toString() === userId;

    if (!isAssigned && !isTeamLead) {
      return res.status(403).json({ message: 'You can only update status of tasks assigned to you or if you are the team lead' });
    }

    // Update status
    task.status = status;
    await task.save();

    // Populate references for response
    await task.populate('assignedTo', 'username email role');
    await task.populate('project', 'name teamCode');

    return res.status(200).json({
      message: 'Task status updated successfully',
      task
    });
  } catch (err) {
    console.error('Update task status error:', err);
    return res.status(500).json({ message: 'Server error updating task status' });
  }
});

module.exports = router;
