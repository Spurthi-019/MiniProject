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

  useEffect(() => {
    fetchUserData();
    fetchProjects();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
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
                                startIcon={<ChatIcon />}
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
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            height: '80vh',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ChatIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {selectedProject?.name} - Project Chat
            </Typography>
          </Box>
          <IconButton onClick={handleCloseChat} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {selectedProject && (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <ChatIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Project Chat Feature
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Real-time chat for {selectedProject.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chat functionality will be integrated here. Navigate to the project dashboard to access the full chat feature.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseChat} variant="outlined">
            Close
          </Button>
          <Button
            onClick={() => {
              handleCloseChat();
              handleProjectClick(selectedProject);
            }}
            variant="contained"
            startIcon={<DashboardIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            Go to Project Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MainDashboard;
