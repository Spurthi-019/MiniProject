const axios = require('axios');

async function createTestProject() {
  try {
    console.log('🧪 Creating Test Project\n');

    // Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      login: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = loginResponse.data.token;
    const adminUser = loginResponse.data.user;
    console.log('✅ Admin logged in:', adminUser.username);

    // Create a test project
    console.log('\n2️⃣ Creating test project...');
    const projectData = {
      name: 'My Awesome Project',
      description: 'A test project for invitation system',
      teamLead: adminUser.id
    };

    const projectResponse = await axios.post(
      'http://localhost:5000/api/projects',
      projectData,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    console.log('✅ Project created successfully!');
    console.log('   Name:', projectResponse.data.name);
    console.log('   Team Code:', projectResponse.data.teamCode);
    console.log('   ID:', projectResponse.data._id);
    
    console.log('\n🎉 Now you can send invitations!');
    console.log('\nRun: node testInvitationFlow.js');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Response data:', error.response.data);
    }
  }
}

createTestProject();
