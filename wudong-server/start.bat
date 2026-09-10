@echo off
chcp 65001 >nul
echo ========================================
echo 乌东文旅「行」模块后端启动脚本
echo ========================================
echo.

echo [1/4] 清理旧的 node 进程...
taskkill /F /IM node.exe >nul 2>&1
echo 等待进程完全退出...
timeout /t 3 /nobreak >nul

echo [2/4] 检查端口占用...
netstat -ano | findstr :7001
echo.

echo [3/4] 设置环境变量...
set PORT=7001
set NODE_ENV=local
echo 端口: %PORT%
echo 主机: 127.0.0.1 (仅 IPv4)
echo.

echo [4/4] 启动服务...
echo 如果仍然报端口占用，请查看上面的端口检查结果
echo 找到占用端口的进程 PID，手动执行: taskkill /F /PID <PID>
echo.
npm run dev

pause
