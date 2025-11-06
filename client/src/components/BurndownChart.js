import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid
} from '@mui/material';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BurndownChart = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [burndownData, setBurndownData] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchBurndownData();
    }
  }, [projectId]);

  const fetchBurndownData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/projects/${projectId}/burndown-data`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = response.data;
      setBurndownData(data);

      // Prepare chart data
      if (data.burndownData && data.burndownData.length > 0) {
        prepareChartData(data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching burndown data:', err);
      setError(err.response?.data?.message || 'Failed to fetch burndown data');
      setLoading(false);
    }
  };

  const prepareChartData = (data) => {
    const { burndownData, totalInitialTasks, projectStartDate, projectEndDate } = data;

    // Extract dates and actual remaining tasks
    const dates = burndownData.map(item => item.date);
    const actualRemainingTasks = burndownData.map(item => item.remainingTasks);

    // Calculate ideal burndown line (straight line from total tasks to 0)
    const idealBurndownLine = [];
    const totalDays = burndownData.length;
    
    if (totalDays > 0) {
      for (let i = 0; i < totalDays; i++) {
        const idealRemaining = totalInitialTasks - (totalInitialTasks * i / (totalDays - 1));
        idealBurndownLine.push(Math.max(0, idealRemaining));
      }
    }

    // Prepare Chart.js data
    const chartConfig = {
      labels: dates.map(date => {
        // Format date for display (e.g., "Jan 15")
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Ideal Burndown',
          data: idealBurndownLine,
          borderColor: 'rgba(158, 158, 158, 0.8)',
          backgroundColor: 'rgba(158, 158, 158, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0,
          fill: false
        },
        {
          label: 'Actual Remaining Tasks',
          data: actualRemainingTasks,
          borderColor: 'rgba(25, 118, 210, 1)',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          borderWidth: 3,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgba(25, 118, 210, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.2,
          fill: true
        }
      ]
    };

    setChartData(chartConfig);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Project Burndown Chart',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(0)} tasks`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 15
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Remaining Tasks',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            if (Number.isInteger(value)) {
              return value;
            }
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        }
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!burndownData || !burndownData.burndownData || burndownData.burndownData.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No burndown data available. Add tasks to this project to see the burndown chart.
      </Alert>
    );
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        {/* Statistics Summary */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                {burndownData.totalInitialTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Tasks
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {burndownData.completedTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {burndownData.currentRemainingTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Remaining
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {burndownData.totalInitialTasks > 0
                  ? Math.round((burndownData.completedTasks / burndownData.totalInitialTasks) * 100)
                  : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Chart */}
        <Box sx={{ height: 400, position: 'relative' }}>
          {chartData && <Line data={chartData} options={chartOptions} />}
        </Box>

        {/* Date Range Info */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Project Timeline: {new Date(burndownData.projectStartDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} 
            {' '} to {' '}
            {new Date(burndownData.projectEndDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>
      </Paper>

      {/* Chart Explanation */}
      <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Chart Explanation:
        </Typography>
        <Typography variant="body2" paragraph>
          • <strong>Ideal Burndown Line</strong> (dashed): Represents the ideal pace if tasks are completed evenly over time.
        </Typography>
        <Typography variant="body2" paragraph>
          • <strong>Actual Remaining Tasks</strong> (solid blue): Shows the actual number of remaining tasks based on completion dates.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          If the actual line is below the ideal line, the project is ahead of schedule. 
          If it's above, the project is behind schedule.
        </Typography>
      </Paper>
    </Box>
  );
};

export default BurndownChart;
