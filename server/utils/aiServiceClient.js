const axios = require('axios');

/**
 * AI Service Client - Connects Express backend to Python FastAPI AI service
 * Handles chat analysis using advanced NLP models
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

class AIServiceClient {
  /**
   * Check if AI service is available
   * @returns {Promise<Boolean>}
   */
  async isAvailable() {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/`, { timeout: 2000 });
      return response.data.status === 'ok';
    } catch (error) {
      console.warn('AI Service not available:', error.message);
      return false;
    }
  }

  /**
   * Analyze chat messages with basic sentiment and keyword extraction
   * @param {Array} messages - Array of {username, text, timestamp}
   * @returns {Promise<Object>}
   */
  async analyzeChat(messages) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/analyze`,
        { messages },
        { 
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error calling AI analysis service:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze user participation and rankings
   * @param {Array} messages - Array of {username, text, timestamp}
   * @returns {Promise<Object>}
   */
  async analyzeUserParticipation(messages) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/analyze_users`,
        { messages },
        {
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error calling user participation service:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate comprehensive weekly mentor report with NLP analysis
   * @param {Array} messages - Array of {username, text, timestamp}
   * @returns {Promise<Object>}
   */
  async generateWeeklyReport(messages) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/weekly_report`,
        { messages },
        {
          timeout: 60000, // Longer timeout for comprehensive analysis
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error calling weekly report service:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format MongoDB messages for AI service
   * @param {Array} mongoMessages - Messages from MongoDB with populated sender
   * @returns {Array}
   */
  formatMessagesForAI(mongoMessages) {
    return mongoMessages.map(msg => ({
      username: msg.sender ? msg.sender.username : 'Unknown',
      text: msg.content || '',
      timestamp: msg.createdAt ? msg.createdAt.toISOString() : new Date().toISOString()
    }));
  }
}

module.exports = new AIServiceClient();
