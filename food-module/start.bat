@echo off
chcp 65001 >nul
title 食模块（餐饮美食）独立演示环境

set ROOT=%~dp0

echo ============================================
echo   食模块（餐饮美食）独立演示环境
echo ============================================
echo.

echo [1/4] 启动内存版 Redis（端口 6379）...
start "wudong-redis" /D "%ROOT%" cmd /c "node fake-redis.js"

echo [2/4] 检查后端配置（server\.env）...
if not exist "%ROOT%server\.env" (
    echo       未找到 server\.env，自动从 .env.example 复制...
    copy "%ROOT%server\.env.example" "%ROOT%server\.env" >nul
    echo       已生成 server\.env，数据库密码默认 root，如需修改请编辑该文件
)
echo       启动后端（端口 7001）...
start "wudong-server" /D "%ROOT%server" cmd /k "chcp 65001 >nul && npm run dev"

echo [3/4] 启动前端（端口 5173）...
start "wudong-web" /D "%ROOT%web" cmd /k "chcp 65001 >nul && npm run dev"

echo [4/4] 等待服务就绪并打开浏览器...
timeout /t 25 /nobreak >nul
start http://localhost:5173/

echo.
echo ============================================
echo   后端 API : http://127.0.0.1:7001
echo   前端页面 : http://localhost:5173
echo.
echo   测试账号：
echo     管理员   13800000000 / admin123
echo     普通用户 13800000001 / user123
echo     食商家   13800000003 / merchant123
echo ============================================
echo.
echo   注意：数据库密码请编辑 server\.env 文件（默认 root）
pause
