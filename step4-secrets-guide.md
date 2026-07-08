# Step 4 超详细教程：配置 Secrets（全程鼠标操作，5分钟搞定）

> 这一步是把你从 Telegram 拿到的 Token/ID，以及你想跟踪的股票代码，安全地存到 GitHub 里。脚本运行时会自动读取这些值，不需要你写任何代码。

---

## 📋 先看你一共要填几个东西

| 优先级 | Name | 填什么 | 必填？ |
|--------|------|--------|--------|
| 1 | `TELEGRAM_BOT_TOKEN` | 你从 BotFather 拿到的 Token | ✅ 必填 |
| 2 | `TELEGRAM_CHAT_ID` | 你从 @userinfobot 拿到的数字 | ✅ 必填 |
| 3 | `STOCK_LIST_A` | 你想跟踪的 A股代码，逗号分隔 | ❌ 可选 |
| 4 | `STOCK_LIST_US` | 你想跟踪的美股代码，逗号分隔 | ❌ 可选 |
| 5 | `CRYPTO_LIST` | 你想跟踪的加密货币 ID，逗号分隔 | ❌ 可选 |
| 6 | `GEMINI_API_KEY` | 免费的 Gemini API Key，让 AI 帮你写总结 | ❌ 可选 |

> **建议**：先填前 2 个必填的，跑通一次后再回来加自选股和 AI。

---

## 🖱️ 具体操作步骤

### 第 0 步：确认你已经在正确的仓库里

打开浏览器，地址栏输入：

```
https://github.com/kfat77/daily-finance-telegram
```

按回车。如果你 Fork 了，那就打开你 Fork 后的仓库地址（`https://github.com/你的用户名/daily-finance-telegram`）。

**确认方法**：页面左上角应该显示仓库名 `kfat77/daily-finance-telegram`（或你的用户名）。

---

### 第 1 步：打开 Settings 页面

在仓库页面**顶部导航栏**（有一排 tab：Code、Issues、Pull requests、Actions...），找到最右边的 **「Settings」**，点击它。

```
页面顶部导航栏的样子：
┌──────────────────────────────────────────────────────────────┐
│  Code  │  Issues  │  Pull requests  │  Actions  │  Settings  │
└──────────────────────────────────────────────────────────────┘
                                                  ↑ 点这里
```

---

### 第 2 步：找到 Secrets 设置入口

点击 Settings 后，页面左侧会出现一个**竖向菜单**。往下滑动，找到：

```
Secrets and variables
    └── Actions
```

点击 **「Actions」**。

> 💡 如果左侧菜单太长找不到，可以用浏览器搜索功能（按 `Ctrl+F`），输入 "Secrets" 快速定位。

---

### 第 3 步：开始新建 Secret

点击 Actions 后，右侧主区域会显示一个页面，标题大概是 **"Actions secrets and variables"**。

页面中间偏上有一个**绿色按钮**，写着：

```
🟢 New repository secret
```

点击这个绿色按钮。

---

### 第 4 步：填写第一个必填项 —— TELEGRAM_BOT_TOKEN

点击绿色按钮后，页面会出现一个表单，有两个输入框：

```
Name  [__________________________]

Secret [__________________________]
                    [🟢 Add secret]
```

**第一个输入框 Name**：完整复制粘贴（注意大小写和 underscores）：
```
TELEGRAM_BOT_TOKEN
```

**第二个输入框 Secret**：粘贴你从 BotFather 拿到的 Token，格式类似：
```
123456789:ABCdefGHIjklMNOpqrsTUVwxyz123456789
```

然后点击下方的 **🟢 Add secret** 按钮。

> ⚠️ **注意**：Token 很长，确保你复制了完整的一整串，不要只复制了一半！

---

### 第 5 步：填写第二个必填项 —— TELEGRAM_CHAT_ID

上一步成功后，页面会回到 Secrets 列表，显示你刚添加的 `TELEGRAM_BOT_TOKEN`（但 Secret 值会被隐藏成 `***`）。

再次点击 **🟢 New repository secret** 按钮，填第二个：

**Name**：
```
TELEGRAM_CHAT_ID
```

**Secret**：粘贴你从 @userinfobot 拿到的数字，例如：
```
123456789
```

> ⚠️ **注意**：这里只填**纯数字**，不要带引号、不要带 `@`、不要有空格！

点击 **🟢 Add secret**。

---

### 第 6 步（可选）：添加 A股自选股 —— STOCK_LIST_A

再次点击 **🟢 New repository secret**。

**Name**：
```
STOCK_LIST_A
```

**Secret**：填写你想跟踪的 A股代码，**用英文逗号分隔，不要空格**，例如：
```
600519,000858,002594,300750
```

> 📌 代码规则：就是你在炒股软件里看到的 6 位数字代码，不需要加市场后缀。

点击 **🟢 Add secret**。

---

### 第 7 步（可选）：添加美股自选股 —— STOCK_LIST_US

再次点击 **🟢 New repository secret**。

**Name**：
```
STOCK_LIST_US
```

**Secret**：填写美股代码，英文逗号分隔，例如：
```
AAPL,TSLA,NVDA,MSFT,GOOGL
```

点击 **🟢 Add secret**。

---

### 第 8 步（可选）：添加加密货币 —— CRYPTO_LIST

再次点击 **🟢 New repository secret**。

**Name**：
```
CRYPTO_LIST
```

**Secret**：填写加密货币 ID（注意是 **CoinGecko 的 ID**，不是币的简称），英文逗号分隔。

常见币的 ID：

| 币种 | CoinGecko ID |
|------|-------------|
| 比特币 | `bitcoin` |
| 以太坊 | `ethereum` |
| 索拉纳 | `solana` |
| 瑞波币 | `ripple` |
| 币安币 | `binancecoin` |
| 狗狗币 | `dogecoin` |
| 卡尔达诺 | `cardano` |
| 波卡 | `polkadot` |

例如填：
```
bitcoin,ethereum,solana,dogecoin
```

> 🔍 如果你想知道其他币的 ID：
> 1. 打开 https://www.coingecko.com/
> 2. 搜索你想加的币（比如 "Chainlink"）
> 3. 点进去，看浏览器地址栏：`https://www.coingecko.com/en/coins/chainlink`
> 4. 最后那个 `chainlink` 就是 ID

点击 **🟢 Add secret**。

---

### 第 9 步（可选，进阶）：添加 AI 分析 —— GEMINI_API_KEY

如果你想要日报最后多一段 AI 写的市场总结，可以免费申请 Gemini 的 API Key。

**申请方法（免费，2分钟）：**
1. 浏览器打开 https://aistudio.google.com/app/apikey
2. 用 Google 账号登录
3. 点击 **「Create API key」**
4. 复制生成的 Key（一长串字符）

然后回到 GitHub Secrets，点击 **🟢 New repository secret**：

**Name**：
```
GEMINI_API_KEY
```

**Secret**：粘贴你刚才复制的 Gemini Key。

点击 **🟢 Add secret**。

> 💡 Gemini 免费版每月有 1500 次请求，本项目每天只用 1 次，完全够用。

---

## ✅ 填完之后的检查清单

回到 Secrets 列表页面，你应该能看到类似这样的列表：

```
Repository secrets (4)

  Name                      Updated
  ─────────────────────────────────
  TELEGRAM_BOT_TOKEN        2 minutes ago
  TELEGRAM_CHAT_ID          2 minutes ago
  STOCK_LIST_A              1 minute ago
  STOCK_LIST_US             1 minute ago
  CRYPTO_LIST               1 minute ago
```

（你填了几个就显示几个，没填的可选项不会显示，这很正常。）

**确认每个 Name 都完全正确**（字母大小写、下划线位置都不能错）：
- ✅ `TELEGRAM_BOT_TOKEN` ✗ `telegram_bot_token` ✗ `TELEGRAM-BOT-TOKEN`
- ✅ `TELEGRAM_CHAT_ID` ✗ `telegram_chat_id` ✗ `chat_id`
- ✅ `STOCK_LIST_A` ✗ `stock_list_a` ✗ `A_STOCKS`

---

## 🆘 常见问题

**Q：Token 填完之后要不要加引号？**
> 不要！Secret 框里直接粘贴纯文本即可，不要加 `'` 或 `"`。

**Q：Chat ID 是负数怎么办？**
> 如果你把机器人拉到了**群组**里，Chat ID 可能是负数（比如 `-123456789`），这完全正常，直接粘贴进去即可，负号也要保留。

**Q：我不填自选股，是不是就什么都收不到？**
> 不是！不填自选股也会收到 **A股三大指数 + 美股三大指数 + 默认加密货币（比特币+以太坊）**。填自选股只是额外加上你关心的个股。

**Q：Secret 填错了怎么改？**
> 在 Secrets 列表里找到填错的那一项，点击它右边的 **🖊️ Update**（铅笔图标），重新输入正确的值，再点 **Update secret**。

**Q：我不小心把 Token 泄露到聊天记录里了怎么办？**
> 立刻去 Telegram 找 @BotFather，发送 `/revoke`，选择你的机器人，BotFather 会生成一个新的 Token，旧的立即失效。然后回来更新 GitHub 里的 Secret。

**Q：可以跟踪港股吗？**
> 目前脚本主要覆盖 A股、美股、加密货币。港股代码（如 `00700`）如果填到 `STOCK_LIST_A` 里可能无法识别。后续可以扩展，有需求随时告诉我。

---

## 🎯 填完 Secrets 后该做什么？

1. 回到仓库页面 → 点击顶部 **「Actions」**
2. 如果看到黄色提示 `Workflows aren't being run on this repository`，点击 **「I understand my workflows, go ahead and enable them」**
3. 然后点击左侧的 **「Daily Finance Report」**
4. 点击右侧 **「Run workflow」** → 再点一次 **「Run workflow」**
5. 等待 1-2 分钟，看到绿色 ✔️ 后，打开 Telegram 检查消息！

---

**如果还有任何步骤不清楚，直接截图发给我，我帮你排查！**
