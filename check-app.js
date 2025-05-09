/**
 * 检查应用是否正常运行
 */
const http = require('http');
const { exec } = require('child_process');

// 检查 API 服务器
function checkApiServer() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000/projects', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const projects = JSON.parse(data);
          console.log('API 服务器正常运行');
          console.log(`获取到 ${projects.length} 个项目`);
          resolve(true);
        } catch (error) {
          console.error('API 服务器返回的数据无法解析为 JSON');
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error('API 服务器检查失败:', error.message);
      reject(error);
    });
  });
}

// 检查静态文件服务器
function checkStaticServer() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:8080', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (data.includes('<div id="app">')) {
          console.log('静态文件服务器正常运行');
          resolve(true);
        } else {
          console.error('静态文件服务器返回的 HTML 不包含 app 元素');
          reject(new Error('静态文件服务器返回的 HTML 不包含 app 元素'));
        }
      });
    }).on('error', (error) => {
      console.error('静态文件服务器检查失败:', error.message);
      reject(error);
    });
  });
}

// 在浏览器中打开应用
function openInBrowser() {
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
}

// 主函数
async function main() {
  try {
    console.log('正在检查应用...');
    
    // 检查 API 服务器
    await checkApiServer();
    
    // 检查静态文件服务器
    await checkStaticServer();
    
    console.log('应用正常运行！');
    console.log('本地访问地址: http://localhost:8080');
    
    // 获取本机 IP 地址
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
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
    
    // 在浏览器中打开应用
    openInBrowser();
  } catch (error) {
    console.error('应用检查失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main();
