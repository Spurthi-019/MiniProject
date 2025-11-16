const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Project = require('../models/Project');

async function main() {
  let uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini_project').trim();
  // Remove quotes if present
  if (uri.startsWith("'") || uri.startsWith('"')) {
    uri = uri.slice(1, -1);
  }
  console.error('Connecting to:', uri);
  await mongoose.connect(uri);
  const p = await Project.findOne({ teamCode: 'TEST123' });
  if (p) {
    console.log(p._id.toString());
  } else {
    console.log('NOT_FOUND');
  }
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
