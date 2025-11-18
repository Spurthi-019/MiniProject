import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';

import {import {

  Box,  Box,

  Paper,  Paper,

  Typography,  Typography,

  Alert,  Alert,

  AlertTitle,  AlertTitle,

  List,  List,

  ListItem,  ListItem,

  ListItemText,  ListItemText,

  ListItemIcon,  ListItemIcon,

  Chip,  Chip,

  CircularProgress,  CircularProgress,

  Divider,  Divider,

  Grid,  Stack

  LinearProgress} from '@mui/material';

} from '@mui/material';import {

import {  Error as ErrorIcon,

  Warning as WarningIcon,  Warning as WarningIcon,

  CheckCircle as CheckCircleIcon,  CheckCircle as CheckCircleIcon,

  TrendingUp as TrendingUpIcon,  TrendingUp as TrendingUpIcon,

  Info as InfoIcon,  Assignment as AssignmentIcon,

  Group as GroupIcon  PriorityHigh as PriorityHighIcon

} from '@mui/icons-material';} from '@mui/icons-material';

import axios from 'axios';import axios from 'axios';



/**/**

 * RecommendationWidget Component * RecommendationWidget Component

 * Displays AI-powered project recommendations including: * Displays AI-powered project recommendations including:

 * - Real-time metrics * - Next suggested tasks (prioritized)

 * - Deadline alerts * - Project delay warnings

 * - Project risks * - Quick insights

 * - Next steps */

 * - Team suggestionsconst RecommendationWidget = ({ projectId, limit = 5 }) => {

 * - Process improvements  const [loading, setLoading] = useState(true);

 * - Timeline prediction  const [error, setError] = useState(null);

 */  const [recommendations, setRecommendations] = useState(null);

const RecommendationWidget = ({ projectId, limit = 5 }) => {

  const [loading, setLoading] = useState(true);  useEffect(() => {

  const [error, setError] = useState(null);    if (projectId) {

  const [recommendations, setRecommendations] = useState(null);      fetchRecommendations();

    }

  useEffect(() => {  }, [projectId, limit]);

    if (projectId) {

      fetchRecommendations();  const fetchRecommendations = async () => {

    }    try {

  }, [projectId, limit]);      setLoading(true);

      setError(null);

  const fetchRecommendations = async () => {

    try {      const token = localStorage.getItem('token');

      setLoading(true);      const response = await axios.get(

      setError(null);        `http://localhost:5000/api/projects/${projectId}/recommendations`,

        {

      const token = localStorage.getItem('token');          headers: {

      const response = await axios.get(            Authorization: `Bearer ${token}`

        `http://localhost:5000/api/projects/${projectId}/recommendations`,          }

        {        }

          headers: {      );

            Authorization: `Bearer ${token}`

          }      console.log('📊 Real-time recommendations:', response.data);

        }      setRecommendations(response.data);

      );    } catch (err) {

      console.error('Error fetching recommendations:', err);

      console.log('📊 Real-time recommendations:', response.data);      setError(err.response?.data?.message || 'Failed to fetch recommendations');

      setRecommendations(response.data);    } finally {

    } catch (err) {      setLoading(false);

      console.error('Error fetching recommendations:', err);    }

      setError(err.response?.data?.message || 'Failed to fetch recommendations');  };

    } finally {

      setLoading(false);  const getPriorityColor = (priorityLevel) => {

    }    switch (priorityLevel) {

  };      case 'CRITICAL':

        return 'error';

  if (loading) {      case 'HIGH':

    return (        return 'warning';

      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>      case 'MEDIUM':

        <CircularProgress size={40} />        return 'info';

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>      case 'LOW':

          Loading recommendations...        return 'success';

        </Typography>      default:

      </Paper>        return 'default';

    );    }

  }  };



  if (error) {  const getPriorityIcon = (priorityLevel) => {

    return (    switch (priorityLevel) {

      <Paper elevation={3} sx={{ p: 3 }}>      case 'CRITICAL':

        <Alert severity="error">        return <ErrorIcon fontSize="small" />;

          <AlertTitle>Error</AlertTitle>      case 'HIGH':

          {error}        return <WarningIcon fontSize="small" />;

          <Typography variant="body2" sx={{ mt: 2 }}>      case 'MEDIUM':

            {error.includes('not found') || error.includes('Server error') ? (        return <PriorityHighIcon fontSize="small" />;

              <>      case 'LOW':

                <strong>Tip:</strong> Make sure:        return <CheckCircleIcon fontSize="small" />;

                <ul style={{ marginLeft: '20px', marginTop: '8px' }}>      default:

                  <li>You have created a project and selected it</li>        return <AssignmentIcon fontSize="small" />;

                  <li>The backend server is running</li>    }

                  <li>MongoDB is connected</li>  };

                </ul>

              </>  const getAlertSeverity = (riskLevel) => {

            ) : null}    switch (riskLevel) {

          </Typography>      case 'HIGH':

        </Alert>        return 'error';

      </Paper>      case 'MEDIUM':

    );        return 'warning';

  }      case 'LOW':

        return 'info';

  if (!recommendations || !recommendations.recommendations) {      default:

    return null;        return 'success';

  }    }

  };

  const { recommendations: recs, projectName, aiEnabled } = recommendations;

  const {   const formatDeadline = (deadline) => {

    summary,     if (!deadline) return 'No deadline';

    nextSteps,     const date = new Date(deadline);

    risks,     const now = new Date();

    deadlineAlerts,     const diffTime = date - now;

    teamSuggestions,     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    processImprovements,

    timelinePrediction,    if (diffDays < 0) {

    metrics       return `Overdue by ${Math.abs(diffDays)} day(s)`;

  } = recs;    } else if (diffDays === 0) {

      return 'Due today';

  return (    } else if (diffDays === 1) {

    <Paper elevation={3} sx={{ p: 3 }}>      return 'Due tomorrow';

      {/* Header */}    } else {

      <Box sx={{ mb: 3 }}>      return `Due in ${diffDays} day(s)`;

        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>    }

          <TrendingUpIcon color="primary" />  };

          AI Recommendations

        </Typography>  if (loading) {

        {projectName && (    return (

          <Typography variant="body2" color="text.secondary">      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>

            {projectName}        <CircularProgress size={40} />

          </Typography>        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>

        )}          Loading recommendations...

      </Box>        </Typography>

      </Paper>

      {/* Project Summary */}    );

      {summary && (  }

        <Box sx={{ mb: 3 }}>

          <Typography variant="body2" color="text.secondary">  if (error) {

            {summary}    return (

          </Typography>      <Paper elevation={3} sx={{ p: 3 }}>

        </Box>        <Alert severity="error">

      )}          <AlertTitle>Error</AlertTitle>

          {error}

      {/* Project Metrics */}          <Typography variant="body2" sx={{ mt: 2 }}>

      {metrics && (            {error.includes('not found') || error.includes('Server error') ? (

        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>              <>

          <Grid container spacing={2}>                <strong>Tip:</strong> Make sure:

            <Grid item xs={6} sm={3}>                <ul style={{ marginLeft: '20px', marginTop: '8px' }}>

              <Typography variant="caption" color="text.secondary">Completion</Typography>                  <li>You have created a project and selected it</li>

              <Typography variant="h6">{metrics.completionPercentage}%</Typography>                  <li>The backend server is running</li>

            </Grid>                  <li>MongoDB is connected</li>

            <Grid item xs={6} sm={3}>                </ul>

              <Typography variant="caption" color="text.secondary">Tasks</Typography>              </>

              <Typography variant="h6">{metrics.completedTasks}/{metrics.totalTasks}</Typography>            ) : null}

            </Grid>          </Typography>

            <Grid item xs={6} sm={3}>        </Alert>

              <Typography variant="caption" color="text.secondary">Velocity</Typography>      </Paper>

              <Typography variant="h6">{metrics.weeklyVelocity}/week</Typography>    );

            </Grid>  }

            <Grid item xs={6} sm={3}>

              <Typography variant="caption" color="text.secondary">Overdue</Typography>  if (!recommendations || !recommendations.recommendations) {

              <Typography variant="h6" color="error">{metrics.overdueTasks}</Typography>    return null;

            </Grid>  }

          </Grid>

        </Box>  const { recommendations: recs, projectName, aiEnabled } = recommendations;

      )}  const { 

    summary, 

      <Divider sx={{ mb: 3 }} />    nextSteps, 

    risks, 

      {/* Deadline Alerts */}    deadlineAlerts, 

      {deadlineAlerts && deadlineAlerts.length > 0 && (    teamSuggestions, 

        <Box sx={{ mb: 3 }}>    processImprovements,

          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>    timelinePrediction,

            <WarningIcon color="error" fontSize="small" />    metrics 

            ⚠️ Deadline Alerts  } = recs;

          </Typography>

          <List dense>  return (

            {deadlineAlerts.map((alert, index) => (    <Paper elevation={3} sx={{ p: 3 }}>

              <ListItem       {/* Header */}

                key={index}      <Box sx={{ mb: 3 }}>

                sx={{        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                  border: '1px solid',          <TrendingUpIcon color="primary" />

                  borderColor: alert.urgency === 'CRITICAL' ? 'error.main' : alert.urgency === 'HIGH' ? 'warning.main' : 'info.main',          AI Recommendations

                  borderRadius: 1,        </Typography>

                  mb: 1,        {projectName && (

                  bgcolor: 'background.paper'          <Typography variant="body2" color="text.secondary">

                }}            {projectName}

              >          </Typography>

                <ListItemIcon>        )}

                  {alert.urgency === 'CRITICAL' && <WarningIcon color="error" />}      </Box>

                  {alert.urgency === 'HIGH' && <WarningIcon color="warning" />}

                  {alert.urgency === 'MEDIUM' && <InfoIcon color="info" />}      {/* Project Summary */}

                </ListItemIcon>      {summary && (

                <ListItemText        <Box sx={{ mb: 3 }}>

                  primary={          <Typography variant="body2" color="text.secondary">

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>            {summary}

                      <Typography variant="subtitle2">{alert.task}</Typography>          </Typography>

                      <Chip         </Box>

                        label={alert.urgency}       )}

                        size="small" 

                        color={      {/* Project Metrics */}

                          alert.urgency === 'CRITICAL' ? 'error' :       {metrics && (

                          alert.urgency === 'HIGH' ? 'warning' :         <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>

                          'info'          <Grid container spacing={2}>

                        }            <Grid item xs={6} sm={3}>

                      />              <Typography variant="caption" color="text.secondary">Completion</Typography>

                    </Box>              <Typography variant="h6">{metrics.completionPercentage}%</Typography>

                  }            </Grid>

                  secondary={            <Grid item xs={6} sm={3}>

                    <Box component="span">              <Typography variant="caption" color="text.secondary">Tasks</Typography>

                      <Typography variant="caption" display="block">              <Typography variant="h6">{metrics.completedTasks}/{metrics.totalTasks}</Typography>

                        {alert.daysRemaining < 0             </Grid>

                          ? `${Math.abs(alert.daysRemaining)} days overdue`            <Grid item xs={6} sm={3}>

                          : `Due in ${alert.daysRemaining} days`}              <Typography variant="caption" color="text.secondary">Velocity</Typography>

                      </Typography>              <Typography variant="h6">{metrics.weeklyVelocity}/week</Typography>

                      {alert.assignedTo && (            </Grid>

                        <Typography variant="caption" color="text.secondary">            <Grid item xs={6} sm={3}>

                          Assigned to: {alert.assignedTo}              <Typography variant="caption" color="text.secondary">Overdue</Typography>

                        </Typography>              <Typography variant="h6" color="error">{metrics.overdueTasks}</Typography>

                      )}            </Grid>

                    </Box>          </Grid>

                  }        </Box>

                />      )}

              </ListItem>

            ))}      <Divider sx={{ mb: 3 }} />

          </List>

        </Box>      {/* Deadline Alerts */}

      )}      {deadlineAlerts && deadlineAlerts.length > 0 && (

        <Box sx={{ mb: 3 }}>

      {/* Risks */}          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

      {risks && risks.length > 0 && (            <WarningIcon color="error" fontSize="small" />

        <Box sx={{ mb: 3 }}>            ⚠️ Deadline Alerts

          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>          </Typography>

            <WarningIcon color="warning" fontSize="small" />          <List dense>

            🚨 Project Risks            {deadlineAlerts.map((alert, index) => (

          </Typography>              <ListItem 

          <List dense>                key={index}

            {risks.map((risk, index) => (                sx={{

              <ListItem                   border: '1px solid',

                key={index}                   borderColor: alert.urgency === 'CRITICAL' ? 'error.main' : alert.urgency === 'HIGH' ? 'warning.main' : 'info.main',

                sx={{                   borderRadius: 1,

                  flexDirection: 'column',                   mb: 1,

                  alignItems: 'flex-start',                  bgcolor: 'background.paper'

                  border: '1px solid',                }}

                  borderColor: 'divider',              >

                  borderRadius: 1,                <ListItemIcon>

                  mb: 1,                  {alert.urgency === 'CRITICAL' && <WarningIcon color="error" />}

                  p: 2                  {alert.urgency === 'HIGH' && <WarningIcon color="warning" />}

                }}                  {alert.urgency === 'MEDIUM' && <InfoIcon color="info" />}

              >                </ListItemIcon>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', mb: 1 }}>                <ListItemText

                  <Chip                   primary={

                    label={risk.severity}                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                    size="small"                       <Typography variant="subtitle2">{alert.task}</Typography>

                    color={                      <Chip 

                      risk.severity === 'HIGH' ? 'error' :                         label={alert.urgency} 

                      risk.severity === 'MEDIUM' ? 'warning' :                         size="small" 

                      'default'                        color={

                    }                          alert.urgency === 'CRITICAL' ? 'error' : 

                  />                          alert.urgency === 'HIGH' ? 'warning' : 

                  <Typography variant="body2" fontWeight="medium">{risk.risk}</Typography>                          'info'

                </Box>                        }

                <Typography variant="caption" color="text.secondary">                      />

                  💡 Mitigation: {risk.mitigation}                    </Box>

                </Typography>                  }

              </ListItem>                  secondary={

            ))}                    <Box component="span">

          </List>                      <Typography variant="caption" display="block">

        </Box>                        {alert.daysRemaining < 0 

      )}                          ? `${Math.abs(alert.daysRemaining)} days overdue`

                          : `Due in ${alert.daysRemaining} days`}

      {/* Next Steps */}                      </Typography>

      {nextSteps && nextSteps.length > 0 && (                      {alert.assignedTo && (

        <Box sx={{ mb: 3 }}>                        <Typography variant="caption" color="text.secondary">

          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>                          Assigned to: {alert.assignedTo}

            <CheckCircleIcon color="primary" fontSize="small" />                        </Typography>

            📋 Next Steps                      )}

          </Typography>                    </Box>

          <List dense>                  }

            {nextSteps.map((step, index) => (                />

              <ListItem               </ListItem>

                key={index}            ))}

                sx={{          </List>

                  border: '1px solid',        </Box>

                  borderColor: 'divider',      )}

                  borderRadius: 1,

                  mb: 1      {/* Risks */}

                }}      {risks && risks.length > 0 && (

              >        <Box sx={{ mb: 3 }}>

                <ListItemIcon>          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                  <Box            <WarningIcon color="warning" fontSize="small" />

                    sx={{            🚨 Project Risks

                      width: 28,          </Typography>

                      height: 28,          <List dense>

                      borderRadius: '50%',            {risks.map((risk, index) => (

                      bgcolor: 'primary.main',              <ListItem 

                      color: 'white',                key={index} 

                      display: 'flex',                sx={{ 

                      alignItems: 'center',                  flexDirection: 'column', 

                      justifyContent: 'center',                  alignItems: 'flex-start',

                      fontWeight: 'bold',                  border: '1px solid',

                      fontSize: '0.875rem'                  borderColor: 'divider',

                    }}                  borderRadius: 1,

                  >                  mb: 1,

                    {index + 1}                  p: 2

                  </Box>                }}

                </ListItemIcon>              >

                <ListItemText primary={step} />                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', mb: 1 }}>

              </ListItem>                  <Chip 

            ))}                    label={risk.severity} 

          </List>                    size="small" 

        </Box>                    color={

      )}                      risk.severity === 'HIGH' ? 'error' : 

                      risk.severity === 'MEDIUM' ? 'warning' : 

      {/* Team Suggestions */}                      'default'

      {teamSuggestions && teamSuggestions.length > 0 && (                    }

        <Box sx={{ mb: 3 }}>                  />

          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>                  <Typography variant="body2" fontWeight="medium">{risk.risk}</Typography>

            <GroupIcon color="primary" fontSize="small" />                </Box>

            👥 Team Suggestions                <Typography variant="caption" color="text.secondary">

          </Typography>                  💡 Mitigation: {risk.mitigation}

          <List dense>                </Typography>

            {teamSuggestions.map((suggestion, index) => (              </ListItem>

              <ListItem             ))}

                key={index}          </List>

                sx={{        </Box>

                  border: '1px solid',      )}

                  borderColor: 'divider',

                  borderRadius: 1,      {/* Next Steps */}

                  mb: 1      {nextSteps && nextSteps.length > 0 && (

                }}        <Box sx={{ mb: 3 }}>

              >          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                <ListItemIcon>            <CheckCircleIcon color="primary" fontSize="small" />

                  <InfoIcon color="info" fontSize="small" />            📋 Next Steps

                </ListItemIcon>          </Typography>

                <ListItemText primary={suggestion} />          <List dense>

              </ListItem>            {nextSteps.map((step, index) => (

            ))}              <ListItem 

          </List>                key={index}

        </Box>                sx={{

      )}                  border: '1px solid',

                  borderColor: 'divider',

      {/* Process Improvements */}                  borderRadius: 1,

      {processImprovements && processImprovements.length > 0 && (                  mb: 1

        <Box sx={{ mb: 3 }}>                }}

          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>              >

            <TrendingUpIcon color="success" fontSize="small" />                <ListItemIcon>

            🔧 Process Improvements                  <Box

          </Typography>                    sx={{

          <List dense>                      width: 28,

            {processImprovements.map((improvement, index) => (                      height: 28,

              <ListItem                       borderRadius: '50%',

                key={index}                      bgcolor: 'primary.main',

                sx={{                      color: 'white',

                  border: '1px solid',                      display: 'flex',

                  borderColor: 'divider',                      alignItems: 'center',

                  borderRadius: 1,                      justifyContent: 'center',

                  mb: 1                      fontWeight: 'bold',

                }}                      fontSize: '0.875rem'

              >                    }}

                <ListItemIcon>                  >

                  <CheckCircleIcon color="success" fontSize="small" />                    {index + 1}

                </ListItemIcon>                  </Box>

                <ListItemText primary={improvement} />                </ListItemIcon>

              </ListItem>                <ListItemText primary={step} />

            ))}              </ListItem>

          </List>            ))}

        </Box>          </List>

      )}        </Box>

      )}

      {/* Timeline Prediction */}

      {timelinePrediction && (      {/* Team Suggestions */}

        <Box sx={{       {teamSuggestions && teamSuggestions.length > 0 && (

          p: 2,         <Box sx={{ mb: 3 }}>

          bgcolor: timelinePrediction.onTrack ? 'success.light' : 'warning.light',           <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

          borderRadius: 1,            <GroupIcon color="primary" fontSize="small" />

          mb: 2            👥 Team Suggestions

        }}>          </Typography>

          <Typography variant="h6" gutterBottom>          <List dense>

            📅 Timeline Prediction            {teamSuggestions.map((suggestion, index) => (

          </Typography>              <ListItem 

          <Typography variant="body2" sx={{ mb: 1 }}>                key={index}

            Status: <strong>{timelinePrediction.onTrack ? '✅ On Track' : '⚠️ At Risk'}</strong>                sx={{

          </Typography>                  border: '1px solid',

          <Typography variant="body2" sx={{ mb: 1 }}>                  borderColor: 'divider',

            Estimated Completion: <strong>{timelinePrediction.estimatedCompletion}</strong>                  borderRadius: 1,

          </Typography>                  mb: 1

          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>                }}

            {timelinePrediction.reasoning}              >

          </Typography>                <ListItemIcon>

          <LinearProgress                   <InfoIcon color="info" fontSize="small" />

            variant="determinate"                 </ListItemIcon>

            value={timelinePrediction.confidence}                 <ListItemText primary={suggestion} />

            sx={{ mt: 1, mb: 0.5 }}              </ListItem>

            color={timelinePrediction.onTrack ? 'success' : 'warning'}            ))}

          />          </List>

          <Typography variant="caption" color="text.secondary">        </Box>

            Confidence: {timelinePrediction.confidence}%      )}

          </Typography>

        </Box>      {/* Process Improvements */}

      )}      {processImprovements && processImprovements.length > 0 && (

        <Box sx={{ mb: 3 }}>

      {aiEnabled === false && (          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>            <TrendingUpIcon color="success" fontSize="small" />

          💡 Using intelligent rule-based analysis (Gemini AI unavailable)            🔧 Process Improvements

        </Typography>          </Typography>

      )}          <List dense>

    </Paper>            {processImprovements.map((improvement, index) => (

  );              <ListItem 

};                key={index}

                sx={{

export default RecommendationWidget;                  border: '1px solid',

                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemIcon>
                  <CheckCircleIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={improvement} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Timeline Prediction */}
      {timelinePrediction && (
        <Box sx={{ 
          p: 2, 
          bgcolor: timelinePrediction.onTrack ? 'success.light' : 'warning.light', 
          borderRadius: 1,
          mb: 2
        }}>
          <Typography variant="h6" gutterBottom>
            📅 Timeline Prediction
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Status: <strong>{timelinePrediction.onTrack ? '✅ On Track' : '⚠️ At Risk'}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Estimated Completion: <strong>{timelinePrediction.estimatedCompletion}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            {timelinePrediction.reasoning}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={timelinePrediction.confidence} 
            sx={{ mt: 1, mb: 0.5 }}
            color={timelinePrediction.onTrack ? 'success' : 'warning'}
          />
          <Typography variant="caption" color="text.secondary">
            Confidence: {timelinePrediction.confidence}%
          </Typography>
        </Box>
      )}

      {aiEnabled === false && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
          💡 Using intelligent rule-based analysis (Gemini AI unavailable)
        </Typography>
      )}
    </Paper>
  );
};

export default RecommendationWidget;
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
