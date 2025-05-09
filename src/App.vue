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

/* 全局卡片样式 */
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

/* 全局按钮样式 */
.el-button {
  border-radius: 4px !important;
  font-weight: 500 !important;
  transition: all 0.25s ease !important;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 全局表单样式 */
.el-form-item__label {
  font-weight: 500 !important;
  color: var(--text-primary) !important;
}

.el-input__inner, .el-textarea__inner {
  border-radius: 4px !important;
}

/* 全局标签样式 */
.el-tag {
  border-radius: 4px !important;
  padding: 0 8px !important;
}

/* 全局进度条样式 */
.el-progress-bar__outer {
  border-radius: 4px !important;
  background-color: #ebeef5 !important;
}

.el-progress-bar__inner {
  border-radius: 4px !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  html, body {
    font-size: 13px;
  }
  
  .el-card__body {
    padding: 16px !important;
  }
}
</style>
