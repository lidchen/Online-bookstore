@echo off
REM ====================================================
REM init_db.bat - 初始化数据库脚本（Windows）
REM 用法：双击运行 或 在 cmd 中执行
REM
REM 前提条件：
REM   1. 已安装 PostgreSQL 15+
REM   2. PostgreSQL 的 bin 目录已加入 PATH
REM ====================================================

title 网上书店系统 - 数据库初始化
chcp 65001 >nul

echo ========================================
echo   网上书店系统 - 数据库初始化脚本
echo ========================================
echo.

set DB_NAME=bookstore
set SQL_FILE=..\docs\database.sql

REM 1. 检查 psql 是否可用
echo [1/5] 检查 PostgreSQL 环境...
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [失败] 未找到 psql 命令，请确认 PostgreSQL 已安装并加入 PATH
    pause
    exit /b 1
)
echo   [成功] PostgreSQL 环境正常

REM 2. 检查 SQL 文件
echo [2/5] 检查 SQL 文件...
if not exist "%SQL_FILE%" (
    echo   [失败] SQL 文件不存在: %SQL_FILE%
    echo   请确保在 scripts 目录下执行此脚本
    pause
    exit /b 1
)
echo   [成功] 找到 SQL 文件: %SQL_FILE%

REM 3. 创建数据库
echo [3/5] 创建数据库 %DB_NAME%...
psql -U postgres -lqt 2>nul | findstr /C:"%DB_NAME%" >nul
if %ERRORLEVEL% EQU 0 (
    echo   [提示] 数据库 %DB_NAME% 已存在，跳过创建
) else (
    createdb -U postgres %DB_NAME% 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo   [失败] 创建数据库失败，请检查权限
        pause
        exit /b 1
    )
    echo   [成功] 数据库 %DB_NAME% 创建成功
)

REM 4. 执行建表 SQL
echo [4/5] 执行建表 SQL...
psql -U postgres -d %DB_NAME% -f %SQL_FILE% -q 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   [失败] SQL 执行失败，请检查错误信息
    pause
    exit /b 1
)
echo   [成功] SQL 执行完成

REM 5. 验证
echo [5/5] 验证表创建结果...
echo   [成功] 数据库初始化完成！
echo.
echo ========================================
echo   数据库初始化完成！
echo   数据库名: %DB_NAME%
echo ========================================
echo.
echo 连接命令: psql -U postgres -d %DB_NAME%
echo 运行测试数据: seed_data.bat
echo.
pause
