# 样式修复指南

## 问题描述

在某些情况下，项目进度管理系统可能会出现样式丢失问题，表现为：
- 按钮没有正确的样式和颜色
- 卡片没有阴影和边框
- 图标显示异常或不显示
- 整体布局混乱

这通常是由于 Element Plus 的样式没有正确加载导致的。

## 解决方案

### 方案一：使用一键启动脚本（推荐）

我们提供了一键启动脚本，可以自动解决样式问题：

1. 双击运行 `一键启动.bat` 文件
2. 脚本会自动执行以下操作：
   - 启动 API 服务器
   - 启动静态文件服务器
   - 在浏览器中打开应用

### 方案二：手动修复

如果您需要手动修复样式问题，可以按照以下步骤操作：

1. 确保在 `public/index.html` 中添加了 Element Plus 的 CDN 样式链接：

```html
<link rel="stylesheet" href="https://unpkg.com/element-plus@2.9.9/dist/index.css">
```

2. 在 `src/App.vue` 中直接使用颜色值而不是 CSS 变量：

```css
.progress-status.low {
  background-color: #f56c6c;
}

.progress-status.medium {
  background-color: #e6a23c;
}

.progress-status.high {
  background-color: #67c23a;
}
```

3. 重新构建项目：

```bash
npm run build:lan
```

4. 启动服务器：

```bash
# 启动 API 服务器
npm run server

# 启动静态文件服务器
npm run serve:static
```

### 方案三：使用检查脚本

我们提供了一个检查脚本，可以帮助您验证应用是否正常运行：

```bash
node check-app.js
```

这个脚本会检查 API 服务器和静态文件服务器是否正常运行，并在浏览器中打开应用。

## 常见问题

### 样式在开发环境正常，但在生产环境丢失

这通常是由于构建过程中的样式处理问题导致的。确保在 `vue.config.js` 中没有禁用 CSS 提取：

```javascript
module.exports = {
  css: {
    extract: true
  }
}
```

### CDN 资源无法加载

如果您的网络环境无法访问 CDN，可以考虑将 Element Plus 的样式文件下载到本地：

1. 下载 Element Plus 的样式文件：
   https://unpkg.com/element-plus@2.9.9/dist/index.css

2. 将文件保存到 `public/css/element-plus.css`

3. 在 `public/index.html` 中引用本地文件：

```html
<link rel="stylesheet" href="<%= BASE_URL %>css/element-plus.css">
```

### 浏览器缓存问题

如果您已经修复了样式但仍然看不到效果，可能是浏览器缓存导致的。尝试以下方法：

1. 强制刷新页面（Windows: Ctrl+F5, Mac: Cmd+Shift+R）
2. 清除浏览器缓存
3. 使用无痕/隐私模式打开应用

## 技术细节

样式问题的根本原因是 Vue CLI 构建过程中对 CSS 的处理方式。在开发环境中，样式通过 JavaScript 动态注入，而在生产环境中，样式被提取到单独的 CSS 文件中。

我们的解决方案通过以下方式解决这个问题：

1. 直接在 HTML 中引入 Element Plus 的样式，绕过 Vue CLI 的样式处理
2. 简化样式定义，避免使用复杂的 CSS 变量和嵌套规则
3. 确保所有必要的样式都被正确加载，无论是通过 CDN 还是本地文件
