import { createRouter, createWebHistory } from 'vue-router'
import StudentLayout from '../layouts/StudentLayout.vue'
import StudentDashboard from '../views/student/Dashboard.vue'
import StudentGrades from '../views/student/Grades.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { 
      title: '登录 - 学生成绩管理系统'
    }
  },
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { 
          title: '管理员面板 - 学生成绩管理系统',
          requiresAuth: true,
          role: 'admin'
        }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('../views/admin/UserManagement.vue'),
        meta: { 
          title: '用户管理 - 学生成绩管理系统',
          requiresAuth: true,
          role: 'admin'
        }
      }
    ]
  },
  {
    path: '/teacher',
    name: 'TeacherLayout',
    component: () => import('../layouts/TeacherLayout.vue'),
    meta: { requiresAuth: true, role: 'teacher' },
    children: [
      {
        path: 'dashboard',
        name: 'TeacherDashboard',
        component: () => import('../views/teacher/Dashboard.vue'),
        meta: { 
          title: '教师面板 - 学生成绩管理系统',
          requiresAuth: true,
          role: 'teacher'
        }
      },
      {
        path: 'grades',
        name: 'GradeManagement',
        component: () => import('../views/teacher/GradeManagement.vue'),
        meta: { 
          title: '成绩管理 - 学生成绩管理系统',
          requiresAuth: true,
          role: 'teacher'
        }
      },
      {
        path: 'grade-management',
        name: 'TeacherGradeManagement',
        component: () => import('../views/teacher/GradeManagement.vue'),
        meta: { 
          title: '成绩管理 - 学生成绩管理系统',
          requiresAuth: true,
          role: 'teacher'
        }
      },
      {
        path: 'course-management',
        name: 'TeacherCourseManagement',
        component: () => import('../views/teacher/CourseManagement.vue'),
        meta: { 
          title: '课程管理 - 学生成绩管理系统',
          requiresAuth: true,
          role: 'teacher'
        }
      }
    ]
  },
  {
    path: '/student',
    component: StudentLayout,
    meta: { requiresAuth: true, role: 'student' },
    children: [
      {
        path: 'dashboard',
        name: 'StudentDashboard',
        component: StudentDashboard,
        meta: { 
          title: '学生面板 - 学生成绩管理系统',
          requiresAuth: true,
          role: 'student'
        }
      },
      {
        path: 'grades',
        name: 'StudentGrades',
        component: StudentGrades,
        meta: { 
          title: '我的成绩 - 学生成绩管理系统',
          requiresAuth: true,
          role: 'student'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  // Update page title
  if (to.meta.title) {
    document.title = to.meta.title
  } else {
    document.title = '学生成绩管理系统'
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next('/login')
    } else if (to.matched.some(record => record.meta.role && record.meta.role !== userRole)) {
      next('/' + userRole + '/dashboard')
    } else {
      next()
    }
  } else {
    if (token && to.path === '/login') {
      next('/' + userRole + '/dashboard')
    } else {
      next()
    }
  }
})

export default router
