# 紫微斗数 MCP 服务器

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node.js-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![iztro](https://img.shields.io/badge/iztro-v2.5.3-blue)](https://github.com/SylarLong/iztro)

一个基于 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 的紫微斗数计算服务器，使用强大的 [iztro](https://github.com/SylarLong/iztro) 库提供精确的紫微斗数排盘和运限分析功能。

## ✨ 功能特性

- 🌟 **完整的紫微斗数排盘** - 支持阳历和农历生日计算
- 📅 **精确的时间处理** - 获取当前系统时间和详细信息
- 🔮 **运限分析** - 大限、流年等运势分析
- 🌐 **多语言支持** - 简体中文、繁体中文、英文、日文、韩文、越南文
- 🔄 **MCP 协议兼容** - 可与支持 MCP 的 AI 助手无缝集成
- ⚡ **轻量高效** - 基于 Node.js，响应快速
- 📊 **结构化数据** - 返回完整的 JSON 格式星盘数据

## 🛠️ 技术栈

- **Node.js** (≥18.0.0) - 运行环境
- **iztro** (v2.5.3) - 紫微斗数核心计算库
- **MCP Protocol** (2024-11-05) - 模型上下文协议

## 📦 安装

### 前置要求

- Node.js 18.0.0 或更高版本
- npm 包管理器

### 克隆仓库

```bash
git clone https://github.com/wuunicorn/MCPIztro.git
cd MCPIztro
```

### 安装依赖

```bash
npm install
```

## ⚙️ 配置

### 1. 创建配置文件

将 `ziwei_mcp_config.json` 中的路径修改为您的实际项目路径：

```json
{
  "mcpServers": {
    "ziwei": {
      "command": "node",
      "args": ["/path/to/your/project/ziwei_mcp_server.js"],
      "env": {
        "NODE_PATH": "/path/to/your/project/node_modules"
      }
    }
  }
}
```

### 2. 在 MCP 客户端中配置

将配置文件内容添加到您的 MCP 客户端配置中（如 Claude Desktop、Cursor 等）。

## 🚀 使用方法

### 直接启动服务器

```bash
npm start
# 或
node ziwei_mcp_server.js
```

### 运行测试

```bash
npm test
# 或
node test_ziwei.js
```

## 📖 API 文档

服务器提供以下三个主要工具：

### 1. get_current_time

获取当前系统时间的详细信息。

**参数：** 无

**返回：**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 8,
    "day": 1,
    "hour": 15,
    "minute": 30,
    "second": 45,
    "datetime_str": "2024-08-01 15:30:45",
    "weekday": "Thursday",
    "weekday_cn": "星期四",
    "timestamp": 1722513045
  }
}
```

### 2. calculate_ziwei

计算指定生辰的紫微斗数星盘。

**参数：**
- `birthday` (必需): 生日，格式 YYYY-MM-DD
- `hour` (可选): 出生时辰 (0-23)，默认 0
- `gender` (可选): 性别 ("男"/"女")，默认 "男"
- `type` (可选): 日期类型 ("solar"/"lunar")，默认 "solar"
- `isLeapMonth` (可选): 是否闰月，默认 false
- `language` (可选): 语言设置，默认 "zh-CN"

**示例请求：**
```json
{
  "birthday": "1990-08-16",
  "hour": 14,
  "gender": "女",
  "type": "solar",
  "language": "zh-CN"
}
```

**返回：** 完整的星盘数据，包含十二宫信息、星耀分布、亮度等。

### 3. get_horoscope

获取指定生辰在特定时间的运限信息。

**参数：**
- `birthday` (必需): 生日，格式 YYYY-MM-DD
- `hour` (可选): 出生时辰 (0-23)，默认 0
- `gender` (可选): 性别 ("男"/"女")，默认 "男"
- `type` (可选): 日期类型 ("solar"/"lunar")，默认 "solar"
- `isLeapMonth` (可选): 是否闰月，默认 false
- `targetDate` (可选): 目标日期，格式 YYYY-MM-DD，默认当前日期
- `language` (可选): 语言设置，默认 "zh-CN"

**返回：** 运限信息，包含大限、流年、年龄等数据。

## 🌐 支持的语言

| 语言代码 | 语言名称 |
|---------|----------|
| zh-CN   | 简体中文 |
| zh-TW   | 繁体中文 |
| en-US   | 英语     |
| ja-JP   | 日语     |
| ko-KR   | 韩语     |
| vi-VN   | 越南语   |

## 📝 使用示例

### 在 MCP 客户端中使用

配置完成后，您可以在支持 MCP 的客户端中直接使用自然语言查询：

```
请帮我排一个1990年8月16日下午2点出生的女性的紫微斗数星盘
```

```
我想看看这个人在2024年的运势如何
```

### 直接 API 调用

```bash
# 获取当前时间
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_current_time", "arguments": {}}}' | node ziwei_mcp_server.js

# 计算星盘
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "calculate_ziwei", "arguments": {"birthday": "1990-08-16", "hour": 14, "gender": "女"}}}' | node ziwei_mcp_server.js
```

## 🏗️ 项目结构

```
MCPIztro/
├── README.md                 # 项目介绍文档
├── package.json             # 项目配置和依赖
├── package-lock.json        # 依赖锁定文件
├── ziwei_mcp_server.js      # MCP 服务器主程序
├── ziwei_mcp_config.json    # MCP 配置文件模板
├── test_ziwei.js           # 测试脚本
└── node_modules/           # 依赖包目录
```

## 🔧 开发

### 测试服务器功能

```bash
node test_ziwei.js
```

### 检查语法

```bash
node -c ziwei_mcp_server.js
```

### 验证依赖

```bash
node -e "import { astro } from 'iztro'; console.log('依赖加载成功');"
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [iztro](https://github.com/SylarLong/iztro) - 提供强大的紫微斗数计算能力
- [Model Context Protocol](https://modelcontextprotocol.io/) - 提供标准化的协议支持

## 📞 联系

如果您有任何问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/wuunicorn/MCPIztro/issues)
- 发送邮件到：wuunicorn@gmail.com

---

**注意：** 紫微斗数仅供参考和娱乐，请理性对待运势分析结果。