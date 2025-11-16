const Message = require('../models/Message');
const Project = require('../models/Project');

/**
 * Analyze chat activity for a project within a specified time window
 * @param {String} projectId - The project ID to analyze
 * @param {Number} daysBack - Number of days to look back (default: 7)
 * @returns {Object} Chat analysis metrics
 */
const analyzeChatActivity = async (projectId, daysBack = 7) => {
  try {
    // Validate project exists and populate ALL participants (members, mentors, team lead)
    const project = await Project.findById(projectId)
      .populate('members', 'username email')
      .populate('mentors', 'username email')
      .populate('teamLead', 'username email');
    
    if (!project) {
      throw new Error('Project not found');
    }

    // Calculate time window
    const timeWindow = new Date();
    timeWindow.setDate(timeWindow.getDate() - daysBack);

    // Fetch messages within the time window
    const messages = await Message.find({
      project: projectId,
      createdAt: { $gte: timeWindow }
    }).populate('sender', 'username email');

    // 1. Count total number of messages
    const totalMessages = messages.length;

    // 2. Calculate average message length
    let totalMessageLength = 0;
    messages.forEach(msg => {
      totalMessageLength += (msg.content || '').length;
    });
    const averageMessageLength = totalMessages > 0 
      ? Math.round(totalMessageLength / totalMessages) 
      : 0;

    // 3. Count messages per member (including team lead, members, and mentors)
    const memberMessageCounts = {};
    const memberDetails = {};

    // Initialize all project participants with zero count
    const allParticipants = [];
    
    // Add team lead
    if (project.teamLead) {
      allParticipants.push(project.teamLead);
    }
    
    // Add members
    if (project.members && project.members.length > 0) {
      allParticipants.push(...project.members);
    }
    
    // Add mentors
    if (project.mentors && project.mentors.length > 0) {
      allParticipants.push(...project.mentors);
    }
    
    // Initialize all participants
    allParticipants.forEach(participant => {
      const participantId = participant._id.toString();
      memberMessageCounts[participantId] = 0;
      memberDetails[participantId] = {
        userId: participant._id,
        username: participant.username,
        email: participant.email,
        messageCount: 0
      };
    });

    // Count messages for each sender
    messages.forEach(msg => {
      if (msg.sender) {
        const senderId = msg.sender._id.toString();
        if (memberMessageCounts[senderId] !== undefined) {
          memberMessageCounts[senderId]++;
          memberDetails[senderId].messageCount++;
        }
      }
    });

    // Convert to array for sorting
    const memberActivity = Object.values(memberDetails);

    // Sort by message count (descending)
    memberActivity.sort((a, b) => b.messageCount - a.messageCount);

    // 4. Identify top 3 most active members
    const top3ActiveMembers = memberActivity.slice(0, 3).map(member => ({
      userId: member.userId,
      username: member.username,
      email: member.email,
      messageCount: member.messageCount
    }));

    // 5. Identify least active member (with at least one message or zero if no messages)
    // Filter members who are part of the project
    const leastActiveMembers = memberActivity.filter(m => m.messageCount >= 0);
    const leastActiveMember = leastActiveMembers.length > 0 
      ? leastActiveMembers[leastActiveMembers.length - 1] 
      : null;

    // Calculate activity rate
    const totalProjectMembers = allParticipants.length;
    const activeMembers = memberActivity.filter(m => m.messageCount > 0).length;
    const activityRate = totalProjectMembers > 0 
      ? Math.round((activeMembers / totalProjectMembers) * 100) 
      : 0;

    // Calculate messages per day
    const messagesPerDay = daysBack > 0 
      ? (totalMessages / daysBack).toFixed(2) 
      : 0;

    return {
      success: true,
      timeWindow: {
        startDate: timeWindow,
        endDate: new Date(),
        daysAnalyzed: daysBack
      },
      summary: {
        totalMessages,
        averageMessageLength,
        messagesPerDay: parseFloat(messagesPerDay),
        totalProjectMembers,
        activeMembers,
        activityRate
      },
      topActiveMembers: top3ActiveMembers,
      leastActiveMember: leastActiveMember ? {
        userId: leastActiveMember.userId,
        username: leastActiveMember.username,
        email: leastActiveMember.email,
        messageCount: leastActiveMember.messageCount
      } : null,
      allMemberActivity: memberActivity,
      insights: generateInsights(totalMessages, activeMembers, totalProjectMembers, messagesPerDay, daysBack)
    };

  } catch (error) {
    console.error('Error analyzing chat activity:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze chat activity'
    };
  }
};

/**
 * Generate insights based on chat analysis metrics
 * @param {Number} totalMessages - Total number of messages
 * @param {Number} activeMembers - Number of active members
 * @param {Number} totalMembers - Total project members
 * @param {Number} messagesPerDay - Average messages per day
 * @param {Number} daysBack - Analysis time window
 * @returns {Array} Array of insight strings
 */
const generateInsights = (totalMessages, activeMembers, totalMembers, messagesPerDay, daysBack) => {
  const insights = [];

  // Message volume insights
  if (totalMessages === 0) {
    insights.push('⚠️ No chat activity detected in the selected time period. Consider encouraging team communication.');
  } else if (messagesPerDay < 1) {
    insights.push('📉 Low chat activity. Team communication is below 1 message per day.');
  } else if (messagesPerDay >= 1 && messagesPerDay < 5) {
    insights.push('📊 Moderate chat activity. Team is communicating regularly.');
  } else if (messagesPerDay >= 5 && messagesPerDay < 20) {
    insights.push('📈 Good chat activity! Team communication is healthy.');
  } else {
    insights.push('🔥 Excellent chat activity! Team is highly engaged.');
  }

  // Member participation insights
  const participationRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;
  
  if (participationRate === 0) {
    insights.push('❌ No team members have participated in chat discussions.');
  } else if (participationRate < 30) {
    insights.push('⚠️ Low team participation. Less than 30% of members are active in chat.');
  } else if (participationRate < 60) {
    insights.push('💬 Moderate participation. Consider encouraging quieter members to share their thoughts.');
  } else if (participationRate < 90) {
    insights.push('✅ Good participation! Most team members are engaging in discussions.');
  } else {
    insights.push('🌟 Excellent! All or nearly all team members are actively communicating.');
  }

  // Time-based insights
  if (daysBack >= 7 && totalMessages > 0) {
    const weeklyAvg = messagesPerDay * 7;
    if (weeklyAvg < 10) {
      insights.push('💡 Tip: Schedule regular team check-ins to boost communication.');
    }
  }

  return insights;
};

/**
 * Get chat activity trends over multiple time periods
 * @param {String} projectId - The project ID
 * @returns {Object} Trend analysis
 */
const getChatActivityTrends = async (projectId) => {
  try {
    const lastWeek = await analyzeChatActivity(projectId, 7);
    const lastTwoWeeks = await analyzeChatActivity(projectId, 14);
    const lastMonth = await analyzeChatActivity(projectId, 30);

    // Calculate trend direction
    const weeklyMessages = lastWeek.success ? lastWeek.summary.totalMessages : 0;
    const previousWeekMessages = lastTwoWeeks.success 
      ? lastTwoWeeks.summary.totalMessages - weeklyMessages 
      : 0;

    let trend = 'stable';
    let trendPercentage = 0;

    if (previousWeekMessages > 0) {
      trendPercentage = Math.round(((weeklyMessages - previousWeekMessages) / previousWeekMessages) * 100);
      if (trendPercentage > 10) {
        trend = 'increasing';
      } else if (trendPercentage < -10) {
        trend = 'decreasing';
      }
    }

    return {
      success: true,
      lastWeek: lastWeek.success ? lastWeek.summary : null,
      lastTwoWeeks: lastTwoWeeks.success ? lastTwoWeeks.summary : null,
      lastMonth: lastMonth.success ? lastMonth.summary : null,
      trend: {
        direction: trend,
        percentage: trendPercentage,
        interpretation: trend === 'increasing' 
          ? 'Chat activity is growing' 
          : trend === 'decreasing' 
          ? 'Chat activity is declining' 
          : 'Chat activity is stable'
      }
    };

  } catch (error) {
    console.error('Error getting chat trends:', error);
    return {
      success: false,
      error: error.message || 'Failed to get chat trends'
    };
  }
};

module.exports = {
  analyzeChatActivity,
  getChatActivityTrends,
  generateInsights
};
