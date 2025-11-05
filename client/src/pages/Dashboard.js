import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import TeamMemberDashboard from './TeamMemberDashboard';
import MentorDashboard from './MentorDashboard';
import AdminDashboard from './AdminDashboard';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Render dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'Admin/Team Lead':
        return <AdminDashboard user={user} />;
      case 'Mentor':
        return <MentorDashboard user={user} />;
      case 'Team Members':
        return <TeamMemberDashboard user={user} />;
      default:
        return (
          <Container>
            <Box sx={{ marginTop: 8 }}>
              <Typography variant="h5" color="error">
                Unknown role: {user.role}
              </Typography>
            </Box>
          </Container>
        );
    }
  };

  return renderDashboard();
}

export default Dashboard;
