# 项目进度管理系统 (Progress Management App)

一个基于 Vue.js 和 Element Plus 的项目进度管理系统，支持多人协作。

## 功能特点

- 项目管理：创建、编辑、删除项目
- 任务管理：为项目添加任务，设置任务状态和进度
- 人员管理：指定项目负责人和成员，任务负责人和参与者
- 数据可视化：使用图表展示项目和任务进度
- 多人协作：基于 API 服务，支持多人同时操作
- 数据导入导出：支持 JSON 格式的数据导入导出

## 技术栈

- 前端框架：Vue 3
- UI 组件库：Element Plus
- 图表库：Chart.js
- 路由管理：Vue Router
- 后端服务：JSON Server

## 安装和使用

### 安装依赖

```bash
npm install
```

### 准备数据库文件

首次使用时，需要创建 db.json 文件。可以复制 db.json.example 作为起点：

```bash
cp db.json.example db.json
```

### 启动后端服务

```bash
npm run server:dev
```

### 启动前端开发服务器

```bash
npm run serve
```

### 同时启动前端和后端（开发模式）

```bash
npm run dev
```

### 构建生产环境版本

```bash
npm run build
```

### 代码检查和修复

```bash
npm run lint
```

## 局域网部署

本项目支持在局域网中部署，方便团队成员协作使用。详细的部署步骤请参考：

[局域网部署指南](./LAN_DEPLOYMENT.md)

## 项目结构

```
├── public/                 # 静态资源
├── src/                    # 源代码
│   ├── assets/             # 资源文件
│   ├── components/         # 组件
│   ├── router/             # 路由配置
│   ├── services/           # API 服务
│   ├── views/              # 页面视图
│   ├── App.vue             # 主组件
│   └── main.js             # 入口文件
├── db.json.example         # 数据库示例文件
├── server.js               # 服务器配置
└── package.json            # 项目配置
```

## 使用说明

1. 在首页可以查看所有项目，点击"添加新项目"按钮创建项目
2. 点击项目卡片进入项目详情页
3. 在项目详情页可以添加、编辑、删除任务
4. 可以设置任务的负责人、参与者、进度等信息
5. 项目进度会根据任务完成情况自动计算

## 贡献指南

欢迎提交 Issue 或 Pull Request 来改进这个项目。

## 注意事项

- db.json 文件包含个人数据，不应该提交到代码仓库中
- 请使用 db.json.example 作为示例，创建自己的 db.json 文件
