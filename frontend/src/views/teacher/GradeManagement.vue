<template>
  <div class="grade-management">
    <div class="page-header">
      <h2>成绩管理</h2>
      <el-button type="primary" @click="showAddGradeDialog">
        添加成绩
      </el-button>
    </div>

    <!-- 成绩筛选 -->
    <el-form :inline="true" class="grade-filters">
      <el-form-item label="课程">
        <el-select 
          v-model="filters.courseId"
          placeholder="所有课程"
          clearable
          style="width: 200px;"
          @change="handleFilterChange"
        >
          <el-option
            v-for="course in courses"
            :key="course._id"
            :label="course.name"
            :value="course._id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学生">
        <el-select 
          v-model="filters.studentId"
          placeholder="所有学生"
          clearable
          style="width: 200px;"
          @change="handleFilterChange"
        >
          <el-option
            v-for="student in students"
            :key="student._id"
            :label="student.username"
            :value="student._id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleFilterChange">搜索</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 成绩表格 -->
    <el-table
      v-loading="loading"
      :data="grades"
      style="width: 100%"
    >
      <el-table-column prop="studentId.name" label="学生" />
      <el-table-column prop="courseId.name" label="课程" />
      <el-table-column prop="score" label="分数">
        <template #default="{ row }">
          {{ row.score }}/100
        </template>
      </el-table-column>
      <el-table-column prop="comments" label="评语" />
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

    <!-- 添加/编辑成绩对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加成绩' : '编辑成绩'"
      width="500px"
    >
      <el-form
        ref="gradeForm"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="学生" prop="studentId">
          <el-select
            v-model="form.studentId"
            placeholder="选择学生"
            filterable
          >
            <el-option
              v-for="student in students"
              :key="student._id"
              :label="student.username"
              :value="student._id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="课程" prop="course">
          <el-select
            v-model="form.course"
            placeholder="选择课程"
            filterable
          >
            <el-option
              v-for="course in courses"
              :key="course._id"
              :label="course.name"
              :value="course._id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="分数" prop="score">
          <el-input-number
            v-model="form.score"
            :min="0"
            :max="100"
            :precision="1"
          />
        </el-form-item>

        <el-form-item label="评语" prop="comments">
          <el-input
            v-model="form.comments"
            type="textarea"
            placeholder="可选评语"
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
          {{ dialogType === 'add' ? '添加' : '更新' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="删除成绩"
      width="400px"
    >
      <p>确定要删除这条成绩记录吗？</p>
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
const grades = ref([])
const students = ref([])
const courses = ref([])
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const dialogType = ref('add')
const selectedGrade = ref(null)
const currentUser = ref({})

const filters = reactive({
  courseId: '',
  studentId: ''
})

const form = reactive({
  studentId: '',
  course: '',
  score: 0,
  comments: ''
})

const rules = {
  studentId: [
    { required: true, message: '请选择学生', trigger: 'change' }
  ],
  course: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  score: [
    { required: true, message: '请输入分数', trigger: 'blur' }
  ]
}

const handleFilterChange = async () => {
  await fetchGrades()
}

const fetchGrades = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams()
    
    if (filters.courseId) {
      queryParams.append('courseId', filters.courseId)
    }
    if (filters.studentId) {
      queryParams.append('studentId', filters.studentId)
    }

    // 发送请求
    const response = await axios.get(`/teacher/grades?${queryParams.toString()}`)
    grades.value = response.data
  } catch (error) {
    console.error('获取成绩失败:', error)
    ElMessage.error('获取成绩失败')
  } finally {
    loading.value = false
  }
}

const fetchStudents = async () => {
  try {
    const response = await axios.get('/teacher/students')
    students.value = response.data
  } catch (error) {
    ElMessage.error('获取学生失败')
  }
}

const fetchCourses = async () => {
  try {
    const response = await axios.get('/teacher/courses')
    courses.value = response.data
  } catch (error) {
    ElMessage.error('获取课程失败')
  }
}

const showAddGradeDialog = () => {
  dialogType.value = 'add'
  form.studentId = ''
  form.course = ''
  form.score = 0
  form.comments = ''
  dialogVisible.value = true
}

const handleEdit = (grade) => {
  dialogType.value = 'edit'
  form.studentId = grade.studentId._id
  form.course = grade.courseId._id
  form.score = grade.score
  form.comments = grade.comments
  selectedGrade.value = grade
  dialogVisible.value = true
}

const handleDelete = (grade) => {
  selectedGrade.value = grade
  deleteDialogVisible.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const gradeData = {
      studentId: form.studentId,
      courseId: form.course,
      score: form.score,
      semester: 'Fall 2023',
      comments: form.comments || ''
    }

    if (dialogType.value === 'add') {
      await axios.post('/teacher/grades', gradeData)
      ElMessage.success('添加成绩成功')
    } else {
      await axios.put(`/teacher/grades/${selectedGrade.value._id}`, gradeData)
      ElMessage.success('更新成绩成功')
    }
    dialogVisible.value = false
    fetchGrades()
  } catch (error) {
    console.error('提交成绩失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async () => {
  submitting.value = true
  try {
    await axios.delete(`/teacher/grades/${selectedGrade.value._id}`)
    ElMessage.success('删除成绩成功')
    deleteDialogVisible.value = false
    fetchGrades()
  } catch (error) {
    ElMessage.error('删除成绩失败')
  } finally {
    submitting.value = false
  }
}

const resetFilters = () => {
  filters.courseId = ''
  filters.studentId = ''
  fetchGrades()
}

onMounted(() => {
  fetchGrades()
  fetchStudents()
  fetchCourses()
  axios.get('/teacher/current-user').then(response => {
    currentUser.value = response.data
  })
})
</script>

<style scoped>
.grade-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.grade-filters {
  margin-bottom: 20px;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.grade-filters .el-form-item {
  margin-bottom: 0;
  margin-right: 15px;
}

.grade-filters .el-select {
  width: 200px;
}

:deep(.el-select-dropdown__item) {
  padding-right: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
