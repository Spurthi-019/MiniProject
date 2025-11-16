const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Message = require('./models/Message');
require('dotenv').config({ path: './server/.env' });

async function debugChatAnalysis() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const projectId = '69173c094ea5cf083a13dbfa';
    
    // Get project with all participants
    const project = await Project.findById(projectId)
      .populate('members', 'username email')
      .populate('mentors', 'username email')
      .populate('teamLead', 'username email');
    
    console.log('📋 Project:', project.name);
    console.log('👤 Team Lead:', project.teamLead?.username || 'None');
    console.log('👥 Members:', project.members.map(m => m.username).join(', ') || 'None');
    console.log('🎓 Mentors:', project.mentors.map(m => m.username).join(', ') || 'None');
    console.log('');
    
    // Get messages
    const messages = await Message.find({ project: projectId })
      .populate('sender', 'username email');
    
    console.log(`💬 Total Messages: ${messages.length}`);
    
    // Count messages by sender
    const senderCounts = {};
    messages.forEach(msg => {
      if (msg.sender) {
        const name = msg.sender.username;
        senderCounts[name] = (senderCounts[name] || 0) + 1;
      }
    });
    
    console.log('\n📊 Messages by sender:');
    Object.entries(senderCounts).forEach(([name, count]) => {
      console.log(`   ${name}: ${count} messages`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

debugChatAnalysis();
