# Maigret 部署与使用 —— 纯新手鼠标操作指南

> 目标：让完全不会命令行的人也能装上、跑起来。
> 适用系统：Windows 10/11（Mac 用户类似，只是下载链接不同）
> 预计耗时：10~15 分钟

---

## 方法一：最简单，双击就能用（推荐新手）

作者给 Windows 用户打了个独立运行包 `.exe`，下载后双击就能跑，**不用装 Python，不用敲命令**。

### 步骤 1：下载 exe 文件
1. 打开浏览器，访问这个链接：
   ```
   https://github.com/soxoj/maigret/releases
   ```
2. 页面往下拉，找到第一个版本（通常是 `Latest`）。
3. 在下面的 **Assets** 区域里，找到名字类似 `maigret_standalone.exe` 的文件。
4. 点击它下载到电脑（通常会进 `下载` 文件夹）。

> 如果下载慢，可以复制链接到迅雷或 IDM 下载；也可以等一等，文件不大（一般几十 MB）。

### 步骤 2：双击运行
1. 打开 `下载` 文件夹，找到 `maigret_standalone.exe`。
2. **双击它**。
3. 如果 Windows 弹出“Windows 已保护你的电脑”，点 **“更多信息” → “仍要运行”**。
4. 程序会弹出一个黑窗口（命令行），提示你输入用户名：
   ```
   Enter username to search:
   ```
5. 用键盘输入你想查的用户名（比如 `testuser`），按回车。
6. 等它跑完，结果会显示在窗口里，同时会在当前文件夹生成报告文件。

### 步骤 3：查看报告
- 黑窗口别急着关，等它跑完（如果网络不好可能要几分钟）。
- 跑完后，它会提示生成了什么文件（比如 `report_testuser.html`）。
- 去 `下载` 文件夹里，双击这些 `.html` 文件就能在浏览器里打开，看图形化结果。

### 进阶用法（可选，需要敲一点点命令）
如果你想生成 PDF 或指定更多选项，需要打开命令行：
1. 按键盘 `Win + R`，输入 `cmd`，按回车（打开黑窗口）。
2. 输入下面命令进入下载文件夹：
   ```cmd
   cd %USERPROFILE%\Downloads
   ```
3. 然后运行（把 `USERNAME` 换成你想查的昵称）：
   ```cmd
   maigret_standalone.exe USERNAME --html
   ```
   - `--html` 表示额外生成一份网页报告。
   - `--pdf` 表示生成 PDF 报告。

---

## 方法二：标准安装（功能最全，推荐长期用）

如果你希望用所有功能（包括网页版、AI 分析、PDF 导出等），建议按下面标准流程安装。步骤稍微多一点，但**全程只点鼠标 + 复制粘贴**，不需要你懂编程。

### 步骤 1：安装 Python 3.10 或更高版本

Maigret 需要 Python 3.10+ 环境，如果电脑没有，先装上。

1. 打开浏览器，访问：
   ```
   https://www.python.org/downloads/
   ```
2. 页面最上面有个黄色按钮写着 **Download Python 3.x.x**，直接点它下载安装包。
3. 下载完成后，**双击运行**安装程序。
4. **最关键的一步**：在安装窗口里，把下面的 **"Add Python to PATH"** 勾选上！
   - 这是一个小复选框，默认没勾，**你一定要勾上**，否则后面找不到命令。
5. 点击 **Install Now**，等进度条跑完，点 Close 关闭。

> 验证装没装上：按 `Win + R`，输入 `cmd`，回车。在弹出的黑窗口里输入 `python --version`，如果显示 `Python 3.10.x` 或更高，说明成功了。

### 步骤 2：打开命令行（只需要复制粘贴）

1. 按键盘 `Win + R`，输入 `cmd`，按回车。这会打开一个黑色窗口（命令提示符）。
2. 在这个窗口里，复制下面这行命令，右键粘贴进去，然后按回车：
   ```cmd
   pip install maigret
   ```
3. 你会看到一堆滚动的文字，表示正在下载安装。等它出现类似 `Successfully installed maigret` 的提示，就说明装好了。

> 如果提示 `pip 不是内部或外部命令`，说明 Python 的 PATH 没加好，回去重看步骤 1 的勾选说明。

### 步骤 3：运行 Maigret

还是刚才的黑窗口，输入：
```cmd
maigret 你要查的用户名
```
比如：
```cmd
maigret john_doe
```
按回车，它就会开始全网搜索了。

### 常用命令模板（直接复制粘贴）

查一个用户，同时生成 HTML 和 PDF 报告：
```cmd
maigret 用户名 --html --pdf
```

查用户，并按标签筛选（比如只查图片站和社交站）：
```cmd
maigret 用户名 --tags photo,dating
```

查多个用户：
```cmd
maigret user1 user2 user3
```

启动网页版界面（在浏览器里操作）：
```cmd
maigret --web 5000
```
运行后，打开浏览器，访问 `http://127.0.0.1:5000`，就能在网页里输入用户名查询了。

---

## 方法三：Docker 一键部署（适合想跑网页版服务的用户）

如果你电脑上装了 Docker Desktop，这是最快的部署方式，一条命令搞定。

### 步骤 1：安装 Docker Desktop（如果还没有）
1. 打开浏览器访问：
   ```
   https://www.docker.com/products/docker-desktop/
   ```
2. 点击 **Download for Windows**，下载后双击安装，一路 Next 即可。
3. 装完后重启电脑，打开 Docker Desktop，等左下角显示绿色（Engine running）。

### 步骤 2：运行 Maigret 容器

1. 打开命令提示符（`Win + R`，输入 `cmd`）。
2. 复制粘贴下面命令：

   **CLI 版（命令行运行）：**
   ```cmd
   docker pull soxoj/maigret:latest
   docker run soxoj/maigret:latest 用户名 --html
   ```

   **Web 版（网页界面）：**
   ```cmd
   docker run -p 5000:5000 soxoj/maigret:web
   ```
   然后浏览器打开 `http://localhost:5000`。

---

## 常见问题（FAQ）

### 1. 运行时被防火墙/杀毒软件拦截怎么办？
- 如果 Windows  Defender 或 360 弹窗，选择 **“允许运行”** 或 **“添加信任”**。
- 不放心的话，可以去 GitHub 官方仓库查看源码，这是开源项目，没有病毒。

### 2. 提示 "Python 版本过低" 怎么办？
- 去 https://www.python.org/downloads/ 重新下载 **3.10 或更高版本**。
- 注意安装时勾选 **Add to PATH**。

### 3. `pip install maigret` 报错或下载特别慢？
- 用国内镜像源安装（速度快很多）：
  ```cmd
  pip install maigret -i https://pypi.tuna.tsinghua.edu.cn/simple
  ```
  直接复制粘贴这条命令即可。

### 4. 生成的报告在哪里？
- 默认在你运行命令时所在的文件夹（比如 `C:\Users\你的用户名\Downloads`）。
- 文件格式可能是 `.html`（网页）、`.pdf`（文档）、`.csv`（表格）。

### 5. 命令行窗口一闪就没了，看不到结果？
- 这是双击运行 exe 的正常现象，建议用 `方法二` 的标准安装，通过 `cmd` 运行，窗口会保持打开。

### 6. 安装完了，怎么更新到最新版？
- 在命令行里运行：
  ```cmd
  pip install --upgrade maigret
  ```

---

## 总结

| 你的情况 | 推荐方法 |
|---------|---------|
| 完全不想敲命令，只想双击运行 | **方法一**（下载 exe） |
| 想功能最全、长期用、会复制粘贴 | **方法二**（装 Python + pip 安装） |
| 电脑有 Docker，想跑网页服务 | **方法三**（Docker 一键部署） |

如果你卡在哪一步，直接把报错截图或文字复制给我，我帮你解决。
