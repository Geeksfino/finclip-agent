# FinClip Chat Widget

An embeddable AI chat widget that can be easily integrated into any website.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
- [Backend Setup](#backend-setup)
  - [API Server](#api-server)
  - [Streaming Server](#streaming-server)
  - [CORS Configuration](#cors-configuration)
- [Building for Production](#building-for-production)
- [Embedding the Chat Widget](#embedding-the-chat-widget)
  - [Basic Embedding](#basic-embedding)
  - [Advanced Configuration](#advanced-configuration)
  - [Configuration Options](#configuration-options)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

The FinClip Chat Widget is a lightweight, customizable chat interface that can be embedded into any website. It provides a seamless way for users to interact with your AI assistant directly from your website.

## Features

- 💬 Real-time chat with AI assistant
- 🔄 Streaming responses for a more natural conversation flow
- 💅 Fully customizable appearance
- 🌐 Cross-domain support with proper CORS configuration
- 📱 Responsive design that works on desktop and mobile
- ⚙️ Configurable backend URLs for flexible deployment
- 💡 Customizable suggestions to guide users

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or higher)
- Node.js (v18 or higher) - only if not using Bun

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/cxagent.git
cd cxagent/ui
```

2. Install dependencies:

```bash
bun install
```

### Running the Development Server

Start the development server:

```bash
bun run dev
```

This will start the Vite development server at `http://localhost:5173`.

## Backend Setup

The chat widget requires two backend servers:

1. **API Server** (default port: 5678) - Handles session creation and message sending
2. **Streaming Server** (default port: 5679) - Handles real-time streaming of AI responses

### API Server

The API server needs to implement the following endpoints:

- `POST /createSession` - Creates a new chat session
- `POST /chat` - Processes user messages and generates responses

Start the API server:

```bash
cd /path/to/cxagent
bun run server
```

### Streaming Server

The streaming server handles real-time streaming of AI responses using Server-Sent Events (SSE).

Start the streaming server:

```bash
cd /path/to/cxagent
bun run streaming
```

### CORS Configuration

For cross-domain embedding, both servers need proper CORS configuration:

```typescript
// Example CORS headers for production
const headers = {
  "Access-Control-Allow-Origin": origin, // Use request origin instead of "*"
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
```

## Building for Production

Build the chat widget for production:

```bash
bun run build
```

This will generate optimized files in the `dist` directory.

## Embedding the Chat Widget

### Basic Embedding

Add the following script to your HTML:

```html
<script src="https://your-domain.com/finclip-chat.js" data-finclip-chat></script>
```

This will add a floating chat button to your website with default settings.

### Advanced Configuration

For advanced configuration, initialize the widget manually:

```html
<script src="https://your-domain.com/finclip-chat.js"></script>
<script>
  window.initFinClipChat({
    buttonLabel: "Chat with Support",
    initialOpen: false,
    suggestions: ["How do I get started?", "What are your pricing plans?"],
    suggestionsLabel: "Frequently Asked Questions",
    apiUrl: "https://api.your-domain.com",
    streamingUrl: "https://streaming.your-domain.com"
  });
</script>
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `buttonLabel` | string | "Chat with us" | Text displayed on the chat button |
| `initialOpen` | boolean | false | Whether the chat window should be open by default |
| `suggestions` | string[] | [] | List of suggested prompts for users |
| `suggestionsLabel` | string | "Try these prompts ✨" | Label for the suggestions section |
| `apiUrl` | string | "http://localhost:5678" | URL of the API server |
| `streamingUrl` | string | "http://localhost:5679" | URL of the streaming server |

## Customization

The chat widget can be customized by modifying the CSS variables in your website:

```css
:root {
  --finclip-chat-primary: #0070f3;
  --finclip-chat-background: #ffffff;
  --finclip-chat-text: #333333;
  --finclip-chat-border-radius: 8px;
}
```

## Troubleshooting

### CORS Issues

If you encounter CORS errors when embedding the widget on a different domain:

1. Ensure your backend servers have proper CORS headers
2. Check that the `apiUrl` and `streamingUrl` are correctly configured
3. Verify that your server responds correctly to OPTIONS preflight requests

### Connection Issues

If the widget fails to connect to the backend:

1. Verify that both the API and streaming servers are running
2. Check the browser console for specific error messages
3. Ensure the URLs are correctly configured in the widget initialization

## License

[MIT](LICENSE)
