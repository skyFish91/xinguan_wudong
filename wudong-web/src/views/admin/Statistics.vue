<template>
  <div class="admin-statistics">
    <h1 class="page-title">数据统计</h1>

    <el-alert type="info" :closable="false" style="margin-bottom: 20px">
      <template #title>
        <div style="display: flex; align-items: center; gap: 10px">
          <el-icon><InfoFilled /></el-icon>
          <span>图表功能需要安装 ECharts，请运行：npm install echarts</span>
        </div>
      </template>
    </el-alert>

    <p style="font-size: 16px; color: #4a5568">
      数据统计页面开发中，可复用商家端的统计图表组件。
    </p>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled } from '@element-plus/icons-vue'
</script>

<style scoped>
.admin-statistics {
  max-width: 1800px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 30px;
}
</style>
