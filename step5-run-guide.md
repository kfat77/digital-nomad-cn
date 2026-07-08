# Step 5 超详细教程：运行你的第一个日报（全程鼠标操作，3分钟搞定）

> 这是最后一步！你的仓库里已经有脚本、已经填好了 Secrets，现在只需要点几下鼠标，让 GitHub 自动运行脚本，把日报推送到你的 Telegram。

---

## 📋 这一步你要做什么

| 步骤 | 动作 | 目的 |
|------|------|------|
| 1 | 进入 Actions 页面 | 打开 GitHub 自动化任务面板 |
| 2 | 启用 Actions | 告诉 GitHub "我同意运行这些自动化脚本" |
| 3 | 找到 Daily Finance Report | 定位到你的日报任务 |
| 4 | 手动触发运行 | 立刻跑一次，测试能不能收到消息 |
| 5 | 等待结果 | 看绿色勾还是红色叉 |
| 6 | 打开 Telegram | 验收成果！ |

---

## 🖱️ 具体操作步骤

### 第 0 步：确认你已经在正确的仓库里

打开浏览器，地址栏输入：

```
https://github.com/kfat77/daily-finance-telegram
```

按回车。如果你 Fork 了，那就打开你 Fork 后的仓库地址。

**确认方法**：页面左上角应该显示仓库名，比如 `kfat77/daily-finance-telegram`。

---

### 第 1 步：打开 Actions 页面

在仓库页面**顶部导航栏**（有一排 tab），找到 **「Actions」**，点击它。

```
页面顶部导航栏：
┌──────────────────────────────────────────────────────────────┐
│  Code  │  Issues  │  Pull requests  │  Actions  │  Settings  │
└──────────────────────────────────────────────────────────────┘
                                    ↑ 点这里
```

点击后，页面会跳转到 Actions 面板。

---

### 第 2 步：启用 Actions（第一次打开会看到黄色提示）

如果是**第一次**进入 Actions 页面，你会看到一个**黄色横条提示**，上面写着类似：

> ⚠️ **Workflows aren't being run on this repository yet.**
> 
> The owner of this repository has not yet enabled Actions. To request that the owner enable Actions, you can contact them. Alternatively, you can enable Actions on your fork by clicking the button below.
> 
> [ 🟢 I understand my workflows, go ahead and enable them ]

**注意**：
- 如果是你自己的仓库（没有 Fork），可能**没有这个提示**，直接跳到第 3 步。
- 如果你是 Fork 的仓库，**必须点这个按钮**才能运行。

**操作**：点击那个绿色按钮：

```
🟢 I understand my workflows, go ahead and enable them
```

点击后，页面会刷新，左侧会出现工作流列表。

> 💡 如果点击后没有反应，刷新一下页面（按 F5）。

---

### 第 3 步：找到 "Daily Finance Report" 工作流

页面刷新后，**左侧边栏**会显示一个列表，类似：

```
Workflows
├── All workflows
├── Daily Finance Report        ← 找这个！
├── CI
└── ...
```

点击 **「Daily Finance Report」**。

> 📌 如果左侧列表是空的、或者找不到这个名字，说明你还没有创建 workflow 文件。
> 
> 解决方法：回到仓库首页 → 点击 **「Add file」** → **「Create new file」** → 文件名填 `.github/workflows/daily-report.yml` → 把 README 里的那段 YAML 代码粘贴进去 → 点 **Commit new file**。然后再回来。

---

### 第 4 步：手动触发运行（Run workflow）

点击 "Daily Finance Report" 后，右侧主区域会显示这个工作流的运行历史。

**第一次进来时**，历史记录是空的，你会看到一行提示：

```
This workflow has no runs yet.
```

在页面**右侧偏上**的位置（可能在提示文字下方或旁边），有一个**灰色按钮**，上面写着：

```
⚙️ Run workflow
```

**操作步骤**：

1. 点击 **「Run workflow」** 按钮
2. 会弹出一个下拉框/小面板，显示一些选项（通常不用改）
3. 下拉框里有一个**绿色的「Run workflow」按钮**，再次点击它

```
点击流程：

[⚙️ Run workflow]          ← 第 1 次点击
        ↓
┌─────────────────────────┐
│ Branch: main            │
│ Use workflow from       │
│ ...                     │
│ [🟢 Run workflow]       │ ← 第 2 次点击（绿色的）
└─────────────────────────┘
```

> ⚠️ **注意要点两次**：第一次是打开选项面板，第二次才是真正的运行按钮。

点击绿色按钮后，页面会自动刷新，列表里会出现一行新的记录。

---

### 第 5 步：等待运行结果

刷新后，你会看到列表里多了一行：

```
Runs

Daily Finance Report
#1  Daily Finance Report    ⏳ 黄色圆圈    几秒前    main
```

旁边有一个**黄色圆圈** `⏳`（或者橙色点），表示"正在运行中"。

**等待 1-3 分钟**，刷新页面（按 F5）。状态会变成以下之一：

| 图标 | 颜色 | 含义 | 下一步 |
|------|------|------|--------|
| ⏳ | 黄色/橙色 | 正在运行 | 再等一会儿，刷新 |
| ✅ | **绿色** | **成功！** | 打开 Telegram 看消息 |
| ❌ | 红色 | 出错了 | 点进去看报错信息 |

---

### 第 6 步：检查运行详情（如果出错了）

如果看到**红色叉** ❌，点击那一行，进入详情页面。

页面会显示类似：

```
Daily Finance Report #1
❌ Failure

report
  ❌ Run daily report
     Error: ... (这里是报错信息)
```

**常见的报错和解决**：

| 报错信息 | 原因 | 解决 |
|---------|------|------|
| `TELEGRAM_BOT_TOKEN not found` | Secrets 没填或填错了名字 | 回去检查 Settings → Secrets，确认 Name 完全正确 |
| `TELEGRAM_CHAT_ID not found` | Chat ID 没填 | 同上 |
| `ModuleNotFoundError: No module named 'akshare'` | 依赖没装好 | 通常是临时的，再跑一次就好 |
| `CoinGecko API rate limit` | 加密货币 API 限流 | 等 5 分钟再跑一次 |
| `403 Forbidden` | GitHub Actions 权限问题 | 确认你启用了 Actions（第 2 步） |

**如果报错看不懂**，直接截图发给我，我帮你排查。

---

### 第 7 步：打开 Telegram 验收成果！

如果看到**绿色勾** ✅，恭喜你！日报已经推送成功了。

**立刻打开 Telegram**，找到你和机器人的对话（或者你拉机器人进去的群组），应该能看到一条新消息：

```
📊 每日财经日报 📊
🕐 2026-07-04 18:30

🇨🇳 A股市场
🟢 上证指数: xxxx (+x.xx%)
🟢 深证成指: xxxx (+x.xx%)
🔴 创业板指: xxxx (-x.xx%)

🇺🇸 美股市场
🟢 标普500: xxxx (+x.xx%)
...

₿ 加密货币
🟢 BITC: $xx,xxx (+x.xx% /24h)
🟢 ETH: $x,xxx (+x.xx% /24h)

💡 数据仅供参考，不构成投资建议
```

🎉 **至此，你的日报系统完全跑通了！**

---

## ⏰ 之后的事情：全自动运行

你刚才做的是**手动触发**测试。从明天开始，GitHub 会自动在以下时间运行：

| 时间 | 说明 |
|------|------|
| 工作日 18:30（北京时间） | A股收盘后自动推送 |
| 你也可以随时手动触发 | 点击 Run workflow 即可 |

如果你想改时间：
1. 仓库首页 → 点击 `.github/workflows/daily-report.yml`
2. 点击右上角 **🖊️ 铅笔图标**（Edit this file）
3. 找到 `cron: '30 10 * * 1-5'`
4. 修改数字：
   - `30 10` = 北京时间 18:30（UTC+8）
   - `0 12` = 北京时间 20:00
   - `30 1` = 北京时间 09:30（盘前）
5. 点 **Commit changes**

---

## 🆘 常见问题

**Q：我点了 Run workflow 但 Telegram 没收到消息？**
> 先确认是绿色 ✅ 还是红色 ❌。如果是绿色但没收到，检查：
> 1. Token 和 Chat ID 是否填对了（有没有多余空格）
> 2. 你有没有给机器人发过 Start 消息
> 3. 你是不是把 Chat ID 填到了 Token 的位置

**Q：列表里显示 "This workflow has no runs yet"，但没有 Run workflow 按钮？**
> 你可能是 Fork 的仓库但没有启用 Actions。先点黄色提示里的 "I understand... enable them"。

**Q：为什么只有加密货币数据，A股和美股显示"获取失败"？**
> 可能是网络问题。A股数据来自 AkShare，美股来自 YFinance，这两个偶尔会因为网络波动失败。等几分钟再跑一次通常就好了。

**Q：我想每天推两次（早一次晚一次），怎么改？**
> 打开 `.github/workflows/daily-report.yml`，找到 `schedule:` 部分，改成：
> ```yaml
> schedule:
>   - cron: '30 1 * * 1-5'   # 早上 9:30
>   - cron: '30 10 * * 1-5'  # 晚上 18:30
> ```

**Q：怎么关闭自动推送？**
> Actions 页面 → Daily Finance Report → 右上角 **「...」** → **「Disable workflow」**

---

## ✅ 全部完成清单

| 步骤 | 状态 |
|------|------|
| 创建 Telegram 机器人 ✅ | |
| 获取 Token 和 Chat ID ✅ | |
| 创建 workflow 文件 ✅ | |
| 填写 Secrets ✅ | |
| 启用 Actions ✅ | |
| 手动运行测试 ✅ | |
| 收到 Telegram 消息 ✅ | |

**全部搞定！以后每天 18:30 自动收日报，一分钱不用花！**

---

**如果运行时报错了，直接截图 Actions 页面的报错信息发给我，我帮你解决！**
