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
const chatRoutes = require('./routes/chat');

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

// Mount chat routes
app.use('/api/chat', chatRoutes);

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
    const room = `project-${projectId}`;
    socket.join(room);
    console.log(`User ${socket.id} joined project room: ${room}`);

    // Notify others in the room
    socket.to(room).emit('user-joined', {
      socketId: socket.id,
      timestamp: new Date()
    });

    // Emit updated online count for the room
    try {
      const size = io.sockets.adapter.rooms.get(room)?.size || 0;
      io.to(room).emit('online-count', { projectId, count: size });
    } catch (e) {
      console.error('Failed to emit online-count on join:', e);
    }
  });

  // Handle user leaving a project room
  socket.on('leave-project', (projectId) => {
    const room = `project-${projectId}`;
    socket.leave(room);
    console.log(`User ${socket.id} left project room: ${room}`);

    // Notify others in the room
    socket.to(room).emit('user-left', {
      socketId: socket.id,
      timestamp: new Date()
    });

    // Emit updated online count for the room
    try {
      const size = io.sockets.adapter.rooms.get(room)?.size || 0;
      io.to(room).emit('online-count', { projectId, count: size });
    } catch (e) {
      console.error('Failed to emit online-count on leave:', e);
    }
  });

  // Handle new chat message
  socket.on('send-message', (data) => {
    const { projectId, message } = data;
    console.log(`Message in project ${projectId} from ${socket.id}`);
    
    // Broadcast message to all users in the project room (including sender)
    io.to(`project-${projectId}`).emit('new-message', message);
  });

  // Handle typing indicator
  socket.on('typing-start', (data) => {
    const { projectId, username } = data;
    socket.to(`project-${projectId}`).emit('user-typing', { username });
  });

  socket.on('typing-stop', (data) => {
    const { projectId, username } = data;
    socket.to(`project-${projectId}`).emit('user-stopped-typing', { username });
  });

  // Handle user joining their personal notification room (for invitations and chat notifications)
  socket.on('join-user-room', (data) => {
    const userId = data?.userId || data;
    const userRoom = `user-${userId}`;
    socket.join(userRoom);
    console.log(`👤 User ${socket.id} joined personal room: ${userRoom}`);
  });

  // Handle disconnecting to update presence for any project rooms
  socket.on('disconnecting', () => {
    console.log(`❌ User disconnecting: ${socket.id}`);
    // socket.rooms contains rooms the socket is still in at this point
    for (const room of socket.rooms) {
      // rooms include the socket id itself, skip that
      if (room === socket.id) continue;
      if (room.startsWith('project-')) {
        try {
          // current size includes this socket; subtract 1 for the new count
          const prevSize = io.sockets.adapter.rooms.get(room)?.size || 0;
          const newCount = Math.max(0, prevSize - 1);
          const projectId = room.replace('project-', '');
          io.to(room).emit('online-count', { projectId, count: newCount });
        } catch (e) {
          console.error('Failed to emit online-count on disconnecting for', room, e);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Socket.IO ready for connections`);
});
