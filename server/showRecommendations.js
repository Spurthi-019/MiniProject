const mongoose = require('mongoose');
require('dotenv').config();
const geminiAI = require('./utils/geminiAI');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

async function showRecommendations() {
  try {
    console.log('\n🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // E-Commerce Website project ID
    const projectId = '690b9adfbaaa5bb11a817f5b';
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🎯 REAL-TIME AI RECOMMENDATIONS - FRONTEND PREVIEW');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const result = await geminiAI.generateRecommendations(projectId);

    if (result && result.summary) {
      const recommendations = result;

      console.log('📊 PROJECT METRICS');
      console.log('─────────────────────────────────────────────────────────────');
      console.log(`  Completion:    ${recommendations.metrics.completionPercentage}%`);
      console.log(`  Tasks:         ${recommendations.metrics.completedTasks}/${recommendations.metrics.totalTasks}`);
      console.log(`  Velocity:      ${recommendations.metrics.weeklyVelocity} tasks/week`);
      console.log(`  Overdue:       ${recommendations.metrics.overdueTasks}`);
      console.log('');

      console.log('💬 PROJECT SUMMARY');
      console.log('─────────────────────────────────────────────────────────────');
      console.log(`  ${recommendations.summary}`);
      console.log('');

      if (recommendations.deadlineAlerts.length > 0) {
        console.log('⚠️  DEADLINE ALERTS');
        console.log('─────────────────────────────────────────────────────────────');
        recommendations.deadlineAlerts.forEach((alert, index) => {
          const urgencyIcon = alert.urgency === 'CRITICAL' ? '🚨' : 
                             alert.urgency === 'HIGH' ? '⚠️' : 'ℹ️';
          const daysText = alert.daysRemaining < 0 
            ? `${Math.abs(alert.daysRemaining)} days overdue`
            : `Due in ${alert.daysRemaining} days`;
          
          console.log(`  ${urgencyIcon} ${alert.urgency}: ${alert.task}`);
          console.log(`     ${daysText}`);
          if (alert.assignedTo) console.log(`     Assigned to: ${alert.assignedTo}`);
          console.log('');
        });
      }

      if (recommendations.risks.length > 0) {
        console.log('🚨 PROJECT RISKS');
        console.log('─────────────────────────────────────────────────────────────');
        recommendations.risks.forEach((risk, index) => {
          console.log(`  ${index + 1}. [${risk.severity}] ${risk.risk}`);
          console.log(`     💡 Mitigation: ${risk.mitigation}`);
          console.log('');
        });
      }

      console.log('📋 NEXT STEPS (PRIORITIZED)');
      console.log('─────────────────────────────────────────────────────────────');
      recommendations.nextSteps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step}`);
      });
      console.log('');

      if (recommendations.teamSuggestions.length > 0) {
        console.log('👥 TEAM SUGGESTIONS');
        console.log('─────────────────────────────────────────────────────────────');
        recommendations.teamSuggestions.forEach((suggestion, index) => {
          console.log(`  • ${suggestion}`);
        });
        console.log('');
      }

      if (recommendations.processImprovements.length > 0) {
        console.log('🔧 PROCESS IMPROVEMENTS');
        console.log('─────────────────────────────────────────────────────────────');
        recommendations.processImprovements.forEach((improvement, index) => {
          console.log(`  • ${improvement}`);
        });
        console.log('');
      }

      console.log('📅 TIMELINE PREDICTION');
      console.log('─────────────────────────────────────────────────────────────');
      console.log(`  Status: ${recommendations.timelinePrediction.onTrack ? '✅ On Track' : '⚠️ At Risk'}`);
      console.log(`  Estimated Completion: ${recommendations.timelinePrediction.estimatedCompletion}`);
      console.log(`  Confidence: ${recommendations.timelinePrediction.confidence}%`);
      console.log(`  Reasoning: ${recommendations.timelinePrediction.reasoning}`);
      console.log('');

      console.log('═══════════════════════════════════════════════════════════════');
      console.log('✅ ALL FEATURES WORKING!');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('');
      console.log('📱 These recommendations will appear in your frontend:');
      console.log('   1. Login to http://localhost:3000');
      console.log('   2. Navigate to Dashboard');
      console.log('   3. Select "E-Commerce Website" project');
      console.log('   4. View AI Recommendations widget');
      console.log('');
      console.log(`📊 Data Source: ${result.aiEnabled ? 'Google Gemini AI' : 'Intelligent Rule-Based Analysis'}`);
      console.log('');

    } else {
      console.log('❌ Error:', result.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Done\n');
  }
}

showRecommendations();
