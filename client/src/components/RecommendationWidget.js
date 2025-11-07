import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  PriorityHigh as PriorityHighIcon
} from '@mui/icons-material';
import axios from 'axios';

/**
 * RecommendationWidget Component
 * Displays AI-powered project recommendations including:
 * - Next suggested tasks (prioritized)
 * - Project delay warnings
 * - Quick insights
 */
const RecommendationWidget = ({ projectId, limit = 5 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchRecommendations();
    }
  }, [projectId, limit]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/projects/${projectId}/recommendations?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setRecommendations(response.data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.response?.data?.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priorityLevel) => {
    switch (priorityLevel) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priorityLevel) => {
    switch (priorityLevel) {
      case 'CRITICAL':
        return <ErrorIcon fontSize="small" />;
      case 'HIGH':
        return <WarningIcon fontSize="small" />;
      case 'MEDIUM':
        return <PriorityHighIcon fontSize="small" />;
      case 'LOW':
        return <CheckCircleIcon fontSize="small" />;
      default:
        return <AssignmentIcon fontSize="small" />;
    }
  };

  const getAlertSeverity = (riskLevel) => {
    switch (riskLevel) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'success';
    }
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day(s)`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} day(s)`;
    }
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading recommendations...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Paper>
    );
  }

  if (!recommendations) {
    return null;
  }

  const { nextSuggestedTasks, projectDelayWarning, insights, projectName } = recommendations;

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="primary" />
          AI Recommendations
        </Typography>
        {projectName && (
          <Typography variant="body2" color="text.secondary">
            {projectName}
          </Typography>
        )}
      </Box>

      {/* Project Delay Warning */}
      {projectDelayWarning && (
        <Box sx={{ mb: 3 }}>
          <Alert 
            severity={getAlertSeverity(projectDelayWarning.riskLevel)}
            icon={projectDelayWarning.isDelayed ? <WarningIcon /> : <CheckCircleIcon />}
          >
            <AlertTitle>
              {projectDelayWarning.isDelayed 
                ? `⚠️ ${projectDelayWarning.riskLevel} Risk Detected`
                : '✅ Project On Track'
              }
            </AlertTitle>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {projectDelayWarning.message}
            </Typography>
            
            {/* Risk Factors */}
            {projectDelayWarning.riskFactors && projectDelayWarning.riskFactors.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Risk Factors:
                </Typography>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  {projectDelayWarning.riskFactors.map((factor, index) => (
                    <li key={index}>
                      <Typography variant="body2">{factor}</Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            )}

            {/* Recommendations */}
            {projectDelayWarning.recommendations && projectDelayWarning.recommendations.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Recommendations:
                </Typography>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  {projectDelayWarning.recommendations.map((rec, index) => (
                    <li key={index}>
                      <Typography variant="body2">{rec}</Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            )}
          </Alert>
        </Box>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Next Suggested Tasks */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📋 Next Suggested Tasks
        </Typography>
        
        {nextSuggestedTasks && nextSuggestedTasks.length > 0 ? (
          <List>
            {nextSuggestedTasks.map((task, index) => (
              <ListItem
                key={task.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}
                  >
                    {index + 1}
                  </Box>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {task.title}
                      </Typography>
                      <Chip
                        icon={getPriorityIcon(task.priorityLevel)}
                        label={task.priorityLevel}
                        color={getPriorityColor(task.priorityLevel)}
                        size="small"
                      />
                      <Chip
                        label={task.status}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      {task.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {task.description}
                        </Typography>
                      )}
                      
                      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          ⏰ {formatDeadline(task.deadline)}
                        </Typography>
                        
                        {task.assignedTo ? (
                          <Typography variant="caption" color="text.secondary">
                            👤 {task.assignedTo.username}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="warning.main">
                            ⚠️ Unassigned
                          </Typography>
                        )}
                      </Stack>

                      {/* Priority Reasons */}
                      {task.reasons && task.reasons.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Why prioritized:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            {task.reasons.map((reason, idx) => (
                              <Chip
                                key={idx}
                                label={reason}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: '20px' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Alert severity="info">
            <AlertTitle>No Pending Tasks</AlertTitle>
            All tasks are completed! Great work! 🎉
          </Alert>
        )}
      </Box>

      {/* Quick Insights */}
      {insights && (
        <>
          <Divider sx={{ mb: 2 }} />
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Quick Insights
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip
                icon={<AssignmentIcon />}
                label={`${insights.completionPercentage}% Complete`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<TrendingUpIcon />}
                label={`${insights.teamVelocity} tasks/day`}
                size="small"
                color="secondary"
                variant="outlined"
              />
              {insights.urgentTasksCount > 0 && (
                <Chip
                  icon={<WarningIcon />}
                  label={`${insights.urgentTasksCount} urgent`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
              {insights.estimatedDaysToComplete !== null && (
                <Chip
                  label={`~${insights.estimatedDaysToComplete} days left`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default RecommendationWidget;
