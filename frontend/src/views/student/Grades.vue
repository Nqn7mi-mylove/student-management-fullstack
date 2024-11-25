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
              @change="filterGrades"
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
              @change="filterGrades"
            >
              <el-option
                v-for="semester in semesters"
                :key="semester"
                :label="getSemesterLabel(semester)"
                :value="semester"
              />
            </el-select>
          </div>
        </div>
      </template>

      <el-table
        :data="filteredGrades"
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

const grades = ref([])
const courses = ref([])
const filters = ref({
  course: '',
  semester: ''
})
const semesters = ['Fall 2023', 'Spring 2024', 'Fall 2024']
const loading = ref(false)

const statistics = ref({
  average: 0,
  highest: 0,
  lowest: 0
})

const getSemesterLabel = (semester) => {
  const semesterMap = {
    'Fall 2023': '2023年秋季学期',
    'Spring 2024': '2024年春季学期',
    'Fall 2024': '2024年秋季学期'
  }
  return semesterMap[semester] || semester
}

const filteredGrades = computed(() => {
  let result = [...grades.value]
  
  if (filters.value.course) {
    result = result.filter(grade => grade.courseId._id === filters.value.course)
  }
  
  if (filters.value.semester) {
    result = result.filter(grade => grade.semester === filters.value.semester)
  }
  
  return result
})

const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-average'
  return 'score-below'
}

const calculateStatistics = () => {
  const scores = filteredGrades.value.map(grade => grade.score)
  statistics.value = {
    average: scores.length ? scores.reduce((a, b) => a + b) / scores.length : 0,
    highest: scores.length ? Math.max(...scores) : 0,
    lowest: scores.length ? Math.min(...scores) : 0
  }
}

const fetchGrades = async () => {
  try {
    loading.value = true
    const response = await axios.get('/student/grades')
    grades.value = response.data
    calculateStatistics()
  } catch (error) {
    ElMessage.error('获取成绩数据失败')
  } finally {
    loading.value = false
  }
}

const fetchCourses = async () => {
  try {
    const response = await axios.get('/student/courses')
    courses.value = response.data
  } catch (error) {
    ElMessage.error('获取课程列表失败')
  }
}

const filterGrades = () => {
  calculateStatistics()
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

:deep(.el-select) {
  width: 180px;
}
</style>
