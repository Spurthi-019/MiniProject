import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import RecommendationWidget from '../components/RecommendationWidget';

/**
 * Demo page for testing the RecommendationWidget component
 * This is a standalone page for development/testing purposes
 */
const RecommendationWidgetDemo = () => {
  const [projectId, setProjectId] = useState('690c085b7b553f23520556c4'); // Default test project ID
  const [limit, setLimit] = useState(5);
  const [displayProjectId, setDisplayProjectId] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Auto-login on component mount
  useEffect(() => {
    const autoLogin = async () => {
      try {
        // Check if already logged in
        const existingToken = localStorage.getItem('token');
        if (existingToken) {
          console.log('Already authenticated');
          setIsAuthenticating(false);
          // Don't auto-load on mount, wait for user to click button
          return;
        }

        // Auto-login with test credentials
        console.log('Auto-logging in with test credentials...');
        const response = await axios.post('/api/auth/login', {
          login: 'alice@example.com',
          password: 'pass123'
        });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          console.log('Auto-login successful');
          // Don't auto-load, wait for user to click button
        }
      } catch (error) {
        console.error('Auto-login failed:', error);
        setAuthError('Failed to authenticate. Please login manually at /login');
      } finally {
        setIsAuthenticating(false);
      }
    };

    autoLogin();
  }, [projectId]);

  const handleLoadRecommendations = async () => {
    try {
      // Verify token exists
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthError('No authentication token found. Refreshing page...');
        window.location.reload();
        return;
      }

      console.log('Loading recommendations with token:', token.substring(0, 20) + '...');
      
      // Small delay to ensure token is set
      setTimeout(() => {
        setDisplayProjectId(projectId);
      }, 100);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setAuthError('Failed to load recommendations: ' + error.message);
    }
  };

  if (isAuthenticating) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }} color="text.secondary">
              Authenticating...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  if (authError) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 3 }}>
            {authError}
          </Alert>
          <Button variant="contained" href="/login">
            Go to Login
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      py: 4 
    }}>
      <Container maxWidth="md"  sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            AI Recommendations Widget - Demo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Test the AI-powered project recommendations widget
          </Typography>
          <Alert severity="success" sx={{ mt: 2 }}>
            ✅ Auto-logged in as: <strong>alice@example.com</strong>
          </Alert>
          <Alert severity="info" sx={{ mt: 1 }}>
            Token in localStorage: <strong>{localStorage.getItem('token') ? 'Yes ✓' : 'No ✗'}</strong>
          </Alert>
        </Box>

      {/* Controls */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Widget Configuration
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            fullWidth
            helperText="Enter the MongoDB ObjectId of the project"
          />
          <TextField
            label="Task Limit"
            type="number"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value) || 5)}
            inputProps={{ min: 1, max: 20 }}
            sx={{ width: { xs: '100%', sm: '200px' } }}
            helperText="Max tasks to show"
          />
        </Stack>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLoadRecommendations}
          fullWidth
          sx={{ mb: 1 }}
        >
          Load Recommendations
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          fullWidth
        >
          Clear Cache & Reload Page
        </Button>
      </Paper>

      {/* Recommendation Widget */}
      {displayProjectId && (
        <RecommendationWidget projectId={displayProjectId} limit={limit} />
      )}

      {/* Usage Instructions */}
      <Paper elevation={1} sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Integration Guide
        </Typography>
        <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`// Import the component
import RecommendationWidget from './components/RecommendationWidget';

// Use in your dashboard
<RecommendationWidget 
  projectId={selectedProject._id} 
  limit={5} 
/>

// Props:
// - projectId (required): MongoDB ObjectId of the project
// - limit (optional): Number of suggested tasks to display (default: 5)
`}
        </Typography>
      </Paper>
      </Container>
    </Box>
  );
};

export default RecommendationWidgetDemo;
