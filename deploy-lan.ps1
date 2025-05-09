# 项目进度管理系统 - 局域网部署脚本
Write-Host "项目进度管理系统 - 局域网部署脚本" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js 是否安装
try {
    $nodeVersion = node -v
    Write-Host "Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "错误: 未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

# 检查是否有正在运行的 Node.js 进程
Write-Host "正在检查是否有正在运行的服务器..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "发现正在运行的 Node.js 进程，正在停止..." -ForegroundColor Yellow
    Stop-Process -Name "node" -Force
    Start-Sleep -Seconds 2
}

# 安装依赖
Write-Host "正在安装依赖..." -ForegroundColor Yellow
npm install

# 确保 db.json 文件存在
if (-not (Test-Path "db.json")) {
    Write-Host "正在创建 db.json 文件..." -ForegroundColor Yellow
    Copy-Item "db.json.example" "db.json"
}

# 构建前端应用
Write-Host "正在构建前端应用..." -ForegroundColor Yellow
npm run build:lan

# 获取本机 IP 地址
$ipAddress = (Get-NetIPAddress | Where-Object {$_.AddressFamily -eq "IPv4" -and $_.IPAddress -notlike "127.0.0.1" -and $_.IPAddress -notlike "192.168.56.*"}).IPAddress
if (-not $ipAddress) {
    $ipAddress = "localhost"
}

# 更新配置文件中的 IP 地址
$configFile = "src\config.js"
$configContent = Get-Content $configFile -Raw
$newConfigContent = $configContent -replace '(API_URL: .http://)[^:]+(:3000)', "`$1$ipAddress`$2"
Set-Content -Path $configFile -Value $newConfigContent -Encoding UTF8

# 显示服务器地址
Write-Host ""
Write-Host "服务器地址:" -ForegroundColor Green
Write-Host "API 服务器: http://$ipAddress`:3000" -ForegroundColor Cyan
Write-Host "前端应用: http://$ipAddress`:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

# 启动服务器
Start-Process powershell -ArgumentList "-Command npm run server" -WindowStyle Normal
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-Command npm run serve:static" -WindowStyle Normal

# 打开浏览器
Start-Sleep -Seconds 3
Start-Process "http://localhost:8080"

Write-Host "服务器已启动，您可以关闭此窗口" -ForegroundColor Green
Write-Host ""
