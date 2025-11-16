const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGI5YWRlYmFhYTViYjExYTgxN2Y1MSIsInJvbGUiOiJBZG1pbi9UZWFtIExlYWQiLCJpYXQiOjE3NjMzMTQ5MTAsImV4cCI6MTc2MzkxOTcxMH0.oKr5Zbt0OAqOoX4QH1aTZzBiU3YsIiCyxjdJY_s4l98';

const projectIds = [
  '69173c094ea5cf083a13dbfa',
  '6910d0a1697a93833382556e',
  '690b9adfbaaa5bb11a817f5b'
];

const messages = [
  'Hello team! Let\'s get started on this project.',
  'I\'ve completed the initial setup.',
  'Great progress today!',
  'Working on the new feature.',
  'Need some help with the backend.',
  'Frontend is looking good!',
  'Let\'s schedule a meeting.',
  'Updated the documentation.',
  'Fixed the bug in the login page.',
  'Deployed to staging.',
  'Ready for review.',
  'Testing the new changes.',
  'All tests passing!',
  'Made some UI improvements.',
  'Optimized the database queries.',
  'Added error handling.',
  'Refactored the code.',
  'Updated dependencies.',
  'Created new component.',
  'Improved performance.'
];

async function createTestData() {
  console.log('Creating test chat data...\n');
  
  for (let i = 0; i < projectIds.length; i++) {
    const projectId = projectIds[i];
    console.log(`\nSending messages to project ${i + 1} (${projectId})...`);
    
    // Send different number of messages to each project (15, 12, 8)
    const messageCount = i === 0 ? 15 : i === 1 ? 12 : 8;
    
    for (let j = 0; j < messageCount; j++) {
      try {
        const message = messages[j % messages.length];
        await axios.post(
          `http://localhost:5000/api/chat/${projectId}/send`,
          { content: message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`  ✓ Message ${j + 1}/${messageCount}: "${message}"`);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`  ✗ Error sending message ${j + 1}:`, error.response?.data?.message || error.message);
      }
    }
  }
  
  console.log('\n\n✅ Test data creation completed!');
  console.log('\nProject 1: 15 messages');
  console.log('Project 2: 12 messages');
  console.log('Project 3: 8 messages');
  console.log('\nRefresh your browser to see the top contributors!');
}

createTestData();
