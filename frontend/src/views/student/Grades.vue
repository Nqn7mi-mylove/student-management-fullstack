<template>
  <div class="grades">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>我的成绩</h3>
          <div class="filters">
            <el-select
              v-model="filters.course"
              placeholder="选择课程"
              clearable
              @change="handleFilterChange"
            >
              <el-option
                v-for="course in courses"
                :key="course.id"
                :label="course.name"
                :value="course.id"
              />
            </el-select>
            
            <el-select
              v-model="filters.semester"
              placeholder="选择学期"
              clearable
              @change="handleFilterChange"
            >
              <el-option
                v-for="option in getSemesterOptions()"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-button type="primary" @click="resetFilters">重置筛选</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="grades"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="courseId.name" label="课程名称" sortable />
        <el-table-column prop="semester" label="学期" sortable>
          <template #default="{ row }">
            {{ getSemesterLabel(row.semester) }}
          </template>
        </el-table-column>
        <el-table-column prop="score" label="分数" sortable width="120">
          <template #default="{ row }">
            <span :class="getScoreClass(row.score)">{{ row.score }}分</span>
          </template>
        </el-table-column>
        <el-table-column prop="comments" label="评语" show-overflow-tooltip />
      </el-table>

      <!-- 统计卡片 -->
      <div class="statistics" v-if="grades.length > 0">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="statistics-header">平均分</div>
              </template>
              <div class="statistic-value">{{ statistics.average.toFixed(1) }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="statistics-header">最高分</div>
              </template>
              <div class="statistic-value">{{ statistics.highest }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="statistics-header">最低分</div>
              </template>
              <div class="statistic-value">{{ statistics.lowest }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="statistics-header">课程总数</div>
              </template>
              <div class="statistic-value">{{ grades.length }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getSemesterLabel, getSemesterOptions } from '../../utils/semesterUtils'

const grades = ref([])
const courses = ref([])
const filters = ref({
  course: '',
  semester: ''
})
const loading = ref(false)

const statistics = ref({
  average: 0,
  highest: 0,
  lowest: 0
})

const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-average'
  return 'score-below'
}

const calculateStatistics = () => {
  const scores = grades.value.map(grade => grade.score)
  statistics.value = {
    average: scores.length ? scores.reduce((a, b) => a + b) / scores.length : 0,
    highest: scores.length ? Math.max(...scores) : 0,
    lowest: scores.length ? Math.min(...scores) : 0
  }
}

const fetchGrades = async () => {
  try {
    loading.value = true
    // 构建查询参数
    const queryParams = new URLSearchParams()
    
    if (filters.value.course) {
      queryParams.append('courseId', filters.value.course)
    }
    if (filters.value.semester) {
      queryParams.append('semester', filters.value.semester)
    }

    // 发送请求
    const response = await axios.get(`/student/grades?${queryParams.toString()}`)
    
    if (Array.isArray(response.data)) {
      grades.value = response.data
      calculateStatistics()
    } else {
      console.error('Invalid response data:', response.data)
      grades.value = []
      ElMessage.error('获取成绩数据格式错误')
    }
  } catch (error) {
    console.error('获取成绩失败:', error)
    grades.value = []
    ElMessage.error('获取成绩数据失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value.course = ''
  filters.value.semester = ''
  fetchGrades()
}

const handleFilterChange = async () => {
  try {
    await fetchGrades()
  } catch (error) {
    console.error('筛选失败:', error)
    ElMessage.error('筛选失败')
  }
}

const fetchCourses = async () => {
  try {
    const response = await axios.get('/student/courses')
    if (Array.isArray(response.data)) {
      courses.value = response.data.map(course => ({
        id: course._id,
        name: course.name,
        teacherName: course.teacherId?.name || '未知教师'
      }))
    } else {
      console.error('Invalid courses data:', response.data)
      courses.value = []
      ElMessage.error('获取课程数据格式错误')
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
    ElMessage.error('获取课程列表失败')
  }
}

onMounted(() => {
  fetchGrades()
  fetchCourses()
})
</script>

<style scoped>
.grades {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.filters {
  display: flex;
  gap: 16px;
}

.filters .el-select {
  width: 200px;
}

.statistics {
  margin-top: 20px;
}

.statistics-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  text-align: center;
}

.statistic-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  text-align: center;
  padding: 12px 0;
}

.score-excellent {
  color: #67c23a;
  font-weight: bold;
}

.score-good {
  color: #409eff;
  font-weight: bold;
}

.score-average {
  color: #e6a23c;
  font-weight: bold;
}

.score-below {
  color: #f56c6c;
  font-weight: bold;
}

:deep(.el-card) {
  transition: all 0.3s;
}

:deep(.el-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #EBEEF5;
  background-color: #F8F9FB;
}

:deep(.el-select-dropdown__item) {
  padding-right: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
