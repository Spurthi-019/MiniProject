const { GoogleGenerativeAI } = require('@google/generative-ai');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Message = require('../models/Message');

/**
 * Gemini AI Service for Real-Time Project Recommendations
 * Analyzes project progress, team collaboration, and task completion patterns
 * to provide intelligent, context-aware recommendations
 */

class GeminiAIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found in environment variables. AI recommendations will be limited.');
    }
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    // Try different model names (API versions may vary)
    this.model = this.genAI ? this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-pro'
    }) : null;
  }

  /**
   * Check if Gemini AI is available
   */
  isAvailable() {
    return this.model !== null;
  }

  /**
   * Analyze project data and generate comprehensive insights
   */
  async analyzeProjectData(projectId) {
    try {
      // Fetch project details
      const project = await Project.findById(projectId)
        .populate('teamLead members mentors', 'username email role');

      if (!project) {
        throw new Error('Project not found');
      }

      // Fetch all tasks
      const allTasks = await Task.find({ project: projectId })
        .populate('assignedTo', 'username email')
        .sort({ deadline: 1 });

      // Fetch recent chat messages (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const chatMessages = await Message.find({
        project: projectId,
        timestamp: { $gte: thirtyDaysAgo }
      })
        .populate('sender', 'username')
        .sort({ timestamp: -1 })
        .limit(100);

      // Calculate project metrics
      const metrics = this.calculateProjectMetrics(project, allTasks, chatMessages);

      return {
        project,
        tasks: allTasks,
        chatMessages,
        metrics
      };
    } catch (error) {
      console.error('Error analyzing project data:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive project metrics
   */
  calculateProjectMetrics(project, tasks, chatMessages) {
    const now = new Date();
    
    // Task categorization
    const todoTasks = tasks.filter(t => t.status === 'To Do');
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
    const completedTasks = tasks.filter(t => t.status === 'Done');

    // Deadline analysis
    const tasksWithDeadlines = tasks.filter(t => t.deadline);
    const overdueTasks = tasks.filter(t => 
      t.deadline && new Date(t.deadline) < now && t.status !== 'Done'
    );
    const upcomingTasks = tasks.filter(t => 
      t.deadline && 
      new Date(t.deadline) > now && 
      new Date(t.deadline) < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) &&
      t.status !== 'Done'
    );

    // Team metrics
    const teamSize = (project.members?.length || 0) + 1; // +1 for team lead
    const unassignedTasks = tasks.filter(t => !t.assignedTo && t.status !== 'Done');

    // Completion rate
    const projectDuration = (now - new Date(project.createdAt)) / (1000 * 60 * 60 * 24);
    const completionRate = projectDuration > 0 ? completedTasks.length / projectDuration : 0;

    // Velocity (tasks completed in last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentCompletions = completedTasks.filter(t => 
      t.updatedAt && new Date(t.updatedAt) >= sevenDaysAgo
    );
    const weeklyVelocity = recentCompletions.length;

    // Chat activity analysis
    const chatActivity = {
      totalMessages: chatMessages.length,
      messagesLast7Days: chatMessages.filter(m => 
        new Date(m.timestamp) >= sevenDaysAgo
      ).length,
      uniqueParticipants: new Set(chatMessages.map(m => m.sender?._id?.toString())).size,
      averageMessagesPerDay: chatMessages.length / Math.max(1, projectDuration)
    };

    // Progress percentage
    const completionPercentage = tasks.length > 0 
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

    // Time to deadline
    let daysToDeadline = null;
    if (project.endDate) {
      daysToDeadline = Math.ceil((new Date(project.endDate) - now) / (1000 * 60 * 60 * 24));
    }

    // Estimated completion
    const remainingTasks = todoTasks.length + inProgressTasks.length;
    const estimatedDaysToComplete = weeklyVelocity > 0 
      ? Math.ceil((remainingTasks / weeklyVelocity) * 7)
      : null;

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      todoTasks: todoTasks.length,
      completionPercentage,
      overdueTasks: overdueTasks.length,
      upcomingDeadlines: upcomingTasks.length,
      unassignedTasks: unassignedTasks.length,
      teamSize,
      completionRate: Math.round(completionRate * 100) / 100,
      weeklyVelocity,
      chatActivity,
      daysToDeadline,
      estimatedDaysToComplete,
      projectAge: Math.round(projectDuration),
      isAtRisk: overdueTasks.length > 0 || 
                (daysToDeadline !== null && estimatedDaysToComplete !== null && 
                 estimatedDaysToComplete > daysToDeadline)
    };
  }

  /**
   * Generate AI-powered recommendations using Gemini
   */
  async generateRecommendations(projectId) {
    try {
      // Analyze project data
      const { project, tasks, chatMessages, metrics } = await this.analyzeProjectData(projectId);

      // If Gemini is not available, return basic recommendations
      if (!this.isAvailable()) {
        return this.generateBasicRecommendations(project, tasks, metrics);
      }

      // Prepare context for Gemini
      const context = this.prepareContextForAI(project, tasks, chatMessages, metrics);

      // Generate AI recommendations
      const prompt = `You are an expert project management AI assistant analyzing a software development project. Based on the following real-time project data, provide specific, actionable recommendations to help the team complete the project on time.

${context}

Please provide:
1. **Next Steps**: Top 3-5 specific tasks or actions the team should prioritize right now
2. **Risk Analysis**: Identify current risks and potential blockers
3. **Deadline Alerts**: Highlight urgent deadlines and overdue tasks
4. **Team Suggestions**: Recommendations for task assignment and workload distribution
5. **Process Improvements**: Suggestions to improve team velocity and collaboration
6. **Timeline Prediction**: Realistic estimate of whether the project will finish on time

Format your response as JSON with the following structure:
{
  "summary": "Brief 2-3 sentence overview of project status",
  "nextSteps": ["step1", "step2", "step3"],
  "risks": [{"risk": "description", "severity": "HIGH|MEDIUM|LOW", "mitigation": "suggestion"}],
  "deadlineAlerts": [{"task": "task title", "deadline": "date", "daysRemaining": number, "urgency": "CRITICAL|HIGH|MEDIUM"}],
  "teamSuggestions": ["suggestion1", "suggestion2"],
  "processImprovements": ["improvement1", "improvement2"],
  "timelinePrediction": {
    "onTrack": true/false,
    "estimatedCompletion": "description",
    "confidence": "HIGH|MEDIUM|LOW",
    "reasoning": "explanation"
  }
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0]);
        return {
          ...recommendations,
          metrics,
          generatedAt: new Date().toISOString(),
          source: 'gemini-ai'
        };
      }

      // Fallback if JSON parsing fails
      return this.generateBasicRecommendations(project, tasks, metrics);

    } catch (error) {
      console.error('Error generating Gemini recommendations:', error);
      // Fallback to basic recommendations
      const { project, tasks, metrics } = await this.analyzeProjectData(projectId);
      return this.generateBasicRecommendations(project, tasks, metrics);
    }
  }

  /**
   * Prepare comprehensive context for AI analysis
   */
  prepareContextForAI(project, tasks, chatMessages, metrics) {
    const now = new Date();

    // Format tasks by status
    const todoTasks = tasks.filter(t => t.status === 'To Do');
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
    const completedTasks = tasks.filter(t => t.status === 'Done');

    // Overdue and upcoming tasks
    const overdueTasks = tasks.filter(t => 
      t.deadline && new Date(t.deadline) < now && t.status !== 'Done'
    );
    const upcomingTasks = tasks.filter(t => 
      t.deadline && 
      new Date(t.deadline) > now && 
      new Date(t.deadline) < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) &&
      t.status !== 'Done'
    ).slice(0, 10);

    // Recent chat insights
    const recentChats = chatMessages.slice(0, 20).map(m => ({
      sender: m.sender?.username || 'Unknown',
      text: (m.text || '').substring(0, 100), // Limit length, handle null/undefined
      timestamp: m.timestamp
    }));

    return `
PROJECT INFORMATION:
- Name: ${project.name}
- Team Size: ${metrics.teamSize} members
- Status: ${project.status}
- Start Date: ${project.startDate?.toISOString().split('T')[0] || 'Not set'}
- End Date: ${project.endDate?.toISOString().split('T')[0] || 'Not set'}
- Days Until Deadline: ${metrics.daysToDeadline !== null ? metrics.daysToDeadline : 'No deadline set'}
- Project Age: ${metrics.projectAge} days

PROGRESS METRICS:
- Total Tasks: ${metrics.totalTasks}
- Completed: ${metrics.completedTasks} (${metrics.completionPercentage}%)
- In Progress: ${metrics.inProgressTasks}
- To Do: ${metrics.todoTasks}
- Overdue Tasks: ${metrics.overdueTasks}
- Upcoming Deadlines (next 7 days): ${metrics.upcomingDeadlines}
- Unassigned Tasks: ${metrics.unassignedTasks}

TEAM VELOCITY:
- Tasks Completed (Last 7 Days): ${metrics.weeklyVelocity}
- Average Completion Rate: ${metrics.completionRate} tasks/day
- Estimated Days to Complete Remaining: ${metrics.estimatedDaysToComplete || 'Cannot estimate'}

TEAM COLLABORATION:
- Total Chat Messages: ${metrics.chatActivity.totalMessages}
- Messages (Last 7 Days): ${metrics.chatActivity.messagesLast7Days}
- Active Participants: ${metrics.chatActivity.uniqueParticipants}
- Avg Messages/Day: ${Math.round(metrics.chatActivity.averageMessagesPerDay * 10) / 10}

OVERDUE TASKS (${overdueTasks.length}):
${overdueTasks.length > 0 ? overdueTasks.map(t => 
  `- ${t.title} (Due: ${t.deadline.toISOString().split('T')[0]}, ${Math.abs(Math.ceil((new Date(t.deadline) - now) / (1000 * 60 * 60 * 24)))} days overdue)`
).join('\n') : '- None'}

UPCOMING DEADLINES (Next 7 Days):
${upcomingTasks.length > 0 ? upcomingTasks.map(t => 
  `- ${t.title} (Due: ${t.deadline.toISOString().split('T')[0]}, ${Math.ceil((new Date(t.deadline) - now) / (1000 * 60 * 60 * 24))} days remaining, Status: ${t.status})`
).join('\n') : '- None'}

IN PROGRESS TASKS (${inProgressTasks.length}):
${inProgressTasks.slice(0, 5).map(t => 
  `- ${t.title}${t.deadline ? ` (Due: ${t.deadline.toISOString().split('T')[0]})` : ''}${t.assignedTo ? ` - Assigned to: ${t.assignedTo.username}` : ' - Unassigned'}`
).join('\n')}

RECENT TEAM COMMUNICATION (Last 20 messages):
${recentChats.length > 0 ? recentChats.map(m => 
  `- [${new Date(m.timestamp).toISOString().split('T')[0]}] ${m.sender}: ${m.text}...`
).join('\n') : '- No recent messages'}

CURRENT DATE: ${now.toISOString().split('T')[0]}
`;
  }

  /**
   * Generate basic recommendations without AI (fallback)
   */
  generateBasicRecommendations(project, tasks, metrics) {
    const now = new Date();
    const overdueTasks = tasks.filter(t => 
      t.deadline && new Date(t.deadline) < now && t.status !== 'Done'
    );
    const upcomingTasks = tasks.filter(t => 
      t.deadline && 
      new Date(t.deadline) > now && 
      new Date(t.deadline) < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) &&
      t.status !== 'Done'
    );

    const nextSteps = [];
    const risks = [];
    const deadlineAlerts = [];
    const teamSuggestions = [];
    const processImprovements = [];

    // Generate next steps
    if (overdueTasks.length > 0) {
      nextSteps.push(`Immediately address ${overdueTasks.length} overdue task(s)`);
    }
    if (upcomingTasks.length > 0) {
      nextSteps.push(`Prioritize ${upcomingTasks.length} task(s) due in the next 7 days`);
    }
    if (metrics.inProgressTasks > 0) {
      nextSteps.push(`Complete ${metrics.inProgressTasks} in-progress task(s) before starting new work`);
    }
    if (metrics.unassignedTasks > 0) {
      nextSteps.push(`Assign ${metrics.unassignedTasks} unassigned task(s) to team members`);
    }
    if (metrics.todoTasks > 0 && nextSteps.length < 3) {
      nextSteps.push(`Begin work on high-priority tasks from ${metrics.todoTasks} pending items`);
    }

    // Analyze risks
    if (overdueTasks.length > 0) {
      risks.push({
        risk: `${overdueTasks.length} task(s) are overdue`,
        severity: 'HIGH',
        mitigation: 'Re-evaluate deadlines or increase team capacity'
      });
    }
    if (metrics.daysToDeadline !== null && metrics.estimatedDaysToComplete !== null &&
        metrics.estimatedDaysToComplete > metrics.daysToDeadline) {
      risks.push({
        risk: `Estimated completion (${metrics.estimatedDaysToComplete} days) exceeds deadline (${metrics.daysToDeadline} days)`,
        severity: 'HIGH',
        mitigation: 'Reduce scope, extend deadline, or add resources'
      });
    }
    if (metrics.weeklyVelocity < 1) {
      risks.push({
        risk: 'Team velocity is very low',
        severity: 'MEDIUM',
        mitigation: 'Identify and remove blockers, improve collaboration'
      });
    }
    if (metrics.chatActivity.messagesLast7Days < 5) {
      risks.push({
        risk: 'Low team communication activity',
        severity: 'LOW',
        mitigation: 'Encourage daily standups and progress updates'
      });
    }

    // Deadline alerts
    [...overdueTasks, ...upcomingTasks].forEach(task => {
      const daysRemaining = Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24));
      deadlineAlerts.push({
        task: task.title,
        deadline: task.deadline.toISOString().split('T')[0],
        daysRemaining,
        urgency: daysRemaining < 0 ? 'CRITICAL' : daysRemaining <= 3 ? 'HIGH' : 'MEDIUM',
        assignedTo: task.assignedTo?.username || 'Unassigned'
      });
    });

    // Team suggestions
    if (metrics.unassignedTasks > metrics.totalTasks * 0.2) {
      teamSuggestions.push('Distribute unassigned tasks evenly among team members');
    }
    if (metrics.inProgressTasks > metrics.teamSize * 2) {
      teamSuggestions.push('Team has too many concurrent tasks - focus on completion');
    }
    teamSuggestions.push('Hold regular sync meetings to track progress and blockers');

    // Process improvements
    if (metrics.weeklyVelocity > 0 && metrics.weeklyVelocity < metrics.teamSize) {
      processImprovements.push('Break down large tasks into smaller, manageable units');
    }
    if (metrics.chatActivity.messagesLast7Days < metrics.teamSize * 3) {
      processImprovements.push('Increase team communication and collaboration');
    }
    processImprovements.push('Use task dependencies to identify critical path');
    processImprovements.push('Set up automated reminders for upcoming deadlines');

    // Timeline prediction
    const onTrack = !metrics.isAtRisk && overdueTasks.length === 0;
    const timelinePrediction = {
      onTrack,
      estimatedCompletion: metrics.estimatedDaysToComplete 
        ? `Estimated ${metrics.estimatedDaysToComplete} days to complete remaining tasks`
        : 'Cannot estimate completion time',
      confidence: metrics.weeklyVelocity >= 1 ? 'MEDIUM' : 'LOW',
      reasoning: onTrack 
        ? 'Current velocity suggests project will complete on time'
        : metrics.isAtRisk 
          ? 'Project is at risk due to overdue tasks or slow velocity'
          : 'Insufficient data for accurate prediction'
    };

    const summary = onTrack
      ? `Project is ${metrics.completionPercentage}% complete and on track. Focus on maintaining current velocity and addressing ${upcomingTasks.length} upcoming deadlines.`
      : `Project is ${metrics.completionPercentage}% complete but at risk. ${overdueTasks.length} overdue tasks require immediate attention. Current velocity may not meet deadline.`;

    return {
      summary,
      nextSteps: nextSteps.slice(0, 5),
      risks,
      deadlineAlerts: deadlineAlerts.slice(0, 10),
      teamSuggestions,
      processImprovements,
      timelinePrediction,
      metrics,
      generatedAt: new Date().toISOString(),
      source: 'rule-based'
    };
  }

  /**
   * Generate personalized task recommendations for a team member
   */
  async generateMemberRecommendations(projectId, userId) {
    try {
      const { project, tasks, metrics } = await this.analyzeProjectData(projectId);

      // Find tasks assigned to this user
      const userTasks = tasks.filter(t => t.assignedTo?._id?.toString() === userId);
      const userInProgress = userTasks.filter(t => t.status === 'In Progress');
      const userTodo = userTasks.filter(t => t.status === 'To Do');
      const userCompleted = userTasks.filter(t => t.status === 'Done');

      const now = new Date();
      const userOverdue = userTasks.filter(t => 
        t.deadline && new Date(t.deadline) < now && t.status !== 'Done'
      );

      // Prioritize user's tasks
      const prioritizedUserTasks = [...userInProgress, ...userTodo]
        .filter(t => t.status !== 'Done')
        .map(task => {
          const daysToDeadline = task.deadline 
            ? Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24))
            : null;
          
          return {
            ...task.toObject(),
            daysToDeadline,
            urgency: daysToDeadline === null ? 'NONE' :
                     daysToDeadline < 0 ? 'OVERDUE' :
                     daysToDeadline <= 1 ? 'CRITICAL' :
                     daysToDeadline <= 3 ? 'HIGH' :
                     daysToDeadline <= 7 ? 'MEDIUM' : 'LOW'
          };
        })
        .sort((a, b) => {
          const urgencyOrder = { 'OVERDUE': 0, 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4, 'NONE': 5 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        });

      return {
        personalStats: {
          totalAssigned: userTasks.length,
          completed: userCompleted.length,
          inProgress: userInProgress.length,
          todo: userTodo.length,
          overdue: userOverdue.length
        },
        recommendedTasks: prioritizedUserTasks.slice(0, 5),
        alerts: userOverdue.map(t => ({
          task: t.title,
          deadline: t.deadline,
          daysOverdue: Math.abs(Math.ceil((new Date(t.deadline) - now) / (1000 * 60 * 60 * 24)))
        })),
        suggestion: prioritizedUserTasks.length > 0
          ? `Focus on "${prioritizedUserTasks[0].title}" - ${prioritizedUserTasks[0].urgency} priority`
          : 'Great work! Check with team lead for new assignments.'
      };
    } catch (error) {
      console.error('Error generating member recommendations:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new GeminiAIService();
