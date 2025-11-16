const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  type: {
    type: String,
    enum: ['text', 'file', 'system'],
    default: 'text'
  },
  metadata: {
    fileName: String,
    fileSize: Number,
    fileUrl: String
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
messageSchema.index({ project: 1, timestamp: -1 });
messageSchema.index({ project: 1, sender: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
