<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>总用户数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.totalUsers" title="用户">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>教师总数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.totalTeachers" title="教师">
              <template #prefix>
                <el-icon><UserFilled /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>学生总数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="statistics.totalStudents" title="学生">
              <template #prefix>
                <el-icon><Avatar /></el-icon>
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
              <span>最近活动</span>
            </div>
          </template>
          <el-table :data="recentActivities" style="width: 100%" v-loading="loading">
            <el-table-column type="index" label="序号" width="80" align="center" />
            <el-table-column prop="action" label="操作记录" align="left">
              <template #default="{ row }">
                {{ getActionText(row.action) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, UserFilled, Avatar } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const statistics = ref({
  totalUsers: 0,
  totalTeachers: 0,
  totalStudents: 0
})

const recentActivities = ref([])
const loading = ref(false)

const getActionText = (action) => {
  const actionMap = {
    'login': '登录系统',
    'logout': '退出系统',
    'create_user': '创建用户',
    'update_user': '更新用户信息',
    'delete_user': '删除用户',
    'create_course': '创建新课程',
    'update_course': '更新课程信息',
    'delete_course': '删除课程',
    'submit_grade': '提交学生成绩',
    'update_grade': '更新成绩信息'
  }
  return actionMap[action] || action
}

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const [statsResponse, activitiesResponse] = await Promise.all([
      axios.get('/admin/statistics'),
      axios.get('/admin/activities')
    ])
    
    statistics.value = statsResponse.data
    recentActivities.value = activitiesResponse.data.slice(0, 10) // 只显示最近10条活动
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

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #EBEEF5;
  background-color: #F8F9FB;
}
</style>
