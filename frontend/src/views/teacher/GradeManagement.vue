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

    <!-- 成绩分布图表 -->
    <el-card class="grade-chart" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>成绩分布</span>
          <el-select
            v-model="chartFilters.courseId"
            placeholder="选择课程"
            clearable
            @change="updateChart"
          >
            <el-option
              v-for="course in courses"
              :key="course._id"
              :label="course.name"
              :value="course._id"
            />
          </el-select>
        </div>
      </template>
      <div ref="chartRef" style="height: 400px;"></div>
    </el-card>

    <!-- 成绩表格 -->
    <el-table
      v-loading="loading"
      :data="grades"
      style="width: 100%"
    >
      <el-table-column label="学生">
        <template #default="{ row }">
          {{ row.studentId?.username || '未知学生' }}
        </template>
      </el-table-column>
      <el-table-column label="课程">
        <template #default="{ row }">
          {{ row.courseId?.name || '未知课程' }}
        </template>
      </el-table-column>
      <el-table-column prop="score" label="分数" width="100">
        <template #default="{ row }">
          {{ row.score }}/100
        </template>
      </el-table-column>
      <el-table-column prop="comments" label="评语" show-overflow-tooltip />
      <el-table-column label="操作" width="200" fixed="right">
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
      :title="dialogTitle"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="editingGrade"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="学生" prop="studentId">
          <el-select
            v-model="editingGrade.studentId"
            placeholder="选择学生"
            style="width: 100%"
          >
            <el-option
              v-for="student in students"
              :key="student._id"
              :label="student.username"
              :value="student._id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="课程" prop="courseId">
          <el-select
            v-model="editingGrade.courseId"
            placeholder="选择课程"
            style="width: 100%"
          >
            <el-option
              v-for="course in courses"
              :key="course._id"
              :label="course.name"
              :value="course._id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="学期" prop="semester">
          <el-select
            v-model="editingGrade.semester"
            placeholder="选择学期"
            style="width: 100%"
          >
            <el-option
              v-for="option in getSemesterOptions()"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="分数" prop="score">
          <el-input-number
            v-model="editingGrade.score"
            :min="0"
            :max="100"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="评语" prop="comments">
          <el-input
            v-model="editingGrade.comments"
            type="textarea"
            :rows="3"
            placeholder="请输入评语（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
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

    <!-- 图表 -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { getSemesterLabel, getSemesterOptions } from '../../utils/semesterUtils'
import * as echarts from 'echarts'

const grades = ref([])
const students = ref([])
const courses = ref([])
const chartRef = ref(null)
let chart = null

const filters = ref({
  courseId: '',
  studentId: ''
})

const chartFilters = ref({
  courseId: ''
})

// 成绩区间定义
const scoreRanges = [
  { min: 90, max: 100, label: '优秀(90-100)' },
  { min: 80, max: 89, label: '良好(80-89)' },
  { min: 70, max: 79, label: '中等(70-79)' },
  { min: 60, max: 69, label: '及格(60-69)' },
  { min: 0, max: 59, label: '不及格(0-59)' }
]

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const dialogTitle = ref('')
const editingGrade = ref({
  studentId: '',
  courseId: '',
  semester: '',
  score: 0,
  comments: ''
})

// 表单规则
const rules = {
  studentId: [
    { required: true, message: '请选择学生', trigger: 'change' }
  ],
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  semester: [
    { required: true, message: '请选择学期', trigger: 'change' }
  ],
  score: [
    { required: true, message: '请输入分数', trigger: 'blur' }
  ]
}

const handleFilterChange = async () => {
  try {
    await fetchGrades()
  } catch (error) {
    console.error('筛选失败:', error)
    ElMessage.error('筛选失败')
  }
}

const fetchGrades = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams()
    
    if (filters.value.courseId) {
      queryParams.append('courseId', filters.value.courseId)
    }
    if (filters.value.studentId) {
      queryParams.append('studentId', filters.value.studentId)
    }

    // 发送请求
    const response = await axios.get(`/teacher/grades?${queryParams.toString()}`)
    
    // 确保数据正确加载
    if (Array.isArray(response.data)) {
      grades.value = response.data
    } else {
      console.error('Invalid response data:', response.data)
      grades.value = []
      ElMessage.error('获取成绩数据格式错误')
    }
  } catch (error) {
    console.error('获取成绩失败:', error)
    grades.value = []
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
  dialogTitle.value = '添加成绩'
  editingGrade.value = {
    studentId: '',
    courseId: '',
    semester: '',
    score: 0,
    comments: ''
  }
  dialogVisible.value = true
}

const handleEdit = (grade) => {
  dialogTitle.value = '编辑成绩'
  editingGrade.value = {
    studentId: grade.studentId._id,
    courseId: grade.courseId._id,
    semester: grade.semester,
    score: grade.score,
    comments: grade.comments
  }
  dialogVisible.value = true
}

const handleDelete = (grade) => {
  editingGrade.value = grade
  deleteDialogVisible.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const gradeData = {
      studentId: editingGrade.value.studentId,
      courseId: editingGrade.value.courseId,
      semester: editingGrade.value.semester,
      score: editingGrade.value.score,
      comments: editingGrade.value.comments || ''
    }

    if (dialogTitle.value === '添加成绩') {
      await axios.post('/teacher/grades', gradeData)
      ElMessage.success('添加成绩成功')
    } else {
      await axios.put(`/teacher/grades/${editingGrade.value._id}`, gradeData)
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
    await axios.delete(`/teacher/grades/${editingGrade.value._id}`)
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
  filters.value.courseId = ''
  filters.value.studentId = ''
  fetchGrades()
}

// 初始化图表
const initChart = () => {
  if (chart) {
    chart.dispose()
  }
  chart = echarts.init(chartRef.value)
  updateChart()
}

// 更新图表数据
const updateChart = () => {
  if (!chart) return

  const filteredGrades = grades.value.filter(grade => 
    !chartFilters.value.courseId || grade.courseId._id === chartFilters.value.courseId
  )

  // 统计各分数段人数
  const statistics = scoreRanges.map(range => ({
    ...range,
    count: filteredGrades.filter(grade => 
      grade.score >= range.min && grade.score <= range.max
    ).length
  }))

  const option = {
    title: {
      text: '成绩分布统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: statistics.map(item => item.label),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      minInterval: 1
    },
    series: [
      {
        name: '学生人数',
        type: 'bar',
        data: statistics.map(item => item.count),
        itemStyle: {
          color: function(params) {
            const colors = ['#67C23A', '#409EFF', '#E6A23C', '#F56C6C', '#909399']
            return colors[params.dataIndex]
          }
        },
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  }

  chart.setOption(option)
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  chart?.resize()
})

// 监听成绩数据变化
watch(grades, () => {
  updateChart()
})

// 在组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', () => {
    chart?.resize()
  })
  chart?.dispose()
})

onMounted(() => {
  fetchGrades()
  fetchStudents()
  fetchCourses()
  nextTick(() => {
    initChart()
  })
  axios.get('/teacher/current-user').then(response => {
    const currentUser = response.data
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

.grade-chart {
  margin-bottom: 20px;
}

.grade-chart .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.grade-chart .el-select {
  width: 200px;
}

:deep(.el-select-dropdown__item) {
  padding-right: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
