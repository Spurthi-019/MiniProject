import React, { useEffect, useState } from 'react';
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
  Drawer
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import TeamMemberDashboard from './TeamMemberDashboard';
import MentorDashboard from './MentorDashboard';
import AdminDashboard from './AdminDashboard';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'projects', label: 'Projects', icon: <FolderIcon /> },
    { id: 'tasks', label: 'Tasks', icon: <AssignmentIcon /> },
    { id: 'team', label: 'Team', icon: <PeopleIcon /> },
    { id: 'chat', label: 'Chat', icon: <ChatIcon /> },
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
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
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
    if (activeSection !== 'dashboard') {
      return (
        <Box sx={{ p: 4 }}>
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', minHeight: 400 }}>
            <Typography variant="h4" gutterBottom color="primary">
              {menuItems.find(item => item.id === activeSection)?.label}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              This section is under development. 
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Coming soon with enhanced features!
            </Typography>
          </Paper>
        </Box>
      );
    }

    // Render role-specific dashboard
    switch (user.role) {
      case 'Admin/Team Lead':
        return <AdminDashboard user={user} />;
      case 'Mentor':
        return <MentorDashboard user={user} />;
      case 'Team Members':
        return <TeamMemberDashboard user={user} />;
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
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
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
        {renderMainContent()}
      </Box>
    </Box>
  );
}

export default Dashboard;
