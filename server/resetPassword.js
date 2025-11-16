const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the admin user
    const email = 'admin@example.com';
    const user = await User.findOne({ email: email });

    if (!user) {
      console.log('❌ User not found with email:', email);
      await mongoose.connection.close();
      return;
    }

    console.log('✅ User found:', user.username);

    // Set new password
    const newPassword = 'admin123';
    user.password = newPassword;
    
    // Save - this will trigger the pre-save hook to hash the password
    await user.save();
    
    console.log(`✅ Password successfully reset to: "${newPassword}"`);

    // Verify the password works
    const isMatch = await user.comparePassword(newPassword);
    console.log('Password verification:', isMatch ? '✅ SUCCESS' : '❌ FAILED');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('\n🎉 You can now login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
