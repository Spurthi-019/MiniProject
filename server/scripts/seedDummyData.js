/*
  Seed script for MiniProject - creates users, a project, and sample messages.
  Usage: node server/scripts/seedDummyData.js
  Requires MONGODB_URI in server/.env or will default to mongodb://localhost:27017/mini_project
*/

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Message = require('../models/Message');

const MONGO = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini_project').trim().replace(/^['"]|['"]$/g, '');

async function main() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', MONGO);

  // Cleanup existing test data with same teamCode/emails if present
  const teamCode = 'TEST123';

  // Remove existing project with this teamCode
  await Project.deleteMany({ teamCode });

  // Remove users with these emails if present
  const emails = ['alice@example.com', 'bob@example.com', 'carol@example.com', 'mentor@example.com'];
  await User.deleteMany({ email: { $in: emails } });

  // Create users
  const usersData = [
    { username: 'alice', email: 'alice@example.com', password: 'pass123', role: 'Team Members' },
    { username: 'bob', email: 'bob@example.com', password: 'pass123', role: 'Team Members' },
    { username: 'carol', email: 'carol@example.com', password: 'pass123', role: 'Admin/Team Lead' },
    { username: 'mentor', email: 'mentor@example.com', password: 'pass123', role: 'Mentor' }
  ];

  const createdUsers = [];
  for (const u of usersData) {
    const user = new User(u);
    await user.save();
    createdUsers.push(user);
    console.log('Created user', user.email, user._id.toString());
  }

  const teamLead = createdUsers.find(u => u.role === 'Admin/Team Lead');
  const mentor = createdUsers.find(u => u.role === 'Mentor');
  const members = createdUsers.filter(u => u.role === 'Team Members');

  // Create project
  const project = new Project({
    name: 'Test Project Alpha',
    description: 'This is a seeded test project for manual testing of chat and dashboards.',
    teamCode,
    teamLead: teamLead._id,
    members: members.map(m => m._id),
    mentors: [mentor._id]
  });

  await project.save();
  console.log('Created project', project._id.toString(), 'teamCode:', teamCode);

  // Create some sample messages
  const now = new Date();
  const messages = [
    { project: project._id, sender: members[0]._id, content: 'Hey team, I pushed the initial commit.', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24) },
    { project: project._id, sender: members[1]._id, content: 'Great — I will review the code today.', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 12) },
    { project: project._id, sender: mentor._id, content: 'Reminder: update the docs and add unit tests.', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 6) },
    { project: project._id, sender: members[0]._id, content: 'Working on tests now.', timestamp: new Date(now.getTime() - 1000 * 60 * 30) }
  ];

  for (const m of messages) {
    const msg = new Message(m);
    await msg.save();
    console.log('Inserted message', msg._id.toString());
  }

  console.log('\nSeeding complete. Test credentials:');
  console.log(' - Team Lead: carol@example.com / pass123');
  console.log(' - Member A: alice@example.com / pass123');
  console.log(' - Member B: bob@example.com / pass123');
  console.log(' - Mentor: mentor@example.com / pass123');
  console.log('\nProject teamCode:', teamCode);
  console.log('\nYou can now start the server and frontend and log in using these accounts.');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
