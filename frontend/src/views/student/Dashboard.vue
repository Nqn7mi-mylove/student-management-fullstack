<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>课程总数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.totalCourses" title="课程">
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
              <span>平均分数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.averageScore" :precision="1" title="平均分">
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
              <span>最高分数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.highestScore" title="最高分">
              <template #prefix>
                <el-icon><TopRight /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>最低分数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.lowestScore" title="最低分">
              <template #prefix>
                <el-icon><BottomLeft /></el-icon>
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
              <el-button type="primary" link @click="$router.push('/student/grades')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table 
            :data="recentGrades" 
            style="width: 100%"
            v-loading="loading"
          >
            <el-table-column prop="courseId.name" label="课程名称" />
            <el-table-column prop="semester" label="学期">
              <template #default="{ row }">
                {{ getSemesterLabel(row.semester) }}
              </template>
            </el-table-column>
            <el-table-column prop="score" label="分数" width="120">
              <template #default="{ row }">
                <span :class="getScoreClass(row.score)">{{ row.score }}分</span>
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
import { Document, DataLine, TopRight, BottomLeft } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getSemesterLabel } from '../../utils/semesterUtils'

const statistics = ref({
  totalCourses: 0,
  averageScore: 0,
  highestScore: 0,
  lowestScore: 0
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
      axios.get('/student/dashboard/statistics'),
      axios.get('/student/grades?limit=5')  // 只获取最近5条成绩
    ])
    
    statistics.value = statsResponse.data
    recentGrades.value = gradesResponse.data.slice(0, 5)  // 确保只显示5条
  } catch (error) {
    ElMessage.error('获取仪表盘数据失败')
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
  transition: all 0.3s;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.mt-4 {
  margin-top: 20px;
}

:deep(.el-statistic__number) {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
}

:deep(.el-statistic__title) {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

:deep(.el-statistic__prefix) {
  margin-right: 8px;
  font-size: 20px;
  vertical-align: middle;
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

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #EBEEF5;
  background-color: #F8F9FB;
}
</style>
