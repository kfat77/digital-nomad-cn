@echo off
chcp 65001 >nul
title C盘大文件迁移到D盘工具
setlocal enabledelayedexpansion

:: ========== 配置 ==========
set "TARGET=D:\MovedFromC"
set "LOG=%TARGET%\迁移日志.txt"
set "TOTAL_FREED=0"

:: ========== 创建目标目录 ==========
if not exist "%TARGET%\Videos" mkdir "%TARGET%\Videos"
if not exist "%TARGET%\Installers" mkdir "%TARGET%\Installers"
if not exist "%TARGET%\压缩包" mkdir "%TARGET%\压缩包"
if not exist "%TARGET%\游戏安装包" mkdir "%TARGET%\游戏安装包"

echo ==========================================
echo    C盘大文件迁移工具
echo    目标: %TARGET%
echo ==========================================
echo.
echo [提示] 本脚本仅迁移: 视频、安装包、压缩包
echo [提示] 游戏文件夹不会自动迁移，避免游戏损坏
echo.
pause
echo.

:: 开始记录日志
echo ===== C盘迁移日志 %date% %time% ===== > "%LOG%"
echo 目标目录: %TARGET% >> "%LOG%"
echo. >> "%LOG%"

:: ========== 迁移 视频文件 ==========
echo [1/4] 正在迁移视频文件...
echo. >> "%LOG%"
echo --- 视频文件迁移 --- >> "%LOG%"

call :move_file "C:\Users\22617\OneDrive\文档\Overwatch\videos\overwatch\file_26-01-06_20-55-10.mp4" "%TARGET%\Videos"

:: ========== 迁移 安装包 (.exe / .msi) ==========
echo [2/4] 正在迁移安装包...
echo. >> "%LOG%"
echo --- 安装包迁移 --- >> "%LOG%"

call :move_file "C:\Users\22617\Downloads\android-studio-quail1-patch2-windows.exe" "%TARGET%\Installers"
call :move_file "C:\Users\22617\Downloads\draw.io-30.2.6-windows-installer.exe" "%TARGET%\Installers"
call :move_file "C:\Users\22617\Downloads\Mineradio-1.1.1-Setup.exe" "%TARGET%\Installers"
call :move_file "C:\Users\22617\Downloads\OpenWiki_0.3.17_x64-setup.exe" "%TARGET%\Installers"
call :move_file "C:\Users\22617\Downloads\SPSS_Statistics_Client_27_Win64_FP001.exe" "%TARGET%\Installers"
call :move_file "C:\Users\22617\OneDrive\Desktop\kimi_3.0.18.exe" "%TARGET%\Installers"
call :move_file "C:\Users\22617\OneDrive\Desktop\game\植物大战僵尸杂交版v2.0.88安装程序.exe" "%TARGET%\游戏安装包"
call :move_file "C:\Users\22617\OneDrive\Desktop\game\植物大战僵尸杂交版v2.1安装程序.exe" "%TARGET%\游戏安装包"

:: ========== 迁移 压缩包 (.zip / .rar) ==========
echo [3/4] 正在迁移压缩包...
echo. >> "%LOG%"
echo --- 压缩包迁移 --- >> "%LOG%"

call :move_file "C:\Users\22617\Downloads\23生医（第三台）.zip" "%TARGET%\压缩包"
call :move_file "C:\Users\22617\Downloads\DesignExpert12.rar" "%TARGET%\压缩包"

:: ========== 可选：迁移游戏缓存（已注释，如需启用请删除行首的 ::） ==========
echo [4/4] 游戏缓存（已跳过）
echo. >> "%LOG%"
echo --- 游戏缓存（已跳过，如需迁移请手动操作） --- >> "%LOG%"
echo 以下游戏缓存/数据已跳过，移动可能导致游戏无法启动: >> "%LOG%"
echo   - Blizzard Entertainment (C盘, 约159MB) >> "%LOG%"
echo   - Steam (C盘, 约265MB) >> "%LOG%"
echo   - Battle.net (C盘, 约605MB) >> "%LOG%"
echo   - NetEase (C盘, 约618MB) >> "%LOG%"
echo. >> "%LOG%"
echo 如果确实需要迁移游戏文件夹，建议: >> "%LOG%"
echo   1. 使用 Steam/Epic 客户端自带的"移动安装文件夹"功能 >> "%LOG%"
echo   2. 或者备份后卸载游戏，重新安装到D盘 >> "%LOG%"
echo. >> "%LOG%"

:: ========== 汇总 ==========
echo.
echo ==========================================
echo    迁移完成!
echo ==========================================
echo   视频文件: 约 306 MB
echo   安装包:   约 3.8 GB
echo   压缩包:   约 637 MB
echo   ------------------------
echo   预计释放: 约 4.7 GB
echo ==========================================
echo.
echo 文件已迁移到: %TARGET%
echo 详细日志: %LOG%
echo.

:: 显示D盘剩余空间
for /f "tokens=3" %%a in ('dir D:\ /-c ^| findstr "可用字节"') do (
    set d_free_raw=%%a
)
set d_free_raw=%d_free_raw:,=%
set /a d_free_gb=%d_free_raw% / 1073741824
echo D盘剩余空间: %d_free_gb% GB
echo.

echo [提示] 如果D盘空间不足，迁移会失败。请检查D盘是否有足够空间。
echo.
pause
endlocal
exit

:: ========== 子程序: 移动文件 ==========
:move_file
set "src=%~1"
set "dst_dir=%~2"
set "filename=%~nx1"

if not exist "%src%" (
    echo   [跳过] 不存在: %filename%
    echo [SKIP] %src% 不存在 >> "%LOG%"
    goto :eof
)

:: 获取文件大小（字节）
for %%F in ("%src%") do set "fsize=%%~zF"

:: 移动文件
echo   [移动] %filename% (约 %fsize% 字节)
move "%src%" "%dst_dir%\" >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] %filename% -^> %dst_dir% >> "%LOG%"
    set /a TOTAL_FREED+=fsize
) else (
    echo [失败] %filename% - 可能文件正在使用中
    echo [FAIL] %filename% >> "%LOG%"
)

goto :eof
