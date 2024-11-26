<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">学生成绩管理系统</h2>
      </template>
      
      <el-form 
        ref="loginForm"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username"
            placeholder="请输入用户名"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            native-type="submit"
            :loading="loading"
            class="login-button"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const loginForm = ref(null)
const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, message: '用户名长度至少为2个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginForm.value) return
  
  try {
    await loginForm.value.validate(async (valid, fields) => {
      if (valid) {
        loading.value = true
        try {
          const { token, user } = await authStore.login(form)
          
          if (!user || !user.role) {
            throw new Error('登录响应中缺少用户角色信息')
          }
          
          ElMessage.success('登录成功')
          await router.push(`/${user.role}/dashboard`)
        } catch (error) {
          console.error('Login error:', error)
          ElMessage.error(error.message || '登录失败')
          throw error
        }
      } else {
        console.log('验证失败:', fields)
      }
    })
  } catch (error) {
    // 已经在内部处理过错误了
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
}

.login-title {
  text-align: center;
  color: #303133;
  margin: 0;
}

.login-button {
  width: 100%;
}

:deep(.el-card__header) {
  padding: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
