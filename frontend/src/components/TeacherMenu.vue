<template>
  <el-menu
    :default-active="$route.path"
    class="el-menu-vertical"
    router
  >
    <el-menu-item index="/teacher/dashboard">
      <el-icon><House /></el-icon>
      <span>首页</span>
    </el-menu-item>

    <el-menu-item index="/teacher/course-management">
      <el-icon><Reading /></el-icon>
      <span>课程管理</span>
    </el-menu-item>

    <el-menu-item index="/teacher/grade-management">
      <el-icon><Document /></el-icon>
      <span>成绩管理</span>
    </el-menu-item>

    <el-menu-item index="/teacher/profile">
      <el-icon><User /></el-icon>
      <span>个人信息</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { House, Reading, Document, User } from '@element-plus/icons-vue'
</script>

<style scoped>
.el-menu-vertical {
  height: 100%;
  border-right: none;
}

.el-menu-item {
  display: flex;
  align-items: center;
}

.el-icon {
  margin-right: 8px;
}
</style>
