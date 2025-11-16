import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  Badge
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
import io from 'socket.io-client';

function ProjectChat({ projectId, projectName, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO');
      newSocket.emit('join-project', projectId);
    });

    newSocket.on('new-message', (message) => {
      console.log('Received new message:', message);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user-joined', (data) => {
      console.log('User joined:', data);
      setOnlineCount(prev => prev + 1);
    });

    newSocket.on('user-left', (data) => {
      console.log('User left:', data);
      setOnlineCount(prev => Math.max(1, prev - 1));
    });

    newSocket.on('user-typing', (data) => {
      setTypingUsers(prev => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });
    });

    newSocket.on('user-stopped-typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u !== data.username));
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-project', projectId);
      newSocket.disconnect();
    };
  }, [projectId]);

  // Fetch initial messages
  useEffect(() => {
    fetchMessages();
  }, [projectId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/chat/${projectId}/messages?limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(response.data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/chat/${projectId}/send`,
        { content: newMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Emit to Socket.IO for real-time update
      if (socket) {
        socket.emit('send-message', {
          projectId,
          message: response.data.chatMessage
        });
      }

      setNewMessage('');
      
      // Stop typing indicator
      if (socket) {
        socket.emit('typing-stop', {
          projectId,
          username: currentUser.username
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/chat/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from local state
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socket) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing start
    socket.emit('typing-start', {
      projectId,
      username: currentUser.username
    });

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing-stop', {
        projectId,
        username: currentUser.username
      });
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAvatarColor = (role) => {
    switch (role) {
      case 'Admin/Team Lead': return 'primary';
      case 'Mentor': return 'secondary';
      default: return 'default';
    }
  };

  const formatTime = (date) => {
    const msgDate = new Date(date);
    const now = new Date();
    const diffMs = now - msgDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return msgDate.toLocaleDateString();
  };

  return (
    <Paper elevation={3} sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          💬 {projectName} - Team Chat
        </Typography>
        <Badge badgeContent={onlineCount} color="success">
          <PersonIcon />
        </Badge>
      </Box>

      <Divider />

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Messages List */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'grey.50' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No messages yet. Start the conversation! 🚀
            </Typography>
          </Box>
        ) : (
          <List>
            {messages.map((msg, index) => {
              const isOwnMessage = msg.sender._id === currentUser.id;
              const showAvatar = index === 0 || messages[index - 1].sender._id !== msg.sender._id;

              return (
                <ListItem
                  key={msg._id}
                  sx={{
                    display: 'flex',
                    flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    mb: 1
                  }}
                >
                  {showAvatar && (
                    <ListItemAvatar sx={{ minWidth: isOwnMessage ? 'auto' : 56, ml: isOwnMessage ? 1 : 0, mr: isOwnMessage ? 0 : 1 }}>
                      <Avatar sx={{ bgcolor: getAvatarColor(msg.sender.role) + '.main' }}>
                        {msg.sender.username[0].toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                  )}
                  
                  <Box sx={{ maxWidth: '70%', ml: !showAvatar && !isOwnMessage ? 7 : 0, mr: !showAvatar && isOwnMessage ? 7 : 0 }}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        bgcolor: isOwnMessage ? 'primary.light' : 'white',
                        borderRadius: 2,
                        position: 'relative'
                      }}
                    >
                      {showAvatar && !isOwnMessage && (
                        <Typography variant="caption" fontWeight="bold" color="primary" display="block" sx={{ mb: 0.5 }}>
                          {msg.sender.username}
                          <Chip label={msg.sender.role} size="small" sx={{ ml: 1, height: 16, fontSize: '0.65rem' }} />
                        </Typography>
                      )}
                      
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(msg.createdAt)}
                        </Typography>
                        
                        {isOwnMessage && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteMessage(msg._id)}
                            sx={{ ml: 1, p: 0.5 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Paper>
                  </Box>
                </ListItem>
              );
            })}
            <div ref={messagesEndRef} />
          </List>
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2, fontStyle: 'italic' }}>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Message Input */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          variant="outlined"
          placeholder="Type your message..."
          value={newMessage}
          onChange={handleTyping}
          onKeyPress={handleKeyPress}
          disabled={sending}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? <CircularProgress size={24} /> : <SendIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Press Enter to send, Shift+Enter for new line
        </Typography>
      </Box>
    </Paper>
  );
}

export default ProjectChat;
