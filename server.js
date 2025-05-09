const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = 3000;
const ip = require('ip');
const localIp = ip.address();

// 设置中间件
server.use(middlewares);

// 添加自定义路由规则（如果需要）
server.use(jsonServer.rewriter({
  '/api/*': '/$1',
  '/projects/:id/tasks': '/tasks?projectId=:id'
}));

// 添加自定义响应头，允许跨域访问
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

// 使用路由
server.use(router);

// 启动服务器，监听所有网络接口
server.listen(port, '0.0.0.0', () => {
  console.log(`JSON Server 正在运行，端口: ${port}`);
  console.log(`本地访问地址: http://localhost:${port}`);
  console.log(`局域网访问地址: http://${localIp}:${port}`);
});
