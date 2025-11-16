const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a test user to receive invitations
    const testUser = new User({
      username: 'john_member',
      email: 'john@example.com',
      password: 'password123',
      role: 'Team Members'
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Email: john@example.com');
    console.log('   Username: john_member');
    console.log('   Password: password123');
    console.log('   Role: Team Members');
    console.log('\n💡 You can now:');
    console.log('   1. Login as admin@example.com to send an invitation');
    console.log('   2. Login as john@example.com to see and accept the invitation');

    await mongoose.connection.close();
  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️  User already exists!');
      console.log('\n📋 Existing user credentials:');
      console.log('   Email: john@example.com');
      console.log('   Username: john_member');
      console.log('   Password: password123');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

createTestUser();
