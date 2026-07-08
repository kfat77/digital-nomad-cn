# digital-nomad-cn 测试 + CI/CD 部署指南

## 已完成的工作

### ✅ 测试套件（60 个测试全部通过）

| 测试文件 | 测试数 | 覆盖内容 |
|---------|--------|---------|
| `tests/datasets.test.ts` | 12 | 数据集结构验证、完整性检查、统计验证 |
| `tests/schemas.test.ts` | 10 | JSON Schema 自验证、字段类型检查 |
| `tests/api.test.ts` | 9 | Router 路由测试、错误处理、参数解析 |
| `tests/sdk.test.ts` | 13 | NomadClient 单元测试、错误处理 |
| `tests/mcp-server.test.ts` | 16 | Data Loader 测试、搜索/推荐逻辑 |

### ✅ CI/CD 工作流

| 工作流 | 触发条件 | 功能 |
|--------|---------|------|
| `.github/workflows/test.yml` | PR / Push | 数据验证 → 单元测试 → API测试 → 类型检查 → E2E测试 |
| `.github/workflows/deploy.yml` | Push to main | 测试通过后自动部署到 GitHub Pages |
| `.github/workflows/data-freshness.yml` | 每周一 / 手动 | 检查数据新鲜度，超30天自动创建Issue |

### ✅ E2E 测试配置

- Playwright 配置支持 Chromium/Firefox/WebKit + 移动端
- 测试覆盖：首页加载、导航、国家页、SEO、响应式、性能

---

## 手动推送步骤

在本地仓库执行：

```bash
cd C:/Users/22617/Documents/kimi/workspace/digital-nomad-cn
git push -f origin clean-main:main
```

---

## 本地运行测试

```bash
# 安装依赖
npm install

# 运行所有单元测试
npm test

# 运行特定测试
npx vitest run tests/datasets.test.ts

# 运行 E2E 测试（需要先启动本地服务器）
npx playwright test

# 运行 E2E 测试（带 UI）
npx playwright test --ui
```

---

## 验证 CI/CD

推送后，访问 GitHub Actions 页面查看运行状态：
https://github.com/kfat77/digital-nomad-cn/actions

预期看到：
1. `CI / Test & Validate` 工作流运行
2. 6 个 job 并行/串行执行：validate-data → unit-tests → api-tests → typecheck → e2e-tests → lint
3. 全部通过后，`CI / Deploy` 工作流自动触发
4. 网站部署到 GitHub Pages
