const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Grade = require('../models/Grade');
require('dotenv').config();

// 生成随机姓名
const generateName = () => {
  const surnames = ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴'];
  const names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明'];
  return surnames[Math.floor(Math.random() * surnames.length)] + 
         names[Math.floor(Math.random() * names.length)];
};

// 生成随机邮箱
const generateEmail = (username) => {
  const domains = ['qq.com', '163.com', 'gmail.com', 'outlook.com'];
  return `${username}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

// 生成随机学号/工号
const generateId = (prefix, index) => {
  return `${prefix}${String(2023000 + index).padStart(6, '0')}`;
};

// 生成随机成绩
const generateScore = () => {
  // 生成一个正态分布的随机数（均值75，标准差10）
  let u1 = Math.random();
  let u2 = Math.random();
  let z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  let score = Math.round(75 + z * 10);
  
  // 限制分数在0-100之间
  return Math.min(Math.max(score, 0), 100);
};

// 生成随机学期
const generateSemester = () => {
  const years = ['2022-2023', '2023-2024'];
  const terms = ['1', '2'];
  return years[Math.floor(Math.random() * years.length)] + '-' + terms[Math.floor(Math.random() * terms.length)];
};

// 主函数
const initData = async () => {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-management');
    console.log('Connected to MongoDB');

    // 清空现有数据
    await User.deleteMany({ role: { $in: ['teacher', 'student'] } });
    await Course.deleteMany({});
    await Grade.deleteMany({});

    // 创建教师
    const teachers = [];
    for (let i = 0; i < 5; i++) {
      const name = generateName();
      const username = `teacher${i + 1}`;
      const teacher = new User({
        username,
        password: '123456',
        role: 'teacher',
        name,
        email: generateEmail(username),
        teacherId: generateId('T', i)
      });
      await teacher.save();
      teachers.push(teacher);
    }
    console.log('Teachers created:', teachers.length);

    // 创建课程
    const courses = [];
    const courseNames = [
      '高等数学', '线性代数', '概率论', '离散数学',
      'C语言程序设计', 'Java程序设计', '数据结构', '操作系统',
      '计算机网络', '数据库原理'
    ];
    const numCourses = Math.floor(Math.random() * 6) + 5; // 5-10门课程
    for (let i = 0; i < numCourses; i++) {
      const course = new Course({
        name: courseNames[i],
        code: `C${String(i + 1).padStart(4, '0')}`,
        teacherId: teachers[i % teachers.length]._id,
        semester: generateSemester(),
        credits: Math.floor(Math.random() * 2) + 2, // 2-3学分
        description: `${courseNames[i]}课程描述`
      });
      await course.save();
      courses.push(course);
    }
    console.log('Courses created:', courses.length);

    // 创建学生
    const students = [];
    for (let i = 0; i < 50; i++) {
      const name = generateName();
      const username = `student${i + 1}`;
      const student = new User({
        username,
        password: '123456',
        role: 'student',
        name,
        email: generateEmail(username),
        studentId: generateId('S', i)
      });
      await student.save();
      students.push(student);
    }
    console.log('Students created:', students.length);

    // 生成成绩
    const grades = [];
    for (const course of courses) {
      // 为每门课程随机选择30-40名学生
      const numStudents = Math.floor(Math.random() * 11) + 30;
      const selectedStudents = [...students]
        .sort(() => Math.random() - 0.5)
        .slice(0, numStudents);
      
      for (const student of selectedStudents) {
        const grade = new Grade({
          studentId: student._id,
          courseId: course._id,
          teacherId: course.teacherId,
          score: generateScore(),
          semester: course.semester,
          comments: '期末考试成绩'
        });
        await grade.save();
        grades.push(grade);
      }
    }
    console.log('Grades created:', grades.length);

    console.log('Data initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// 运行初始化
initData();
