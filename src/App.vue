<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* 全局变量 */
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --border-color: #ebeef5;
  --border-light: #f0f0f0;
  --background-color: #f5f7fa;
  --card-background: #ffffff;
  --card-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  --transition-duration: 0.3s;
}

/* 基础样式 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
}

#app {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  min-height: 100vh;
  background-color: var(--background-color);
}

/* 卡片样式 */
.el-card {
  border: none !important;
  border-radius: 8px !important;
  box-shadow: var(--card-shadow) !important;
  transition: all var(--transition-duration) ease !important;
  overflow: hidden;
}

.el-card__header {
  padding: 16px 20px !important;
  border-bottom: 1px solid var(--border-light) !important;
}

.el-card__body {
  padding: 20px !important;
}

/* 按钮样式 */
.el-button {
  border-radius: 4px !important;
  transition: all var(--transition-duration) ease !important;
}

.el-button--primary {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

.el-button--success {
  background-color: var(--success-color) !important;
  border-color: var(--success-color) !important;
}

.el-button--warning {
  background-color: var(--warning-color) !important;
  border-color: var(--warning-color) !important;
}

.el-button--danger {
  background-color: var(--danger-color) !important;
  border-color: var(--danger-color) !important;
}

/* 表格样式 */
.el-table {
  border-radius: 8px !important;
  overflow: hidden;
}

.el-table th {
  background-color: #f5f7fa !important;
  color: var(--text-regular) !important;
  font-weight: 600 !important;
}

/* 项目卡片样式 */
.project-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}

/* 项目进度样式 */
.progress-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  color: #fff;
}

.progress-status.low {
  background-color: #f56c6c;
}

.progress-status.medium {
  background-color: #e6a23c;
}

.progress-status.high {
  background-color: #67c23a;
}
</style>
