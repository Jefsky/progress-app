@echo off
echo 正在启动项目进度管理系统...

REM 启动 API 服务器
start cmd /k "title API 服务器 & node server.js"

REM 等待 API 服务器启动
timeout /t 2 /nobreak > nul

REM 启动静态文件服务器
start cmd /k "title 静态文件服务器 & node static-server.js"

REM 等待静态文件服务器启动
timeout /t 2 /nobreak > nul

REM 检查应用并在浏览器中打开
node check-app.js

echo 应用已启动，请在浏览器中访问。
echo 本地访问地址: http://localhost:8080
echo 如需停止服务器，请关闭相应的命令行窗口。
