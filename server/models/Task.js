const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  deadline: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Index for querying tasks by project and status
TaskSchema.index({ project: 1, status: 1 });
TaskSchema.index({ assignedTo: 1 });

module.exports = mongoose.models.Task || mongoose.model('Task', TaskSchema);
