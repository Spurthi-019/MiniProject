const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const geminiAI = require('./utils/geminiAI');

async function testFullFlow() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Find a user and project
    const user = await User.findOne({ email: 'admin@example.com' });
    const project = await Project.findOne();

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    if (!project) {
      console.log('❌ No project found');
      process.exit(1);
    }

    console.log(`User: ${user.username} (${user.email})`);
    console.log(`Project: ${project.name} (${project.teamCode})\n`);

    // Test recommendations
    console.log('📊 Generating recommendations...\n');
    const recommendations = await geminiAI.generateRecommendations(project._id);

    console.log('═══════════════════════════════════════');
    console.log('✅ RECOMMENDATIONS WORKING!');
    console.log('═══════════════════════════════════════\n');

    console.log(`📈 Project: ${project.name}`);
    console.log(`Completion: ${recommendations.metrics.completionPercentage}%`);
    console.log(`Total Tasks: ${recommendations.metrics.totalTasks}`);
    console.log(`Overdue: ${recommendations.metrics.overdueTasks}`);
    console.log(`Risk Status: ${recommendations.metrics.isAtRisk ? '⚠️ AT RISK' : '✅ ON TRACK'}\n`);

    console.log('🎯 Next Steps:');
    recommendations.nextSteps.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step}`);
    });
    console.log('');

    if (recommendations.deadlineAlerts.length > 0) {
      console.log('⏰ Deadline Alerts:');
      recommendations.deadlineAlerts.slice(0, 3).forEach(alert => {
        const icon = alert.urgency === 'CRITICAL' ? '🚨' : '⚠️';
        console.log(`  ${icon} ${alert.task} - ${alert.daysRemaining} days`);
      });
      console.log('');
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ TEST PASSED!');
    console.log('═══════════════════════════════════════\n');

    console.log('📡 API Endpoint Ready:');
    console.log(`   GET /api/projects/${project._id}/recommendations`);
    console.log('');

    await mongoose.connection.close();
    console.log('✅ Done');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testFullFlow();
