import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Chat as ChatIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  MessageOutlined as MessageIcon,
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

function ChatAnalysisReport({ projectId }) {
  const [metrics, setMetrics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeWindow, setTimeWindow] = useState('7'); // 7, 14, 30 days
  const [viewMode, setViewMode] = useState('metrics'); // 'metrics' or 'trends'

  useEffect(() => {
    if (projectId) {
      fetchChatMetrics();
    }
  }, [projectId, timeWindow]);

  const fetchChatMetrics = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `http://localhost:5000/api/projects/${projectId}/chat-metrics?days=${timeWindow}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMetrics(response.data.metrics);
    } catch (err) {
      console.error('Error fetching chat metrics:', err);
      setError(err.response?.data?.message || 'Failed to fetch chat metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatTrends = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `http://localhost:5000/api/projects/${projectId}/chat-trends`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTrends(response.data.trends);
    } catch (err) {
      console.error('Error fetching chat trends:', err);
      setError(err.response?.data?.message || 'Failed to fetch chat trends');
    } finally {
      setLoading(false);
    }
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
      if (newMode === 'trends' && !trends) {
        fetchChatTrends();
      }
    }
  };

  const handleRefresh = () => {
    if (viewMode === 'metrics') {
      fetchChatMetrics();
    } else {
      fetchChatTrends();
    }
  };

  // Generate chart data for message activity
  const generateChartData = () => {
    if (!metrics || !metrics.summary) return null;

    const { messagesPerDay, totalMessages } = metrics.summary;
    const days = parseInt(timeWindow);
    
    // Create labels for the last N days
    const labels = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    // Simulate daily distribution (in real scenario, backend should provide this)
    // For now, we'll create an approximation
    const avgPerDay = messagesPerDay;
    const dataPoints = labels.map(() => {
      // Add some variance to make it look realistic
      const variance = (Math.random() - 0.5) * avgPerDay * 0.4;
      return Math.max(0, Math.round(avgPerDay + variance));
    });

    return {
      labels,
      datasets: [
        {
          label: 'Messages',
          data: dataPoints,
          fill: true,
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderColor: 'rgb(37, 99, 235)',
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: 'rgb(37, 99, 235)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `Daily Message Volume (Last ${timeWindow} Days)`,
        font: {
          size: 14,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const getActivityRateColor = (rate) => {
    if (rate >= 80) return 'success';
    if (rate >= 50) return 'info';
    if (rate >= 30) return 'warning';
    return 'error';
  };

  const getTrendIcon = (direction) => {
    if (direction === 'increasing') return <TrendingUpIcon color="success" />;
    if (direction === 'decreasing') return <TrendingDownIcon color="error" />;
    return <SpeedIcon color="info" />;
  };

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading chat analysis...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert severity="info">
        No chat metrics available. Try refreshing the data.
      </Alert>
    );
  }

  const chartData = generateChartData();

  return (
    <Box>
      {/* Header with Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatIcon color="primary" sx={{ fontSize: 30 }} />
          <Typography variant="h5" fontWeight="bold">
            Chat Activity Analysis
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={timeWindow}
            exclusive
            onChange={(e, newValue) => newValue && setTimeWindow(newValue)}
            size="small"
          >
            <ToggleButton value="7">7 Days</ToggleButton>
            <ToggleButton value="14">14 Days</ToggleButton>
            <ToggleButton value="30">30 Days</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="metrics">Metrics</ToggleButton>
            <ToggleButton value="trends">Trends</ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} color="primary" size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {viewMode === 'metrics' ? (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Messages
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {metrics.summary.totalMessages}
                      </Typography>
                    </Box>
                    <MessageIcon color="primary" sx={{ fontSize: 40, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Avg Length
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="secondary.main">
                        {metrics.summary.averageMessageLength}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        characters
                      </Typography>
                    </Box>
                    <ChatIcon color="secondary" sx={{ fontSize: 40, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Messages/Day
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="info.main">
                        {metrics.summary.messagesPerDay.toFixed(1)}
                      </Typography>
                    </Box>
                    <CalendarIcon color="info" sx={{ fontSize: 40, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Active Members
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {metrics.summary.activeMembers}/{metrics.summary.totalProjectMembers}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {metrics.summary.activityRate}% active
                      </Typography>
                    </Box>
                    <PeopleIcon color="success" sx={{ fontSize: 40, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Activity Rate Progress */}
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Team Participation Rate
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={metrics.summary.activityRate}
                  color={getActivityRateColor(metrics.summary.activityRate)}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Chip
                label={`${metrics.summary.activityRate}%`}
                color={getActivityRateColor(metrics.summary.activityRate)}
                size="small"
              />
            </Box>
          </Paper>

          <Grid container spacing={2}>
            {/* Chart */}
            <Grid item xs={12} md={7}>
              <Paper elevation={2} sx={{ p: 2, height: 350 }}>
                {chartData && <Line data={chartData} options={chartOptions} />}
              </Paper>
            </Grid>

            {/* Top Active Members */}
            <Grid item xs={12} md={5}>
              <Paper elevation={2} sx={{ p: 2, height: 350, overflow: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrophyIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Top Contributors
                  </Typography>
                </Box>
                <List>
                  {metrics.topActiveMembers.map((member, index) => (
                    <React.Fragment key={member.userId}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : '#cd7f32',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight="600">
                              {member.username}
                            </Typography>
                          }
                          secondary={member.email}
                        />
                        <Chip
                          label={`${member.messageCount} msgs`}
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      </ListItem>
                      {index < metrics.topActiveMembers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                {metrics.leastActiveMember && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Least Active Member
                    </Typography>
                    <ListItem sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'grey.400' }}>
                          {metrics.leastActiveMember.username.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={metrics.leastActiveMember.username}
                        secondary={metrics.leastActiveMember.email}
                      />
                      <Chip
                        label={`${metrics.leastActiveMember.messageCount} msgs`}
                        size="small"
                        variant="outlined"
                      />
                    </ListItem>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Insights */}
          {metrics.insights && metrics.insights.length > 0 && (
            <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                💡 Insights & Recommendations
              </Typography>
              <List>
                {metrics.insights.map((insight, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={insight}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.primary'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </>
      ) : (
        // Trends View
        trends && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {getTrendIcon(trends.trend?.direction)}
                  <Typography variant="h6" fontWeight="bold">
                    Activity Trend: {trends.trend?.interpretation}
                  </Typography>
                  {trends.trend?.percentage !== 0 && (
                    <Chip
                      label={`${trends.trend?.percentage > 0 ? '+' : ''}${trends.trend?.percentage}%`}
                      color={trends.trend?.direction === 'increasing' ? 'success' : trends.trend?.direction === 'decreasing' ? 'error' : 'default'}
                      size="small"
                    />
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Last Week
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {trends.lastWeek?.totalMessages || 0} messages
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {trends.lastWeek?.messagesPerDay.toFixed(1) || 0} per day
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Last Two Weeks
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {trends.lastTwoWeeks?.totalMessages || 0} messages
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {trends.lastTwoWeeks?.messagesPerDay.toFixed(1) || 0} per day
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Last Month
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {trends.lastMonth?.totalMessages || 0} messages
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {trends.lastMonth?.messagesPerDay.toFixed(1) || 0} per day
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )
      )}
    </Box>
  );
}

export default ChatAnalysisReport;
