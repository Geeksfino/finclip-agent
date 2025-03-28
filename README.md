# CxAgent

CxAgent is an AI-powered customer experience agent built on the actgent framework. It provides automated customer support through natural language interaction via both CLI and web interfaces. It can use MCP (Model Context Protocol) server to access knowledge base and other services. Its frontend is embeddable to any website.

## Table of Contents

- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Setup and Run](#setup-and-run)
  - [Embed the Chatbot in a Website](#embed-the-chatbot-in-a-website)
- [Inspector UI](#inspector-ui)
  - [Using the Inspector](#using-the-inspector)
  - [Log Level Configuration](#log-level-configuration)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Agent Brain](#agent-brain)
  - [Configuration Files](#configuration-files)
- [Advanced Usage](#advanced-usage)
  - [MCP Knowledge Base Integration](#mcp-knowledge-base-integration)
  - [MCP Servers](#mcp-servers)
- [Development](#development)
  - [Installation For Local Development](#installation-for-local-development)
  - [Command Line Interface](#command-line-interface)
  - [Web Frontend Chat Widget](#web-frontend-chat-widget)
  - [Building and Publishing](#building-and-publishing)
  - [Project Structure](#project-structure)
  - [Embedding the Chat Widget](#embedding-the-chat-widget)
  - [Development Workflow](#development-workflow)
- [License](#license)

## Quick start

First make sure the following prerequisites are met:

### Prerequisites

- [Bun](https://bun.sh/) runtime (v1.0.0 or higher)
- API key for an OpenAI compatible language model provider

### Setup local environment

- Create a new directory for your agent
- **Important**: Create a `.agent.env` file in the directory with your API key and configuration

```bash
# LLM Configuration - REQUIRED
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

**Note**: The `.agent.env` file is required for CXAgent to function properly. Without it, the agent will not be able to connect to an LLM provider.
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
bunx @finogeek/cxagent --inspect 
```
That's it. This should start a chatbot that does casual chats as a companion. You can point your browser to `http://localhost:5173` to inspect it and chat with it. To embed it into your own website, follow the 'Embedding Instructions' section on the page.

The agent can also be run without the inspector UI by running:

```bash
bunx @finogeek/cxagent
```  
You can chat with it by using the console at command line.


**Important**: When running CxAgent with `bunx`, the tool will first look for the `.agent.env` and `brain.md` files in your current working directory. If these files exist, they will be used instead of the default ones bundled with the package. This allows you to customize the agent's behavior without modifying the package itself.

The `.agent.env` file containing a valid LLM API key is required for the agent to function properly. Make sure to create this file in the directory where you'll be running the command.

## Configuration Files

### Required Configuration Files
- `.agent.env` - Environment variables for API keys and settings
- `brain.md` - Agent instructions and capabilities (optional, will use default if not present)
- `conf/` directory - Configuration files for various components but not required

### Configuration Priority
When running CxAgent, it will look for configuration files in the following order:

1. User-supplied files in the current working directory
2. Default files bundled with the package

This allows you to customize the agent's behavior without modifying the package itself.

### Security Best Practices

1. **Never commit sensitive information**: Ensure `.agent.env` is listed in your `.gitignore` file
2. **Use the example template**: Copy `.agent.env.example` to `.agent.env` and add your own API keys
3. **Keep API keys private**: Never share your `.agent.env` file containing real API keys
4. **Rotate compromised keys**: If you accidentally expose your API keys, rotate them immediately

### Embed the Chatbot in a Website

1. **Install the package locally**:

```bash
bun add @finogeek/cxagent
```

2. **Create a simple HTML file** (e.g., `chat.html`):

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
    src="./node_modules/@finogeek/cxagent/web/dist/finclip-chat-embed.iife.js" 
    data-finclip-chat 
    data-api-url="http://localhost:5678" 
    data-streaming-url="http://localhost:5679"
    data-suggestions="How can you help me today?,What topics can we discuss?"
    data-suggestions-label="Try asking me something 👋"
    data-button-label="Let's chat">
  </script>
</body>
</html>
```

3. **Start the agent server** in a terminal:

```bash
bunx @finogeek/cxagent
```

4. **Open the HTML file** in a browser to see the chatbot in action.

## Inspector UI

CxAgent includes a powerful Inspector UI that helps you visualize and manage your agent's configuration.

### Using the Inspector

Start the Inspector UI with the following command:

```bash
bunx @finogeek/cxagent --inspect
```

By default, the Inspector UI runs on port 5173. You can specify a different port:

```bash
bunx @finogeek/cxagent --inspect --inspect-port 3000
```

The Inspector UI provides:

- Visual representation of your agent's configuration
- Status indicators for brain.md, .agent.env, and other components
- Sample configuration files for missing components
- A floating chat widget to interact with your agent

### Log Level Configuration

You can control the verbosity of the Inspector's console output by setting the log level:

```bash
bunx @finogeek/cxagent --inspect --log-level info
```

Available log levels (from most to least verbose):

- `debug` - Show all debug messages, useful for troubleshooting
- `info` - Show informational messages (default)
- `warn` - Show only warnings and errors
- `error` - Show only errors
- `none` - Suppress all output

## Configuration

### Environment Variables

Create a `.agent.env` file in your project directory with the following options:

```bash
# LLM Configuration - REQUIRED
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

### Agent Brain

The `brain.md` file defines your agent's personality, capabilities, and behavior. It uses a YAML frontmatter format:

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
---
```

For more advanced brain configurations, see the [actgent documentation](https://github.com/Geeksfino/actgent).

### Configuration Files

CxAgent looks for configuration files in the following order:

1. User-supplied files in the current working directory
2. Default files bundled with the package

Required configuration files:
- `.agent.env` - Environment variables for API keys and settings
- `brain.md` - Agent instructions and capabilities (optional, will use default if not present)
- `conf/` directory - Configuration files for various components (optional)

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

# Run with UI for visualizing agent configuration
bun index.ts --ui
# or specify a custom port
bun index.ts --ui --ui-port 3000
```
This will start:
- API Server on port 5678 (handles session creation and message processing)
- Streaming Server on port 5679 (handles real-time streaming of AI responses)
- UI Server (when using `--ui` option) on port 5173 by default (configurable with `--ui-port`)

#### UI Mode

The `--ui` option starts a web server that displays your agent's configuration in a user-friendly interface. This is useful for:

- Visualizing and inspecting your `brain.md` content
- Understanding your agent's configuration
- Testing interactions with your agent

When running via `bunx`, you can also use the UI mode:

```bash
bunx @finogeek/cxagent --ui
# or with custom port
bunx @finogeek/cxagent --ui --ui-port 3000
```

The UI will use the `brain.md` file from your current working directory if available. If no `brain.md` is found, it will display a default template.

**Notes**: ports are configurable via `.agent.env` file or command line options.

### Web Frontend Chat Widget

The web frontend chat widget is a separate Vite application that you can run and embed in your own web application.

```bash
cd web
bun install
bun run dev
```

This will start the Vite development server at `http://localhost:5173`.

Point your browser to `http://localhost:5173` to see the chat widget, or access the examples at `http://localhost:5173/examples/`.

The chat widget includes advanced features such as:
- Message deduplication to prevent duplicate responses from streaming servers
- Configurable backend URLs for API and streaming servers
- CORS handling for cross-origin requests with proper credentials management
- Error handling for network and server issues
- Standalone mode for full-page chat experience

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
  - `examples/` - Example HTML files demonstrating different integration scenarios
  - `src/` - Source code for the React components and hooks
  - `dist/` - Built files (generated after build)

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

The chat widget has been configured to handle CORS properly:

- For localhost development: `withCredentials` is set to `false` to avoid CORS issues
- For production: `withCredentials` is set to `true` when the API URL is not localhost
- All components (ChatApp, FloatingChatWidget, DemoPage) pass apiUrl and streamingUrl parameters
- Error handling for CORS-related issues is implemented

When testing cross-domain scenarios, use the `/examples/cross-domain-test.html` file to verify your CORS configuration.

## Development Workflow

### Development Testing URLs

You can access the following URLs for testing different integration approaches:

1. **React Component Integration**: `http://localhost:5173`
   - This loads the main `index.html` in the root directory
   - Renders the `DemoPage.tsx` component that uses the React component integration approach
   - Demonstrates how to use the `FloatingChatWidget` component in a React application

2. **Examples Directory**: `http://localhost:5173/examples/`
   - Contains all standalone examples for different integration scenarios
   - Access through the examples index page at `http://localhost:5173/examples/index.html`

3. **Standalone Widget**: `http://localhost:5173/examples/standalone-widget.html`
   - Demonstrates the chat widget in standalone mode without the floating button interface
   - Useful for testing the full-page chat experience

4. **Embed Script Integration**: `http://localhost:5173/examples/embed-demo.html`
   - Uses the development embed script (`embed-dev.ts`) which is specifically built for development
   - Demonstrates how to embed the chat widget on any website using a script tag

5. **Production Embed Demo**: `http://localhost:5173/examples/embed-demo-prod.html`
   - Uses the production build of the embed script
   - Demonstrates how the widget behaves in a production environment

6. **Cross-Domain Testing**: `http://localhost:5173/examples/cross-domain-test.html`
   - Simulates a production environment where the chat widget and backend are on different domains
   - Useful for testing CORS configurations

### Building for Production

To build the chat widget for production:

```bash
cd /path/to/cxagent/web
bun run build
```

This will generate optimized files in the `dist` directory. For production deployment, the `dist-production` directory is created with all necessary files for embedding the chat widget on any website.

### Serving the Built Files

The project includes a simple Bun-based HTTP server (`serve.ts`) for serving the built files, but it's not mandatory. You can use any web server of your choice:

#### Using the included serve.ts
```bash
cd /path/to/cxagent/web
bun serve.ts 3001 ./dist
```

#### Alternative Web Servers

1. **Python HTTP Server**:
   ```bash
   cd /path/to/cxagent/web/dist
   python -m http.server 3001
   ```

2. **Node.js/npm HTTP Server**:
   ```bash
   npm install -g http-server
   cd /path/to/cxagent/web/dist
   http-server -p 3001 --cors
   ```

3. **Nginx**: Configure a virtual host to serve the static files from the dist directory

4. **Bun's built-in serve**:
   ```bash
   cd /path/to/cxagent/web/dist
   bun --serve
   ```

When using an alternative server for cross-domain testing, ensure proper CORS headers are set:

#### Production Build Output

The production build generates the following key files:

- **finclip-chat-embed.iife.js**: The production-ready embed script optimized for deployment
- **style.css**: The stylesheet for the chat widget
- **assets/**: Directory containing icons, fonts, and other static assets
- **sample-embed.html**: A sample HTML file demonstrating how to embed the widget

### Understanding the Embedding Scripts

There are three main embedding script files in the project, which work together to provide a seamless embedding experience for different environments:

1. **embed.ts** (`src/embed.ts`): 
   - Serves as the base implementation and foundation for the other embed scripts
   - Provides core functionality for creating the widget container and rendering the React component
   - Is not used directly by end users, but is built into `finclip-chat.iife.js` during the build process
   - Implements the basic `window.initFinClipChat()` function that all variants share

2. **embed-dev.ts** (`src/embed-dev.ts`): 
   - Extends the base functionality with development-specific features
   - Includes additional logging to help with debugging
   - Has special handling for API URLs with default localhost values
   - Is used by the examples/embed-demo.html page during development
   - Implements CORS handling with conditional credentials based on whether the API URL is localhost

3. **embed-production.ts** (`src/embed-production.ts`): 
   - The production-optimized version that's built into `finclip-chat-embed.iife.js`
   - Includes enhanced URL extraction capabilities for production environments
   - Is used by the examples/cross-domain-test.html for testing cross-domain scenarios
   - Handles CORS properly for cross-domain usage in production environments

**Note for Developers**: You don't need to directly interact with these source files. When implementing the chat widget:
- For development: The build system automatically uses the development version
- For production: Use the pre-built `finclip-chat-embed.iife.js` file from the distribution

All embedding scripts handle CORS configuration and API URL extraction internally, making them simple to use regardless of your hosting environment.

### CDN Deployment

For production deployment, host the built files on a CDN and reference them in your HTML:

```html
<script src="https://cdn.your-domain.com/finclip-chat-embed.iife.js" data-finclip-chat data-api-url="https://your-api-server.com" data-streaming-url="https://your-streaming-server.com"></script>
```

### Cross-Domain Testing

The project includes a `cross-domain-test.html` file that simulates a production environment where the chat widget and backend servers are on different domains. This is useful for testing CORS configurations.

To test cross-domain scenarios:

1. Build the production files:
   ```bash
   cd /path/to/cxagent/web
   bun run build
   ```

2. Serve the production files from a different port (e.g., 3001):
   ```bash
   cd /path/to/cxagent/web/dist-production
   npx http-server -p 3001 --cors
   ```

3. Open the cross-domain test file in your browser:
   ```
   file:///path/to/cxagent/web/cross-domain-test.html
   ```
   
   Or serve it from another port:
   ```bash
   cd /path/to/cxagent/web
   npx http-server -p 3002 --cors
   # Then access http://localhost:3002/cross-domain-test.html
   ```

This setup tests:
- The chat widget script loaded from port 3001
- The backend API running on port 5678
- The streaming server running on port 5679

Ensure your backend servers have proper CORS headers configured as mentioned in the CORS section.

### Using CXAgent with `bunx`

If you're using CXAgent via `bunx` instead of cloning the repository, the package includes pre-built scripts for embedding the chat widget. When you install CXAgent using `bunx @finogeek/cxagent`, the following files are included in the package:

- **finclip-chat-embed.iife.js**: The production-ready embed script optimized for deployment
- **style.css**: The required CSS styles for the chat widget
- **implementation-guide.html**: A sample HTML file showing how to implement the widget

To set up the embedding frontend UI when using `bunx`:

1. Start the CXAgent backend:
   ```bash
   bunx @finogeek/cxagent
   ```

2. Find the embedding files in the npm package directory:
   ```bash
   # Locate the package directory
   npm list -g @finogeek/cxagent
   # Or if installed locally
   ls node_modules/@finogeek/cxagent/web/dist
   ```

3. Copy the embedding files from the package to your website:
   ```bash
   # If installed globally
   cp -r /path/to/global/node_modules/@finogeek/cxagent/web/dist/* your-website-directory/
   # If installed locally
   cp -r node_modules/@finogeek/cxagent/web/dist/* your-website-directory/
   ```

4. Reference the files in your HTML:
   ```html
   <link rel="stylesheet" href="/style.css">
   <script src="/finclip-chat-embed.iife.js" data-finclip-chat data-api-url="http://localhost:5678" data-streaming-url="http://localhost:5679"></script>
   ```

## License

[MIT](LICENSE)
