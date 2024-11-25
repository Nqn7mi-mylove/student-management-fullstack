<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="showCreateDialog">
        添加用户
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="users"
      style="width: 100%"
    >
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色">
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.role)">
            {{ getRoleLabel(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button-group>
            <el-button
              type="primary"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              :icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '创建用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        ref="userForm"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="form.email"
            placeholder="请输入邮箱"
          />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select 
            v-model="form.role"
            placeholder="请选择角色"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        
        <el-form-item 
          label="密码" 
          prop="password"
          v-if="dialogType === 'create'"
        >
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
        >
          {{ dialogType === 'create' ? '创建' : '更新' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="删除用户"
      width="400px"
    >
      <p>确定要删除这个用户吗？此操作不可恢复。</p>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button
          type="danger"
          @click="confirmDelete"
          :loading="submitting"
        >
          删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const submitting = ref(false)
const users = ref([])
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const dialogType = ref('create')
const selectedUser = ref(null)
const userForm = ref(null)

const form = reactive({
  username: '',
  email: '',
  role: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少为3个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur', when: () => dialogType.value === 'create' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur', when: () => dialogType.value === 'create' }
  ]
}

const getRoleType = (role) => {
  const types = {
    admin: 'danger',
    teacher: 'warning',
    student: 'success'
  }
  return types[role] || 'info'
}

const getRoleLabel = (role) => {
  const labels = {
    admin: '管理员',
    teacher: '教师',
    student: '学生'
  }
  return labels[role] || role
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await axios.get('/admin/users')
    users.value = response.data
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  dialogType.value = 'create'
  Object.assign(form, {
    username: '',
    email: '',
    role: '',
    password: ''
  })
  dialogVisible.value = true
}

const handleEdit = (user) => {
  dialogType.value = 'edit'
  Object.assign(form, {
    username: user.username,
    email: user.email,
    role: user.role
  })
  selectedUser.value = user
  dialogVisible.value = true
}

const handleDelete = (user) => {
  selectedUser.value = user
  deleteDialogVisible.value = true
}

const handleSubmit = async () => {
  if (!userForm.value) return
  
  await userForm.value.validate(async (valid, fields) => {
    if (valid) {
      submitting.value = true
      try {
        const userData = {
          username: form.username,
          email: form.email,
          role: form.role,
          ...(dialogType.value === 'create' ? { password: form.password } : {})
        }

        if (dialogType.value === 'create') {
          await axios.post('/admin/users', userData)
          ElMessage.success('用户创建成功')
        } else {
          await axios.put(`/admin/users/${selectedUser.value._id}`, userData)
          ElMessage.success('用户更新成功')
        }
        dialogVisible.value = false
        fetchUsers()
      } catch (error) {
        ElMessage.error(dialogType.value === 'create' ? '创建用户失败' : '更新用户失败')
      } finally {
        submitting.value = false
      }
    } else {
      console.log('验证失败:', fields)
    }
  })
}

const confirmDelete = async () => {
  if (!selectedUser.value) return

  submitting.value = true
  try {
    await axios.delete(`/admin/users/${selectedUser.value._id}`)
    ElMessage.success('用户删除成功')
    deleteDialogVisible.value = false
    fetchUsers()
  } catch (error) {
    ElMessage.error('删除用户失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
  font-weight: 600;
  color: #303133;
}

:deep(.el-form-item__label) {
  font-weight: bold;
}
</style>
