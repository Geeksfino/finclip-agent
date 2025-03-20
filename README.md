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

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/cxagent.git
cd cxagent
bun install
```

## Configuration

1. Copy the example environment file and customize it:

```bash
cp .agent.env.example .agent.env
```

2. Edit `.agent.env` with your language model API key and other configuration options.

## Usage

### Command Line Interface

Run the CLI for direct interaction with the agent:

```bash
# Run the CLI
bun index.ts
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
bun index.ts
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



## Project Structure

- `CxAgent.ts` - Main agent implementation
- `index.ts` - Main entry point for both CLI and server modes
- `KnowledgePreProcessor.ts` - Knowledge base integration
- `brain.md` - Agent instructions and capabilities
- `web/` - Frontend chat widget implementation

## Embedding the Chat Widget

The chat widget can be easily embedded into any website. Here's how to do it:

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
