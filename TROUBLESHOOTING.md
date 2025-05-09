# 问题排查指南

## json-server 模块未找到问题

### 问题描述

启动应用时出现以下错误：

```
Error: Cannot find module 'json-server'
Require stack:
- D:/hello/progress-app/server.js
```

前端应用启动后提示"加载项目数据失败"。

### 原因

虽然 `json-server` 已经在 `package.json` 的 `devDependencies` 中列出，但可能由于以下原因导致问题：

1. 依赖项未正确安装
2. 依赖项版本不兼容
3. 模块路径解析问题

### 解决方案

#### 方案1：直接使用 npx 启动 json-server

不使用 `server.js` 文件，而是直接通过 npx 命令启动 json-server：

```bash
npx json-server --watch db.json --port 3000
```

然后在另一个终端窗口启动前端应用：

```bash
npm run serve
```

#### 方案2：修改 package.json 中的 server 脚本

将 `package.json` 中的 `server` 脚本从：

```json
"server": "node server.js"
```

修改为：

```json
"server": "json-server --watch db.json --port 3000"
```

这样就可以使用 `npm run server` 来启动 JSON Server，而不需要依赖 `server.js` 文件。

#### 方案3：重新安装依赖

如果希望使用原始的 `server.js` 文件，可以尝试重新安装依赖：

```bash
npm uninstall json-server
npm install json-server
```

或者尝试全局安装：

```bash
npm install -g json-server
```

### 注意事项

- 确保 JSON Server 在端口 3000 上运行，因为前端代码中的 API URL 被硬编码为 `http://localhost:3000`
- 前端应用通常在端口 8080 或 8081 上运行
- 可以使用 `npm run dev` 命令同时启动前端和后端（如果 `server` 脚本已正确配置）
