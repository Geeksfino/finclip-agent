# FinClip-Agent

[English Documentation](./README.md)

FinClip-Agent 是一个基于 actgent 框架构建的 AI 客户体验代理。它通过命令行和网页界面提供自然语言交互的自动化客户支持。**只需一行代码，您就可以将聊天小部件嵌入到任何网站中** - 这使得向您的网络应用程序添加 AI 支持变得极其简单。该代理可以使用 MCP（Model Context Protocol）服务器访问知识库和其他服务，基于您的自定义数据提供智能回应。

> **希望更好地控制客户支持内容？** 请查看 [finclip-agent-starterkit](https://github.com/Geeksfino/finclip-agent-starterkit) - 这是一个现成的解决方案，可以将自定义知识库与您的代理集成。这有助于通过将响应基于您自己的文档和数据，来提高问答质量并防止幻觉。

## 目录

- [快速开始](#快速开始)
  - [前提条件](#前提条件)
  - [设置和运行](#设置和运行)
  - [在网站中嵌入聊天机器人](#在网站中嵌入聊天机器人)
- [检查器界面](#检查器界面)
  - [使用检查器](#使用检查器)
  - [日志级别配置](#日志级别配置)
- [配置](#配置)
  - [环境变量](#环境变量)
  - [Agent Brain](#agent-brain)
  - [配置文件](#配置文件)
- [高级用法](#高级用法)
  - [MCP 知识库集成](#mcp-知识库集成)
  - [MCP 服务器](#mcp-服务器)
- [开发](#开发)
  - [本地开发安装](#本地开发安装)
  - [命令行界面](#命令行界面)
  - [Web 前端聊天小部件](#web-前端聊天小部件)
  - [构建和发布](#构建和发布)
  - [项目结构](#项目结构)
  - [嵌入聊天小部件](#嵌入聊天小部件)
  - [开发工作流程](#开发工作流程)
- [许可证](#许可证)

## 快速开始

首先确保满足以下前提条件：

### 前提条件

- [Bun](https://bun.sh/) 运行时（v1.0.0 或更高版本）
- OpenAI 兼容的语言模型提供商的 API 密钥

### 设置本地环境

- 为您的代理创建一个新目录
- **重要**：在目录中创建一个包含 API 密钥和配置的 `.agent.env` 文件

```bash
# LLM 配置 - 必需
LLM_API_KEY=您的API密钥
LLM_PROVIDER_URL=https://您的OpenAI兼容提供商URL
LLM_MODEL=您的模型名称
LLM_STREAM_MODE=true或false

# 代理服务器配置 - 如有必要，更改端口
AGENT_HOST=localhost
AGENT_HTTP_PORT=5678
AGENT_STREAM_PORT=5679
AGENT_ENABLE_STREAMING=true
```

**注意**：`.agent.env` 文件对于 FinClip-Agent 的正常运行是必需的。没有它，代理将无法连接到 LLM 提供商。

- 通过在项目目录中创建 `brain.md` 文件为您的代理提供"大脑"。以下是一个示例：

```markdown
---
name: "聊天机器人"
role: >-
  友好的对话伙伴
goal: >-
  就用户选择的任何话题进行自然、开放式的对话

capabilities: >-
  - 在所有主题上流畅的对话技能
  - 基本的情感理解和共情回应
  - 适当时使用轻松幽默
  - 适应性沟通风格

  guidelines:
  1. 发起并保持自然对话流程
  2. 通过积极回应表现出对用户消息的兴趣
  3. 除非被提示，否则避免技术/领域特定讨论
  4. 绝不拒绝任何对话主题
  5. 保持回应简洁（通常1-3句话）
  6. 使用随意但语法正确的语言

  Example interaction:
  用户: "今天天气真糟糕"
  聊天代理: "是啊！这雨就是不停。不过这是待在家里看书的完美日子 - 你今天在做什么呢？"
---
```

**注意**：`brain.md` 文件有一个 YAML 前置元数据，包含代理的名称、角色、目标、能力和指南。有关自定义代理的更多详情，请参阅 https://github.com/Geeksfino/actgent.git。通过使用指令、工具和模式，它可以非常强大。但对于简单的聊天机器人，您可以只使用默认设置。

### 启动服务器

无需安装。只需运行：

```bash
bunx @finogeek/cxagent --inspect 

bunx @finogeek/cxagent --inspect --inspect-port 3000
```

就这样。这应该会启动一个作为伴侣进行休闲聊天的聊天机器人。您可以将浏览器指向 `http://localhost:5173` 来检查它并与之聊天。要将其嵌入到您自己的网站中，请按照页面上的"嵌入说明"部分操作。

也可以通过运行以下命令在没有检查器 UI 的情况下运行代理：

```bash
bunx @finogeek/cxagent
```

您可以使用命令行控制台与之聊天。

**重要提示**：使用 `bunx` 运行 FinClip-Agent 时，工具将首先在当前工作目录中查找 `.agent.env` 和 `brain.md` 文件。如果这些文件存在，它们将被用来替代包中捆绑的默认文件。这允许您自定义代理的行为，而无需修改包本身。

包含有效 LLM API 密钥的 `.agent.env` 文件对于代理的正常运行是必需的。确保在运行命令的目录中创建此文件。

## 配置文件

### 必需的配置文件
- `.agent.env` - API 密钥和设置的环境变量
- `brain.md` - 代理指令和能力（可选，如果不存在将使用默认值）
- `conf/` 目录 - 各组件的配置文件，但不是必需的

### 配置优先级
运行 FinClip-Agent 时，它将按以下顺序查找配置文件：

1. 当前工作目录中的用户提供文件
2. 包中捆绑的默认文件

这允许您自定义代理的行为，而无需修改包本身。

### 安全最佳实践

1. **永远不要提交敏感信息**：确保 `.agent.env` 列在您的 `.gitignore` 文件中
2. **使用示例模板**：将 `.agent.env.example` 复制到 `.agent.env` 并添加您自己的 API 密钥
3. **保持 API 密钥私密**：永远不要共享包含真实 API 密钥的 `.agent.env` 文件
4. **轮换泄露的密钥**：如果您不小心暴露了 API 密钥，立即轮换它们

### 在网站中嵌入聊天机器人

1. **本地安装包**：

```bash
bun add @finogeek/cxagent
```

2. **创建一个简单的 HTML 文件**（例如，`chat.html`）：

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinClip-Agent 聊天</title>
</head>
<body>
  <h1>FinClip-Agent 聊天</h1>
  
  <script 
    src="./node_modules/@finogeek/cxagent/web/dist/finclip-chat-embed.iife.js" 
    data-finclip-chat 
    data-api-url="http://localhost:5678" 
    data-streaming-url="http://localhost:5679"
    data-suggestions="您今天能帮我什么忙?,我们可以讨论哪些话题?"
    data-suggestions-label="试着问我些什么 👋"
    data-button-label="开始聊天">
  </script>
</body>
</html>
```

3. **在终端中启动代理服务器**：

```bash
bunx @finogeek/cxagent
```

4. **在浏览器中打开 HTML 文件**，查看聊天机器人的运行情况。

## 检查器界面

FinClip-Agent 包含一个强大的检查器 UI，帮助您可视化和管理代理的配置。

### 使用检查器

使用以下命令启动检查器 UI：

```bash
bunx @finogeek/cxagent --inspect
```

默认情况下，检查器 UI 在端口 5173 上运行。您可以指定不同的端口：

```bash
bunx @finogeek/cxagent --inspect --inspect-port 3000
```

检查器 UI 提供：

- 代理配置的可视化表示
- brain.md、.agent.env 和其他组件的状态指示器
- 缺失组件的示例配置文件
- 用于与代理交互的浮动聊天小部件

### 日志级别配置

您可以使用 `--log-level` 参数设置日志级别：

```bash
bunx @finogeek/cxagent --log-level debug
```

可用的日志级别包括：
- `trace`：最详细的日志级别
- `debug`：调试信息
- `info`：默认级别，一般信息
- `warn`：警告
- `error`：错误
- `fatal`：致命错误

## 高级用法

### MCP 知识库集成

FinClip-Agent 可以与 MCP（Model Context Protocol）服务器集成，以访问外部知识库。

#### 设置 MCP 知识库

1. **安装 kb-mcp-server**：

```bash
pip install kb-mcp-server
```

2. **创建知识库配置**：

创建一个 `kb.yml` 文件：

```yaml
embeddings:
  path: sentence-transformers/all-MiniLM-L6-v2
  device: cpu

storage:
  type: chroma
  path: kb

retriever:
  type: similarity
  search_type: mmr
  search_kwargs:
    k: 5
    fetch_k: 20
    lambda_mult: 0.5
```

3. **构建知识库**：

```bash
kb-build --config kb.yml --input your-documents-folder
```

4. **配置 MCP 集成**：

创建一个 `conf/preproc-mcp.json` 文件：

```json
{
  "mcpServers": {
    "kb-server": {
      "command": "kb-mcp-server",
      "args": ["--embeddings", "kb"]
    }
  }
}
```

### MCP 服务器

MCP（Model Context Protocol）服务器允许代理与外部服务和知识库交互。

#### 预处理查询

如果您想在将用户查询发送到 LLM 之前对其进行预处理，可以使用 MCP 工具来执行此操作。例如，您可以进行查询扩展，或者对嵌入数据库执行相似性搜索以获取相关上下文，并将其与查询一起发送到 LLM，以便更好地理解上下文，从而获得更高质量的响应。要做到这一点，您需要创建一个可以处理预处理任务的 MCP 服务器。

- 在当前项目目录下创建一个 'conf' 文件夹
- 在 'conf' 文件夹中创建一个 'preproc-mcp.json' 文件

## 开发

### 本地开发安装

克隆仓库并安装依赖：

```bash
git clone https://github.com/Geeksfino/finclip-agent.git
cd finclip-agent
bun install
```

### 命令行界面

FinClip-Agent 提供了一个命令行界面，用于与代理交互：

```bash
bun run cli
```

### Web 前端聊天小部件

FinClip-Agent 包含一个可嵌入的 Web 聊天小部件：

```bash
cd web
bun install
bun run dev
```

这将在 `http://localhost:5173` 启动 Vite 开发服务器。

### 构建和发布

构建包：

```bash
bun run build
```

发布到 npm：

```bash
npm publish
```

### 项目结构

- `src/` - 核心代理代码
  - `cli/` - 命令行界面
  - `web/` - Web 聊天小部件
  - `core/` - 核心代理功能
  - `mcp/` - MCP 集成
- `web/` - Web 前端代码
- `dist/` - 构建输出
- `conf/` - 配置文件

### 嵌入聊天小部件

#### 基本嵌入

最简单的方法是使用 `data-finclip-chat` 属性：

```html
<script 
  src="https://your-domain.com/finclip-chat-embed.iife.js" 
  data-finclip-chat 
  data-api-url="http://localhost:5678" 
  data-streaming-url="http://localhost:5679">
</script>
```

#### 高级配置

对于高级配置，手动初始化小部件：

```html
<script src="https://your-domain.com/finclip-chat.js"></script>
<script>
  FinclipChat.init({
    apiUrl: 'http://localhost:5678',
    streamingUrl: 'http://localhost:5679',
    position: 'bottom-right',
    theme: {
      primaryColor: '#4f46e5',
      textColor: '#111827',
      backgroundColor: '#ffffff'
    },
    i18n: {
      buttonLabel: '开始聊天',
      placeholderText: '输入您的问题...',
      welcomeMessage: '您好！我能帮您什么忙？'
    }
  });
</script>
```

### 开发工作流程

1. **设置开发环境**：
   ```bash
   bun install
   ```

2. **运行测试**：
   ```bash
   bun test
   ```

3. **启动开发服务器**：
   ```bash
   bun run dev
   ```

4. **构建生产版本**：
   ```bash
   bun run build
   ```

## 许可证

MIT
