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
  - 成绩统计分析
- 个人信息管理

### 学生功能
- 成绩查询
  - 查看个人成绩
  - 按学期筛选
  - 按课程筛选
- 成绩统计
  - 平均分统计
  - 最高分/最低分
  - 成绩趋势分析
- 个人信息管理

## 界面特点
- 完整的中文本地化
- 响应式设计
- 直观的数据可视化
- 友好的用户交互
- 统一的设计风格
- 优雅的动画效果

## 安装和运行

### 前端
```bash
cd frontend
npm install
npm run dev
```

### 后端
```bash
cd backend
npm install
npm run dev
```

## 默认账号
- 管理员：admin / admin123
- 教师：teacher / teacher123
- 学生：student / student123

## 系统要求
- Node.js 14.0+
- MongoDB 4.0+
- 现代浏览器（Chrome, Firefox, Safari, Edge等）

## 注意事项
- 首次使用请使用默认管理员账号登录
- 请及时修改默认密码
- 确保 MongoDB 服务已启动
- 建议使用最新版本的浏览器
- 定期备份数据库

## 最近更新
- 完整的中文界面支持
- 优化的用户界面和交互体验
- 改进的数据可视化展示
- 增强的错误处理和用户提示
- 优化的响应式布局
- 统一的设计风格

## 开发团队
- 前端开发：Nqn7mi
- 后端开发：Nqn7mi
- UI设计：Nqn7mi
- With the help of Cascade

## 许可证
MIT License
