# 学生管理系统前端

基于 Vue 3 + Vite 开发的现代化学生管理系统前端项目，提供完整的中文界面支持。

## 技术栈

- Vue 3 (组件化开发)
- Vite (构建工具)
- Element Plus (UI组件库)
- Vue Router (路由管理)
- Pinia (状态管理)
- Axios (HTTP 客户端)

## 功能特点

- 完整的中文界面
- 响应式设计
- 现代化的UI/UX
- 角色权限管理
- 实时数据更新
- 优雅的动画效果

## 项目结构

```
frontend/
├── src/
│   ├── assets/         # 静态资源
│   ├── components/     # 通用组件
│   ├── layouts/        # 布局组件
│   ├── views/          # 页面组件
│   │   ├── admin/     # 管理员页面
│   │   ├── teacher/   # 教师页面
│   │   └── student/   # 学生页面
│   ├── router/        # 路由配置
│   ├── stores/        # 状态管理
│   └── utils/         # 工具函数
└── package.json
```

## 开发环境设置

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 主要功能

### 管理员模块
- 用户管理
- 系统统计
- 权限管理

### 教师模块
- 课程管理
- 成绩管理
- 学生管理

### 学生模块
- 成绩查询
- 个人信息
- 课程信息

## 开发团队
- 前端开发：Nqn7mi
- UI设计：Nqn7mi
- With the help of Cascade

## 浏览器支持

- Chrome
- Firefox
- Safari
- Edge

## 许可证
MIT License
