import React from 'react';
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
  CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

function AdminDashboard({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#1565c0' }}>
        <Toolbar>
          <AdminPanelSettingsIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin / Team Lead Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user.username}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
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

        <Grid container spacing={3}>
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
                <Button variant="contained" sx={{ mt: 2 }}>
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
                <Button variant="outlined" sx={{ mt: 2 }}>
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
                <Button variant="outlined" sx={{ mt: 2 }}>
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
                <Button variant="outlined" sx={{ mt: 2 }}>
                  View Team
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default AdminDashboard;
