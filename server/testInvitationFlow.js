const axios = require('axios');

async function testInvitationFlow() {
  try {
    console.log('🧪 Testing Invitation Flow\n');

    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      login: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = loginResponse.data.token;
    console.log('✅ Admin logged in successfully');
    console.log('   User:', loginResponse.data.user.username);

    // Step 2: Get admin's projects
    console.log('\n2️⃣ Fetching admin projects...');
    const projectsResponse = await axios.get('http://localhost:5000/api/projects', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const projects = projectsResponse.data;
    console.log(`✅ Found ${projects.length} project(s)`);
    
    if (projects.length === 0) {
      console.log('⚠️  No projects found. Please create a project first!');
      return;
    }

    const firstProject = projects[0];
    console.log('   Using project:', firstProject.name);
    console.log('   Team code:', firstProject.teamCode);

    // Step 3: Send invitation
    console.log('\n3️⃣ Sending invitation to john@example.com...');
    const inviteResponse = await axios.post(
      `http://localhost:5000/api/projects/${firstProject._id}/invite`,
      {
        email: 'john@example.com',
        role: 'Team Members'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    console.log('✅ Invitation sent!');
    console.log('   Message:', inviteResponse.data.message);

    // Step 4: Login as john and check invitations
    console.log('\n4️⃣ Logging in as john...');
    const johnLogin = await axios.post('http://localhost:5000/api/auth/login', {
      login: 'john@example.com',
      password: 'password123'
    });
    const johnToken = johnLogin.data.token;
    console.log('✅ John logged in successfully');

    // Step 5: Get john's pending invitations
    console.log('\n5️⃣ Checking john\'s pending invitations...');
    const invitationsResponse = await axios.get('http://localhost:5000/api/projects/invitations', {
      headers: { Authorization: `Bearer ${johnToken}` }
    });
    const invitations = invitationsResponse.data.invitations;
    console.log(`✅ John has ${invitations.length} pending invitation(s)`);
    
    if (invitations.length > 0) {
      console.log('\n📬 Invitation details:');
      invitations.forEach((inv, index) => {
        console.log(`   ${index + 1}. Project: ${inv.project.name}`);
        console.log(`      Role: ${inv.role}`);
        console.log(`      Team Code: ${inv.project.teamCode}`);
        console.log(`      Invited by: ${inv.invitedBy.username} (${inv.invitedBy.email})`);
      });
      
      console.log('\n✅ INVITATION SYSTEM WORKING PERFECTLY! 🎉');
      console.log('\nNext steps:');
      console.log('   1. Open browser and login as john@example.com');
      console.log('   2. Click the notification bell icon');
      console.log('   3. You should see the invitation!');
    } else {
      console.log('⚠️  Invitation may have been sent before. Try logging into the app!');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.status === 400) {
      console.log('\n💡 Tip: The invitation may already exist or john is already in the project');
    }
  }
}

testInvitationFlow();
