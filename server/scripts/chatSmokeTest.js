/*
  Smoke test for chat real-time flow.
  - Logs in two users (alice and bob) using /api/auth/login
  - Connects two socket clients to the server and joins the seeded project room
  - Client A sends a message via POST /api/chat/:projectId/send
  - Verifies Client B receives 'new-message' via socket

  Usage:
    node server/scripts/chatSmokeTest.js <PROJECT_ID>

  Make sure the server is running and the seed script has been executed.
*/

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const io = require('socket.io-client');
const axios = require('axios');

const SERVER = process.env.SERVER_URL || 'http://localhost:5000';
const USER_A = { email: 'alice@example.com', password: 'pass123' };
const USER_B = { email: 'bob@example.com', password: 'pass123' };

async function login(user) {
  try {
    const res = await axios.post(`${SERVER}/api/auth/login`, { login: user.email, password: user.password });
    return { token: res.data.token, user: res.data.user };
  } catch (err) {
    console.error('Login failed for', user.email, err.response?.data || err.message);
    throw err;
  }
}

async function run(projectId) {
  if (!projectId) {
    console.error('Usage: node chatSmokeTest.js <PROJECT_ID>');
    process.exit(1);
  }

  console.log('Logging in test users...');
  const a = await login(USER_A);
  const b = await login(USER_B);

  console.log('Connecting socket clients...');
  const socketA = io(SERVER, { transports: ['websocket', 'polling'], extraHeaders: { Authorization: `Bearer ${a.token}` } });
  const socketB = io(SERVER, { transports: ['websocket', 'polling'], extraHeaders: { Authorization: `Bearer ${b.token}` } });

  let receivedByB = false;

  socketB.on('connect', () => {
    console.log('Socket B connected:', socketB.id);
    socketB.emit('join-project', projectId);
  });

  socketA.on('connect', () => {
    console.log('Socket A connected:', socketA.id);
    socketA.emit('join-project', projectId);
  });

  socketB.on('new-message', (message) => {
    console.log('[socketB] Received new-message:', JSON.stringify(message));
    receivedByB = true;
  });

  // Wait for sockets to connect
  await new Promise((resolve) => setTimeout(resolve, 1200));

  console.log('Client A sending message via API...');
  try {
    const res = await axios.post(
      `${SERVER}/api/chat/${projectId}/send`,
      { content: `Smoke test message at ${new Date().toISOString()}` },
      { headers: { Authorization: `Bearer ${a.token}` } }
    );
    console.log('API send response:', res.data.message);
  } catch (err) {
    console.error('API send failed:', err.response?.data || err.message);
  }

  // Wait for event propagation
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log('Checking GET messages endpoint...');
  try {
    const res = await axios.get(`${SERVER}/api/chat/${projectId}/messages?limit=50`, { headers: { Authorization: `Bearer ${a.token}` } });
    console.log('GET messages count:', res.data.count);
    console.log('Last messages:', res.data.messages.slice(-5));
  } catch (err) {
    console.error('GET messages failed:', err.response?.data || err.message);
  }

  console.log('Result: client B received message via socket?', receivedByB);

  socketA.emit('leave-project', projectId);
  socketB.emit('leave-project', projectId);
  socketA.disconnect();
  socketB.disconnect();

  process.exit(receivedByB ? 0 : 2);
}

const projectId = process.argv[2];
run(projectId).catch(err => { console.error('Smoke test error', err); process.exit(1); });
