const express = require('express');
const Grade = require('../models/grade.model');
const { auth, checkRole } = require('../middleware/auth.middleware');

const router = express.Router();

// 获取学生成绩（学生只能查看自己的，教师可以查看自己教授的，管理员可以查看所有）
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      query.teacher = req.user._id;
    }

    const grades = await Grade.find(query)
      .populate('student', 'name studentId')
      .populate('teacher', 'name');
      
    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 添加成绩（仅教师和管理员）
router.post('/', auth, checkRole(['teacher', 'admin']), async (req, res) => {
  try {
    const grade = new Grade({
      ...req.body,
      teacher: req.user.role === 'teacher' ? req.user._id : req.body.teacher
    });
    
    await grade.save();
    res.status(201).json(grade);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: '该学生本学期此课程已有成绩' });
    } else {
      res.status(500).json({ error: '服务器错误' });
    }
  }
});

// 更新成绩（仅教师和管理员）
router.put('/:id', auth, checkRole(['teacher', 'admin']), async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role === 'teacher') {
      query.teacher = req.user._id;
    }

    const grade = await Grade.findOneAndUpdate(
      query,
      req.body,
      { new: true }
    ).populate('student', 'name studentId');

    if (!grade) {
      return res.status(404).json({ error: '成绩不存在或无权修改' });
    }

    res.json(grade);
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除成绩（仅管理员）
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) {
      return res.status(404).json({ error: '成绩不存在' });
    }
    res.json({ message: '成绩删除成功' });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取学生的成绩统计
router.get('/statistics/:studentId', auth, async (req, res) => {
  try {
    // 检查权限
    if (
      req.user.role === 'student' && 
      req.user._id.toString() !== req.params.studentId
    ) {
      return res.status(403).json({ error: '没有权限访问此资源' });
    }

    const grades = await Grade.find({ student: req.params.studentId });
    
    const statistics = {
      totalCourses: grades.length,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 100
    };

    if (grades.length > 0) {
      const scores = grades.map(g => g.score);
      statistics.averageScore = scores.reduce((a, b) => a + b) / scores.length;
      statistics.highestScore = Math.max(...scores);
      statistics.lowestScore = Math.min(...scores);
    }

    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
