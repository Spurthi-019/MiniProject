const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Message = require('./models/Message');
const geminiAI = require('./utils/geminiAI');

/**
 * Test script for Real-Time AI Recommendations
 * This demonstrates how the system works with actual project data
 */

async function testRecommendations() {
  try {
    console.log('🧪 Testing Real-Time AI Recommendation System\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if Gemini AI is configured
    console.log('🤖 Gemini AI Status:', geminiAI.isAvailable() ? '✅ ENABLED' : '⚠️ DISABLED (will use fallback)');
    
    if (!geminiAI.isAvailable()) {
      console.log('   💡 To enable Gemini AI:');
      console.log('   1. Get API key from: https://makersuite.google.com/app/apikey');
      console.log('   2. Add to .env: GEMINI_API_KEY=your_key_here\n');
    } else {
      console.log('   API Key: ' + process.env.GEMINI_API_KEY.substring(0, 10) + '...\n');
    }

    // Find a test project (remove the models require here)
    const projects = await Project.find().limit(1);

    if (projects.length === 0) {
      console.log('❌ No projects found in database');
      console.log('💡 Run seedProjectData.js first to create test data\n');
      process.exit(0);
    }

    const project = projects[0];
    console.log(`📊 Testing with Project: "${project.name}"`);
    console.log(`   Team Code: ${project.teamCode}`);
    console.log(`   Project ID: ${project._id}\n`);

    // Generate recommendations
    console.log('⏳ Generating real-time recommendations...\n');
    const startTime = Date.now();
    
    const recommendations = await geminiAI.generateRecommendations(project._id);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Recommendations generated in ${duration}ms\n`);

    // Display results
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📈 PROJECT METRICS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total Tasks: ${recommendations.metrics.totalTasks}`);
    console.log(`Completed: ${recommendations.metrics.completedTasks} (${recommendations.metrics.completionPercentage}%)`);
    console.log(`In Progress: ${recommendations.metrics.inProgressTasks}`);
    console.log(`To Do: ${recommendations.metrics.todoTasks}`);
    console.log(`Overdue: ${recommendations.metrics.overdueTasks}`);
    console.log(`Team Size: ${recommendations.metrics.teamSize}`);
    console.log(`Weekly Velocity: ${recommendations.metrics.weeklyVelocity} tasks/week`);
    console.log(`Days to Deadline: ${recommendations.metrics.daysToDeadline ?? 'No deadline set'}`);
    console.log(`Est. Days to Complete: ${recommendations.metrics.estimatedDaysToComplete ?? 'Cannot estimate'}`);
    console.log(`At Risk: ${recommendations.metrics.isAtRisk ? '⚠️ YES' : '✅ NO'}\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📝 AI SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(recommendations.summary + '\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎯 NEXT STEPS (Top Priorities)');
    console.log('═══════════════════════════════════════════════════════════');
    recommendations.nextSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });
    console.log('');

    if (recommendations.risks.length > 0) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('⚠️  RISK ANALYSIS');
      console.log('═══════════════════════════════════════════════════════════');
      recommendations.risks.forEach((risk, index) => {
        const severityIcon = risk.severity === 'HIGH' ? '🔴' : risk.severity === 'MEDIUM' ? '🟡' : '🟢';
        console.log(`${index + 1}. ${severityIcon} ${risk.risk} [${risk.severity}]`);
        console.log(`   💡 Mitigation: ${risk.mitigation}`);
      });
      console.log('');
    }

    if (recommendations.deadlineAlerts.length > 0) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('⏰ DEADLINE ALERTS');
      console.log('═══════════════════════════════════════════════════════════');
      recommendations.deadlineAlerts.forEach((alert, index) => {
        const urgencyIcon = alert.urgency === 'CRITICAL' ? '🚨' : alert.urgency === 'HIGH' ? '⚠️' : '📅';
        console.log(`${index + 1}. ${urgencyIcon} ${alert.task}`);
        console.log(`   Deadline: ${alert.deadline} (${alert.daysRemaining} days ${alert.daysRemaining < 0 ? 'OVERDUE' : 'remaining'})`);
        console.log(`   Assigned: ${alert.assignedTo || 'Unassigned'}`);
      });
      console.log('');
    }

    if (recommendations.teamSuggestions.length > 0) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('👥 TEAM SUGGESTIONS');
      console.log('═══════════════════════════════════════════════════════════');
      recommendations.teamSuggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion}`);
      });
      console.log('');
    }

    if (recommendations.processImprovements.length > 0) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('⚙️  PROCESS IMPROVEMENTS');
      console.log('═══════════════════════════════════════════════════════════');
      recommendations.processImprovements.forEach((improvement, index) => {
        console.log(`${index + 1}. ${improvement}`);
      });
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔮 TIMELINE PREDICTION');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Status: ${recommendations.timelinePrediction.onTrack ? '✅ ON TRACK' : '⚠️ AT RISK'}`);
    console.log(`Estimate: ${recommendations.timelinePrediction.estimatedCompletion}`);
    console.log(`Confidence: ${recommendations.timelinePrediction.confidence}`);
    console.log(`Reasoning: ${recommendations.timelinePrediction.reasoning}`);
    console.log('');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('ℹ️  METADATA');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Source: ${recommendations.source === 'gemini-ai' ? '🤖 Google Gemini AI' : '📊 Rule-Based Analysis'}`);
    console.log(`Generated: ${new Date(recommendations.generatedAt).toLocaleString()}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('✅ Test completed successfully!\n');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test
testRecommendations();
