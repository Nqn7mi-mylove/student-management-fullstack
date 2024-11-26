<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>总学生数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.totalStudents">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>总课程数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.totalCourses">
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>平均分</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.averageScore" :precision="1">
              <template #prefix>
                <el-icon><DataLine /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>及格率</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.passRate" :precision="1" suffix="%">
              <template #prefix>
                <el-icon><TrendCharts /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近成绩</span>
              <el-button type="primary" link @click="$router.push('/teacher/grades')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table 
            :data="recentGrades" 
            style="width: 100%"
            v-loading="loading"
          >
            <el-table-column prop="studentId.name" label="学生" />
            <el-table-column prop="courseId.name" label="课程" />
            <el-table-column prop="semester" label="学期">
              <template #default="{ row }">
                {{ getSemesterLabel(row.semester) }}
              </template>
            </el-table-column>
            <el-table-column prop="score" label="分数">
              <template #default="{ row }">
                <span :class="getScoreClass(row.score)">{{ row.score }}/100</span>
              </template>
            </el-table-column>
            <el-table-column prop="comments" label="评语" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, Document, DataLine, TrendCharts } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getSemesterLabel } from '../../utils/semesterUtils'

const statistics = ref({
  totalStudents: 0,
  totalCourses: 0,
  averageScore: 0,
  passRate: 0
})

const recentGrades = ref([])
const loading = ref(false)

const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-fair'
  return 'score-below'
}

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const [statsResponse, gradesResponse] = await Promise.all([
      axios.get('/teacher/dashboard/statistics'),
      axios.get('/teacher/grades?limit=5')
    ])
    
    statistics.value = statsResponse.data
    recentGrades.value = gradesResponse.data.slice(0, 5)
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.mt-4 {
  margin-top: 20px;
}

:deep(.el-statistic__number) {
  font-size: 24px;
  font-weight: bold;
}

:deep(.el-statistic__prefix) {
  margin-right: 8px;
}

.score-excellent {
  color: #67c23a;
  font-weight: bold;
}

.score-good {
  color: #409eff;
  font-weight: bold;
}

.score-fair {
  color: #e6a23c;
  font-weight: bold;
}

.score-below {
  color: #f56c6c;
  font-weight: bold;
}
</style>
