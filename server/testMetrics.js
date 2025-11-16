const axios = require('axios');

async function testMetrics() {
  try {
    // Login first
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      login: 'admin_john',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // Get projects
    console.log('2. Fetching projects...');
    const projectsResponse = await axios.get('http://localhost:5000/api/projects/user-projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const projects = projectsResponse.data.projects;
    console.log(`✅ Found ${projects.length} projects\n`);
    
    // Get metrics for each project
    console.log('3. Fetching chat metrics for all projects...\n');
    for (const project of projects) {
      try {
        const metricsResponse = await axios.get(
          `http://localhost:5000/api/projects/${project._id}/chat-metrics`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const data = metricsResponse.data;
        console.log(`📊 Project: ${data.projectName || 'Unknown'}`);
        console.log(`   Total Messages: ${data.totalMessages}`);
        console.log(`   Top Contributors:`, data.topContributors);
        console.log('');
      } catch (error) {
        console.log(`❌ Error fetching metrics for project ${project._id}:`, error.response?.data || error.message);
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testMetrics();
