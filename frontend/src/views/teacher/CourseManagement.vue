<template>
  <div class="course-management">
    <div class="page-header">
      <h2>课程管理</h2>
      <el-button type="primary" @click="showCreateDialog">
        添加课程
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="courses"
      style="width: 100%"
    >
      <el-table-column prop="code" label="课程代码" />
      <el-table-column prop="name" label="课程名称" />
      <el-table-column prop="semester" label="学期" />
      <el-table-column prop="credits" label="学分" />
      <el-table-column prop="description" label="课程描述" />
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

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '创建课程' : '编辑课程'"
      width="500px"
    >
      <el-form
        ref="courseForm"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="课程代码" prop="code">
          <el-input 
            :modelValue="form.code"
            @update:modelValue="form.code = $event"
          />
        </el-form-item>
        
        <el-form-item label="课程名称" prop="name">
          <el-input 
            :modelValue="form.name"
            @update:modelValue="form.name = $event"
          />
        </el-form-item>
        
        <el-form-item label="学期" prop="semester">
          <el-select 
            :modelValue="form.semester"
            @update:modelValue="form.semester = $event"
            placeholder="选择学期"
          >
            <el-option label="2023年秋季学期" value="Fall 2023" />
            <el-option label="2024年春季学期" value="Spring 2024" />
          </el-select>
        </el-form-item>

        <el-form-item label="学分" prop="credits">
          <el-input-number
            :modelValue="form.credits"
            @update:modelValue="form.credits = $event"
            :min="1"
            :max="6"
          />
        </el-form-item>

        <el-form-item label="课程描述" prop="description">
          <el-input
            :modelValue="form.description"
            @update:modelValue="form.description = $event"
            type="textarea"
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

    <!-- Delete Confirmation -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="删除课程"
      width="400px"
    >
      <p>确定要删除这门课程吗？</p>
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
const courses = ref([])
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const dialogType = ref('create')
const selectedCourse = ref(null)

const form = reactive({
  code: '',
  name: '',
  semester: '',
  credits: 3,
  description: ''
})

const rules = {
  code: [
    { required: true, message: '请输入课程代码', trigger: 'blur' },
    { min: 3, message: '长度至少为3个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入课程名称', trigger: 'blur' }
  ],
  semester: [
    { required: true, message: '请选择学期', trigger: 'change' }
  ],
  credits: [
    { required: true, message: '请输入学分', trigger: 'change' }
  ]
}

const fetchCourses = async () => {
  loading.value = true
  try {
    const response = await axios.get('/teacher/courses')
    courses.value = response.data
  } catch (error) {
    ElMessage.error('获取课程失败')
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  dialogType.value = 'create'
  form.code = ''
  form.name = ''
  form.semester = ''
  form.credits = 3
  form.description = ''
  dialogVisible.value = true
}

const handleEdit = (course) => {
  dialogType.value = 'edit'
  form.code = course.code
  form.name = course.name
  form.semester = course.semester
  form.credits = course.credits
  form.description = course.description
  selectedCourse.value = course
  dialogVisible.value = true
}

const handleDelete = (course) => {
  selectedCourse.value = course
  deleteDialogVisible.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const courseData = {
      code: form.code,
      name: form.name,
      semester: form.semester,
      credits: form.credits,
      description: form.description
    }

    if (dialogType.value === 'create') {
      await axios.post('/teacher/courses', courseData)
      ElMessage.success('创建课程成功')
    } else {
      await axios.put(`/teacher/courses/${selectedCourse.value._id}`, courseData)
      ElMessage.success('更新课程成功')
    }
    dialogVisible.value = false
    fetchCourses()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async () => {
  submitting.value = true
  try {
    await axios.delete(`/teacher/courses/${selectedCourse.value._id}`)
    ElMessage.success('删除课程成功')
    deleteDialogVisible.value = false
    fetchCourses()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.course-management {
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
}
</style>
