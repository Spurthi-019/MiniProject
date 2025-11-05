const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../authMiddleware');
const Project = require('../models/Project');

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

module.exports = router;
