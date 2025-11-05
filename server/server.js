const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple health route
app.get('/', (req, res) => res.json({ message: 'Server Running' }));

// MongoDB connection (optional) - uses MONGODB_URI from server/.env if provided
const mongoUri = process.env.MONGODB_URI || '';
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err.message));
} else {
  console.log('No MONGODB_URI provided — skipping MongoDB connection');
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
