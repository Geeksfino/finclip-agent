# CxAgent

CxAgent is an AI-powered customer experience agent built on the actgent framework. It provides automated customer support through natural language interaction.

## Features

- Command-line interface for direct interactions
- WebSocket server for integration with web applications
- Knowledge base integration using MCP (Model Context Protocol)
- PostgreSQL database integration for session persistence

## Prerequisites

- [Bun](https://bun.sh/) runtime (v1.0.0 or higher)
- PostgreSQL database
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

### Development

```bash
# Run the CLI with hot reloading
bun run dev:cli

# Run the server with hot reloading
bun run dev:server

# Watch for changes (TypeScript and resources)
bun run watch
```

### Production

```bash
# Build the project
bun run build

# Run the CLI
bun cli.ts

# Run the server
bun server.ts
```

## Testing

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch
```

## Project Structure

- `CxAgent.ts` - Main agent implementation
- `cli.ts` - Command-line interface
- `server.ts` - WebSocket server
- `McpKnowledgePreProcessor.ts` - Knowledge base integration
- `brain.md` - Agent instructions and capabilities
- `conf/` - Configuration files

## License

[MIT](LICENSE)
