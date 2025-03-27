# CxAgent Inspector

A modular web interface for inspecting and interacting with CxAgent configurations.

## Overview

The CxAgent Inspector provides a web-based UI for:

- Viewing agent configuration from brain.md
- Checking MCP configuration status
- Interacting with the agent through a chat interface
- Inspecting agent capabilities and settings

## Architecture

The inspector follows a modular architecture:

- **Core**: Main `AgentInspector` class that orchestrates components
- **Config Manager**: Handles loading and checking configuration files
- **Asset Manager**: Locates and serves static assets (scripts, styles)
- **Server**: HTTP server that handles requests and serves the UI
- **Templates**: HTML templates for the inspector UI

## Usage

### Running the Inspector

```bash
# Start with default settings
bun run start

# Specify a port
bun run start -- --port 8080

# Specify a custom brain.md path
bun run start -- --brain /path/to/brain.md

# Specify both
bun run start -- --port 8080 --brain /path/to/brain.md
```

### Development Mode

```bash
# Run with auto-reload on file changes
bun run dev
```

## Integration with CxAgent CLI

The inspector has been integrated with the CxAgent CLI via a new `--inspect` option, while maintaining the existing `--ui` option for backward compatibility.

### Using the Inspector

```bash
# Start with the new inspector UI
bun run index.ts --inspect

# Specify a custom port
bun run index.ts --inspect --inspect-port 3000

# When using bunx
bunx @finogeek/cxagent --inspect
```

### Implementation Details

The integration uses dynamic imports to load the inspector bridge module:

```typescript
// In index.ts
if (options.inspect) {
  const inspectPort = options.inspectPort;
  import('./inspector/bridge.js').then(({ startUI: startInspector }) => {
    startInspector({
      port: parseInt(inspectPort),
      brainPath: path.join(process.cwd(), 'brain.md')
    });
  });
}
```

The bridge module maintains the same API as the original `startUI` function, so integration is seamless while keeping the codebases separate.

## Features

- **Brain.md Visualization**: View the agent's configuration from brain.md
- **MCP Status**: Check if MCP preprocessor and configuration are available
- **Chat Interface**: Interact with the agent through an embedded chat widget
- **Responsive Design**: Works on desktop and mobile devices
- **Asset Auto-discovery**: Automatically finds required assets in various locations

## Technical Details

- Built with TypeScript and Bun
- Uses a modular architecture for maintainability
- Embeds the chat widget using the finclip-chat-embed.iife.js script
- Supports running via bunx with proper asset discovery
