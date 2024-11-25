const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');
const User = require('../models/User');
const Grade = require('../models/Grade');
const Activity = require('../models/Activity');

// Get all users
router.get('/users', auth, checkRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user
router.post('/users', auth, checkRole('admin'), async (req, res) => {
  try {
    const { username, password, role, email, name } = req.body;
    
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      username,
      password,
      role,
      email,
      name
    });

    await user.save();
    
    // Log activity
    const activity = new Activity({
      action: 'create_user',
      userId: req.user.id,
      details: `Created user ${username}`
    });
    await activity.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/users/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const { username, role, email, name } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (role) user.role = role;
    if (email) user.email = email;
    if (name) user.name = name;

    await user.save();
    
    // Log activity
    const activity = new Activity({
      action: 'update_user',
      userId: req.user.id,
      details: `Updated user ${username}`
    });
    await activity.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.remove();
    
    // Log activity
    const activity = new Activity({
      action: 'delete_user',
      userId: req.user.id,
      details: `Deleted user ${user.username}`
    });
    await activity.save();

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system statistics
router.get('/statistics', auth, checkRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalGrades = await Grade.countDocuments();

    res.json({
      totalUsers,
      totalTeachers,
      totalStudents,
      totalGrades
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system activities
router.get('/activities', auth, checkRole('admin'), async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'username');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
