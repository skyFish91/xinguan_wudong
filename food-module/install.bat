@echo off
chcp 65001 >nul
title 食模块 - 安装依赖

echo ============================================
echo   首次运行：安装前后端依赖
echo ============================================

echo [1/2] 安装后端依赖（server）...
cd /d "%~dp0server"
call npm install

echo [2/2] 安装前端依赖（web）...
cd /d "%~dp0web"
call npm install

echo.
echo 依赖安装完成，可运行 start.bat 启动
pause
