import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PendingIcon from '@mui/icons-material/Pending';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import axios from 'axios';
import BurndownChart from '../components/BurndownChart';

function MentorDashboard({ user }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/projects/my-projects', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProjects(response.data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = async (project) => {
    try {
      setSelectedProject(project);
      setDetailsLoading(true);
      setDialogOpen(true);
      setTabValue(0);

      const token = localStorage.getItem('token');
      
      // Fetch project metrics and tasks
      const [metricsResponse, tasksResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/projects/${project._id}/metrics`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/tasks/project/${project._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setProjectDetails({
        metrics: metricsResponse.data,
        tasks: tasksResponse.data.tasks || []
      });
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError(err.response?.data?.message || 'Failed to fetch project details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProject(null);
    setProjectDetails(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do': return 'warning';
      case 'In Progress': return 'info';
      case 'Done': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'To Do': return <PendingIcon fontSize="small" />;
      case 'In Progress': return <PlayArrowIcon fontSize="small" />;
      case 'Done': return <CheckCircleIcon fontSize="small" />;
      default: return null;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mentor Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user.username}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Welcome, {user.username}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Role: {user.role}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: {user.email}
          </Typography>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PeopleIcon sx={{ mr: 1, fontSize: 30 }} color="secondary" />
              <Typography variant="h5">Projects I'm Mentoring</Typography>
              <Chip label={projects.length} color="secondary" sx={{ ml: 2 }} />
            </Box>

            {projects.length === 0 ? (
              <Alert severity="info">
                You are not mentoring any projects yet. Join a project using a team code!
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {projects.map((project) => (
                  <Grid item xs={12} md={6} key={project._id}>
                    <Card elevation={3}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {project.name}
                        </Typography>
                        <Chip 
                          label={`Code: ${project.teamCode}`} 
                          size="small" 
                          color="secondary"
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {project.description || 'No description'}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" display="block" color="text.secondary">
                          Team Lead: {project.teamLead?.username || 'N/A'}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Members: {project.members?.length || 0} | Mentors: {project.mentors?.length || 0}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="secondary"
                          onClick={() => handleViewProject(project)}
                          startIcon={<BarChartIcon />}
                        >
                          View Details & Metrics
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        )}

        {/* Project Details Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {selectedProject?.name}
              </Typography>
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {detailsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : projectDetails ? (
              <>
                {/* Tabs for Tasks and Metrics */}
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                  <Tab label="Tasks" icon={<AssignmentIcon />} iconPosition="start" />
                  <Tab label="Contribution Metrics" icon={<BarChartIcon />} iconPosition="start" />
                  <Tab label="Burndown Chart" icon={<TrendingDownIcon />} iconPosition="start" />
                </Tabs>

                {/* Tab 0: Tasks List */}
                {tabValue === 0 && (
                  <Box>
                    <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <Typography variant="caption">Total Tasks</Typography>
                          <Typography variant="h6">{projectDetails.metrics.projectStats.totalTasks}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption">To Do</Typography>
                          <Typography variant="h6">{projectDetails.metrics.projectStats.todoTasks}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption">In Progress</Typography>
                          <Typography variant="h6">{projectDetails.metrics.projectStats.inProgressTasks}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption">Completed</Typography>
                          <Typography variant="h6">{projectDetails.metrics.projectStats.completedTasks}</Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption">Overall Completion Rate</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={projectDetails.metrics.projectStats.completionRate} 
                          sx={{ height: 10, borderRadius: 5, mt: 1 }}
                        />
                        <Typography variant="caption">{projectDetails.metrics.projectStats.completionRate}%</Typography>
                      </Box>
                    </Paper>

                    {projectDetails.tasks.length === 0 ? (
                      <Alert severity="info">No tasks found for this project.</Alert>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Task</strong></TableCell>
                              <TableCell><strong>Status</strong></TableCell>
                              <TableCell><strong>Assigned To</strong></TableCell>
                              <TableCell><strong>Deadline</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {projectDetails.tasks.map((task) => (
                              <TableRow key={task._id} hover>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="bold">
                                    {task.title}
                                  </Typography>
                                  {task.description && (
                                    <Typography variant="caption" color="text.secondary">
                                      {task.description}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    icon={getStatusIcon(task.status)}
                                    label={task.status} 
                                    color={getStatusColor(task.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {task.assignedTo?.username || 'Unassigned'}
                                </TableCell>
                                <TableCell>
                                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {/* Tab 1: Contribution Metrics */}
                {tabValue === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Individual Contribution Metrics
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Track task completion and progress for each team member
                    </Typography>

                    {projectDetails.metrics.contributionMetrics.length === 0 ? (
                      <Alert severity="info">No contribution data available.</Alert>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'secondary.light' }}>
                              <TableCell><strong>Member</strong></TableCell>
                              <TableCell align="center"><strong>Role</strong></TableCell>
                              <TableCell align="center"><strong>Total Tasks</strong></TableCell>
                              <TableCell align="center"><strong>Completed</strong></TableCell>
                              <TableCell align="center"><strong>In Progress</strong></TableCell>
                              <TableCell align="center"><strong>To Do</strong></TableCell>
                              <TableCell align="center"><strong>Completion Rate</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {projectDetails.metrics.contributionMetrics.map((metric) => (
                              <TableRow key={metric.userId} hover>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="bold">
                                    {metric.username}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {metric.email}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={metric.role} size="small" />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={metric.totalTasks} color="primary" size="small" />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={metric.completedTasks} color="success" size="small" />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={metric.inProgressTasks} color="info" size="small" />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={metric.todoTasks} color="warning" size="small" />
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box sx={{ width: '100%', mr: 1 }}>
                                      <LinearProgress 
                                        variant="determinate" 
                                        value={metric.completionRate}
                                        color={metric.completionRate === 100 ? 'success' : 'primary'}
                                        sx={{ height: 8, borderRadius: 5 }}
                                      />
                                    </Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      {metric.completionRate}%
                                    </Typography>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {/* Tab 2: Burndown Chart */}
                {tabValue === 2 && (
                  <Box>
                    <BurndownChart projectId={selectedProject?._id} />
                  </Box>
                )}
              </>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default MentorDashboard;
