@echo off
chcp 65001 >nul
title C盘一键清理工具
setlocal enabledelayedexpansion

echo =========================================
echo      C盘一键清理工具
echo      安全模式 - 仅清理临时文件
echo =========================================
echo.

:: 检查是否管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [提示] 未以管理员运行，部分系统目录可能无法清理。
    echo [建议] 右键点击此脚本，选择"以管理员身份运行"。
    echo.
    pause
    cls
)

:: 获取清理前可用空间
for /f "tokens=3" %%a in ('dir C:\ /-c ^| findstr "可用字节"') do (
    set before_bytes=%%a
)
:: 去除逗号
set before_bytes=%before_bytes:,=%
set /a before_gb=%before_bytes% / 1073741824

echo [1/8] 当前 C盘可用空间: %before_gb% GB
echo.

:: 1. 清理 Windows Temp
echo [2/8] 正在清理 Windows 系统临时文件...
rd /s /q "C:\Windows\Temp" 2>nul
mkdir "C:\Windows\Temp" 2>nul
echo        ✓ 完成

:: 2. 清理用户 Temp
echo [3/8] 正在清理用户临时文件...
rd /s /q "%LOCALAPPDATA%\Temp" 2>nul
mkdir "%LOCALAPPDATA%\Temp" 2>nul
echo        ✓ 完成

:: 3. 清理 Windows Update 下载缓存
echo [4/8] 正在清理 Windows Update 下载缓存...
rd /s /q "C:\Windows\SoftwareDistribution\Download" 2>nul
mkdir "C:\Windows\SoftwareDistribution\Download" 2>nul
echo        ✓ 完成

:: 4. 清理 Windows 日志和 Prefetch
echo [5/8] 正在清理 Windows 日志和 Prefetch 缓存...
rd /s /q "C:\Windows\Logs" 2>nul
mkdir "C:\Windows\Logs" 2>nul
rd /s /q "C:\Windows\Prefetch" 2>nul
mkdir "C:\Windows\Prefetch" 2>nul
echo        ✓ 完成

:: 5. 清理 Updater 缓存
echo [6/8] 正在清理各类更新缓存...
rd /s /q "%LOCALAPPDATA%\kimi-desktop-updater" 2>nul
rd /s /q "%LOCALAPPDATA%\draw.io-updater" 2>nul
rd /s /q "%LOCALAPPDATA%\mineradio-updater" 2>nul
rd /s /q "%LOCALAPPDATA%\QianwenUpdater" 2>nul
rd /s /q "%LOCALAPPDATA%\Package Cache" 2>nul
rd /s /q "%LOCALAPPDATA%\Downloaded Installations" 2>nul
echo        ✓ 完成

:: 6. 清理 pip 缓存
echo [7/8] 正在清理 Python pip 缓存...
rd /s /q "%LOCALAPPDATA%\pip" 2>nul
:: 如果安装了 pip，也可以运行 pip cache purge
where pip >nul 2>&1
if %errorLevel% equ 0 (
    pip cache purge 2>nul
)
echo        ✓ 完成

:: 7. 清理浏览器缓存（Chrome 和 Edge）
echo [8/8] 正在清理浏览器缓存...
:: Chrome
rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" 2>nul
rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Code Cache" 2>nul
:: Edge
rd /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache" 2>nul
rd /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Code Cache" 2>nul
echo        ✓ 完成

:: 8. 清理回收站（可选，取消下一行注释即可启用）
:: echo [9/9] 正在清空回收站...
:: rd /s /q "%SystemDrive%\$Recycle.Bin" 2>nul
:: echo        ✓ 完成

:: 重新计算空间
for /f "tokens=3" %%a in ('dir C:\ /-c ^| findstr "可用字节"') do (
    set after_bytes=%%a
)
set after_bytes=%after_bytes:,=%
set /a after_gb=%after_bytes% / 1073741824
set /a freed=%after_gb% - %before_gb%

echo.
echo =========================================
echo      清理完成！
echo =========================================
echo   清理前可用: %before_gb% GB
echo   清理后可用: %after_gb% GB
echo   释放空间:   %freed% GB
echo =========================================
echo.

:: 额外提示
if %freed% lss 1 (
    echo [提示] 释放空间较少，可能是有程序正在占用临时文件。
    echo [建议] 重启电脑后再次运行，或手动清理 Downloads 文件夹。
)

echo 按任意键退出...
pause >nul
endlocal
exit
