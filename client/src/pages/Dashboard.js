import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Avatar,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import TeamMemberDashboard from './TeamMemberDashboard';
import MentorDashboard from './MentorDashboard';
import AdminDashboard from './AdminDashboard';
import axios from 'axios';
import io from 'socket.io-client';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [invitationsDialogOpen, setInvitationsDialogOpen] = useState(false);
  
  // Refs for scrolling to sections
  const dashboardRef = useRef(null);
  const projectsRef = useRef(null);
  const tasksRef = useRef(null);
  const teamRef = useRef(null);
  const chatRef = useRef(null);

  const drawerWidth = 280;

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      // Not authenticated, redirect to login
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Fetch pending invitations
  useEffect(() => {
    if (!user) return;

    const fetchInvitations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/projects/invitations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('📥 Fetched invitations:', response.data);
        setPendingInvitations(response.data.invitations || []);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      }
    };

    fetchInvitations();

    // Setup Socket.IO for real-time invitation notifications
    const socket = io('http://localhost:5000');
    
    socket.emit('join-user-room', { userId: user.id });
    
    socket.on('new-invitation', (data) => {
      console.log('📬 New invitation received in Dashboard:', data);
      if (data.invitation) {
        setPendingInvitations(prev => [data.invitation, ...prev]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleAcceptInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/projects/invitations/${invitationId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove from pending invitations
      setPendingInvitations(prev => prev.filter(inv => inv._id !== invitationId));
      
      // Refresh the page to show new project
      window.location.reload();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert(error.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/projects/invitations/${invitationId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove from pending invitations
      setPendingInvitations(prev => prev.filter(inv => inv._id !== invitationId));
    } catch (error) {
      console.error('Error declining invitation:', error);
      alert(error.response?.data?.message || 'Failed to decline invitation');
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    setMobileOpen(false); // Close mobile drawer after click
    
    // Map sections to their refs
    const sectionRefs = {
      dashboard: dashboardRef,
      projects: projectsRef,
      tasks: tasksRef,
      team: teamRef,
      chat: projectsRef // Chat navigates to projects section
    };
    
    const targetRef = sectionRefs[sectionId];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, description: 'Overview & Tasks' },
    { id: 'projects', label: 'Projects', icon: <FolderIcon />, description: 'Manage Projects' },
    { id: 'tasks', label: 'Tasks', icon: <AssignmentIcon />, description: 'Task Management' },
    { id: 'team', label: 'Team', icon: <PeopleIcon />, description: 'Team Members' },
    { id: 'chat', label: 'Chat', icon: <ChatIcon />, description: 'Team Communication' },
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin/Team Lead':
        return 'primary';
      case 'Mentor':
        return 'secondary';
      case 'Team Members':
        return 'success';
      default:
        return 'default';
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* User Profile Section */}
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            margin: '0 auto 16px',
            bgcolor: 'white',
            color: 'primary.main',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}
        >
          {user?.username?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h6" gutterBottom>
          {user?.username}
        </Typography>
        <Chip 
          label={user?.role} 
          size="small" 
          sx={{ 
            bgcolor: 'white', 
            color: 'primary.main',
            fontWeight: 600
          }} 
        />
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, pt: 2 }}>
        {/* Invitations Button */}
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => setInvitationsDialogOpen(true)}
            sx={{
              mx: 1,
              borderRadius: 2,
              bgcolor: pendingInvitations.length > 0 ? 'warning.light' : 'transparent',
              '&:hover': {
                bgcolor: pendingInvitations.length > 0 ? 'warning.main' : 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Badge badgeContent={pendingInvitations.length} color="error">
                <NotificationsIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText 
              primary="Invitations"
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1 }} />

        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeSection === item.id}
              onClick={() => handleSectionClick(item.id)}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Logout Button */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              mx: 1,
              mb: 1,
              borderRadius: 2,
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.dark',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout"
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Render main content based on active section
  const renderMainContent = () => {
    const sectionRefs = {
      dashboardRef,
      projectsRef,
      tasksRef,
      teamRef,
      chatRef
    };

    // Render role-specific dashboard for 'dashboard' section
    if (activeSection === 'dashboard') {
      switch (user.role) {
        case 'Admin/Team Lead':
          return <AdminDashboard user={user} sectionRefs={sectionRefs} />;
        case 'Mentor':
          return <MentorDashboard user={user} sectionRefs={sectionRefs} />;
        case 'Team Members':
          return <TeamMemberDashboard user={user} sectionRefs={sectionRefs} />;
        default:
          return (
            <Box sx={{ p: 4 }}>
              <Paper elevation={2} sx={{ p: 4 }}>
                <Typography variant="h5" color="error">
                  Unknown role: {user.role}
                </Typography>
              </Paper>
            </Box>
          );
      }
    }

    // For other sections, render the appropriate role-specific dashboard
    // since all features are integrated into the role-specific dashboards
    switch (user.role) {
      case 'Admin/Team Lead':
        return <AdminDashboard user={user} sectionRefs={sectionRefs} />;
      case 'Mentor':
        return <MentorDashboard user={user} sectionRefs={sectionRefs} />;
      case 'Team Members':
        return <TeamMemberDashboard user={user} sectionRefs={sectionRefs} />;
      default:
        return (
          <Box sx={{ p: 4 }}>
            <Paper elevation={2} sx={{ p: 4 }}>
              <Typography variant="h5" color="error">
                Unknown role: {user.role}
              </Typography>
            </Paper>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile AppBar */}
      <AppBar
        position="fixed"
        sx={{
          display: { sm: 'none' },
          width: '100%',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          {/* Notification Icon */}
          <IconButton 
            color="inherit" 
            onClick={() => setInvitationsDialogOpen(true)}
          >
            <Badge badgeContent={pendingInvitations.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar - Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            backgroundImage: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Sidebar - Desktop Permanent */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundImage: 'none',
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          mt: { xs: '64px', sm: 0 }, // Account for mobile AppBar
        }}
      >
        {/* Active Section Indicator (only show if not dashboard) */}
        {activeSection !== 'dashboard' && (
          <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 1, px: 3 }}>
            <Typography variant="body2">
              📍 Viewing: <strong>{menuItems.find(item => item.id === activeSection)?.label}</strong> - 
              All features are integrated below. Scroll to find {menuItems.find(item => item.id === activeSection)?.description.toLowerCase()}.
            </Typography>
          </Box>
        )}
        {renderMainContent()}
      </Box>

      {/* Invitations Dialog */}
      <Dialog 
        open={invitationsDialogOpen} 
        onClose={() => setInvitationsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 700, fontSize: '1.5rem' }}>
          📬 Pending Invitations ({pendingInvitations.length})
        </DialogTitle>
        <DialogContent>
          {pendingInvitations.length === 0 ? (
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 2
              }}
            >
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                You have no pending invitations
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {pendingInvitations.map((invitation) => (
                <Paper
                  key={invitation._id}
                  sx={{
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmailIcon sx={{ mr: 1, color: '#4dabf7' }} />
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                          {invitation.project?.name || 'Unknown Project'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`Role: ${invitation.role}`}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                        <Chip 
                          label={`Code: ${invitation.project?.teamCode || 'N/A'}`}
                          size="small"
                          sx={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>

                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
                        {invitation.project?.description || 'No description available'}
                      </Typography>

                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Invited by: <strong>{invitation.invitedBy?.username || 'Unknown'}</strong> ({invitation.invitedBy?.email || 'N/A'})
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 120 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAcceptInvitation(invitation._id)}
                        sx={{
                          background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
                          color: 'white',
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #37b24d 0%, #51cf66 100%)',
                            transform: 'scale(1.05)',
                          }
                        }}
                      >
                        ✓ Accept
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleDeclineInvitation(invitation._id)}
                        sx={{
                          borderColor: 'rgba(255, 107, 107, 0.8)',
                          color: '#ff6b6b',
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: '#ff6b6b',
                            background: 'rgba(255, 107, 107, 0.1)',
                          }
                        }}
                      >
                        ✕ Decline
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setInvitationsDialogOpen(false)}
            sx={{
              color: 'white',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard;
