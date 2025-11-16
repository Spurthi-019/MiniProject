const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../authMiddleware');
const Project = require('../models/Project');
const Message = require('../models/Message');
const User = require('../models/User');

// POST /api/chat/:projectId/send - Send a message to project chat
router.post('/:projectId/send', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    if (content.trim().length > 5000) {
      return res.status(400).json({ message: 'Message is too long (max 5000 characters)' });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is authorized (member, team lead, or mentor)
    const isMember = project.members.some(memberId => memberId.toString() === userId);
    const isTeamLead = project.teamLead.toString() === userId;
    const isMentor = project.mentors.some(mentorId => mentorId.toString() === userId);

    if (!isMember && !isTeamLead && !isMentor) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this project.' 
      });
    }

    // Create message
    const message = new Message({
      project: projectId,
      sender: userId,
      content: content.trim(),
      messageType: 'text'
    });

    await message.save();

    // Populate sender info for response
    await message.populate('sender', 'username email role');

    return res.status(201).json({
      message: 'Message sent successfully',
      chatMessage: message
    });

  } catch (err) {
    console.error('Send message error:', err);
    return res.status(500).json({ 
      message: 'Server error sending message',
      error: err.message 
    });
  }
});

// GET /api/chat/:projectId/messages - Get all messages for a project
// Query params: ?limit=50&before=messageId (for pagination)
router.get('/:projectId/messages', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before; // Message ID to fetch messages before

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is authorized
    const isMember = project.members.some(memberId => memberId.toString() === userId);
    const isTeamLead = project.teamLead.toString() === userId;
    const isMentor = project.mentors.some(mentorId => mentorId.toString() === userId);

    if (!isMember && !isTeamLead && !isMentor) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this project.' 
      });
    }

    // Build query - include messages where isDeleted is false or not set (older seeded docs may not have the field)
    const query = {
      project: projectId,
      $or: [
        { isDeleted: { $exists: false } },
        { isDeleted: false }
      ]
    };

    // If 'before' is provided, fetch messages before that message
    if (before) {
      const beforeMessage = await Message.findById(before);
      if (beforeMessage) {
        query.createdAt = { $lt: beforeMessage.createdAt };
      }
    }

    // Fetch messages
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'username email role')
      .lean();

    // Reverse to get chronological order
    messages.reverse();

    return res.status(200).json({
      message: 'Messages retrieved successfully',
      messages,
      count: messages.length,
      hasMore: messages.length === limit
    });

  } catch (err) {
    console.error('Get messages error:', err);
    return res.status(500).json({ 
      message: 'Server error retrieving messages',
      error: err.message 
    });
  }
});

// DELETE /api/chat/messages/:messageId - Delete a message (only sender can delete)
router.delete('/messages/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Find message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete your own messages.' 
      });
    }

    // Soft delete
    message.isDeleted = true;
    await message.save();

    return res.status(200).json({
      message: 'Message deleted successfully'
    });

  } catch (err) {
    console.error('Delete message error:', err);
    return res.status(500).json({ 
      message: 'Server error deleting message',
      error: err.message 
    });
  }
});

module.exports = router;
