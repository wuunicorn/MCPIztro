# 📚 GitHub 发布指南

本指南将帮助您将紫微斗数 MCP 服务器项目发布到 GitHub。

## 🚀 快速发布步骤

### 1. 创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 仓库名称建议使用：`ziwei-mcp-server`
4. 添加描述：`紫微斗数 MCP 服务器 - 基于 iztro 库`
5. 选择 "Public"（公开）或 "Private"（私有）
6. **不要** 勾选 "Add a README file"（因为我们已经有了）
7. 点击 "Create repository"

### 2. 更新项目配置

在发布前，请更新以下文件中的 GitHub 用户名：

#### 更新 `package.json`
将所有 `yourusername` 替换为您的 GitHub 用户名：
```json
"repository": {
  "type": "git",
  "url": "git+https://github.com/YOUR_USERNAME/ziwei-mcp-server.git"
},
"bugs": {
  "url": "https://github.com/YOUR_USERNAME/ziwei-mcp-server/issues"
},
"homepage": "https://github.com/YOUR_USERNAME/ziwei-mcp-server#readme"
```

#### 更新 `README.md`
将文件中的 `yourusername` 替换为您的 GitHub 用户名。

### 3. 初始化 Git 仓库

在项目目录中执行以下命令：

```bash
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 创建首次提交
git commit -m "🎉 Initial commit: Ziwei MCP Server v1.0.0

- ✨ 完整的紫微斗数排盘功能
- ✨ 支持运限分析
- ✨ MCP 协议兼容
- ✨ 多语言支持
- 📝 完整文档"

# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/ziwei-mcp-server.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 4. 发布第一个版本

```bash
# 创建并推送标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### 5. 在 GitHub 上创建 Release

1. 访问您的仓库页面
2. 点击 "Releases" → "Create a new release"
3. 选择标签 `v1.0.0`
4. 标题：`紫微斗数 MCP 服务器 v1.0.0`
5. 描述可以复制 `CHANGELOG.md` 中的内容
6. 点击 "Publish release"

## 📋 发布前检查清单

- [ ] 已更新所有文件中的 GitHub 用户名
- [ ] 项目能正常运行 (`npm test`)
- [ ] 所有敏感信息已移除
- [ ] README.md 内容准确完整
- [ ] LICENSE 文件存在
- [ ] .gitignore 配置正确

## 🎯 发布后的工作

### 1. 更新项目描述
在 GitHub 仓库页面右侧的 "About" 部分：
- 添加描述：`紫微斗数 MCP 服务器 - 基于 iztro 库提供精确的紫微斗数排盘和运限分析`
- 添加网站链接（如果有）
- 添加主题标签：`mcp` `ziwei` `astrology` `chinese-astrology` `iztro` `fortune-telling`

### 2. 设置分支保护
在 Settings → Branches 中为 `main` 分支设置保护规则。

### 3. 启用 Issues 和 Discussions
在 Settings → General 中启用 Issues 功能，方便用户反馈问题。

### 4. 添加贡献者指南
如果需要，可以创建 `CONTRIBUTING.md` 文件。

## 🔄 后续更新流程

当您要发布新版本时：

```bash
# 更新版本号
npm version patch  # 补丁版本 (1.0.1)
# 或
npm version minor  # 次要版本 (1.1.0)
# 或
npm version major  # 主要版本 (2.0.0)

# 推送更改和标签
git push && git push --tags

# 在 GitHub 上创建新的 Release
```

## 📞 需要帮助？

如果在发布过程中遇到问题：

1. 检查 [GitHub 官方文档](https://docs.github.com/)
2. 确保 Git 配置正确：
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```
3. 检查网络连接和 GitHub 权限

祝您发布顺利！🚀