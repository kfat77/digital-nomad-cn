"""
从 Step 2 继续：安装 Python 3.11 + 依赖 + 测试
"""
import os
import subprocess
import time

INSTALLER_PATH = r"C:\Users\22617\AppData\Local\Temp\python-3.11.9.exe"
PYTHON_311 = r"C:\Program Files\Python311\python.exe"
PROJECT_DIR = r"C:\Users\22617\Documents\kimi\workspace\overwatch-assistant"

print("="*50)
print("  Step 2: 安装 Python 3.11")
print("="*50)

if os.path.exists(PYTHON_311):
    print("Python 3.11 已安装，跳过")
else:
    print("正在静默安装 Python 3.11...")
    cmd = [
        INSTALLER_PATH,
        "/quiet",
        "InstallAllUsers=1",
        "PrependPath=1",
        "Include_test=0",
        "Include_tcltk=1",
        "Include_launcher=1",
    ]
    subprocess.run(cmd)
    
    # 等待安装
    for i in range(60):
        if os.path.exists(PYTHON_311):
            print("✓ Python 3.11 安装成功！")
            break
        time.sleep(1)
    else:
        print("✗ 安装超时")
        exit(1)

print("\n" + "="*50)
print("  Step 3: 安装依赖")
print("="*50)

deps = ["Pillow", "numpy", "opencv-python-headless", "translators", "keyboard", "pytesseract"]
for dep in deps:
    print(f"  安装 {dep}...")
    r = subprocess.run([PYTHON_311, "-m", "pip", "install", "--user", dep], capture_output=True)
    print(f"    {'✓' if r.returncode == 0 else '✗'} {dep}")

# EasyOCR（韩文识别更好）
print("  安装 easyocr（可选，韩文识别）...")
r = subprocess.run([PYTHON_311, "-m", "pip", "install", "--user", "easyocr"], capture_output=True, timeout=300)
print(f"    {'✓' if r.returncode == 0 else '✗'} easyocr")

print("\n" + "="*50)
print("  Step 4: 运行测试")
print("="*50)

test = os.path.join(PROJECT_DIR, "test_init.py")
r = subprocess.run([PYTHON_311, test], capture_output=True, text=True, timeout=30)
print(r.stdout)
if r.returncode != 0:
    print(r.stderr)

print("\n" + "="*50)
print("  Step 5: 启动守望先锋辅助插件")
print("="*50)
print("  热键: F11=选区域 F10=翻译 F9=显示/隐藏 Ctrl+Shift+Q=退出")

main = os.path.join(PROJECT_DIR, "main.py")
process = subprocess.Popen(
    [PYTHON_311, main],
    cwd=PROJECT_DIR,
    creationflags=subprocess.CREATE_NEW_CONSOLE
)
print(f"  ✓ 程序已启动 (PID: {process.pid})")
