# CxAgent

CxAgent is an AI-powered customer experience agent built on the actgent framework. It provides automated customer support through natural language interaction via both CLI and web interfaces.

## Features

- Command-line interface for direct interactions
- Web-based chat widget that can be embedded in any website
- Knowledge base integration using MCP (Model Context Protocol)
- Real-time streaming of AI responses
- Cross-domain support with proper CORS configuration

## Prerequisites

- [Bun](https://bun.sh/) runtime (v1.0.0 or higher)
- API key for the language model provider

## Installation

### Local Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/cxagent.git
cd cxagent
bun install
```

### Global Installation (when published)

```bash
# Install globally with bun
bun install -g @finogeek/cxagent

# Or run directly without installing
bunx @finogeek/cxagent
```

## Configuration

1. Copy the example environment file and customize it:

```bash
cp .agent.env.example .agent.env
```

2. Edit `.agent.env` with your language model API key and other configuration options.

**Note**: When running CxAgent with `bunx`, the tool will look for the `.agent.env` file and configuration files in your current working directory. Make sure to create these files in the directory where you'll be running the command.

Required configuration files:
- `.agent.env` - Environment variables for API keys and settings
- `brain.md` - Agent instructions and capabilities (optional, will use default if not present)
- `conf/` directory - Configuration files for various components

## Usage

### Command Line Interface

Run the CLI for direct interaction with the agent:

```bash
# Development mode
bun run dev

# Or if installed globally
bunx @finogeek/cxagent
```

### Web Application

The web application consists of two parts:

1. **Backend API and Streaming Servers**
2. **Frontend Chat Widget**

#### Running the Backend

```bash
# Build the project
bun run build

# Run the application (starts both API and streaming servers)
bun run start

# Or if installed globally
bunx @finogeek/cxagent
```

This will start:
- API Server on port 5678 (handles session creation and message processing)
- Streaming Server on port 5679 (handles real-time streaming of AI responses)

#### Running the Frontend (Development)

```bash
cd web
bun install
bun run dev
```

This will start the Vite development server at `http://localhost:5173`.



## Building and Publishing

### Building the Project

```bash
# Build backend only
bun run build

# Build frontend only
bun run build:web

# Build everything (backend and frontend)
bun run build:all
```

### Publishing to npm

Before publishing, make sure to build the project:

```bash
# Clean and rebuild everything
bun run rebuild:all

# Preview what will be published
bun pack --dry-run

# Publish to npm registry
bun publish
```

## Project Structure

- `CxAgent.ts` - Main agent implementation
- `index.ts` - Main entry point for both CLI and server modes
- `KnowledgePreProcessor.ts` - Knowledge base integration
- `brain.md` - Agent instructions and capabilities
- `web/` - Frontend chat widget implementation

## Embedding the Chat Widget

The chat widget (`finclip-chat.js`) is included in the npm package and can be used in multiple ways:

### Option 1: Host on a CDN (Recommended for Production)

1. Build the widget:
   ```bash
   bun run build:web
   ```

2. Upload the `web/dist/finclip-chat.js` and `web/dist/assets/` directory to your preferred CDN

3. Add to your HTML:
   ```html
   <script src="https://your-cdn.com/finclip-chat.js" data-finclip-chat></script>
   ```

### Option 2: Self-host from the npm Package

If you've installed the package via npm/bun:

```html
<script src="./node_modules/@finogeek/cxagent/web/dist/finclip-chat.js" data-finclip-chat></script>
```

### Option 3: Serve from your CxAgent Server

If running your own cxagent server, you can configure it to serve the widget files:

1. In your server code, add routes to serve the widget files
2. Reference it in your HTML:
   ```html
   <script src="http://your-server:5678/finclip-chat.js" data-finclip-chat></script>
   ```

### Configuration

The widget can be configured with data attributes:

```html
<script 
  src="https://your-domain.com/finclip-chat.js" 
  data-finclip-chat 
  data-api-url="https://your-api-server:5678" 
  data-streaming-url="wss://your-streaming-server:5679"
  data-theme="light"
  data-position="right"
></script>
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

### CORS Configuration

For cross-domain embedding, ensure your backend servers have proper CORS configuration:

```typescript
// Example CORS headers for production
const headers = {
  "Access-Control-Allow-Origin": origin, // Use request origin instead of "*"
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
```

## License

[MIT](LICENSE)
