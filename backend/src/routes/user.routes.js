const express = require('express');
const User = require('../models/user.model');
const { auth, checkRole } = require('../middleware/auth.middleware');

const router = express.Router();

// 获取所有用户（仅管理员）
router.get('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建新用户（仅管理员）
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: '用户名或邮箱已存在' });
    } else {
      res.status(500).json({ error: '服务器错误' });
    }
  }
});

// 更新用户信息（仅管理员）
router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: '用户名或邮箱已存在' });
    } else {
      res.status(500).json({ error: '服务器错误' });
    }
  }
});

// 删除用户（仅管理员）
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ message: '用户删除成功' });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取特定用户信息（管理员或本人）
router.get('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: '没有权限访问此资源' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
