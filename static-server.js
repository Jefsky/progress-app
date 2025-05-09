const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 8080;

// 检查 dist 目录是否存在
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('错误：dist 目录不存在，请先运行 npm run build');
  process.exit(1);
}

// 设置静态文件目录
app.use(express.static(distPath));

// 设置响应头，确保使用 UTF-8 编码
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  next();
});

// 处理所有路由，返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// 启动服务器
app.listen(port, () => {
  console.log(`静态文件服务器已启动，访问地址：http://localhost:${port}`);
  console.log(`局域网访问地址：http://${getLocalIP()}:${port}`);
});

// 获取本机 IP 地址
function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // 跳过内部 IP 和非 IPv4 地址
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  
  return 'localhost';
}
