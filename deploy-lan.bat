@echo off
echo 项目进度管理系统 - 局域网部署脚本
echo ===================================

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 错误: 未找到 Node.js，请先安装 Node.js
  exit /b 1
)

REM 检查 npm 是否安装
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 错误: 未找到 npm，请先安装 Node.js
  exit /b 1
)

REM 检查是否有正在运行的 Node.js 进程
echo 正在检查是否有正在运行的服务器...
tasklist /fi "imagename eq node.exe" >nul 2>nul
if %ERRORLEVEL% equ 0 (
  echo 发现正在运行的 Node.js 进程，正在停止...
  taskkill /F /IM node.exe >nul 2>nul
  timeout /t 2 >nul
)

REM 安装依赖
echo 正在安装依赖...
call npm install

REM 确保 db.json 文件存在
if not exist db.json (
  echo 正在创建 db.json 文件...
  copy db.json.example db.json >nul
)

REM 构建前端应用
echo 正在构建前端应用...
call npm run build:lan

REM 获取本机 IP 地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 地址" ^| findstr /v "192.168.56"') do (
  set IP=%%a
  set IP=!IP:~1!
  goto :found_ip
)
:found_ip

REM 启动服务器
echo 正在启动服务器...
echo API 服务器地址: http://%IP%:3000
echo 前端应用地址: http://%IP%:8080
echo.
echo 按 Ctrl+C 停止服务器
echo.

REM 启动服务器
start "API 服务器" cmd /c "npm run server"
timeout /t 2 >nul
start "前端应用服务器" cmd /c "npm run serve:static"

REM 打开浏览器
timeout /t 3 >nul
start http://localhost:8080

echo 服务器已启动，请勿关闭此窗口
echo.
pause
