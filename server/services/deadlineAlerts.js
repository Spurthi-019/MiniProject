const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const nodemailer = require('nodemailer');

/**
 * Deadline Alert Service
 * Monitors task deadlines and sends alerts to team members
 */

class DeadlineAlertService {
  constructor() {
    this.checkInterval = 6 * 60 * 60 * 1000; // Check every 6 hours
    this.isRunning = false;
    this.alertsEnabled = process.env.ENABLE_DEADLINE_ALERTS === 'true';
    
    // Email configuration (optional - only if email alerts are needed)
    this.emailEnabled = process.env.EMAIL_ALERTS_ENABLED === 'true';
    this.transporter = null;
    
    if (this.emailEnabled && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  }

  /**
   * Start the deadline monitoring service
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Deadline Alert Service is already running');
      return;
    }

    console.log('🚀 Starting Deadline Alert Service...');
    this.isRunning = true;

    // Run initial check
    this.checkDeadlines();

    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.checkDeadlines();
    }, this.checkInterval);

    console.log(`✅ Deadline Alert Service started (checking every ${this.checkInterval / 1000 / 60} minutes)`);
  }

  /**
   * Stop the deadline monitoring service
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ Deadline Alert Service stopped');
  }

  /**
   * Check for tasks approaching deadlines
   */
  async checkDeadlines() {
    if (!this.alertsEnabled) {
      return;
    }

    try {
      console.log('🔍 Checking for approaching deadlines...');
      const now = new Date();

      // Find tasks that are:
      // 1. Not completed
      // 2. Have deadlines in the next 48 hours or are overdue
      const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

      const urgentTasks = await Task.find({
        status: { $ne: 'Done' },
        deadline: { 
          $lte: twoDaysFromNow 
        }
      })
      .populate('assignedTo', 'username email')
      .populate('project', 'name teamCode teamLead members');

      if (urgentTasks.length === 0) {
        console.log('✅ No urgent deadlines found');
        return;
      }

      console.log(`⚠️ Found ${urgentTasks.length} tasks with approaching or overdue deadlines`);

      // Group tasks by project
      const tasksByProject = {};
      urgentTasks.forEach(task => {
        const projectId = task.project._id.toString();
        if (!tasksByProject[projectId]) {
          tasksByProject[projectId] = {
            project: task.project,
            tasks: []
          };
        }
        tasksByProject[projectId].tasks.push(task);
      });

      // Process alerts for each project
      for (const projectId in tasksByProject) {
        await this.sendProjectAlerts(tasksByProject[projectId]);
      }

      console.log('✅ Deadline checks completed');
    } catch (error) {
      console.error('❌ Error checking deadlines:', error);
    }
  }

  /**
   * Send alerts for a project's urgent tasks
   */
  async sendProjectAlerts(projectData) {
    const { project, tasks } = projectData;
    const now = new Date();

    // Categorize tasks
    const overdueTasks = tasks.filter(t => new Date(t.deadline) < now);
    const dueSoon = tasks.filter(t => {
      const deadline = new Date(t.deadline);
      return deadline >= now && deadline < new Date(now.getTime() + 24 * 60 * 60 * 1000);
    });
    const upcoming = tasks.filter(t => {
      const deadline = new Date(t.deadline);
      return deadline >= new Date(now.getTime() + 24 * 60 * 60 * 1000);
    });

    console.log(`\n📊 Project: ${project.name} (${project.teamCode})`);
    console.log(`   - Overdue: ${overdueTasks.length}`);
    console.log(`   - Due in 24h: ${dueSoon.length}`);
    console.log(`   - Due in 48h: ${upcoming.length}`);

    // Create alert summary
    const alertSummary = {
      projectId: project._id,
      projectName: project.name,
      teamCode: project.teamCode,
      overdueTasks: overdueTasks.map(t => this.formatTaskAlert(t, now)),
      dueSoonTasks: dueSoon.map(t => this.formatTaskAlert(t, now)),
      upcomingTasks: upcoming.map(t => this.formatTaskAlert(t, now)),
      timestamp: now.toISOString()
    };

    // Store alert in database (you could create an Alert model for this)
    // For now, we'll just log it
    this.logAlert(alertSummary);

    // Send email notifications if enabled
    if (this.emailEnabled && this.transporter) {
      await this.sendEmailAlerts(project, alertSummary);
    }

    // In a real application, you might also:
    // - Send push notifications
    // - Post to a Slack/Discord channel
    // - Create in-app notifications
    // - Send SMS for critical overdue tasks
  }

  /**
   * Format task information for alert
   */
  formatTaskAlert(task, now) {
    const deadline = new Date(task.deadline);
    const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);
    const daysUntilDeadline = Math.floor(hoursUntilDeadline / 24);
    
    return {
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      deadline: task.deadline,
      assignedTo: task.assignedTo ? {
        username: task.assignedTo.username,
        email: task.assignedTo.email
      } : null,
      hoursRemaining: Math.round(hoursUntilDeadline),
      daysRemaining: daysUntilDeadline,
      isOverdue: hoursUntilDeadline < 0,
      urgencyLevel: hoursUntilDeadline < 0 ? 'OVERDUE' :
                    hoursUntilDeadline <= 24 ? 'CRITICAL' :
                    hoursUntilDeadline <= 48 ? 'HIGH' : 'MEDIUM'
    };
  }

  /**
   * Log alert to console (could be stored in database)
   */
  logAlert(alertSummary) {
    console.log('\n📢 DEADLINE ALERT:');
    console.log(`Project: ${alertSummary.projectName}`);
    
    if (alertSummary.overdueTasks.length > 0) {
      console.log('\n🚨 OVERDUE TASKS:');
      alertSummary.overdueTasks.forEach(task => {
        console.log(`   - "${task.title}" (${Math.abs(task.hoursRemaining)}h overdue) - ${task.assignedTo?.username || 'Unassigned'}`);
      });
    }

    if (alertSummary.dueSoonTasks.length > 0) {
      console.log('\n⏰ DUE IN 24 HOURS:');
      alertSummary.dueSoonTasks.forEach(task => {
        console.log(`   - "${task.title}" (${task.hoursRemaining}h remaining) - ${task.assignedTo?.username || 'Unassigned'}`);
      });
    }

    if (alertSummary.upcomingTasks.length > 0) {
      console.log('\n📅 DUE IN 48 HOURS:');
      alertSummary.upcomingTasks.forEach(task => {
        console.log(`   - "${task.title}" (${task.daysRemaining}d ${task.hoursRemaining % 24}h remaining) - ${task.assignedTo?.username || 'Unassigned'}`);
      });
    }
    console.log('');
  }

  /**
   * Send email alerts to team members
   */
  async sendEmailAlerts(project, alertSummary) {
    try {
      // Get team lead email
      const teamLead = await User.findById(project.teamLead).select('email username');
      
      if (!teamLead || !teamLead.email) {
        console.log('⚠️ No email found for team lead');
        return;
      }

      // Prepare email content
      const emailContent = this.generateEmailContent(alertSummary);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: teamLead.email,
        subject: `⚠️ Deadline Alert: ${project.name} - ${alertSummary.overdueTasks.length} Overdue, ${alertSummary.dueSoonTasks.length} Due Soon`,
        html: emailContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email alert sent to ${teamLead.email}`);
    } catch (error) {
      console.error('❌ Error sending email alert:', error);
    }
  }

  /**
   * Generate HTML email content
   */
  generateEmailContent(alertSummary) {
    let html = `
      <h2>🚨 Deadline Alert: ${alertSummary.projectName}</h2>
      <p><strong>Team Code:</strong> ${alertSummary.teamCode}</p>
      <p><strong>Alert Time:</strong> ${new Date(alertSummary.timestamp).toLocaleString()}</p>
      <hr>
    `;

    if (alertSummary.overdueTasks.length > 0) {
      html += `
        <h3 style="color: #dc2626;">🚨 OVERDUE TASKS (${alertSummary.overdueTasks.length})</h3>
        <ul>
      `;
      alertSummary.overdueTasks.forEach(task => {
        html += `
          <li>
            <strong>${task.title}</strong><br>
            Assigned to: ${task.assignedTo?.username || 'Unassigned'}<br>
            Overdue by: ${Math.abs(task.hoursRemaining)} hours<br>
            Status: ${task.status}
          </li>
        `;
      });
      html += '</ul>';
    }

    if (alertSummary.dueSoonTasks.length > 0) {
      html += `
        <h3 style="color: #ea580c;">⏰ DUE IN 24 HOURS (${alertSummary.dueSoonTasks.length})</h3>
        <ul>
      `;
      alertSummary.dueSoonTasks.forEach(task => {
        html += `
          <li>
            <strong>${task.title}</strong><br>
            Assigned to: ${task.assignedTo?.username || 'Unassigned'}<br>
            Time remaining: ${task.hoursRemaining} hours<br>
            Status: ${task.status}
          </li>
        `;
      });
      html += '</ul>';
    }

    if (alertSummary.upcomingTasks.length > 0) {
      html += `
        <h3 style="color: #f59e0b;">📅 DUE IN 48 HOURS (${alertSummary.upcomingTasks.length})</h3>
        <ul>
      `;
      alertSummary.upcomingTasks.forEach(task => {
        html += `
          <li>
            <strong>${task.title}</strong><br>
            Assigned to: ${task.assignedTo?.username || 'Unassigned'}<br>
            Time remaining: ${task.daysRemaining} days, ${task.hoursRemaining % 24} hours<br>
            Status: ${task.status}
          </li>
        `;
      });
      html += '</ul>';
    }

    html += `
      <hr>
      <p><em>This is an automated alert from your Project Management System.</em></p>
    `;

    return html;
  }

  /**
   * Get current alert status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      alertsEnabled: this.alertsEnabled,
      emailEnabled: this.emailEnabled,
      checkInterval: this.checkInterval,
      checkIntervalMinutes: this.checkInterval / 1000 / 60
    };
  }
}

// Export singleton instance
module.exports = new DeadlineAlertService();
