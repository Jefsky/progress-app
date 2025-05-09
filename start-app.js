/**
 * 启动项目进度管理系统
 */
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

console.log('正在启动项目进度管理系统...');

// 启动 API 服务器
console.log('正在启动 API 服务器...');
const apiServer = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true,
  windowsHide: false
});

apiServer.on('error', (error) => {
  console.error('API 服务器启动失败:', error);
});

// 等待 API 服务器启动
console.log('等待 API 服务器启动...');
setTimeout(() => {
  // 启动静态文件服务器
  console.log('正在启动静态文件服务器...');
  const staticServer = spawn('node', ['static-server.js'], {
    stdio: 'inherit',
    shell: true,
    windowsHide: false
  });

  staticServer.on('error', (error) => {
    console.error('静态文件服务器启动失败:', error);
  });

  // 等待静态文件服务器启动
  console.log('等待静态文件服务器启动...');
  setTimeout(() => {
    // 在浏览器中打开应用
    console.log('正在浏览器中打开应用...');
    
    // 使用默认浏览器打开应用
    const url = 'http://localhost:8080';
    
    // 根据操作系统选择打开命令
    const command = process.platform === 'win32' ? `start ${url}` : 
                   process.platform === 'darwin' ? `open ${url}` : 
                   `xdg-open ${url}`;
    
    exec(command, (error) => {
      if (error) {
        console.error('无法打开浏览器:', error);
      } else {
        console.log('已在浏览器中打开应用');
      }
    });
    
    console.log('应用已启动，请在浏览器中访问。');
    console.log('本地访问地址: http://localhost:8080');
    
    // 获取本机 IP 地址
    const nets = os.networkInterfaces();
    let localIP = 'localhost';
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // 跳过内部 IP 和非 IPv4 地址
        if (net.family === 'IPv4' && !net.internal) {
          localIP = net.address;
          break;
        }
      }
    }
    
    console.log(`局域网访问地址: http://${localIP}:8080`);
    console.log('如需停止服务器，请按 Ctrl+C 终止此进程。');
  }, 2000);
}, 2000);
