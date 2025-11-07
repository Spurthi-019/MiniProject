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

  const TaskCard = ({ task }) => (
    <Card sx={{ mb: 2, borderLeft: 4, borderColor: getStatusColor(task.status) + '.main' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Typography variant="h6" component="div">
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {task.description}
          </Typography>
        )}
        
        <Typography variant="caption" color="text.secondary" display="block">
          Project: {task.project?.name || 'N/A'}
        </Typography>
        
        {task.deadline && (
          <Typography variant="caption" color="text.secondary" display="block">
            Deadline: {new Date(task.deadline).toLocaleDateString()}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <FormControl size="small" fullWidth sx={{ px: 1, pb: 1 }}>
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Team Member Dashboard
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

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* AI Recommendations Section - Proactive Guidance */}
            {projects.length > 0 && (
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {projects.map(project => (
                  <Grid item xs={12} lg={6} key={project._id}>
                    <RecommendationWidget 
                      projectId={project._id} 
                      limit={3}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Tasks Section */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AssignmentIcon sx={{ mr: 1, fontSize: 30 }} color="primary" />
                <Typography variant="h5">My Tasks</Typography>
                <Chip label={tasks.length} color="primary" sx={{ ml: 2 }} />
              </Box>

              <Grid container spacing={3}>
                {/* To Do Column */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PendingIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">To Do</Typography>
                      <Chip label={todoTasks.length} size="small" sx={{ ml: 1 }} />
                    </Box>
                  </Paper>
                  <Box sx={{ mt: 2 }}>
                    {todoTasks.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" align="center">
                        No tasks in To Do
                      </Typography>
                    ) : (
                      todoTasks.map(task => <TaskCard key={task._id} task={task} />)
                    )}
                  </Box>
                </Grid>

                {/* In Progress Column */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PlayArrowIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">In Progress</Typography>
                      <Chip label={inProgressTasks.length} size="small" sx={{ ml: 1 }} />
                    </Box>
                  </Paper>
                  <Box sx={{ mt: 2 }}>
                    {inProgressTasks.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" align="center">
                        No tasks in progress
                      </Typography>
                    ) : (
                      inProgressTasks.map(task => <TaskCard key={task._id} task={task} />)
                    )}
                  </Box>
                </Grid>

                {/* Done Column */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckCircleIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">Done</Typography>
                      <Chip label={doneTasks.length} size="small" sx={{ ml: 1 }} />
                    </Box>
                  </Paper>
                  <Box sx={{ mt: 2 }}>
                    {doneTasks.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" align="center">
                        No completed tasks
                      </Typography>
                    ) : (
                      doneTasks.map(task => <TaskCard key={task._id} task={task} />)
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Projects Section */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
