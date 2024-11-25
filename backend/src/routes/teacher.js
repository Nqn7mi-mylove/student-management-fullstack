const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');
const Grade = require('../models/Grade');
const User = require('../models/User');
const Course = require('../models/Course');

// Get all grades
router.get('/grades', auth, checkRole('teacher'), async (req, res) => {
  try {
    const grades = await Grade.find({ teacherId: req.user.id })
      .populate('studentId', 'name')
      .populate('courseId', 'name');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create grade
router.post('/grades', auth, checkRole('teacher'), async (req, res) => {
  try {
    const { studentId, courseId, score, comments, semester } = req.body;
    
    const grade = new Grade({
      studentId,
      courseId,
      teacherId: req.user.id,
      score,
      comments,
      semester
    });

    await grade.save();
    res.json(grade);
  } catch (error) {
    console.error('Grade creation error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update grade
router.put('/grades/:id', auth, checkRole('teacher'), async (req, res) => {
  try {
    const { score, comments, semester } = req.body;
    const grade = await Grade.findOne({
      _id: req.params.id,
      teacherId: req.user.id
    });
    
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    if (score !== undefined) grade.score = score;
    if (comments !== undefined) grade.comments = comments;
    if (semester) grade.semester = semester;

    await grade.save();
    res.json(grade);
  } catch (error) {
    console.error('Grade update error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Delete grade
router.delete('/grades/:id', auth, checkRole('teacher'), async (req, res) => {
  try {
    const grade = await Grade.findOne({
      _id: req.params.id,
      teacherId: req.user.id
    });
    
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    await grade.remove();
    res.json({ message: 'Grade deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students
router.get('/students', auth, checkRole('teacher'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Course Management Routes
// Get all courses for the teacher
router.get('/courses', auth, checkRole('teacher'), async (req, res) => {
  try {
    const courses = await Course.find({ teacherId: req.user.id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new course
router.post('/courses', auth, checkRole('teacher'), async (req, res) => {
  try {
    const { code, name, semester, credits, description } = req.body;
    
    // Check if course code already exists
    let course = await Course.findOne({ code });
    if (course) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    course = new Course({
      code,
      name,
      teacherId: req.user.id,
      semester,
      credits,
      description
    });

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a course
router.put('/courses/:id', auth, checkRole('teacher'), async (req, res) => {
  try {
    const { code, name, semester, credits, description } = req.body;
    const course = await Course.findOne({
      _id: req.params.id,
      teacherId: req.user.id
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (code) course.code = code;
    if (name) course.name = name;
    if (semester) course.semester = semester;
    if (credits) course.credits = credits;
    if (description) course.description = description;

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a course
router.delete('/courses/:id', auth, checkRole('teacher'), async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      teacherId: req.user.id
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if there are any grades associated with this course
    const gradeCount = await Grade.countDocuments({ courseId: req.params.id });
    if (gradeCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete course with existing grades' 
      });
    }

    await course.remove();
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher's courses
router.get('/my-courses', auth, checkRole('teacher'), async (req, res) => {
  try {
    const courses = await Course.find({ teacherId: req.user.id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard statistics
router.get('/dashboard/statistics', auth, checkRole('teacher'), async (req, res) => {
  try {
    // Get all grades
    const grades = await Grade.find()
      .populate('studentId', 'name')
      .populate('courseId', 'name');
    
    // Get unique students and courses
    const uniqueStudents = new Set(grades.map(grade => grade.studentId._id.toString()));
    const uniqueCourses = new Set(grades.map(grade => grade.courseId._id.toString()));
    
    // Calculate statistics
    const scores = grades.map(grade => grade.score);
    const totalGrades = scores.length;
    const averageScore = totalGrades > 0 
      ? scores.reduce((acc, curr) => acc + curr, 0) / totalGrades 
      : 0;
    
    // Calculate pass rate (score >= 60)
    const passCount = scores.filter(score => score >= 60).length;
    const passRate = totalGrades > 0 
      ? (passCount / totalGrades) * 100 
      : 0;

    res.json({
      totalStudents: uniqueStudents.size,
      totalCourses: uniqueCourses.size,
      averageScore: Number(averageScore.toFixed(1)),
      passRate: Number(passRate.toFixed(1))
    });
  } catch (error) {
    console.error('Dashboard statistics error:', error);
    res.status(500).json({ message: '获取统计数据失败' });
  }
});

// Get recent grades
router.get('/dashboard/recent-grades', auth, checkRole('teacher'), async (req, res) => {
  try {
    const grades = await Grade.find({ teacherId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('studentId', 'name')
      .populate('courseId', 'name');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
