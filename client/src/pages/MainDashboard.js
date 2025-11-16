import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Avatar,
  IconButton,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  Folder as FolderIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Chat as ChatIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import ProjectChatWindow from '../components/ProjectChatWindow';

const MainDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({}); // Track unread messages per project
  const [socket, setSocket] = useState(null);
  const [chatMetrics, setChatMetrics] = useState({}); // Track chat metrics per project
  const [metricsLoading, setMetricsLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchProjects();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        console.error('No token or user data found, redirecting to login');
        navigate('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      console.log('[MainDashboard] User data loaded:', parsedUser);
      setUser(parsedUser);
    } catch (err) {
      console.error('Error loading user data:', err);
      navigate('/login');
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Fetching projects with token:', token.substring(0, 20) + '...');
      
      const response = await axios.get('http://localhost:5000/api/projects/user-projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Projects response:', response.data);
      setProjects(response.data.projects || []);
      setError('');
      
      // Fetch chat metrics for all projects
      if (response.data.projects && response.data.projects.length > 0) {
        fetchAllChatMetrics(response.data.projects);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to load projects. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch chat metrics for all projects
  const fetchAllChatMetrics = async (projectsList) => {
    try {
      setMetricsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || !projectsList || projectsList.length === 0) return;

      const metricsPromises = projectsList.map(project => 
        axios.get(`http://localhost:5000/api/projects/${project._id}/chat-metrics`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => ({
          projectId: project._id,
          data: response.data
        }))
        .catch(error => {
          console.error(`Error fetching metrics for project ${project._id}:`, error);
          return {
            projectId: project._id,
            data: null
          };
        })
      );

      const results = await Promise.all(metricsPromises);
      
      // Store metrics by project ID
      const metricsMap = {};
      results.forEach(result => {
        if (result.data) {
          metricsMap[result.projectId] = result.data;
          console.log(`[MainDashboard] Metrics for project ${result.projectId}:`, {
            totalMessages: result.data.totalMessages,
            topContributors: result.data.topContributors
          });
        }
      });
      
      setChatMetrics(metricsMap);
      console.log('[MainDashboard] Chat metrics loaded:', metricsMap);
    } catch (err) {
      console.error('Error fetching chat metrics:', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  // Calculate points for a user based on their contribution
  const calculatePoints = (messageCount) => {
    // Point system: 1 point per message, with bonus for high activity
    let points = messageCount;
    
    if (messageCount >= 50) {
      points += 20; // Bonus for very active
    } else if (messageCount >= 20) {
      points += 10; // Bonus for active
    } else if (messageCount >= 10) {
      points += 5; // Bonus for moderately active
    }
    
    return points;
  };

  // Get the most active person overall across all projects
  const getMostActivePerson = () => {
    const userPoints = {};
    
    // Aggregate points from all projects
    Object.values(chatMetrics).forEach(metric => {
      if (metric.metrics && metric.metrics.allMemberActivity) {
        metric.metrics.allMemberActivity.forEach(member => {
          const userId = member.userId.toString();
          const points = calculatePoints(member.messageCount);
          
          if (!userPoints[userId]) {
            userPoints[userId] = {
              username: member.username,
              totalMessages: 0,
              totalPoints: 0,
              projectCount: 0
            };
          }
          
          userPoints[userId].totalMessages += member.messageCount;
          userPoints[userId].totalPoints += points;
          userPoints[userId].projectCount += 1;
        });
      }
    });

    // Find the user with the highest points
    let mostActive = null;
    let maxPoints = 0;
    
    Object.entries(userPoints).forEach(([userId, data]) => {
      if (data.totalPoints > maxPoints) {
        maxPoints = data.totalPoints;
        mostActive = { userId, ...data };
      }
    });
    
    return mostActive;
  };

  // Setup Socket.IO for real-time chat notifications
  useEffect(() => {
    if (!user) return;

    console.log('[MainDashboard] Setting up Socket.IO connection for user:', user.id);
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    newSocket.on('connect', () => {
      console.log('[MainDashboard] Connected to Socket.IO');
      // Join user's personal room for notifications
      newSocket.emit('join-user-room', { userId: user.id });
    });

    // Listen for chat notifications
    newSocket.on('new-chat-notification', (data) => {
      console.log('[MainDashboard] New chat notification:', data);
      const { projectId, projectName, sender } = data;
      
      // Increment unread count for this project
      setUnreadCounts(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || 0) + 1
      }));

      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`New message in ${projectName}`, {
          body: `${sender.username}: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`,
          icon: '/favicon.ico'
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('[MainDashboard] Disconnected from Socket.IO');
    });

    setSocket(newSocket);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      console.log('[MainDashboard] Cleaning up Socket.IO connection');
      newSocket.disconnect();
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleBackToPersonalDashboard = () => {
    // Force a full page reload to the dashboard
    window.location.href = '/dashboard';
  };

  const getUserRole = (project) => {
    if (!user) return null;
    
    // Use the userRoleInProject field from the API response if available
    if (project.userRoleInProject) {
      const roleMap = {
        'Team Lead': { role: 'Team Lead', color: 'primary', icon: <StarIcon /> },
        'Member': { role: 'Member', color: 'success', icon: <PersonIcon /> },
        'Mentor': { role: 'Mentor', color: 'secondary', icon: <SchoolIcon /> }
      };
      return roleMap[project.userRoleInProject] || null;
    }
    
    // Fallback to checking manually if userRoleInProject is not available
    if (project.teamLead?._id === user._id || project.teamLead === user._id) {
      return { role: 'Team Lead', color: 'primary', icon: <StarIcon /> };
    }
    
    const isMentor = project.mentors?.some(
      (mentor) => (mentor._id || mentor) === user._id
    );
    if (isMentor) {
      return { role: 'Mentor', color: 'secondary', icon: <SchoolIcon /> };
    }
    
    const isMember = project.members?.some(
      (member) => (member._id || member) === user._id
    );
    if (isMember) {
      return { role: 'Member', color: 'success', icon: <PersonIcon /> };
    }
    
    return null;
  };

  const handleProjectClick = (project) => {
    const roleInfo = getUserRole(project);
    if (!roleInfo) return;

    // Navigate based on user's role in the project
    if (roleInfo.role === 'Team Lead') {
      navigate('/admin-dashboard');
    } else if (roleInfo.role === 'Mentor') {
      navigate('/mentor-dashboard');
    } else {
      navigate('/team-member-dashboard');
    }
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedProject(null);
  };

  const handleOpenChat = (project) => {
    setSelectedProject(project);
    setChatDialogOpen(true);
    // Clear unread count for this project
    setUnreadCounts(prev => ({
      ...prev,
      [project._id]: 0
    }));
  };

  const handleCloseChat = () => {
    setChatDialogOpen(false);
    setSelectedProject(null);
  };

  const drawerContent = (
    <Box sx={{ width: 250, mt: 8 }}>
      <List>
        <ListItem button onClick={() => { navigate('/main'); setDrawerOpen(false); }}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="All Projects" />
        </ListItem>
        <ListItem button onClick={() => { handleBackToPersonalDashboard(); setDrawerOpen(false); }}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="My Dashboard" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={() => { handleLogout(); setDrawerOpen(false); }}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Project Management System
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1">{user.username}</Typography>
              <Chip label={user.role} color="secondary" size="small" />
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                {user.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: '100%',
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                    mb: 1,
                  }}
                >
                  My Projects
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Projects you're involved in as a member, mentor, or lead
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<PersonIcon />}
                onClick={handleBackToPersonalDashboard}
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 14px rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Back to My Dashboard
              </Button>
            </Box>
          </Box>

          {/* Most Active Person Overall Banner */}
          {!loading && !metricsLoading && getMostActivePerson() && (
            <Card
              sx={{
                mb: 3,
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '2px solid rgba(218, 165, 32, 0.5)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'rgba(218, 165, 32, 0.3)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      border: '2px solid rgba(218, 165, 32, 0.6)',
                      boxShadow: '0 4px 12px rgba(218, 165, 32, 0.3)',
                    }}
                  >
                    🏆
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                      Most Active Person Overall
                      <Chip
                        label="CHAMPION"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(218, 165, 32, 0.4)',
                          color: '#FFC107',
                          border: '1px solid rgba(218, 165, 32, 0.6)',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                        }}
                      />
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#FFD54F' }}>
                      {getMostActivePerson().username}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}>
                          Total Messages
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                          {getMostActivePerson().totalMessages}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}>
                          Projects Active
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                          {getMostActivePerson().projectCount}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}>
                          Total Points
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FFCA28' }}>
                          {getMostActivePerson().totalPoints} ⭐
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      fontSize: '4rem',
                      opacity: 0.4,
                      transform: 'rotate(-15deg)',
                      color: '#FFB300',
                    }}
                  >
                    ⭐
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : (
            <>
              {/* Projects Grid */}
              {projects.length === 0 ? (
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    p: 4,
                    textAlign: 'center',
                  }}
                >
                  <FolderIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.5)', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    No Projects Found
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    You're not part of any projects yet. Join a project using a team code or create a new one.
                  </Typography>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {projects.map((project) => {
                    const roleInfo = getUserRole(project);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={project._id}>
                        <Card
                          sx={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 3,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-8px)',
                              boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
                            },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1 }}>
                            {/* Role Badge */}
                            {roleInfo && (
                              <Box sx={{ mb: 2 }}>
                                <Chip
                                  icon={roleInfo.icon}
                                  label={roleInfo.role}
                                  color={roleInfo.color}
                                  size="small"
                                  sx={{ fontWeight: 'bold' }}
                                />
                              </Box>
                            )}

                            {/* Project Name */}
                            <Typography
                              variant="h6"
                              gutterBottom
                              sx={{
                                color: 'white',
                                fontWeight: 'bold',
                                mb: 1,
                              }}
                            >
                              {project.name}
                            </Typography>

                            {/* Project Description */}
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                mb: 2,
                                minHeight: 40,
                              }}
                            >
                              {project.description || 'No description provided'}
                            </Typography>

                            {/* Project Stats */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                              <Chip
                                icon={<PeopleIcon />}
                                label={`${project.members?.length || 0} Members`}
                                size="small"
                                sx={{
                                  background: 'rgba(255, 255, 255, 0.2)',
                                  color: 'white',
                                }}
                              />
                              <Chip
                                icon={<SchoolIcon />}
                                label={`${project.mentors?.length || 0} Mentors`}
                                size="small"
                                sx={{
                                  background: 'rgba(255, 255, 255, 0.2)',
                                  color: 'white',
                                }}
                              />
                            </Box>

                            {/* Team Code */}
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                display: 'block',
                                mb: 1,
                              }}
                            >
                              Team Code: <strong>{project.teamCode}</strong>
                            </Typography>

                            {/* Team Lead */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                                  fontSize: '0.875rem',
                                }}
                              >
                                {project.teamLead?.username?.charAt(0).toUpperCase() || 'T'}
                              </Avatar>
                              <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', lineHeight: 1.2 }}>
                                  Team Lead
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, lineHeight: 1.2 }}>
                                  {project.teamLead?.username || 'Unknown'}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Top Contributor (Weekly) */}
                            {chatMetrics[project._id] && chatMetrics[project._id].topContributors && chatMetrics[project._id].topContributors.length > 0 ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, p: 1.5, bgcolor: 'rgba(218, 165, 32, 0.2)', borderRadius: 2, border: '1px solid rgba(218, 165, 32, 0.4)' }}>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: 'rgba(218, 165, 32, 0.4)',
                                    color: '#FFC107',
                                    fontSize: '0.875rem',
                                    fontWeight: 'bold',
                                    border: '1px solid rgba(218, 165, 32, 0.6)',
                                  }}
                                >
                                  {chatMetrics[project._id].topContributors[0].username?.charAt(0).toUpperCase() || '⭐'}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'flex', alignItems: 'center', gap: 0.5, lineHeight: 1.2 }}>
                                    ⭐ Top Contributor (7 Days)
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#FFD54F', fontWeight: 600, lineHeight: 1.2 }}>
                                    {chatMetrics[project._id].topContributors[0].username}
                                  </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', lineHeight: 1.2 }}>
                                    Messages
                                  </Typography>
                                  <Typography variant="h6" sx={{ color: '#FFCA28', fontWeight: 'bold', lineHeight: 1.2 }}>
                                    {chatMetrics[project._id].topContributors[0].messageCount}
                                  </Typography>
                                  <Chip
                                    label={`${calculatePoints(chatMetrics[project._id].topContributors[0].messageCount)} pts`}
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(218, 165, 32, 0.4)',
                                      color: '#FFC107',
                                      border: '1px solid rgba(218, 165, 32, 0.6)',
                                      fontWeight: 'bold',
                                      fontSize: '0.7rem',
                                      height: 18,
                                      mt: 0.5
                                    }}
                                  />
                                </Box>
                              </Box>
                            ) : metricsLoading ? (
                              <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, textAlign: 'center' }}>
                                <CircularProgress size={20} sx={{ color: 'white' }} />
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mt: 0.5 }}>
                                  Loading chat stats...
                                </Typography>
                              </Box>
                            ) : (
                              <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', textAlign: 'center' }}>
                                  💬 No chat activity yet
                                </Typography>
                              </Box>
                            )}
                          </CardContent>

                          <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<InfoIcon />}
                                onClick={() => handleViewDetails(project)}
                                sx={{
                                  background: 'rgba(255, 255, 255, 0.2)',
                                  backdropFilter: 'blur(10px)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.3)',
                                    transform: 'translateY(-2px)',
                                  },
                                }}
                              >
                                View Details
                              </Button>
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={
                                  <Badge badgeContent={unreadCounts[project._id] || 0} color="error">
                                    <ChatIcon />
                                  </Badge>
                                }
                                onClick={() => handleOpenChat(project)}
                                sx={{
                                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                                    transform: 'translateY(-2px)',
                                  },
                                }}
                              >
                                Project Chat
                              </Button>
                            </Box>
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </>
          )}
        </Container>
      </Box>

      {/* Project Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Project Details
          </Typography>
          <IconButton onClick={handleCloseDetails} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedProject && (
            <Box>
              {/* Project Name */}
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                {selectedProject.name}
              </Typography>

              {/* User's Role */}
              {getUserRole(selectedProject) && (
                <Box sx={{ mb: 3 }}>
                  <Chip
                    icon={getUserRole(selectedProject).icon}
                    label={`Your Role: ${getUserRole(selectedProject).role}`}
                    color={getUserRole(selectedProject).color}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              )}

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1 }}>
                  Description
                </Typography>
                <Typography variant="body1">
                  {selectedProject.description || 'No description provided'}
                </Typography>
              </Box>

              {/* Team Code */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1 }}>
                  Team Code
                </Typography>
                <Chip label={selectedProject.teamCode} color="primary" sx={{ fontWeight: 'bold', fontSize: '1rem' }} />
              </Box>

              {/* Team Lead */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1 }}>
                  Team Lead
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {selectedProject.teamLead?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedProject.teamLead?.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedProject.teamLead?.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Members */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1 }}>
                  Team Members ({selectedProject.members?.length || 0})
                </Typography>
                {selectedProject.members && selectedProject.members.length > 0 ? (
                  <Grid container spacing={2}>
                    {selectedProject.members.map((member) => (
                      <Grid item xs={12} sm={6} key={member._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'grey.100', borderRadius: 2 }}>
                          <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32, fontSize: '0.875rem' }}>
                            {member.username?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {member.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No team members yet
                  </Typography>
                )}
              </Box>

              {/* Mentors */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1 }}>
                  Mentors ({selectedProject.mentors?.length || 0})
                </Typography>
                {selectedProject.mentors && selectedProject.mentors.length > 0 ? (
                  <Grid container spacing={2}>
                    {selectedProject.mentors.map((mentor) => (
                      <Grid item xs={12} sm={6} key={mentor._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'grey.100', borderRadius: 2 }}>
                          <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: '0.875rem' }}>
                            {mentor.username?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {mentor.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {mentor.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No mentors assigned yet
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDetails} variant="outlined">
            Close
          </Button>
          <Button
            onClick={() => {
              handleCloseDetails();
              handleProjectClick(selectedProject);
            }}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            Go to Dashboard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Chat Dialog */}
      <Dialog
        open={chatDialogOpen}
        onClose={handleCloseChat}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            height: '85vh',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ChatIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {selectedProject?.name} - Team Chat
            </Typography>
          </Box>
          <IconButton onClick={handleCloseChat} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
          {selectedProject && user && (
            <ProjectChatWindow
              projectId={selectedProject._id}
              projectName={selectedProject.name}
              currentUser={user}
              height={0}
              showHeader={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MainDashboard;
