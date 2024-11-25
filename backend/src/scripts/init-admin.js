const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const initAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-management');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      email: 'admin@example.com',
      name: 'System Admin'
    });

    await admin.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

initAdmin();
