const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user exists
    const email = 'admin@example.com';
    const user = await User.findOne({ email: email });

    if (!user) {
      console.log('❌ User not found with email:', email);
      
      // List all users
      const allUsers = await User.find({}, 'username email role');
      console.log('\n📋 All users in database:');
      allUsers.forEach(u => {
        console.log(`  - ${u.username} (${u.email}) - Role: ${u.role}`);
      });
    } else {
      console.log('✅ User found:', {
        username: user.username,
        email: user.email,
        role: user.role,
        hashedPassword: user.password.substring(0, 20) + '...'
      });

      // Test password comparison
      const testPassword = 'admin123';
      console.log(`\n🔐 Testing password: "${testPassword}"`);
      const isMatch = await user.comparePassword(testPassword);
      console.log('Password match result:', isMatch ? '✅ CORRECT' : '❌ INCORRECT');

      if (!isMatch) {
        console.log('\n💡 Suggestion: The password might be different. Try these common passwords:');
        const commonPasswords = ['admin', 'password', 'Admin123', '123456'];
        for (const pwd of commonPasswords) {
          const match = await user.comparePassword(pwd);
          if (match) {
            console.log(`  ✅ Correct password is: "${pwd}"`);
            break;
          }
        }
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testLogin();
