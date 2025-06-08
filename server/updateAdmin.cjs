const mongoose = require('mongoose');
require('dotenv').config();

async function updateUserRole() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Dynamically import the User model
    const { default: User } = await import('./src/models/User.js');
    
    const user = await User.findOne({ email: 'j.nishimwe@admin.com' });
    if (user) {
      user.role = 'admin';
      await user.save();
      console.log('User role updated to admin successfully');
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

updateUserRole(); 