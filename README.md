# 学生管理系统（全栈版）

基于现代化技术栈开发的学生管理系统，支持管理员、教师和学生三种角色的用户管理和成绩管理。系统提供完整的中文界面，优秀的用户体验。

## 技术栈

### 前端
- Vue 3 (组件化开发)
- Vite (构建工具)
- Element Plus (UI组件库)
- Vue Router (路由管理)
- Pinia (状态管理)
- Axios (HTTP 客户端)
- ECharts (数据可视化)

### 后端
- Node.js
- Express
- MongoDB
- Mongoose (MongoDB ODM)
- JWT (身份认证)
- bcrypt (密码加密)

## 项目结构
```
student-management-fullstack/
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── assets/         # 静态资源
│   │   ├── components/     # 通用组件
│   │   ├── layouts/        # 布局组件
│   │   ├── views/          # 页面组件
│   │   │   ├── admin/      # 管理员页面
│   │   │   ├── teacher/    # 教师页面
│   │   │   └── student/    # 学生页面
│   │   ├── router/         # 路由配置
│   │   ├── stores/         # 状态管理
│   │   ├── utils/          # 工具函数
│   │   └── App.vue         # 根组件
│   └── package.json
│
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── middleware/     # 中间件
│   │   ├── utils/          # 工具函数
│   │   ├── scripts/        # 脚本工具
│   │   └── app.js          # 应用入口
│   └── package.json
│
└── README.md
```

## 功能特点

### 管理员功能
- 用户管理
  - 添加、编辑、删除用户
  - 用户角色分配
  - 用户状态管理
- 系统管理
  - 查看系统统计数据
  - 用户活动监控
  - 系统日志查看

### 教师功能
- 课程管理
  - 创建新课程
  - 编辑课程信息
  - 删除课程
- 成绩管理
  - 录入学生成绩
  - 编辑成绩信息
  - 成绩分布可视化
  - 按课程筛选成绩
  - 按学生筛选成绩
- 个人信息管理

### 学生功能
- 成绩查询
  - 查看个人成绩
  - 按学期筛选
  - 按课程筛选
- 成绩统计
  - 总学分统计
  - GPA计算
  - 平均分统计
  - 课程数量统计
- 个人信息管理

## 界面特点
- 完整的中文本地化
- 响应式设计
- 直观的数据可视化
  - 成绩分布柱状图
  - 动态数据更新
  - 交互式图表
- 友好的用户交互
- 统一的设计风格
- 优雅的动画效果

## 安装和运行

### 前提条件
- Node.js >= 14
- MongoDB >= 4.4
- npm >= 6

### 前端
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build
```

### 后端
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 生产模式运行
npm start
```

### 初始化示例数据
系统提供了一个初始化脚本，可以快速生成示例数据：
```bash
# 进入后端目录
cd backend

# 运行初始化脚本
node src/scripts/init-data.js
```

初始化脚本会生成：
- 5名教师账号（用户名：teacher1-5）
- 50名学生账号（用户名：student1-50）
- 5-10门课程
- 随机生成的成绩数据

所有用户的初始密码均为：123456

## 系统特色

### 成绩管理
- 支持按课程和学生筛选成绩
- 成绩分布可视化展示
- 自动计算GPA（计算公式：(课程成绩-50)/10 * 课程学分 / 总学分）
- 低于60分的课程GPA计为0

### 数据可视化
- 使用ECharts实现成绩分布图表
- 支持动态数据更新
- 交互式图表操作
- 自适应布局

### 用户体验
- 实时搜索过滤
- 表单验证
- 操作确认
- 状态反馈
- 加载动画

## 开发团队
- 前端开发：Nqn7mi
- 后端开发：Nqn7mi
- UI设计：Nqn7mi
- With the help of Cascade

## 许可证
MIT License
