<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <teacher-menu />
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-content">
          <h2>学生管理系统-教师端</h2>
          <el-dropdown @command="handleCommand">
            <el-button type="primary">
              {{ user?.username }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ArrowDown } from '@element-plus/icons-vue'
import TeacherMenu from '../components/TeacherMenu.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout().then(() => {
      ElMessage.success('退出登录成功')
      router.push('/login')
    }).catch(() => {
      ElMessage.error('退出登录失败')
    })
  } else if (command === 'profile') {
    router.push('/teacher/profile')
  }
}

onMounted(async () => {
  // No need to fetch user profile here, we're using the authStore
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0 20px;
}

.header-content {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}

h2 {
  margin: 0;
}
</style>
