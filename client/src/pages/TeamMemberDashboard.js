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
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PendingIcon from '@mui/icons-material/Pending';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EmailIcon from '@mui/icons-material/Email';
import axios from 'axios';
import BurndownChart from '../components/BurndownChart';
import RecommendationWidget from '../components/RecommendationWidget';
import ChatAnalysisReport from '../components/ChatAnalysisReport';
import ProjectChatWindow from '../components/ProjectChatWindow';
import io from 'socket.io-client';
import { Avatar, Badge } from '@mui/material';

function TeamMemberDashboard({ user, sectionRefs }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [burndownDialogOpen, setBurndownDialogOpen] = useState(false);
  const [chatAnalysisDialogOpen, setChatAnalysisDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineCounts, setOnlineCounts] = useState({});
  
  // Join team states
  const [joinTeamDialogOpen, setJoinTeamDialogOpen] = useState(false);
  const [teamCode, setTeamCode] = useState('');
  const [pendingInvitations, setPendingInvitations] = useState([]);

  useEffect(() => {
    fetchData();
    fetchInvitations();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [tasksResponse, projectsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/tasks/my-tasks', config),
        axios.get('http://localhost:5000/api/projects/my-projects', config)
      ]);

      setTasks(tasksResponse.data.tasks || []);
      const projs = projectsResponse.data.projects || [];
      setProjects(projs);

      // Initialize unread/online counts
      const initialUnread = {};
      const initialOnline = {};
      projs.forEach(p => {
        initialUnread[p._id] = 0;
        initialOnline[p._id] = 1; // assume self online until presence known
      });
      setUnreadCounts(initialUnread);
      setOnlineCounts(initialOnline);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch data');
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
      // Don't show error for invitations fetch failure
    }
  };

  // Setup Socket.IO for user notifications (invitations)
  useEffect(() => {
    const notificationSocket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });

    notificationSocket.on('connect', () => {
      // Join user's personal notification room
      notificationSocket.emit('join-user-room', user.id);
      console.log('🔔 Joined notification room for user:', user.id);
    });

    // Listen for new invitations
    notificationSocket.on('new-invitation', (data) => {
      console.log('📬 New invitation received:', data);
      
      // Add the new invitation to the list
      setPendingInvitations(prev => [data.invitation, ...prev]);
      
      // Show success message
      setSuccess(`You've received a new invitation to join "${data.invitation.project.name}"!`);
      setTimeout(() => setSuccess(''), 8000);
    });

    // Listen for new chat messages
    notificationSocket.on('new-chat-notification', (data) => {
      console.log('💬 New chat notification:', data);
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

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      notificationSocket.disconnect();
    };
  }, [user.id]);

  // Setup Socket.IO connection once projects are loaded
  useEffect(() => {
    if (!projects || projects.length === 0) return;

    const newSocket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      projects.forEach(p => newSocket.emit('join-project', p._id));
    });

    newSocket.on('new-message', (message) => {
      try {
        const projectId = message.project || (message.chatMessage && message.chatMessage.project);
        const senderId = message.sender?._id || message.chatMessage?.sender?._id;
        if (projectId && senderId && senderId !== user.id) {
          setUnreadCounts(prev => ({ ...prev, [projectId]: (prev[projectId] || 0) + 1 }));
        }
      } catch (e) {
        console.error('Error handling new-message in dashboard socket:', e);
      }
    });

    // Listen for online-count updates for project rooms
    newSocket.on('online-count', (payload) => {
      try {
        const { projectId, count } = payload || {};
        if (projectId) {
          setOnlineCounts(prev => ({ ...prev, [projectId]: count }));
        }
      } catch (e) {
        console.error('Error handling online-count:', e);
      }
    });

    newSocket.on('user-joined', (data) => {
      console.log('user-joined', data);
    });

    newSocket.on('user-left', (data) => {
      console.log('user-left', data);
    });

    return () => {
      try {
        projects.forEach(p => newSocket.emit('leave-project', p._id));
        newSocket.disconnect();
      } catch (e) {}
    };
  }, [projects]);

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
      
      // Refresh data
      fetchData();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error joining team:', err);
      setError(err.response?.data?.message || 'Failed to join team');
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
      
      // Refresh invitations and projects
      fetchInvitations();
      fetchData();
      
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
      
      // Refresh invitations
      fetchInvitations();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error declining invitation:', err);
      setError(err.response?.data?.message || 'Failed to decline invitation');
    }
  };

  const handleViewBurndown = (project) => {
    setSelectedProject(project);
    setBurndownDialogOpen(true);
  };

  const handleCloseBurndownDialog = () => {
    setBurndownDialogOpen(false);
    setSelectedProject(null);
  };

  const handleViewChatAnalysis = (project) => {
    setSelectedProject(project);
    setChatAnalysisDialogOpen(true);
  };

  const handleCloseChatAnalysisDialog = () => {
    setChatAnalysisDialogOpen(false);
    setSelectedProject(null);
  };

  const handleViewChat = (project) => {
    setSelectedProject(project);
    setChatDialogOpen(true);
    // reset unread count for that project
    setUnreadCounts(prev => ({ ...prev, [project._id]: 0 }));
  };

  const handleCloseChatDialog = () => {
    setChatDialogOpen(false);
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
              <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>Project:</Box>
              {task.project?.name || 'N/A'}
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
        <CardActions sx={{ pt: 0, pb: 1.5 }}>
          <FormControl size="small" fullWidth sx={{ px: 1 }}>
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
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 103, 103, 0.3), transparent 50%)',
        pointerEvents: 'none'
      }
    }}>
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: 3,
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Dashboard/Welcome Section - Glassmorphism */}
        <div ref={sectionRefs?.dashboardRef}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.15)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.45)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight="700" sx={{ color: 'white', mb: 1, letterSpacing: '-0.02em' }}>
                  Welcome back, {user.username}! 👋
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Chip 
                    label={user.role}
                    size="small"
                    sx={{ 
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      fontWeight: 600,
                      border: '1px solid rgba(255,255,255,0.3)',
                      height: 24,
                      fontSize: '0.75rem'
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: '24px', fontSize: '0.875rem' }}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                {pendingInvitations.length > 0 && (
                  <Badge badgeContent={pendingInvitations.length} color="error">
                    <Chip
                      icon={<EmailIcon sx={{ color: 'white !important' }} />}
                      label={`${pendingInvitations.length} Invitation${pendingInvitations.length > 1 ? 's' : ''}`}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      sx={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 12px rgba(245, 87, 108, 0.4)'
                        }
                      }}
                    />
                  </Badge>
                )}
                <Button
                  variant="contained"
                  startIcon={<GroupAddIcon />}
                  onClick={handleOpenJoinTeamDialog}
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
                    }
                  }}
                >
                  Join Team
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate('/main')}
                  sx={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(240, 147, 251, 0.4)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(240, 147, 251, 0.6)'
                    }
                  }}
                >
                  Go to Main Dashboard
                </Button>
              </Box>
            </Box>
          </Paper>
        </div>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              background: 'rgba(244, 67, 54, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: 2,
              color: 'white',
              '& .MuiAlert-icon': { color: '#ff6b6b' }
            }} 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2, 
              whiteSpace: 'pre-line',
              background: 'rgba(76, 175, 80, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              borderRadius: 2,
              color: 'white',
              '& .MuiAlert-icon': { color: '#51cf66' }
            }} 
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Pending Invitations Section */}
        {!loading && pendingInvitations.length > 0 && (
          <Alert 
            severity="info" 
            icon={<EmailIcon />}
            sx={{ 
              mb: 3,
              background: 'rgba(33, 150, 243, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              borderRadius: 2,
              color: 'white',
              '& .MuiAlert-icon': { color: '#4dabf7' }
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ color: 'white' }}>
                📬 You have {pendingInvitations.length} pending invitation{pendingInvitations.length > 1 ? 's' : ''}
              </Typography>
              {pendingInvitations.map((invitation) => (
                <Paper 
                  key={invitation._id} 
                  sx={{ 
                    p: 2.5, 
                    mb: 1.5,
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(31, 38, 135, 0.4)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="600" sx={{ color: 'white', mb: 1 }}>
                        {invitation.project.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`Role: ${invitation.role}`} 
                          size="small" 
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                        <Chip 
                          label={`Code: ${invitation.project.teamCode}`} 
                          size="small" 
                          sx={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1.5, color: 'rgba(255, 255, 255, 0.8)' }}>
                        {invitation.project.description || 'No description'}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.6)' }}>
                        Invited by: {invitation.invitedBy.username} ({invitation.invitedBy.email})
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAcceptInvitation(invitation._id)}
                        sx={{
                          background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
                          color: 'white',
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2.5,
                          py: 0.75,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #37b24d 0%, #51cf66 100%)',
                            transform: 'scale(1.05)',
                            boxShadow: '0 4px 12px rgba(55, 178, 77, 0.4)'
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
                          borderColor: 'rgba(244, 67, 54, 0.5)',
                          color: '#ff6b6b',
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2.5,
                          py: 0.75,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#ff6b6b',
                            background: 'rgba(244, 67, 54, 0.1)',
                            transform: 'scale(1.05)'
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
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tasks Section - Primary Focus */}
            <div ref={sectionRefs?.tasksRef}>
              <Paper 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AssignmentIcon sx={{ mr: 1.5, fontSize: 32, color: 'white' }} />
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    My Tasks
                  </Typography>
                  <Chip 
                    label={tasks.length} 
                    sx={{ 
                      ml: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }} 
                  />
                </Box>

              <Grid container spacing={2}>
                {/* To Do Column */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      background: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
                      color: 'white',
                      borderRadius: 2,
                      mb: 1.5,
                      boxShadow: '0 4px 16px rgba(251, 140, 0, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 6px 24px rgba(251, 140, 0, 0.4)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PendingIcon sx={{ mr: 1, fontSize: 28 }} />
                        <Typography variant="h6" fontWeight="bold">To Do</Typography>
                      </Box>
                      <Chip 
                        label={todoTasks.length} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.95)', 
                          color: '#fb8c00',
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }} 
                      />
                    </Box>
                  </Paper>
                  <Box sx={{ mt: 2, minHeight: 400 }}>
                    {todoTasks.length === 0 ? (
                      <Paper 
                        sx={{ 
                          p: 3, 
                          textAlign: 'center', 
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                          border: '2px dashed rgba(255, 255, 255, 0.2)',
                          borderRadius: 2,
                          color: 'rgba(255, 255, 255, 0.6)'
                        }}
                      >
                        <Typography variant="body2">
                          No tasks in To Do
                        </Typography>
                      </Paper>
                    ) : (
                      todoTasks.map(task => <TaskCard key={task._id} task={task} />)
                    )}
                  </Box>
                </Grid>

                {/* In Progress Column */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                      color: 'white',
                      borderRadius: 2,
                      mb: 1.5,
                      boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 6px 24px rgba(25, 118, 210, 0.4)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PlayArrowIcon sx={{ mr: 1, fontSize: 28 }} />
                        <Typography variant="h6" fontWeight="bold">In Progress</Typography>
                      </Box>
                      <Chip 
                        label={inProgressTasks.length} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.95)', 
                          color: '#1976d2',
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }} 
                      />
                    </Box>
                  </Paper>
                  <Box sx={{ mt: 2, minHeight: 400 }}>
                    {inProgressTasks.length === 0 ? (
                      <Paper 
                        sx={{ 
                          p: 3, 
                          textAlign: 'center', 
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                          border: '2px dashed rgba(255, 255, 255, 0.2)',
                          borderRadius: 2,
                          color: 'rgba(255, 255, 255, 0.6)'
                        }}
                      >
                        <Typography variant="body2">
                          No tasks in progress
                        </Typography>
                      </Paper>
                    ) : (
                      inProgressTasks.map(task => <TaskCard key={task._id} task={task} />)
                    )}
                  </Box>
                </Grid>

                {/* Done Column */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                      color: 'white',
                      borderRadius: 2,
                      mb: 1.5,
                      boxShadow: '0 4px 16px rgba(67, 160, 71, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 6px 24px rgba(67, 160, 71, 0.4)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircleIcon sx={{ mr: 1, fontSize: 28 }} />
                        <Typography variant="h6" fontWeight="bold">Done</Typography>
                      </Box>
                      <Chip 
                        label={doneTasks.length} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.95)', 
                          color: '#43a047',
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }} 
                      />
                    </Box>
                  </Paper>
                  <Box sx={{ mt: 2, minHeight: 400 }}>
                    {doneTasks.length === 0 ? (
                      <Paper 
                        sx={{ 
                          p: 3, 
                          textAlign: 'center', 
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                          border: '2px dashed rgba(255, 255, 255, 0.2)',
                          borderRadius: 2,
                          color: 'rgba(255, 255, 255, 0.6)'
                        }}
                      >
                        <Typography variant="body2">
                          No completed tasks
                        </Typography>
                      </Paper>
                    ) : (
                      doneTasks.map(task => <TaskCard key={task._id} task={task} />)
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            </div>

            {/* AI Recommendations Section - Proactive Guidance */}
            {projects.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUpIcon color="primary" />
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
            <div ref={sectionRefs?.teamRef}>
              <Paper elevation={2} sx={{ p: 2.5, mt: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ mr: 1, fontSize: 30 }} color="primary" />
                  <Typography variant="h5">Team Members</Typography>
                  <Chip label="By Project" color="primary" size="small" sx={{ ml: 2 }} />
                </Box>

                {projects.length === 0 ? (
                  <Alert severity="info">
                    Join a project to see your teammates!
                  </Alert>
                ) : (
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
                                color="secondary"
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
                              <Chip 
                                label={`${onlineCounts[project._id] || 0} Online`} 
                                size="small" 
                                color="primary"
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </div>

            {/* Projects Section */}
            <div ref={sectionRefs?.projectsRef}>
              <Paper elevation={2} sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                      <ListItem sx={{ alignItems: 'center' }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box>
                                <Typography variant="h6">{project.name}</Typography>
                                <Chip label={`Code: ${project.teamCode}`} size="small" sx={{ ml: 1 }} />
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {(project.members || []).slice(0,4).map(m => (
                                  <Avatar key={m._id} sx={{ width: 32, height: 32, fontSize: 12 }}>{m.username?.charAt(0).toUpperCase()}</Avatar>
                                ))}
                                {((project.members || []).length - 4) > 0 && (
                                  <Typography variant="caption">+{(project.members || []).length - 4}</Typography>
                                )}
                                <Chip label={`${onlineCounts[project._id] || 0} online`} size="small" color="success" sx={{ ml: 1 }} />
                              </Box>
                            </Box>
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
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Badge color="error" badgeContent={unreadCounts[project._id] || 0} showZero={false}>
                            <Button
                              variant="outlined"
                              color="primary"
                              startIcon={<ChatIcon />}
                              onClick={() => handleViewChat(project)}
                            >
                              Chat
                            </Button>
                          </Badge>

                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<TrendingDownIcon />}
                            onClick={() => handleViewBurndown(project)}
                          >
                            Burndown
                          </Button>

                          <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<ChatIcon />}
                            onClick={() => handleViewChatAnalysis(project)}
                          >
                            Chat Health
                          </Button>
                        </Box>
                      </ListItem>
                      {index < projects.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
            </div>
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

        {/* Chat Analysis Dialog */}
        <Dialog
          open={chatAnalysisDialogOpen}
          onClose={handleCloseChatAnalysisDialog}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ChatIcon sx={{ mr: 1 }} color="secondary" />
                <Typography variant="h6">
                  Chat Interaction Health - {selectedProject?.name}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseChatAnalysisDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Monitor team communication patterns and identify engagement trends
            </Typography>
            {selectedProject && <ChatAnalysisReport projectId={selectedProject._id} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseChatAnalysisDialog} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Team Chat Dialog */}
        <Dialog
          open={chatDialogOpen}
          onClose={handleCloseChatDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ChatIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">
                  Team Chat - {selectedProject?.name}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseChatDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {selectedProject && <ProjectChatWindow projectId={selectedProject._id} projectName={selectedProject.name} currentUser={user} />}
          </DialogContent>
        </Dialog>

        {/* Join Team by Code Dialog */}
        <Dialog
          open={joinTeamDialogOpen}
          onClose={handleCloseJoinTeamDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupAddIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">
                  Join Team by Code
                </Typography>
              </Box>
              <IconButton onClick={handleCloseJoinTeamDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter the team code shared by your project lead or team member to join the team.
            </Typography>
            <TextField
              autoFocus
              label="Team Code"
              fullWidth
              variant="outlined"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
              placeholder="Enter team code"
              inputProps={{ style: { textTransform: 'uppercase' } }}
              helperText="Team code is case-insensitive"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleJoinTeam();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseJoinTeamDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleJoinTeam} 
              variant="contained" 
              color="primary"
              disabled={!teamCode.trim()}
            >
              Join Team
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default TeamMemberDashboard;
