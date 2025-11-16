const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Team Member', 'Mentor']
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Auto-delete after 7 days (in seconds)
  }
}, { timestamps: true });

// Index for faster lookups
invitationSchema.index({ email: 1, status: 1 });
invitationSchema.index({ project: 1, status: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);
