# 获取 Telegram Chat ID 的三种方法（任选一种，30秒搞定）

> Chat ID 是 Telegram 给你的唯一数字编号，脚本需要用它来知道"把消息发给谁"。

---

## 方法一：用 @userinfobot（最简单，推荐 ⭐）

1. 打开 Telegram
2. 在顶部搜索框输入：`@userinfobot`
3. 点击搜索结果里的 **@userinfobot**
4. 点击底部 **「Start」** 按钮
5. 机器人立刻回复你一条消息，类似：

```
Id: 123456789
First: 你的名字
Last: 你的姓
Username: @你的用户名
Language: zh-hans
```

**把 `Id:` 后面那个数字记下来**（比如 `123456789`），这就是你的 Chat ID。

> 💡 这个数字**不要分享给任何人**，它相当于你的 Telegram 用户编号。

---

## 方法二：用你的机器人获取（如果方法一排除了）

如果你不想用 @userinfobot，也可以通过你自己的机器人获取：

1. 在 Telegram 里找到你的机器人 **@DFforZbot**
2. 点击底部 **「Start」** 按钮（或者发送 `/start`）
3. 打开浏览器，地址栏输入（把 `<你的Token>` 换成 BotFather 给你的完整 Token）：

```
https://api.telegram.org/bot<你的Token>/getUpdates
```

例如：
```
https://api.telegram.org/bot8933085602:AAGzapye0eMTzKyW0Hej_PuzjqU3kULJFqk/getUpdates
```

4. 按回车，浏览器会显示一段 JSON 文字，找到里面 `"chat":{"id":123456789` 这样的内容
5. **那个数字（比如 `123456789`）就是你的 Chat ID**

> ⚠️ 如果显示 `{"ok":true,"result":[]}`（空的），说明你还没给机器人发过消息。先回 Telegram 给机器人发一条消息，再刷新浏览器。

---

## 方法三：把机器人拉到群里（获取群组 Chat ID）

如果你想让日报推送到**群组**而不是私聊：

1. 在 Telegram 创建一个群组（或者打开现有群组）
2. 点击群组名称 → **添加成员** → 搜索你的机器人 **@DFforZbot** → 添加进去
3. 在群里发一条消息（随便发什么都行，比如 "test"）
4. 用方法二里的 API 链接访问 `getUpdates`
5. 找到最新的记录， `"chat":{"id":-123456789` —— **注意群组 ID 是负数，比如 `-123456789`**
6. 这个负数（包括负号！）就是你的群组 Chat ID

---

## ✅ 拿到 Chat ID 后做什么？

1. 回到 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. **Name** 填：`TELEGRAM_CHAT_ID`
4. **Secret** 填你刚拿到的数字（如 `123456789` 或 `-123456789`）
5. 点击 **Add secret**
6. 回到 Actions 页面，再点一次 **Run workflow** 测试！

---

## 🆘 常见问题

**Q：@userinfobot 搜索不到？**
> 确保你输入的是 `@userinfobot`，不是 `@userinfo_bot` 或其他变体。如果还是搜不到，试试方法二。

**Q：getUpdates 返回空的 `{"ok":true,"result":[]}`？**
> 你必须先给机器人发过消息！回到 Telegram，找到你的机器人，点 Start 或随便发一条消息，然后再刷新浏览器。

**Q：Chat ID 很长，复制时容易漏数字？**
> 双击数字可以全选，或者长按选择后复制。确保没有多复制空格或标点。

**Q：我不确定 Token 对不对，怎么验证？**
> 把 Token 完整粘贴到这个网址里访问：
> `https://api.telegram.org/bot<你的Token>/getMe`
> 如果返回 `{"ok":true,"result":{"id":...,"first_name":"DFforZ",...}}`，说明 Token 是对的。

---

**拿到 Chat ID 了吗？拿到了就可以直接告诉我数字，或者去 GitHub 填上再跑一次！**
