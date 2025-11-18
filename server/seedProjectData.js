require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Message = require('./models/Message');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a test user
    let user = await User.findOne();
    if (!user) {
      console.log('❌ No users found in database. Creating a test user...');
      user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$YourHashedPasswordHere', // Pre-hashed for testing
        role: 'Team Lead'
      });
      await user.save();
      console.log(`✅ Created user: ${user.username} (${user.email})`);
    } else {
      console.log(`✅ Found user: ${user.username} (${user.email})`);
    }

    // Find the Test Project Alpha
    let project = await Project.findOne({ name: 'Test Project Alpha' });
    
    if (!project) {
      console.log('❌ Project "Test Project Alpha" not found. Creating it...');
      project = new Project({
        name: 'Test Project Alpha',
        description: 'AI-powered project management test project with smart recommendations',
        teamCode: 'TEST123',
        teamLead: user._id,
        members: [user._id],
        mentors: [],
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active'
      });
      await project.save();
      console.log('✅ Created project: Test Project Alpha');
    } else {
      console.log(`✅ Found project: ${project.name}`);
    }

    // Delete existing tasks for this project to start fresh
    await Task.deleteMany({ project: project._id });
    console.log('🗑️  Cleared existing tasks');

    // Create realistic tasks with different statuses and deadlines
    const now = new Date();
    const tasksData = [
      // Completed tasks (past)
      {
        title: 'Set up project repository',
        description: 'Initialize Git repo and project structure',
        project: project._id,
        assignedTo: user._id,
        status: 'Done',
        priority: 'High',
        deadline: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Design database schema',
        description: 'Create MongoDB schemas for users, projects, and tasks',
        project: project._id,
        assignedTo: user._id,
        status: 'Done',
        priority: 'High',
        deadline: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Implement authentication',
        description: 'JWT-based authentication with bcrypt password hashing',
        project: project._id,
        assignedTo: user._id,
        status: 'Done',
        priority: 'High',
        deadline: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000)
      },
      
      // In Progress tasks (current - urgent)
      {
        title: 'Build AI chat analysis service',
        description: 'Python FastAPI service with spaCy NLP and VADER sentiment analysis',
        project: project._id,
        assignedTo: user._id,
        status: 'In Progress',
        priority: 'High',
        deadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now (URGENT)
      },
      {
        title: 'Integrate AI with Express backend',
        description: 'Connect AI service to generate weekly team reports',
        project: project._id,
        assignedTo: user._id,
        status: 'In Progress',
        priority: 'High',
        deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now (URGENT)
      },
      
      // To Do tasks (upcoming - high priority)
      {
        title: 'Create mentor dashboard UI',
        description: 'React dashboard showing AI-powered team insights and recommendations',
        project: project._id,
        assignedTo: user._id,
        status: 'To Do',
        priority: 'High',
        deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
      {
        title: 'Implement real-time chat feature',
        description: 'Socket.IO based real-time messaging for project teams',
        project: project._id,
        assignedTo: user._id,
        status: 'To Do',
        priority: 'High',
        deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        title: 'Add task recommendation algorithm',
        description: 'AI-powered task prioritization based on deadlines and dependencies',
        project: project._id,
        assignedTo: user._id,
        status: 'To Do',
        priority: 'Medium',
        deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      },
      
      // To Do tasks (medium priority)
      {
        title: 'Write API documentation',
        description: 'Document all REST API endpoints with examples',
        project: project._id,
        assignedTo: user._id,
        status: 'To Do',
        priority: 'Medium',
        deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'GitHub Actions for automated testing and deployment',
        project: project._id,
        assignedTo: user._id,
        status: 'To Do',
        priority: 'Low',
        deadline: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      },
      
      // Overdue task (to test risk detection)
      {
        title: 'Fix critical security vulnerability',
        description: 'Address SQL injection risk in user input validation',
        project: project._id,
        assignedTo: user._id,
        status: 'To Do',
        priority: 'Critical',
        deadline: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day overdue
      },
    ];

    const tasks = await Task.insertMany(tasksData);
    console.log(`✅ Created ${tasks.length} tasks`);

    // Create some chat messages for AI analysis
    await Message.deleteMany({ project: project._id });
    
    const chatMessages = [
      {
        project: project._id,
        sender: user._id,
        text: 'Just completed the authentication module! JWT is working perfectly.',
        timestamp: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000)
      },
      {
        project: project._id,
        sender: user._id,
        text: 'Working on the AI chat analysis integration. Using spaCy and VADER for NLP.',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        project: project._id,
        sender: user._id,
        text: 'Need help with the Python FastAPI deployment. Anyone familiar with uvicorn?',
        timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000)
      },
      {
        project: project._id,
        sender: user._id,
        text: 'Update: AI service is now trained on 20k messages! Ready for integration.',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      },
      {
        project: project._id,
        sender: user._id,
        text: 'Pushed the latest changes to GitHub. Express backend now connects to AI service.',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000)
      },
    ];

    await Message.insertMany(chatMessages);
    console.log(`✅ Created ${chatMessages.length} chat messages`);

    console.log('\n========================================');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`Project ID: ${project._id}`);
    console.log(`Project Name: ${project.name}`);
    console.log(`Team Code: ${project.teamCode}`);
    console.log(`Total Tasks: ${tasks.length}`);
    console.log(`  - Completed: ${tasks.filter(t => t.status === 'Done').length}`);
    console.log(`  - In Progress: ${tasks.filter(t => t.status === 'In Progress').length}`);
    console.log(`  - To Do: ${tasks.filter(t => t.status === 'To Do').length}`);
    console.log(`  - Overdue: 1 (Critical security fix)`);
    console.log(`Chat Messages: ${chatMessages.length}`);
    console.log('========================================\n');

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
