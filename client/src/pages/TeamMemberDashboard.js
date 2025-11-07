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
  Chip,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PendingIcon from '@mui/icons-material/Pending';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import BurndownChart from '../components/BurndownChart';
import RecommendationWidget from '../components/RecommendationWidget';

function TeamMemberDashboard({ user }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [burndownDialogOpen, setBurndownDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch tasks and projects in parallel
      const [tasksResponse, projectsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/tasks/my-tasks', config),
        axios.get('http://localhost:5000/api/projects/my-projects', config)
      ]);

      setTasks(tasksResponse.data.tasks || []);
      setProjects(projectsResponse.data.projects || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update task in state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? response.data.task : task
        )
      );

      setSuccess('Task status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleViewBurndown = (project) => {
    setSelectedProject(project);
    setBurndownDialogOpen(true);
  };

  const handleCloseBurndownDialog = () => {
    setBurndownDialogOpen(false);
    setSelectedProject(null);
  };

  // Categorize tasks by status
  const todoTasks = tasks.filter(task => task.status === 'To Do');
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
  const doneTasks = tasks.filter(task => task.status === 'Done');

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
      case 'To Do': return <PendingIcon />;
      case 'In Progress': return <PlayArrowIcon />;
      case 'Done': return <CheckCircleIcon />;
      default: return null;
    }
  };

  // Get deadline urgency with color coding
  const getDeadlineUrgency = (deadline) => {
    if (!deadline) return { level: 'none', color: 'text.secondary', bgColor: 'transparent', text: 'No deadline' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return { level: 'overdue', color: 'error.main', bgColor: 'error.light', text: `Overdue by ${Math.abs(daysUntil)} days`, icon: '🔴' };
    } else if (daysUntil === 0) {
      return { level: 'today', color: 'error.main', bgColor: 'error.light', text: 'Due Today', icon: '⚠️' };
    } else if (daysUntil <= 3) {
      return { level: 'urgent', color: 'warning.main', bgColor: 'warning.light', text: `Due in ${daysUntil} days`, icon: '⏰' };
    } else if (daysUntil <= 7) {
      return { level: 'soon', color: 'info.main', bgColor: 'info.light', text: `Due in ${daysUntil} days`, icon: '📅' };
    } else {
      return { level: 'normal', color: 'text.secondary', bgColor: 'transparent', text: deadlineDate.toLocaleDateString(), icon: '📆' };
    }
  };

  const TaskCard = ({ task }) => {
    const urgency = getDeadlineUrgency(task.deadline);
    
    return (
      <Card 
        sx={{ 
          mb: 2, 
          borderLeft: 4, 
          borderColor: getStatusColor(task.status) + '.main',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          }
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
            <Typography variant="subtitle1" component="div" fontWeight="600">
              {task.title}
            </Typography>
            <Chip
              icon={getStatusIcon(task.status)}
              label={task.status}
              color={getStatusColor(task.status)}
              size="small"
            />
          </Box>
          
          {task.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {task.description}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
              <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>Project:</Box>
              {task.project?.name || 'N/A'}
            </Typography>
            
            {task.deadline && (
              <Box 
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: urgency.bgColor,
                  width: 'fit-content'
                }}
              >
                <Typography variant="caption" sx={{ color: urgency.color, fontWeight: 600 }}>
                  {urgency.icon} {urgency.text}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
        <CardActions sx={{ pt: 0, pb: 1.5 }}>
          <FormControl size="small" fullWidth sx={{ px: 1 }}>
            <InputLabel>Update Status</InputLabel>
            <Select
              value={task.status}
              label="Update Status"
              onChange={(e) => handleStatusChange(task._id, e.target.value)}
            >
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
            </Select>
          </FormControl>
        </CardActions>
      </Card>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Paper elevation={2} sx={{ p: 2.5, mb: 2 }}>
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
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tasks Section - Primary Focus */}
            <Paper elevation={2} sx={{ p: 2.5, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ mr: 1, fontSize: 30 }} color="primary" />
                <Typography variant="h5">My Tasks</Typography>
                <Chip label={tasks.length} color="primary" sx={{ ml: 2 }} />
              </Box>

              <Grid container spacing={2}>
                {/* To Do Column */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'warning.main', 
                      color: 'warning.contrastText',
                      borderRadius: 2,
                      mb: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PendingIcon sx={{ mr: 1, fontSize: 28 }} />
                        <Typography variant="h6" fontWeight="bold">To Do</Typography>
                      </Box>
                      <Chip 
                        label={todoTasks.length} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.9)', 
                          color: 'warning.main',
                          fontWeight: 'bold'
                        }} 
                      />
                    </Box>
                  </Paper>
                  <Box sx={{ mt: 2, minHeight: 400 }}>
                    {todoTasks.length === 0 ? (
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 3, 
                          textAlign: 'center', 
                          bgcolor: 'grey.50',
                          border: '2px dashed',
                          borderColor: 'grey.300',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No tasks in To Do
                        </Typography>
                      </Paper>
                    ) : (
                      todoTasks.map(task => <TaskCard key={task._id} task={task} />)
                    )}
                  </Box>
                </Grid>

                {/* In Progress Column */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'info.main', 
                      color: 'info.contrastText',
                      borderRadius: 2,
                      mb: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PlayArrowIcon sx={{ mr: 1, fontSize: 28 }} />
                        <Typography variant="h6" fontWeight="bold">In Progress</Typography>
                      </Box>
                      <Chip 
                        label={inProgressTasks.length} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.9)', 
                          color: 'info.main',
                          fontWeight: 'bold'
                        }} 
                      />
                    </Box>
                  </Paper>
                  <Box sx={{ mt: 2, minHeight: 400 }}>
                    {inProgressTasks.length === 0 ? (
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 3, 
                          textAlign: 'center', 
                          bgcolor: 'grey.50',
                          border: '2px dashed',
                          borderColor: 'grey.300',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No tasks in progress
                        </Typography>
                      </Paper>
                    ) : (
                      inProgressTasks.map(task => <TaskCard key={task._id} task={task} />)
                    )}
                  </Box>
                </Grid>

                {/* Done Column */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'success.main', 
                      color: 'success.contrastText',
                      borderRadius: 2,
                      mb: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircleIcon sx={{ mr: 1, fontSize: 28 }} />
                        <Typography variant="h6" fontWeight="bold">Done</Typography>
                      </Box>
                      <Chip 
                        label={doneTasks.length} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.9)', 
                          color: 'success.main',
                          fontWeight: 'bold'
                        }} 
                      />
                    </Box>
                  </Paper>
                  <Box sx={{ mt: 2, minHeight: 400 }}>
                    {doneTasks.length === 0 ? (
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 3, 
                          textAlign: 'center', 
                          bgcolor: 'grey.50',
                          border: '2px dashed',
                          borderColor: 'grey.300',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No completed tasks
                        </Typography>
                      </Paper>
                    ) : (
                      doneTasks.map(task => <TaskCard key={task._id} task={task} />)
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* AI Recommendations Section - Proactive Guidance */}
            {projects.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUpIcon color="primary" />
                  AI Project Recommendations
                </Typography>
                <Grid container spacing={2}>
                  {projects.map(project => (
                    <Grid item xs={12} lg={6} key={project._id}>
                      <RecommendationWidget 
                        projectId={project._id} 
                        limit={3}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Projects Section */}
            <Paper elevation={2} sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GroupIcon sx={{ mr: 1, fontSize: 30 }} color="secondary" />
                <Typography variant="h5">My Projects</Typography>
                <Chip label={projects.length} color="secondary" sx={{ ml: 2 }} />
              </Box>

              {projects.length === 0 ? (
                <Alert severity="info">
                  You are not part of any projects yet. Join a project using a team code!
                </Alert>
              ) : (
                <List>
                  {projects.map((project, index) => (
                    <React.Fragment key={project._id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography variant="h6">
                              {project.name}
                              <Chip label={`Code: ${project.teamCode}`} size="small" sx={{ ml: 2 }} />
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary">
                                {project.description || 'No description'}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Team Lead: {project.teamLead?.username || 'N/A'}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Members: {project.members?.length || 0} | Mentors: {project.mentors?.length || 0}
                              </Typography>
                            </>
                          }
                        />
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<TrendingDownIcon />}
                          onClick={() => handleViewBurndown(project)}
                          sx={{ ml: 2 }}
                        >
                          View Burndown
                        </Button>
                      </ListItem>
                      {index < projects.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </>
        )}

        {/* Burndown Chart Dialog */}
        <Dialog
          open={burndownDialogOpen}
          onClose={handleCloseBurndownDialog}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingDownIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">
                  Burndown Chart - {selectedProject?.name}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseBurndownDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedProject && <BurndownChart projectId={selectedProject._id} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBurndownDialog} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default TeamMemberDashboard;
