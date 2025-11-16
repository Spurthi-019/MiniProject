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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloseIcon from '@mui/icons-material/Close';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PendingIcon from '@mui/icons-material/Pending';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import axios from 'axios';
import BurndownChart from '../components/BurndownChart';
import RecommendationWidget from '../components/RecommendationWidget';
import ProjectChat from '../components/ProjectChat';
import ChatAnalysisReport from '../components/ChatAnalysisReport';

function AdminDashboard({ user, sectionRefs }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create Project Dialog
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // View Projects Dialog
  const [viewProjectsOpen, setViewProjectsOpen] = useState(false);

  // Manage Tasks Dialog
  const [manageTasksOpen, setManageTasksOpen] = useState(false);
  const [selectedProjectForTask, setSelectedProjectForTask] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);

  // View Team Dialog
  const [viewTeamOpen, setViewTeamOpen] = useState(false);
  const [selectedProjectForTeam, setSelectedProjectForTeam] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [taskView, setTaskView] = useState('kanban'); // 'table' or 'kanban'

  // Invite states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Team Member');
  const [selectedProjectForInvite, setSelectedProjectForInvite] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleOpenInviteDialog = (project) => {
    setSelectedProjectForInvite(project);
    setInviteDialogOpen(true);
    setInviteEmail('');
    setInviteRole('Team Member');
    setError('');
    setSuccess('');
  };

  const handleCloseInviteDialog = () => {
    setInviteDialogOpen(false);
    setInviteEmail('');
    setInviteRole('Team Member');
    setSelectedProjectForInvite(null);
  };

  const handleSendInvite = async () => {
    try {
      if (!inviteEmail.trim()) {
        setError('Please enter an email address');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail.trim())) {
        setError('Please enter a valid email address');
        return;
      }

      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/projects/invite',
        {
          projectId: selectedProjectForInvite._id,
          email: inviteEmail.trim(),
          role: inviteRole
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const inviteDetails = `
📧 Invitation sent successfully!

To: ${inviteEmail}
Role: ${inviteRole}
Project: ${selectedProjectForInvite.name}
Team Code: ${selectedProjectForInvite.teamCode}

The invitee will see this invitation when they log in to their dashboard.
      `.trim();

      setSuccess(inviteDetails);
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('Team Member');
      setSelectedProjectForInvite(null);
      
      setTimeout(() => setSuccess(''), 10000);
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  // Create Project Handlers
  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/projects',
        { name: projectName, description: projectDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Project created successfully! Team Code: ${response.data.project.teamCode}`);
      setProjectName('');
      setProjectDescription('');
      setCreateProjectOpen(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  // Manage Tasks Handlers
  const handleOpenManageTasks = () => {
    if (projects.length === 0) {
      setError('Please create a project first');
      return;
    }
    setManageTasksOpen(true);
  };

  const handleCreateTask = async () => {
    if (!selectedProjectForTask || !taskTitle.trim()) {
      setError('Project and task title are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/tasks',
        {
          title: taskTitle,
          description: taskDescription,
          project: selectedProjectForTask,
          deadline: taskDeadline || undefined,
          assignedTo: taskAssignedTo || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Task created successfully!');
      setTaskTitle('');
      setTaskDescription('');
      setTaskDeadline('');
      setTaskAssignedTo('');
      setManageTasksOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const fetchTeamMembers = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/projects/${projectId}/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const project = response.data.project;
      const members = [project.teamLead, ...project.members];
      setTeamMembers(members);
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  };

  useEffect(() => {
    if (selectedProjectForTask) {
      fetchTeamMembers(selectedProjectForTask);
    }
  }, [selectedProjectForTask]);

  // View Team Handlers
  const handleViewTeam = async (project) => {
    try {
      setSelectedProjectForTeam(project);
      setDetailsLoading(true);
      setViewTeamOpen(true);
      setTabValue(0);

      const token = localStorage.getItem('token');
      
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

  // Helper functions for task display
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
              <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>Assigned to:</Box>
              {task.assignedTo?.username || 'Unassigned'}
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
      </Card>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 2.5, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Welcome, {user.username}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Role: {user.role}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {user.email}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/main')}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
                }
              }}
            >
              Go to Main Dashboard
            </Button>
          </Box>
        </Paper>

        {/* Action Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AddIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Create Project</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Start a new project and get a unique team code
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={() => setCreateProjectOpen(true)}
                >
                  New Project
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DashboardIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">My Projects</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  View and manage your projects
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => setViewProjectsOpen(true)}
                >
                  View Projects
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignmentIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Manage Tasks</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Create and assign tasks to team members
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={handleOpenManageTasks}
                >
                  Manage Tasks
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GroupIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Team Members</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  View team members and their progress
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => setViewProjectsOpen(true)}
                >
                  View Team
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* AI Recommendations for Projects */}
        {projects.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChartIcon color="primary" />
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

        {/* Team Members Section */}
        {projects.length > 0 && (
          <div ref={sectionRefs?.teamRef}>
            <Paper elevation={2} sx={{ p: 2.5, mt: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ mr: 1, fontSize: 30 }} color="primary" />
                <Typography variant="h5">Team Members</Typography>
                <Chip label="By Project" color="primary" size="small" sx={{ ml: 2 }} />
              </Box>

              <Grid container spacing={2}>
                {projects.map((project) => (
                  <Grid item xs={12} md={6} key={project._id}>
                    <Card elevation={3}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" color="primary">
                            {project.name}
                          </Typography>
                          <Chip 
                            label={`Code: ${project.teamCode}`} 
                            size="small" 
                            color="primary"
                          />
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Team Lead */}
                        {project.teamLead && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Team Lead
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, bgcolor: 'primary.light', borderRadius: 1 }}>
                              <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>
                                {project.teamLead.username?.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight="600">
                                  {project.teamLead.username}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {project.teamLead.email}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        )}

                        {/* Team Members */}
                        {project.members && project.members.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Members ({project.members.length})
                            </Typography>
                            <List dense>
                              {project.members.map((member) => (
                                <ListItem key={member._id} sx={{ px: 1 }}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'success.main', width: 36, height: 36 }}>
                                      {member.username?.charAt(0).toUpperCase()}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={member.username}
                                    secondary={member.email}
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {/* Mentors */}
                        {project.mentors && project.mentors.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Mentors ({project.mentors.length})
                            </Typography>
                            <List dense>
                              {project.mentors.map((mentor) => (
                                <ListItem key={mentor._id} sx={{ px: 1 }}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                                      {mentor.username?.charAt(0).toUpperCase()}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={mentor.username}
                                    secondary={mentor.email}
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {/* Summary Stats */}
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          <Chip 
                            icon={<GroupIcon />}
                            label={`${(project.members?.length || 0) + 1} Members`} 
                            size="small" 
                            color="success"
                          />
                          <Chip 
                            icon={<SchoolIcon />}
                            label={`${project.mentors?.length || 0} Mentors`} 
                            size="small" 
                            color="secondary"
                          />
                        </Box>

                        {/* Invite Button */}
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<EmailIcon />}
                          fullWidth
                          onClick={() => handleOpenInviteDialog(project)}
                          sx={{ textTransform: 'none' }}
                        >
                          Invite Team Member / Mentor
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </div>
        )}

        {/* Create Project Dialog */}
        <Dialog open={createProjectOpen} onClose={() => setCreateProjectOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Project Name"
              fullWidth
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
            <TextField
              margin="dense"
              label="Description (Optional)"
              fullWidth
              multiline
              rows={3}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateProjectOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProject} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        {/* View Projects Dialog */}
        <Dialog open={viewProjectsOpen} onClose={() => setViewProjectsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">My Projects</Typography>
              <IconButton onClick={() => setViewProjectsOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : projects.length === 0 ? (
              <Alert severity="info">
                No projects yet. Create your first project!
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {projects.map((project) => (
                  <Grid item xs={12} key={project._id}>
                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {project.name}
                        </Typography>
                        <Chip 
                          label={`Code: ${project.teamCode}`} 
                          size="small" 
                          color="primary"
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {project.description || 'No description'}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" display="block" color="text.secondary">
                          Members: {project.members?.length || 0} | Mentors: {project.mentors?.length || 0}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={() => {
                            setViewProjectsOpen(false);
                            handleViewTeam(project);
                          }}
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
          </DialogContent>
        </Dialog>

        {/* Manage Tasks Dialog */}
        <Dialog open={manageTasksOpen} onClose={() => setManageTasksOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Select Project</InputLabel>
              <Select
                value={selectedProjectForTask}
                onChange={(e) => setSelectedProjectForTask(e.target.value)}
                label="Select Project"
              >
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="dense"
              label="Task Title"
              fullWidth
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />

            <TextField
              margin="dense"
              label="Description (Optional)"
              fullWidth
              multiline
              rows={3}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />

            <TextField
              margin="dense"
              label="Deadline (Optional)"
              type="date"
              fullWidth
              value={taskDeadline}
              onChange={(e) => setTaskDeadline(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel>Assign To (Optional)</InputLabel>
              <Select
                value={taskAssignedTo}
                onChange={(e) => setTaskAssignedTo(e.target.value)}
                label="Assign To (Optional)"
                disabled={!selectedProjectForTask}
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {teamMembers.map((member) => (
                  <MenuItem key={member._id} value={member._id}>
                    {member.username} ({member.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setManageTasksOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTask} variant="contained">Create Task</Button>
          </DialogActions>
        </Dialog>

        {/* View Team / Project Details Dialog */}
        <Dialog 
          open={viewTeamOpen} 
          onClose={() => setViewTeamOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {selectedProjectForTeam?.name}
              </Typography>
              <IconButton onClick={() => setViewTeamOpen(false)}>
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
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                  <Tab label="Tasks" icon={<AssignmentIcon />} iconPosition="start" />
                  <Tab label="Team Metrics" icon={<BarChartIcon />} iconPosition="start" />
                  <Tab label="Burndown Chart" icon={<TrendingDownIcon />} iconPosition="start" />
                </Tabs>

                {/* Tasks Tab */}
                {tabValue === 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Project Tasks
                      </Typography>
                      <ToggleButtonGroup
                        value={taskView}
                        exclusive
                        onChange={(e, newView) => newView && setTaskView(newView)}
                        size="small"
                      >
                        <ToggleButton value="kanban">
                          <ViewKanbanIcon sx={{ mr: 0.5 }} fontSize="small" />
                          Kanban
                        </ToggleButton>
                        <ToggleButton value="table">
                          <ViewListIcon sx={{ mr: 0.5 }} fontSize="small" />
                          Table
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                    
                    {projectDetails.tasks.length === 0 ? (
                      <Alert severity="info">No tasks found for this project.</Alert>
                    ) : taskView === 'kanban' ? (
                      // Kanban View
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
                                label={projectDetails.tasks.filter(t => t.status === 'To Do').length} 
                                size="small" 
                                sx={{ 
                                  bgcolor: 'rgba(255, 255, 255, 0.9)', 
                                  color: 'warning.main',
                                  fontWeight: 'bold'
                                }} 
                              />
                            </Box>
                          </Paper>
                          <Box sx={{ mt: 2, minHeight: 300 }}>
                            {projectDetails.tasks.filter(t => t.status === 'To Do').length === 0 ? (
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
                              projectDetails.tasks.filter(t => t.status === 'To Do').map(task => (
                                <TaskCard key={task._id} task={task} />
                              ))
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
                                label={projectDetails.tasks.filter(t => t.status === 'In Progress').length} 
                                size="small" 
                                sx={{ 
                                  bgcolor: 'rgba(255, 255, 255, 0.9)', 
                                  color: 'info.main',
                                  fontWeight: 'bold'
                                }} 
                              />
                            </Box>
                          </Paper>
                          <Box sx={{ mt: 2, minHeight: 300 }}>
                            {projectDetails.tasks.filter(t => t.status === 'In Progress').length === 0 ? (
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
                              projectDetails.tasks.filter(t => t.status === 'In Progress').map(task => (
                                <TaskCard key={task._id} task={task} />
                              ))
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
                                label={projectDetails.tasks.filter(t => t.status === 'Done').length} 
                                size="small" 
                                sx={{ 
                                  bgcolor: 'rgba(255, 255, 255, 0.9)', 
                                  color: 'success.main',
                                  fontWeight: 'bold'
                                }} 
                              />
                            </Box>
                          </Paper>
                          <Box sx={{ mt: 2, minHeight: 300 }}>
                            {projectDetails.tasks.filter(t => t.status === 'Done').length === 0 ? (
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
                              projectDetails.tasks.filter(t => t.status === 'Done').map(task => (
                                <TaskCard key={task._id} task={task} />
                              ))
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    ) : (
                      // Table View
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
                            {projectDetails.tasks.map((task) => {
                              const urgency = getDeadlineUrgency(task.deadline);
                              return (
                                <TableRow key={task._id} hover>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight="bold">{task.title}</Typography>
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
                                      size="small" 
                                      color={getStatusColor(task.status)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {task.assignedTo ? task.assignedTo.username : 'Unassigned'}
                                  </TableCell>
                                  <TableCell>
                                    {task.deadline ? (
                                      <Box 
                                        sx={{ 
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 0.5,
                                          px: 1,
                                          py: 0.5,
                                          borderRadius: 1,
                                          bgcolor: urgency.bgColor
                                        }}
                                      >
                                        <Typography variant="caption" sx={{ color: urgency.color, fontWeight: 600 }}>
                                          {urgency.icon} {urgency.text}
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <Typography variant="caption" color="text.secondary">No deadline</Typography>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {/* Team Metrics Tab */}
                {tabValue === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Individual Contribution Metrics
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
                              <TableRow key={metric.userId}>
                                <TableCell>
                                  <Typography variant="body2">{metric.username}</Typography>
                                  <Typography variant="caption" color="text.secondary">{metric.email}</Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={metric.role} size="small" />
                                </TableCell>
                                <TableCell align="center">{metric.totalTasks}</TableCell>
                                <TableCell align="center">{metric.completedTasks}</TableCell>
                                <TableCell align="center">{metric.inProgressTasks}</TableCell>
                                <TableCell align="center">{metric.todoTasks}</TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    label={`${metric.completionRate}%`} 
                                    size="small"
                                    color={metric.completionRate >= 70 ? 'success' : metric.completionRate >= 40 ? 'warning' : 'error'}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {/* Burndown Chart Tab */}
                {tabValue === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Project Burndown Chart
                    </Typography>
                    <BurndownChart projectId={selectedProjectForTeam?._id} />
                  </Box>
                )}
              </>
            ) : (
              <Alert severity="info">Select a project to view details.</Alert>
            )}
          </DialogContent>
        </Dialog>

        {/* Invite Team Member/Mentor Dialog */}
        <Dialog
          open={inviteDialogOpen}
          onClose={handleCloseInviteDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">
                  Invite to Team
                </Typography>
              </Box>
              <IconButton onClick={handleCloseInviteDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedProjectForInvite && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Inviting to project:
                </Typography>
                <Typography variant="body1" fontWeight="600" color="primary">
                  {selectedProjectForInvite.name}
                </Typography>
                <Chip 
                  label={`Code: ${selectedProjectForInvite.teamCode}`} 
                  size="small" 
                  color="primary"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Send an email invitation to join your team as a member or mentor.
            </Typography>

            <TextField
              autoFocus
              label="Email Address"
              fullWidth
              variant="outlined"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              sx={{ mb: 2 }}
              helperText="Enter the email address of the person you want to invite"
            />

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Role</FormLabel>
              <RadioGroup
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <FormControlLabel 
                  value="Team Member" 
                  control={<Radio />} 
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="600">Team Member</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Can view tasks, chat with team, and update their own tasks
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="Mentor" 
                  control={<Radio />} 
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="600">Mentor</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Can guide the team, view metrics, and monitor progress
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            <Alert severity="info" sx={{ mt: 2 }}>
              The invited person will receive a notification when they log in to their dashboard.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInviteDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendInvite} 
              variant="contained" 
              color="primary"
              startIcon={<EmailIcon />}
              disabled={!inviteEmail.trim()}
            >
              Send Invitation
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default AdminDashboard;
