# FinClip Agent 小程序聊天

FinClip/微信小程序版本的 FinClip Agent 聊天界面实现。这个小程序可以通过 FinClip SDK 轻松嵌入到任何 iOS 或 Android 应用中。

## 功能特点

- 针对移动端优化的全屏聊天界面
- 使用分块传输实现实时流式响应
- 常见查询的建议提示
- 复制到剪贴板功能
- 错误处理和重试功能
- Markdown 类文本格式化

## 开始使用

### 前提条件

- [FinClip Studio](https://en.finclip.com/products/finclip-studio) - FinClip 小程序开发的官方 IDE（或者，您也可以使用微信开发者工具）
- 注册 FinClip 开发者账号（在 [FinClip 开发者平台](https://en.finclip.com) 注册）
- 注册 FinClip 小程序 AppID（从 FinClip 开发者平台获取）

### 设置

1. 在 FinClip Studio 或微信开发者工具中打开项目
2. 在 `project.config.json` 中更新 AppID
3. 在 `app.js` 中配置后端 URL：
   ```javascript
   globalData: {
     apiUrl: 'http://localhost:5678',  // 您的 FinClip Agent REST API 端点
     streamingUrl: 'http://localhost:5679',  // 您的 FinClip Agent 流式传输端点
     sessionId: null,
     userInfo: null
   }
   ```

4. 将头像图片添加到 assets 文件夹：
   - `assets/user-avatar.png`
   - `assets/assistant-avatar.png`

## 实现说明

- API 通信集中在 `utils/api.js` 中
- 简单的 Markdown 解析在 `utils/markdown.js` 中
- 与现有 FinClip Agent 后端完全兼容

### 流式传输实现状态

这个小程序支持两种流式响应方法：

1. **HTTP 分块传输** - 使用微信原生的分块传输功能代替 SSE，因为小程序不支持 SSE。此方法目前部分实现，但未来版本可能会被废弃。
   - **状态**：部分实现，但未来版本可能会被废弃
   - **限制**：在不同小程序平台上存在一些兼容性问题

2. **WebSocket** - 使用 WebSocket 连接进行实时流式传输
   - **状态**：实验性，正在积极开发中
   - **优势**：更好的跨平台兼容性和性能
   - **使用方法**：在 `utils/api.js` 中设置 `useWebSocket: true`

尽管 WebSocket 实现仍处于实验阶段，我们仍建议在新项目中使用它。

## 自定义

### 更改建议提示

修改 `pages/chat/chat.js` 中的 `DEFAULT_SUGGESTIONS` 数组：

```javascript
const DEFAULT_SUGGESTIONS = [
  "什么是超级应用？",
  "向我解释小程序技术",
  "超级应用如何赋能数字业务？"
];
```

### 样式设置

小程序使用 CSS 变量来保持一致的主题风格。编辑 `app.wxss` 中的变量：

```css
page {
  --primary-color: #0062CC;
  --secondary-color: #E6F3FF;
  --text-color: #333333;
  --light-gray: #F0F0F0;
  --user-message-bg: #EFEFEF;
  --assistant-message-bg: #E6F3FF;
  --border-radius: 12px;
}
```

## 开发

此实现利用微信的 `enableChunked: true` 选项和 `onChunkReceived` 处理程序，提供类似于 Web 版本中服务器发送事件（SSE）的流式功能。

### 关键文件

- `app.js` - 主应用程序入口点
- `pages/chat/chat.js` - 聊天页面逻辑
- `pages/chat/chat.wxml` - 聊天页面模板
- `pages/chat/chat.wxss` - 聊天页面样式
- `utils/api.js` - API 通信工具
- `utils/markdown.js` - Markdown 解析工具

## 使用 FinClip 技术开发

### 开发工作流程

#### 步骤 1：在 FinClip Studio 中设置项目

1. 下载并安装 [FinClip Studio](https://en.finclip.com/resources/downloads)
2. 打开 FinClip Studio 并使用您的开发者账号登录
3. 点击 "+" 按钮创建新项目或导入现有项目
4. 输入项目名称并选择项目目录

#### 步骤 2：配置项目

1. 使用从 FinClip 开发者平台获取的 AppID 更新 `project.config.json` 文件
2. 修改 `app.json` 以配置页面、窗口样式和其他全局设置
3. 更新 `utils/api.js` 中的 API 端点，指向您的 FinClip Agent 后端

#### 步骤 3：本地开发和测试

1. 使用 FinClip Studio 中的内置模拟器预览小程序
2. 进行代码更改并实时查看效果
3. 使用开发者工具面板（控制台、网络、存储等）进行调试
4. 测试与后端的 API 连接

#### 步骤 4：在真机上预览

1. 点击 FinClip Studio 中的"预览"按钮
2. 使用安装了 FinClip App 的设备扫描生成的二维码
3. 在实际设备上测试小程序，确保功能正常

### 部署流程

#### 步骤 1：在 FinClip 平台上创建小程序

1. 登录 [FinClip 开发者平台](https://en.finclip.com)
2. 创建新的小程序条目并获取 AppID
3. 配置基本信息（名称、图标、描述等）

#### 步骤 2：上传小程序代码

1. 在 FinClip Studio 中，确保您已使用开发者账号登录
2. 将本地项目与平台上创建的小程序关联
3. 点击"上传"按钮提交代码
4. 平台上将创建一个开发版本

#### 步骤 3：提交审核

**注意**：FinClip 公共平台目前供开发者用于测试和开发目的。因此，此审核过程被跳过。但如果您部署到自己的平台，可以启用审核流程并自行批准。

1. 登录 FinClip 开发者平台
2. 导航到小程序管理部分
3. 找到上传的版本并提交审核
4. 提供必要的文档和测试账号（如需）

#### 步骤 4：发布小程序

1. 审核通过后，您可以发布小程序
2. 选择分阶段发布（逐步推出）或完全发布
3. 小程序将在 FinClip App 和任何集成 FinClip SDK 的超级应用中可用

### 与超级应用集成

要使您的小程序在超级应用中可用：

1. 超级应用必须集成 FinClip SDK
2. 超级应用所有者需要将您的小程序添加到他们的批准列表中
3. 用户随后可以通过超级应用的小程序市场访问您的小程序

### 在您的应用中嵌入 FinClip SDK

如果您想快速将智能助手/聊天机器人添加到现有移动应用程序中，我们强烈建议嵌入 FinClip SDK：

1. **什么是 FinClip SDK？**
   - 小程序运行时和安全沙箱
   - 允许任何小程序在您的应用内运行
   - 为第三方代码提供隔离和安全保障

2. **智能助手集成的好处：**
   - 无需大量原生开发即可快速部署聊天界面
   - 类似于在网站中嵌入聊天组件的 Web 版本
   - 可以在不更新宿主应用的情况下更新智能助手
   - 跨不同平台的一致用户体验

3. **实施：**
   - 将 FinClip SDK 集成到您的 iOS/Android 应用中
   - 将此小程序部署到您的 FinClip 开发者账号
   - 配置您的应用自动打开此小程序
   - 通过 SDK 自定义外观和行为

这种方法为在现有移动应用中添加功能全面的智能助手提供了最快捷的途径，同时保持安全性和灵活性。

## 与 Web 实现的关系

这个小程序实现与 Web 版本（`/web`）的功能相似，同时适应 FinClip 平台功能。两种实现使用相同的后端 API 端点，但使用不同的流式传输技术：

- **Web**：使用服务器发送事件（EventSource API）
- **小程序**：
  - 主要方法：WebSocket 连接（实验性但推荐）
  - 替代方法：分块 HTTP 传输（部分实现，可能会被弃用）

小程序方法提供了类似于在网站中嵌入聊天组件的好处，但具有更好的移动集成和类原生性能。对于 Web 应用程序，使用 Web 实现；对于移动应用，通过 FinClip SDK 嵌入此小程序或在 WebView 中使用 Web 实现。

## 跨平台兼容性

### FinClip 和微信兼容性

FinClip 和微信小程序共享相同的基本框架和语法，使它们高度兼容。这个小程序可以在两个平台上部署，只需进行最小的修改。我们建议先使用 FinClip App 或 FinClip For Enterprise（iOS 和 Android 平台均可用）进行开发和测试，然后根据需要调整适应微信。

### 在微信平台上部署

如果您还想在微信上部署此小程序，请按照以下步骤操作：

#### 微信前提条件

1. 注册 [微信开发者账号](https://mp.weixin.qq.com/)
2. 创建微信小程序并获取 AppID
3. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

#### 微信开发流程

1. 在微信开发者工具中打开项目
2. 使用您的微信小程序 AppID 更新 `project.config.json`
3. 在微信模拟器中测试小程序
4. 对微信特定 API 进行必要的调整

#### 微信部署

1. 在微信开发者工具模拟器中彻底测试
2. 在微信小程序控制台上传审核
3. 审核通过后，小程序将对微信用户可用

#### 需要考虑的主要差异

- API 端点：确保您的后端可从微信网络访问
- 网络请求：微信对网络请求有特定的安全要求
- 用户认证：微信使用自己的认证系统

### 推荐方法

为获得最佳跨平台体验：

1. 首先使用 FinClip Studio 进行开发和测试
2. 使用 FinClip App 或 FinClip For Enterprise 进行真机测试
3. 根据需要将其调整为微信平台
4. 维护单一代码库，使用条件逻辑处理平台特定功能

## 资源

### FinClip 资源

- [FinClip 官方网站](https://en.finclip.com)
- [FinClip 文档](https://www.finclip.com/mop/document/)
- [FinClip Studio 下载](https://en.finclip.com/resources/downloads)
- [FinClip 开发者社区](https://en.finclip.com/community/)

### 微信资源

- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/)
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
