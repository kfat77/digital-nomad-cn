# 🤖 @digital-nomad-cn/mcp

> MCP (Model Context Protocol) Server for Digital Nomad CN  
> 让 ChatGPT、Claude、Cursor、Windsurf 等 AI Agent 直接查询全球数字游民数据

---

## 安装

### Claude Desktop

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) 或 `%APPDATA%\Claude\claude_desktop_config.json` (Windows)：

```json
{
  "mcpServers": {
    "digital-nomad": {
      "command": "npx",
      "args": ["-y", "@digital-nomad-cn/mcp@latest"]
    }
  }
}
```

### Cursor

在 Cursor Settings → MCP 中添加：

```json
{
  "mcpServers": {
    "digital-nomad": {
      "command": "npx",
      "args": ["-y", "@digital-nomad-cn/mcp@latest"]
    }
  }
}
```

### Windsurf

在 Windsurf Settings → Cascade 中添加 MCP Server：

```json
{
  "mcpServers": {
    "digital-nomad": {
      "command": "npx",
      "args": ["-y", "@digital-nomad-cn/mcp@latest"]
    }
  }
}
```

### 本地开发

```bash
git clone https://github.com/kfat77/digital-nomad-cn.git
cd digital-nomad-cn/packages/mcp-server
npm install
npm run build
node dist/index.js
```

---

## 可用工具

| 工具 | 描述 | 示例查询 |
|------|------|----------|
| `nomad_search_countries` | 搜索国家 | "东南亚有哪些国家？" |
| `nomad_get_country` | 获取国家详情 | "泰国的信息" |
| `nomad_list_regions` | 列出所有区域 | "你们覆盖哪些区域？" |
| `nomad_compare_countries` | 对比国家 | "泰国和马来西亚哪个好？" |
| `nomad_recommend` | 智能推荐 | "推荐一个数字游民目的地" |
| `nomad_get_stats` | 数据集统计 | "有多少个国家数据？" |

---

## 使用示例

### 与 Claude 对话

```
User: 帮我找一个适合数字游民的东南亚国家

Claude: [调用 nomad_recommend]
       → 推荐泰国、马来西亚、印度尼西亚...

Claude: 根据数据，我为你推荐以下东南亚国家：
        1. 🇹🇭 泰国（Thailand）— 位于 southeast-asia，数据状态 active
        2. 🇲🇾 马来西亚（Malaysia）— ...
```

### 与 Cursor 对话

```
User: 写一个脚本，对比泰国和越南的数字游民数据

Cursor: [调用 nomad_compare_countries with ids: ["thailand", "vietnam"]]
        → 获取对比数据

Cursor: [生成代码]
```

---

## 数据说明

MCP Server 直接读取 `datasets/countries.json`，因此：
- **离线可用**：安装后无需网络即可查询
- **实时更新**：数据更新后重启 MCP Server 即可生效
- **100 国覆盖**：当前包含 100 个国家/地区的基础数据

---

## 许可证

MIT
