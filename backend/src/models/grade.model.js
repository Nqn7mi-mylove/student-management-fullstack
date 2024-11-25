const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  semester: {
    type: String,
    required: true
  },
  comments: {
    type: String
  }
}, {
  timestamps: true
});

// 创建复合索引
gradeSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });

const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade;
