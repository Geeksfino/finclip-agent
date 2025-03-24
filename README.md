# CxAgent

CxAgent is an AI-powered customer experience agent built on the actgent framework. It provides automated customer support through natural language interaction via both CLI and web interfaces. It can use MCP (Model Context Protocol) server to access knowledge base and other services. Its frontend is embeddable to any website. 

## Quick start

First make sure the following prerequisites are met:

### Prerequisites

- [Bun](https://bun.sh/) runtime (v1.0.0 or higher)
- API key for an OpenAI compatible language model provider

### Setup local environment

- Create a new directory for your agent
- Create a `.agent.env` file in the directory

```bash
# LLM Configuration
LLM_API_KEY=your_api_key_here
LLM_PROVIDER_URL=https://your-openai-compatible-provider-url
LLM_MODEL=your-model-name
LLM_STREAM_MODE=true or false

# Agent Server Configuration - change ports if necessary
AGENT_HOST=localhost
AGENT_HTTP_PORT=5678
AGENT_STREAM_PORT=5679
AGENT_ENABLE_STREAMING=true
```
- Give your agent a 'brain' by creating a `brain.md` file in the project directory. Below is an example:

```markdown
---
name: "Chatbot"
role: >-
  Friendly conversation partner
goal: >-
  Engage in natural, open-ended dialogue about any topic the user chooses

capabilities: >-
  - Fluid conversational skills across all subjects
  - Basic emotional understanding and empathetic responses
  - Light humor when appropriate
  - Adaptive communication style

  guidelines:
  1. Initiate and maintain natural dialogue flow
  2. Show interest in user's messages through engaged responses
  3. Avoid technical/domain-specific discussions unless prompted
  4. Never decline any conversation topic
  5. Keep responses concise (1-3 sentences typically)
  6. Use casual but grammatically correct language

  Example interaction:
  User: "The weather's terrible today"
  ChatAgent: "Oh I know! This rain just won't quit. Perfect day for staying in with a book though - what are you up to today?"
---
```
**Note**: The 'brain.md' file has a YAML frontmatter that contains the agent's name, role, goal, capabilities, and guidelines. For more details for customizing an agent see https://github.com/Geeksfino/actgent.git for more detail. It can be very powerful with the use of instructions, tools and schemas. But for simple chatbot, you can just use the default settings.

### Start the server

No installation required. Just run:

```bash
bunx @finogeek/cxagent
```
That's it. This should start a chatbot that does nothing but respond to user messages. You can use the CLI to chat with it.

**Note**: When running CxAgent with `bunx`, the tool will look for the `.agent.env` file and configuration files in your current working directory. Make sure to create these files in the directory where you'll be running the command.

Required configuration files:
- `.agent.env` - Environment variables for API keys and settings
- `brain.md` - Agent instructions and capabilities (optional, will use default if not present)
- `conf/` directory - Configuration files for various components but not required 

### Embed the chatbot in a website

Create a simple HTML file (e.g., `chat.html`) in your project directory:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>CxAgent Chat</title>
   </head>
   <body>
     <h1>CxAgent Chat</h1>
     
     <script 
       src="./node_modules/@finogeek/cxagent/web/dist/finclip-chat.js" 
       data-finclip-chat 
       data-api-url="http://localhost:5678" 
       data-streaming-url="http://localhost:5679"
     ></script>
   </body>
   </html>
   ```
Open the HTML file in a browser to see the chatbot in action.

## Advanced Usage

### MCP Knowledge Base Integration

If you want to pre-process user query before sending it to LLM, you can use some MCP Tool to do so. For example, you can do query expansion, or you can perform a similarity search against some embeddings database to obtain relevant context to send it along with the query to LLM for better context understanding and therefore higher quality response. To do this, you need to create a MCP server that can handle the pre-processing tasks.

- Create a 'conf' folder under current project directory
- Create a 'preproc-mcp.json' file in the 'conf' folder

```json
{
  "mcpServers": {
    "some-rag-server": {
      "command": "/path/to/kb-mcp-server",
      "args": [
        "/path/to/some-knowledgebase/some-data",
        "--some-param",
        "some-value"
      ],
      "cwd": "/path/to/working/directory"
    }
  }
}
```

It is recommended to use MCP server at https://github.com/Geeksfino/kb-mcp-server for knowledge base integration. What this server does is:

- Load knowledge base data
- Handle embeddings
- Provide causal boost for better context understanding
- perform similarity search and graph search to obtain relevant context

For more details, please refer to https://github.com/Geeksfino/kb-mcp-server to see how to create some knowledgebase to use.

Note: pre-processing of queries is not required for basic usage. They are only needed if you want to pre-process user query before sending it to LLM.

### MCP Servers

CxAgent is by itself an MCP host that can make use of MCP servers. This is different from the aforementioned MCP servers that are used to pre-process user query. Query pre-processing is optional step before reaching LLM for final response. We just so happen to use an MCP server to do query pre-processing but theoretically it could be any programs - as long as they take in user query and return processed context. 

MCP servers here are to be invoked by LLM tool calls. So they are invoked post LLM response. To configure MCP servers, you need to create a 'conf' folder under current project directory, if not yet created, and create a 'mcp_config.json' file in the 'conf' folder. This file typically looks like this:

```json
{
    "mcpServers": {
      "filesystem": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-filesystem",
          "/Users/name/Desktop",
          "/Users/name/Downloads"
        ]
      },
    }
}
```
For more information, look at relevant MCP specification. Any MCP servers that work with Claude desktop shall work here as well. 

## Installation For Local Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/Geeksfino/cxagent.git
cd cxagent
bun install
```

### Global Installation

```bash
# Install globally with bun
bun install -g @finogeek/cxagent
```

### Configuration

1. Copy the example environment file and customize it:

```bash
cp .agent.env.example .agent.env
```

2. Edit `.agent.env` with your language model API key and other configuration options.

**Note again**: When running CxAgent, it will look for the `.agent.env` file and configuration files in your current working directory. Make sure to create these files in the directory where you'll be running the command.

Required configuration files:
- `.agent.env` - Environment variables for API keys and settings
- `brain.md` - Agent instructions and capabilities (optional, will use default if not present)
- `conf/` directory - Configuration files for various components

### Command Line Interface

Run the CLI for direct interaction with the agent:

```bash
# cd into project folder

# Development mode
bun run dev

# Production mode
bun run build
bun run start
```
This will start:
- API Server on port 5678 (handles session creation and message processing)
- Streaming Server on port 5679 (handles real-time streaming of AI responses)

**Notes**: ports are configurable via `.agent.env` file.

### Web Frontend Chat Widget

The web frontend chat widget is a separate Vite application that you can run and embed in your own web application.

```bash
cd web
bun install
bun run dev
```

This will start the Vite development server at `http://localhost:5173`.

Point your browser to `http://localhost:5173` to see the chat widget.

### Accessing the Chat Frontend Without Development Server

When you run `bunx @finogeek/cxagent`, it starts the agent with the CLI interface and also starts the backend servers (API on port 5678 and Streaming on port 5679), but doesn't automatically serve the web frontend.

**For first-time users:** When using `bunx @finogeek/cxagent`, the chat widget script (`finclip-chat.js`) is included in the npm package but not automatically accessible. You'll need to either:

1. Install the package locally first: `bun add @finogeek/cxagent`
2. Then reference the script from `node_modules/@finogeek/cxagent/web/dist/finclip-chat.js`

Here are options to access the chat frontend:

#### Option 1: Use the pre-built embed-demo.html file

After installing the package locally with `bun add @finogeek/cxagent`, you can use the pre-built embed-demo.html file:

```bash
# Copy the embed demo to a convenient location
cp node_modules/@finogeek/cxagent/web/dist/embed-demo.html ~/Desktop/

# Then open it in your browser
open ~/Desktop/embed-demo.html
```

#### Option 2: Create a simple HTML file that loads the chat widget

After installing the package locally with `bun add @finogeek/cxagent`, create a new HTML file with the following content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CxAgent Chat Test</title>
</head>
<body>
  <h1>CxAgent Chat Test</h1>
  
  <script 
    src="./node_modules/@finogeek/cxagent/web/dist/finclip-chat.js" 
    data-finclip-chat 
    data-api-url="http://localhost:5678" 
    data-streaming-url="http://localhost:5679"
    data-theme="light"
    data-position="right"
  ></script>
</body>
</html>
```

#### Option 3: Use a simple HTTP server to serve the web files

```bash
# Navigate to the web/dist directory
cd web/dist

# Use Bun's serve capability
bun --serve .

# Then open http://localhost:3000 in your browser
```

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
