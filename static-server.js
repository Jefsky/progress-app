const express = require('express');
const path = require('path');
const ip = require('ip');
const app = express();
const port = 8080;
const localIp = ip.address();

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// 所有路由都返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
  console.log(`前端应用服务器正在运行`);
  console.log(`本地访问地址: http://localhost:${port}`);
  console.log(`局域网访问地址: http://${localIp}:${port}`);
});
