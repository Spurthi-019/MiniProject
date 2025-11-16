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
  ListItemAvatar,
  Avatar,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel
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
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EmailIcon from '@mui/icons-material/Email';
import axios from 'axios';
import BurndownChart from '../components/BurndownChart';
import ChatAnalysisReport from '../components/ChatAnalysisReport';
import ProjectChat from '../components/ProjectChat';

function MentorDashboard({ user, sectionRefs }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [taskView, setTaskView] = useState('kanban'); // 'table' or 'kanban'
  
  // Invitation states
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [joinTeamDialogOpen, setJoinTeamDialogOpen] = useState(false);
  const [teamCode, setTeamCode] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Team Member');
  const [selectedProjectForInvite, setSelectedProjectForInvite] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchInvitations();
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

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/projects/invitations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPendingInvitations(response.data.invitations || []);
    } catch (err) {
      console.error('Error fetching invitations:', err);
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

  const handleViewChatAnalysis = (project) => {
    setSelectedProject(project);
    setDialogOpen(true);
    setTabValue(4); // Navigate to Chat Analysis tab
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleOpenJoinTeamDialog = () => {
    setJoinTeamDialogOpen(true);
    setTeamCode('');
    setError('');
    setSuccess('');
  };

  const handleCloseJoinTeamDialog = () => {
    setJoinTeamDialogOpen(false);
    setTeamCode('');
  };

  const handleJoinTeam = async () => {
    try {
      if (!teamCode.trim()) {
        setError('Please enter a team code');
        return;
      }

      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/projects/join',
        { teamCode: teamCode.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Successfully joined team: ${response.data.project.name}`);
      setJoinTeamDialogOpen(false);
      setTeamCode('');
      
      fetchProjects();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error joining team:', err);
      setError(err.response?.data?.message || 'Failed to join team');
    }
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

      setSuccess(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('Team Member');
      setSelectedProjectForInvite(null);
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/projects/invitations/${invitationId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message);
      fetchInvitations();
      fetchProjects();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/projects/invitations/${invitationId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message);
      fetchInvitations();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error declining invitation:', err);
      setError(err.response?.data?.message || 'Failed to decline invitation');
    }
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
          mb: 1.5, 
          borderLeft: 3, 
          borderColor: getStatusColor(task.status) + '.main',
          transition: 'all 0.2s ease',
          borderRadius: 1.5,
          bgcolor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          }
        }}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
            <Typography variant="body2" component="div" fontWeight="600" sx={{ flex: 1, pr: 1 }}>
              {task.title}
            </Typography>
            <Chip
              icon={getStatusIcon(task.status)}
              label={task.status}
              color={getStatusColor(task.status)}
              size="small"
              sx={{ height: 22, fontSize: '0.7rem' }}
            />
          </Box>
          
          {task.description && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', lineHeight: 1.4 }}>
              {task.description}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
              <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>Assigned:</Box>
              {task.assignedTo?.username || 'Unassigned'}
            </Typography>
            
            {task.deadline && (
              <Box 
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 0.75,
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
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)',
      py: 2
    }}>
      <Container 
        maxWidth="lg" 
        sx={{ 
          px: { xs: 2, sm: 3 }
        }}
      >
        {/* Welcome Header - Compact */}
        <div ref={sectionRefs?.dashboardRef}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 2,
              mb: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 48, height: 48 }}>
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600" sx={{ lineHeight: 1.2 }}>
                    Welcome back, {user.username}!
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        height: 20,
                        fontSize: '0.7rem'
                      }} 
                    />
                    <Typography variant="caption" sx={{ opacity: 0.9, lineHeight: '20px' }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/main')}
                sx={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                Go to Main Dashboard
              </Button>
            </Box>
          </Paper>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Projects Section - Compact */}
            <div ref={sectionRefs?.projectsRef}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon sx={{ fontSize: 24 }} color="secondary" />
                    <Typography variant="h6" fontWeight="600">
                      Projects I'm Mentoring
                    </Typography>
                  </Box>
                  <Chip 
                    label={projects.length} 
                    color="secondary" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                {projects.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    You are not mentoring any projects yet. Join a project using a team code!
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {projects.map((project) => (
                      <Grid item xs={12} md={6} key={project._id}>
                        <Card 
                          elevation={0}
                          sx={{ 
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'grey.200',
                            transition: 'all 0.3s',
                            '&:hover': {
                              borderColor: 'secondary.main',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 1.5 }}>
                              <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
                                {project.name}
                              </Typography>
                              <Chip 
                                label={project.teamCode} 
                                size="small" 
                                color="secondary"
                                sx={{ height: 22, fontSize: '0.7rem' }}
                              />
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.5 }}>
                              {project.description || 'No description'}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                              <Chip 
                                icon={<GroupIcon />}
                                label={`${project.members?.length || 0} members`}
                                size="small"
                                variant="outlined"
                                sx={{ height: 24, fontSize: '0.75rem' }}
                              />
                              <Chip 
                                icon={<SchoolIcon />}
                                label={`${project.mentors?.length || 0} mentors`}
                                size="small"
                                variant="outlined"
                                sx={{ height: 24, fontSize: '0.75rem' }}
                              />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                              <Button 
                                size="small" 
                                variant="contained" 
                                color="secondary"
                                fullWidth
                                onClick={() => handleViewProject(project)}
                                startIcon={<BarChartIcon />}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                              >
                                View Details
                              </Button>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="primary"
                                fullWidth
                                onClick={() => handleOpenInviteDialog(project)}
                                startIcon={<EmailIcon />}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                              >
                                Invite
                              </Button>
                            </Box>
                            
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="info"
                              fullWidth
                              onClick={() => handleViewChatAnalysis(project)}
                              startIcon={<ChatIcon />}
                              sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
                            >
                              Check Chat Health
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </div>

            {/* Team Members Section - Compact */}
            {projects.length > 0 && (
              <div ref={sectionRefs?.teamRef}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleIcon sx={{ fontSize: 24 }} color="primary" />
                      <Typography variant="h6" fontWeight="600">
                        Team Members
                      </Typography>
                    </Box>
                    <Chip 
                      label="By Project" 
                      color="primary" 
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    {projects.map((project) => (
                      <Grid item xs={12} md={6} key={project._id}>
                        <Card 
                          elevation={0}
                          sx={{ 
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'grey.200',
                            bgcolor: 'grey.50'
                          }}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                              <Typography variant="subtitle1" fontWeight="600" color="secondary">
                                {project.name}
                              </Typography>
                              <Chip 
                                label={project.teamCode} 
                                size="small" 
                                color="secondary"
                                sx={{ height: 22, fontSize: '0.7rem' }}
                              />
                            </Box>

                            {/* Team Lead */}
                            {project.teamLead && (
                              <Box sx={{ mb: 1.5 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 0.5, display: 'block' }}>
                                  TEAM LEAD
                                </Typography>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1.5, 
                                  p: 1.5, 
                                  bgcolor: 'primary.light', 
                                  borderRadius: 1.5,
                                  border: '1px solid',
                                  borderColor: 'primary.main'
                                }}>
                                  <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                                    {project.teamLead.username?.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight="600" noWrap>
                                      {project.teamLead.username}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {project.teamLead.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            )}

                            {/* Team Members */}
                            {project.members && project.members.length > 0 && (
                              <Box sx={{ mb: 1.5 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 0.5, display: 'block' }}>
                                  MEMBERS ({project.members.length})
                                </Typography>
                                <List dense disablePadding sx={{ bgcolor: 'white', borderRadius: 1.5, border: '1px solid', borderColor: 'grey.200' }}>
                                  {project.members.map((member, index) => (
                                    <ListItem 
                                      key={member._id} 
                                      sx={{ 
                                        px: 1.5,
                                        py: 1,
                                        borderBottom: index < project.members.length - 1 ? '1px solid' : 'none',
                                        borderColor: 'grey.100'
                                      }}
                                    >
                                      <ListItemAvatar sx={{ minWidth: 44 }}>
                                        <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32, fontSize: '0.9rem' }}>
                                          {member.username?.charAt(0).toUpperCase()}
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={member.username}
                                        secondary={member.email}
                                        primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem' }}
                                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}

                            {/* Other Mentors */}
                            {project.mentors && project.mentors.length > 0 && (
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 0.5, display: 'block' }}>
                                  MENTORS ({project.mentors.length})
                                </Typography>
                                <List dense disablePadding sx={{ bgcolor: 'white', borderRadius: 1.5, border: '1px solid', borderColor: 'grey.200' }}>
                                  {project.mentors.map((mentor, index) => (
                                    <ListItem 
                                      key={mentor._id} 
                                      sx={{ 
                                        px: 1.5,
                                        py: 1,
                                        borderBottom: index < project.mentors.length - 1 ? '1px solid' : 'none',
                                        borderColor: 'grey.100'
                                      }}
                                    >
                                      <ListItemAvatar sx={{ minWidth: 44 }}>
                                        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: '0.9rem' }}>
                                          {mentor.username?.charAt(0).toUpperCase()}
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={mentor.username}
                                        secondary={mentor.email}
                                        primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem' }}
                                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}

                            {/* Summary Stats */}
                            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                              <Chip 
                                icon={<GroupIcon />}
                                label={`${(project.members?.length || 0) + 1} Total`} 
                                size="small" 
                                color="success"
                                variant="outlined"
                                sx={{ height: 24, fontSize: '0.7rem' }}
                              />
                              <Chip 
                                icon={<SchoolIcon />}
                                label={`${project.mentors?.length || 0} Mentors`} 
                                size="small" 
                                color="secondary"
                                variant="outlined"
                                sx={{ height: 24, fontSize: '0.7rem' }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </div>
            )}
          </>
        )}

        {/* Project Details Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="600">
                {selectedProject?.name}
              </Typography>
              <IconButton onClick={handleCloseDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 2 }}>
            {detailsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : projectDetails ? (
              <>
                {/* Tabs for Tasks and Metrics */}
                <Tabs 
                  value={tabValue} 
                  onChange={(e, newValue) => setTabValue(newValue)} 
                  sx={{ 
                    mb: 2,
                    minHeight: 42,
                    '& .MuiTab-root': {
                      minHeight: 42,
                      textTransform: 'none',
                      fontWeight: 600
                    }
                  }}
                >
                  <Tab label="Tasks" icon={<AssignmentIcon fontSize="small" />} iconPosition="start" />
                  <Tab label="Metrics" icon={<BarChartIcon fontSize="small" />} iconPosition="start" />
                  <Tab label="Burndown" icon={<TrendingDownIcon fontSize="small" />} iconPosition="start" />
                  <Tab label="Chat" icon={<ChatIcon fontSize="small" />} iconPosition="start" />
                  <Tab label="Analysis" icon={<PeopleIcon fontSize="small" />} iconPosition="start" />
                </Tabs>

                {/* Tab 0: Tasks List */}
                {tabValue === 0 && (
                  <Box>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>Total Tasks</Typography>
                          <Typography variant="h5" fontWeight="600">{projectDetails.metrics.projectStats.totalTasks}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>To Do</Typography>
                          <Typography variant="h5" fontWeight="600">{projectDetails.metrics.projectStats.todoTasks}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>In Progress</Typography>
                          <Typography variant="h5" fontWeight="600">{projectDetails.metrics.projectStats.inProgressTasks}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>Completed</Typography>
                          <Typography variant="h5" fontWeight="600">{projectDetails.metrics.projectStats.completedTasks}</Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>Completion Rate</Typography>
                          <Typography variant="caption" fontWeight="600">{projectDetails.metrics.projectStats.completionRate}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={projectDetails.metrics.projectStats.completionRate} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.3)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: 'white'
                            }
                          }}
                        />
                      </Box>
                    </Paper>

                    {/* View Toggle */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <ToggleButtonGroup
                        value={taskView}
                        exclusive
                        onChange={(e, newView) => newView && setTaskView(newView)}
                        size="small"
                        sx={{
                          '& .MuiToggleButton-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2
                          }
                        }}
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
                      <Alert severity="info" sx={{ borderRadius: 2 }}>No tasks found for this project.</Alert>
                    ) : taskView === 'kanban' ? (
                      // Kanban View
                      <Grid container spacing={2}>
                        {/* To Do Column */}
                        <Grid item xs={12} md={4}>
                          <Paper 
                            elevation={0}
                            sx={{ 
                              p: 1.5, 
                              bgcolor: 'warning.main', 
                              color: 'warning.contrastText',
                              borderRadius: 1.5,
                              mb: 1.5
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PendingIcon sx={{ mr: 0.75, fontSize: 20 }} />
                                <Typography variant="body2" fontWeight="700">To Do</Typography>
                              </Box>
                              <Chip 
                                label={projectDetails.tasks.filter(t => t.status === 'To Do').length} 
                                size="small" 
                                sx={{ 
                                  bgcolor: 'rgba(255, 255, 255, 0.9)', 
                                  color: 'warning.main',
                                  fontWeight: 'bold',
                                  height: 22,
                                  fontSize: '0.75rem'
                                }} 
                              />
                            </Box>
                          </Paper>
                          <Box sx={{ minHeight: 300 }}>
                            {projectDetails.tasks.filter(t => t.status === 'To Do').length === 0 ? (
                              <Paper 
                                elevation={0} 
                                sx={{ 
                                  p: 2, 
                                  textAlign: 'center', 
                                  bgcolor: 'grey.50',
                                  border: '2px dashed',
                                  borderColor: 'grey.300',
                                  borderRadius: 1.5
                                }}
                              >
                                <Typography variant="caption" color="text.secondary">
                                  No tasks
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
                            elevation={0}
                            sx={{ 
                              p: 1.5, 
                              bgcolor: 'info.main', 
                              color: 'info.contrastText',
                              borderRadius: 1.5,
                              mb: 1.5
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PlayArrowIcon sx={{ mr: 0.75, fontSize: 20 }} />
                                <Typography variant="body2" fontWeight="700">In Progress</Typography>
                              </Box>
                              <Chip 
                                label={projectDetails.tasks.filter(t => t.status === 'In Progress').length} 
                                size="small" 
                                sx={{ 
                                  bgcolor: 'rgba(255, 255, 255, 0.9)', 
                                  color: 'info.main',
                                  fontWeight: 'bold',
                                  height: 22,
                                  fontSize: '0.75rem'
                                }} 
                              />
                            </Box>
                          </Paper>
                          <Box sx={{ minHeight: 300 }}>
                            {projectDetails.tasks.filter(t => t.status === 'In Progress').length === 0 ? (
                              <Paper 
                                elevation={0} 
                                sx={{ 
                                  p: 2, 
                                  textAlign: 'center', 
                                  bgcolor: 'grey.50',
                                  border: '2px dashed',
                                  borderColor: 'grey.300',
                                  borderRadius: 1.5
                                }}
                              >
                                <Typography variant="caption" color="text.secondary">
                                  No tasks
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
                            elevation={0}
                            sx={{ 
                              p: 1.5, 
                              bgcolor: 'success.main', 
                              color: 'success.contrastText',
                              borderRadius: 1.5,
                              mb: 1.5
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon sx={{ mr: 0.75, fontSize: 20 }} />
                                <Typography variant="body2" fontWeight="700">Done</Typography>
                              </Box>
                              <Chip 
                                label={projectDetails.tasks.filter(t => t.status === 'Done').length} 
                                size="small" 
                                sx={{ 
                                  bgcolor: 'rgba(255, 255, 255, 0.9)', 
                                  color: 'success.main',
                                  fontWeight: 'bold',
                                  height: 22,
                                  fontSize: '0.75rem'
                                }} 
                              />
                            </Box>
                          </Paper>
                          <Box sx={{ minHeight: 300 }}>
                            {projectDetails.tasks.filter(t => t.status === 'Done').length === 0 ? (
                              <Paper 
                                elevation={0} 
                                sx={{ 
                                  p: 2, 
                                  textAlign: 'center', 
                                  bgcolor: 'grey.50',
                                  border: '2px dashed',
                                  borderColor: 'grey.300',
                                  borderRadius: 1.5
                                }}
                              >
                                <Typography variant="caption" color="text.secondary">
                                  No tasks
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

                {/* Tab 3: Team Chat */}
                {tabValue === 3 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Team Chat
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Real-time messaging with your project team
                    </Typography>
                    <ProjectChat 
                      projectId={selectedProject?._id} 
                      projectName={selectedProject?.name}
                      currentUser={user}
                    />
                  </Box>
                )}

                {/* Tab 4: Chat Analysis */}
                {tabValue === 4 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Group Chat Interaction Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Monitor team communication patterns and identify engagement trends
                    </Typography>
                    <ChatAnalysisReport projectId={selectedProject?._id} />
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

export default MentorDashboard;
