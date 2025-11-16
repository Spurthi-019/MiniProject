const axios = require('axios');

async function testUserProjects() {
  try {
    // First, login to get a valid token
    console.log('Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      login: 'admin@example.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✓ Login successful');
    console.log('User:', loginResponse.data.user.username);
    console.log('Role:', loginResponse.data.user.role);
    console.log('\nFetching user projects...\n');

    // Test the user-projects endpoint
    const projectsResponse = await axios.get('http://localhost:5000/api/projects/user-projects', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✓ Projects fetched successfully');
    console.log('Count:', projectsResponse.data.count);
    console.log('\nProjects:');
    
    if (projectsResponse.data.projects.length === 0) {
      console.log('  No projects found');
    } else {
      projectsResponse.data.projects.forEach((project, index) => {
        console.log(`\n${index + 1}. ${project.name}`);
        console.log(`   Team Code: ${project.teamCode}`);
        console.log(`   User Role: ${project.userRoleInProject}`);
        console.log(`   Team Lead: ${project.teamLead?.username}`);
        console.log(`   Members: ${project.members?.length || 0}`);
        console.log(`   Mentors: ${project.mentors?.length || 0}`);
      });
    }

    console.log('\n✓ Test completed successfully!');
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

testUserProjects();
