const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

// routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/project');
const taskRoutes = require('./routes/task');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React app URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Simple health route
app.get('/', (req, res) => res.json({ message: 'Server Running' }));

// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount project routes
app.use('/api/projects', projectRoutes);

// Mount task routes
app.use('/api/tasks', taskRoutes);

// MongoDB connection (optional) - uses MONGODB_URI from server/.env if provided
const mongoUri = process.env.MONGODB_URI || '';
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err.message));
} else {
  console.log('No MONGODB_URI provided — skipping MongoDB connection');
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Handle user joining a project room
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`User ${socket.id} joined project room: project-${projectId}`);
  });

  // Handle user leaving a project room
  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
    console.log(`User ${socket.id} left project room: project-${projectId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Socket.IO ready for connections`);
});
