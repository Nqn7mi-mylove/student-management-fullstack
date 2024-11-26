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
      .populate('courseId', 'name credits');
    
    const totalCourses = grades.length;
    let totalCredits = 0;
    let weightedGradePoints = 0;
    let totalScore = 0;

    grades.forEach(grade => {
      const credits = grade.courseId.credits || 0;
      totalCredits += credits;
      totalScore += grade.score;
      
      // 计算绩点：(分数-50)/10，但如果分数低于60分，绩点为0
      const gradePoint = grade.score >= 60 ? (grade.score - 50) / 10 : 0;
      weightedGradePoints += gradePoint * credits;
    });

    const averageScore = totalCourses > 0 
      ? totalScore / totalCourses 
      : 0;
    
    const gpa = totalCredits > 0 
      ? weightedGradePoints / totalCredits 
      : 0;

    res.json({
      totalCourses,
      averageScore,
      totalCredits,  // 总学分
      gpa           // 总绩点
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
