const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function findUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('./models/User');
  const users = await User.find().limit(5).select('username email');
  console.log('Available users:');
  users.forEach(u => console.log(`  - ${u.email} (${u.username})`));
  await mongoose.connection.close();
}

findUser();
