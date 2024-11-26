# 学生管理系统后端

基于 Node.js + Express + MongoDB 开发的现代化学生管理系统后端服务，提供完整的RESTful API支持。

## 技术栈

- Node.js (运行环境)
- Express (Web框架)
- MongoDB (数据库)
- Mongoose (ODM)
- JWT (身份认证)
- bcrypt (密码加密)
- cors (跨域支持)

## 功能特点

- RESTful API设计
- JWT身份验证
- 角色权限控制
- 数据库事务支持
- 错误处理中间件
- 日志记录
- 安全性保护

## 项目结构

```
backend/
├── src/
│   ├── controllers/    # 控制器
│   ├── models/        # 数据模型
│   ├── routes/        # 路由
│   ├── middleware/    # 中间件
│   ├── utils/         # 工具函数
│   └── app.js         # 应用入口
├── config/            # 配置文件
└── package.json
```

## API文档

### 认证相关

#### POST /api/auth/login
- 功能：用户登录
- 请求体：
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- 响应：JWT token

#### POST /api/auth/register
- 功能：用户注册
- 请求体：
  ```json
  {
    "username": "string",
    "password": "string",
    "role": "string"
  }
  ```

### 用户管理

#### GET /api/admin/users
- 功能：获取所有用户
- 权限：管理员

#### PUT /api/admin/users/:id
- 功能：更新用户信息
- 权限：管理员

### 成绩管理

#### GET /api/teacher/grades
- 功能：获取成绩列表
- 权限：教师

#### POST /api/teacher/grades
- 功能：添加成绩
- 权限：教师

#### GET /api/student/grades
- 功能：查看个人成绩
- 权限：学生

## 开发环境设置

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start
```

## 环境变量

创建 `.env` 文件：

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/student_management
JWT_SECRET=your_jwt_secret
```

## 数据库设计

### User 模型
```javascript
{
  username: String,
  password: String,
  role: String,
  name: String,
  email: String
}
```

### Grade 模型
```javascript
{
  student: ObjectId,
  course: String,
  score: Number,
  semester: String
}
```

### Course 模型
```javascript
{
  name: String,
  teacher: ObjectId,
  students: [ObjectId],
  semester: String
}
```

## 开发团队
- 后端开发：Nqn7mi
- 数据库设计：Nqn7mi
- With the help of Cascade

## 系统要求
- Node.js 14.0+
- MongoDB 4.0+
- npm 6.0+

## 部署说明

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量

3. 启动MongoDB服务

4. 运行应用：
```bash
npm start
```

## 安全注意事项

- 所有密码都经过bcrypt加密
- 使用JWT进行身份验证
- 实施了CORS策略
- 添加了请求速率限制
- 实施了XSS防护
- 使用Helmet增强安全头

## 许可证
MIT License