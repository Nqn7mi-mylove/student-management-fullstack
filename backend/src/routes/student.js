const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');
const Grade = require('../models/Grade');
const Course = require('../models/Course');

// Get student's grades
router.get('/grades', auth, checkRole('student'), async (req, res) => {
  try {
    const { courseId, semester } = req.query;
    const query = { studentId: req.user.id };

    // 添加筛选条件
    if (courseId) {
      query.courseId = courseId;
    }
    if (semester) {
      query.semester = semester;
    }

    const grades = await Grade.find(query)
      .populate('courseId', 'name')
      .populate('teacherId', 'username name')
      .sort({ updatedAt: -1 }); // 按更新时间倒序排序
    res.json(grades);
  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's courses
router.get('/courses', auth, checkRole('student'), async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.user.id });
    const courseIds = grades.map(grade => grade.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } })
      .select('_id name teacherId')
      .populate('teacherId', 'username name');
    res.json(courses);
  } catch (error) {
    console.error('Get student courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard statistics
router.get('/dashboard/statistics', auth, checkRole('student'), async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.user.id })
      .populate('courseId', 'name');
    
    const scores = grades.map(grade => grade.score);
    const totalCourses = grades.length;
    const averageScore = totalCourses > 0 
      ? scores.reduce((acc, curr) => acc + curr, 0) / totalCourses 
      : 0;
    const highestScore = totalCourses > 0 ? Math.max(...scores) : 0;
    const lowestScore = totalCourses > 0 ? Math.min(...scores) : 0;

    res.json({
      totalCourses,
      averageScore,
      highestScore,
      lowestScore
    });
  } catch (error) {
    console.error('Dashboard statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent grades
router.get('/dashboard/recent-grades', auth, checkRole('student'), async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('courseId', 'name')
      .populate('teacherId', 'name');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
