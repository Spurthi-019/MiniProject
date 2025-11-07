const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * Calculate team's average task completion rate (tasks per day)
 * @param {Array} completedTasks - Array of completed tasks
 * @param {Date} projectStartDate - Project start date
 * @returns {Number} Average tasks completed per day
 */
const calculateCompletionRate = (completedTasks, projectStartDate) => {
  if (completedTasks.length === 0) {
    // No completed tasks yet, assume a moderate rate of 0.5 tasks/day per team member
    return 0.5;
  }

  // Find the earliest and latest completion dates
  const completionDates = completedTasks
    .filter(task => task.updatedAt)
    .map(task => new Date(task.updatedAt).getTime())
    .sort((a, b) => a - b);

  if (completionDates.length === 0) {
    return 0.5; // Default rate if no completion dates available
  }

  const startTime = Math.min(new Date(projectStartDate).getTime(), completionDates[0]);
  const endTime = completionDates[completionDates.length - 1];
  
  const daysElapsed = Math.max(1, (endTime - startTime) / (1000 * 60 * 60 * 24));
  const completionRate = completedTasks.length / daysElapsed;

  return completionRate > 0 ? completionRate : 0.5;
};

/**
 * Analyze project health and identify at-risk tasks
 * @param {String} projectId - The project ID to analyze
 * @returns {Object} Analysis results with at-risk tasks and project health status
 */
const analyzeProjectHealth = async (projectId) => {
  try {
    // Fetch project details
    const project = await Project.findById(projectId)
      .populate('teamLead members mentors', 'username email');

    if (!project) {
      throw new Error('Project not found');
    }

    // Fetch all tasks for the project
    const allTasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'username email')
      .sort({ deadline: 1 }); // Sort by deadline (earliest first)

    if (allTasks.length === 0) {
      return {
        projectId,
        projectName: project.name,
        totalTasks: 0,
        isAtRisk: false,
        message: 'No tasks found for this project',
        urgentTasks: [],
        recommendations: []
      };
    }

    // Categorize tasks by status
    const todoTasks = allTasks.filter(task => task.status === 'To Do');
    const inProgressTasks = allTasks.filter(task => task.status === 'In Progress');
    const completedTasks = allTasks.filter(task => task.status === 'Done');

    // Identify urgent tasks (To Do with nearest deadlines)
    const now = new Date();
    const urgentTasks = todoTasks
      .filter(task => task.deadline)
      .map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        assignedTo: task.assignedTo ? {
          id: task.assignedTo._id,
          username: task.assignedTo.username,
          email: task.assignedTo.email
        } : null,
        daysUntilDeadline: Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24)),
        isOverdue: new Date(task.deadline) < now
      }))
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5); // Top 5 most urgent tasks

    // Calculate team velocity (average completion rate)
    const projectStartDate = project.createdAt;
    const teamSize = (project.members?.length || 0) + 1; // +1 for team lead
    const baseCompletionRate = calculateCompletionRate(completedTasks, projectStartDate);
    const teamCompletionRate = baseCompletionRate * teamSize; // Adjust for team size

    // Calculate remaining work and time
    const remainingTasks = todoTasks.length + inProgressTasks.length;
    const tasksWithDeadlines = allTasks.filter(task => 
      (task.status === 'To Do' || task.status === 'In Progress') && task.deadline
    );

    let isAtRisk = false;
    let riskFactors = [];
    let recommendations = [];

    // Check if project is at risk
    if (tasksWithDeadlines.length > 0) {
      // Find the earliest deadline among remaining tasks
      const earliestDeadline = new Date(Math.min(
        ...tasksWithDeadlines.map(t => new Date(t.deadline).getTime())
      ));

      const daysUntilDeadline = Math.ceil((earliestDeadline - now) / (1000 * 60 * 60 * 24));
      const estimatedDaysNeeded = teamCompletionRate > 0 
        ? Math.ceil(remainingTasks / teamCompletionRate) 
        : remainingTasks * 2; // Fallback estimate

      if (daysUntilDeadline < estimatedDaysNeeded) {
        isAtRisk = true;
        riskFactors.push(`Estimated ${estimatedDaysNeeded} days needed, but only ${daysUntilDeadline} days until earliest deadline`);
      }

      // Check for overdue tasks
      const overdueTasks = tasksWithDeadlines.filter(t => new Date(t.deadline) < now);
      if (overdueTasks.length > 0) {
        isAtRisk = true;
        riskFactors.push(`${overdueTasks.length} task(s) are already overdue`);
      }

      // Check team velocity
      if (teamCompletionRate < 0.3) {
        isAtRisk = true;
        riskFactors.push('Team velocity is below optimal threshold');
      }

      // Check workload distribution
      const unassignedTasks = allTasks.filter(t => 
        !t.assignedTo && (t.status === 'To Do' || t.status === 'In Progress')
      );
      if (unassignedTasks.length > remainingTasks * 0.3) {
        isAtRisk = true;
        riskFactors.push(`${unassignedTasks.length} tasks are unassigned (${Math.round(unassignedTasks.length / remainingTasks * 100)}% of remaining work)`);
      }
    }

    // Generate recommendations
    if (isAtRisk) {
      if (urgentTasks.some(t => t.isOverdue)) {
        recommendations.push('Immediately address overdue tasks or adjust deadlines');
      }
      if (urgentTasks.some(t => t.daysUntilDeadline <= 3 && t.daysUntilDeadline > 0)) {
        recommendations.push('Prioritize tasks due within 3 days');
      }
      if (teamCompletionRate < 0.3) {
        recommendations.push('Consider increasing team capacity or reducing scope');
      }
      const unassignedCount = allTasks.filter(t => 
        !t.assignedTo && (t.status === 'To Do' || t.status === 'In Progress')
      ).length;
      if (unassignedCount > 0) {
        recommendations.push(`Assign ${unassignedCount} unassigned task(s) to team members`);
      }
      if (remainingTasks > completedTasks.length * 2) {
        recommendations.push('Consider breaking down large tasks into smaller, manageable units');
      }
    } else {
      recommendations.push('Project is on track. Continue monitoring progress.');
      if (urgentTasks.length > 0) {
        recommendations.push(`Focus on ${urgentTasks.length} upcoming deadline(s)`);
      }
    }

    // Calculate completion percentage
    const completionPercentage = allTasks.length > 0 
      ? Math.round((completedTasks.length / allTasks.length) * 100)
      : 0;

    // Project health metrics
    const healthMetrics = {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      todoTasks: todoTasks.length,
      completionPercentage,
      teamSize,
      teamVelocity: Math.round(teamCompletionRate * 100) / 100, // tasks per day
      estimatedDaysToComplete: teamCompletionRate > 0 
        ? Math.ceil(remainingTasks / teamCompletionRate)
        : null
    };

    return {
      projectId,
      projectName: project.name,
      teamCode: project.teamCode,
      isAtRisk,
      riskLevel: isAtRisk 
        ? (riskFactors.length > 2 ? 'HIGH' : 'MEDIUM')
        : 'LOW',
      riskFactors,
      urgentTasks,
      healthMetrics,
      recommendations,
      analysisDate: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error analyzing project health:', error);
    throw error;
  }
};

/**
 * Get tasks prioritized by urgency (nearest deadlines and status)
 * @param {String} projectId - The project ID
 * @param {Number} limit - Maximum number of tasks to return (default: 10)
 * @returns {Array} Prioritized task list
 */
const getPrioritizedTasks = async (projectId, limit = 10) => {
  try {
    const now = new Date();

    // Fetch tasks that are not completed
    const tasks = await Task.find({ 
      project: projectId,
      status: { $ne: 'Done' }
    })
      .populate('assignedTo', 'username email')
      .sort({ deadline: 1, createdAt: 1 });

    // Score and prioritize tasks
    const prioritizedTasks = tasks.map(task => {
      let priorityScore = 0;
      let priorityLevel = 'LOW';
      let reasons = [];

      // Factor 1: Deadline proximity
      if (task.deadline) {
        const daysUntilDeadline = (new Date(task.deadline) - now) / (1000 * 60 * 60 * 24);
        
        if (daysUntilDeadline < 0) {
          priorityScore += 100; // Overdue
          priorityLevel = 'CRITICAL';
          reasons.push('Overdue');
        } else if (daysUntilDeadline <= 1) {
          priorityScore += 80;
          priorityLevel = 'CRITICAL';
          reasons.push('Due within 24 hours');
        } else if (daysUntilDeadline <= 3) {
          priorityScore += 60;
          priorityLevel = 'HIGH';
          reasons.push('Due within 3 days');
        } else if (daysUntilDeadline <= 7) {
          priorityScore += 40;
          priorityLevel = 'MEDIUM';
          reasons.push('Due within 7 days');
        } else {
          priorityScore += 20;
        }
      } else {
        priorityScore += 10; // No deadline set
        reasons.push('No deadline set');
      }

      // Factor 2: Task status
      if (task.status === 'In Progress') {
        priorityScore += 30;
        reasons.push('Already in progress');
      }

      // Factor 3: Assignment status
      if (!task.assignedTo) {
        priorityScore += 15;
        reasons.push('Unassigned');
      }

      return {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        deadline: task.deadline,
        assignedTo: task.assignedTo ? {
          id: task.assignedTo._id,
          username: task.assignedTo.username,
          email: task.assignedTo.email
        } : null,
        priorityScore,
        priorityLevel: priorityScore > 70 ? 'CRITICAL' : priorityLevel,
        reasons
      };
    });

    // Sort by priority score (highest first) and return top N
    return prioritizedTasks
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, limit);

  } catch (error) {
    console.error('Error getting prioritized tasks:', error);
    throw error;
  }
};

module.exports = {
  analyzeProjectHealth,
  getPrioritizedTasks,
  calculateCompletionRate
};
