# 贡献指南

感谢参与 Nomad Essentials。请先通过 Issue 说明问题或改进方向，再提交小而聚焦的 Pull Request。

## 提交前检查

```powershell
npm run check
npm run sitemap
```

页面内容、投资、税务和法律信息必须附带可靠来源或明确的更新时间。不要提交密钥、服务端令牌、个人信息或未压缩的大型构建产物。

## 目录约定

- `docs/` 是唯一的 GitHub Pages 部署根目录。
- `supabase/` 只存放数据库结构和安全 RPC 脚本。
- `scripts/` 只存放仍在使用、可重复运行的维护脚本。
- 自动化配置放在 `.github/`，不要把生成文件或临时调试文件提交到仓库根目录。
