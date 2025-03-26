# CxAgent Web Examples

This directory contains example HTML files demonstrating different ways to use and test the CxAgent chat widget.

## Key Features

### Message Deduplication
The chat widget includes a message deduplication mechanism to prevent duplicate messages from appearing in the chat history. This is particularly important when using streaming responses, as network issues could potentially cause duplicate messages to be received.

### CORS Configuration
The widget is configured to handle cross-origin requests properly:
- For localhost development: `withCredentials` is set to `false` to avoid CORS issues
- For production environments: `withCredentials` is set to `true` when the API URL is not localhost
- All components (ChatApp, FloatingChatWidget, DemoPage) pass apiUrl and streamingUrl parameters
- Error handling for CORS-related issues is implemented

## Available Examples

1. **[standalone-widget.html](./standalone-widget.html)**
   - A standalone page demonstrating the chat widget in development mode
   - Useful for testing the widget's functionality in isolation

2. **[embed-demo.html](./embed-demo.html)**
   - Demonstrates how to embed the chat widget in a website
   - Shows the recommended implementation pattern for websites

3. **[cross-domain-test.html](./cross-domain-test.html)**
   - Simulates a production environment where the chat widget and backend servers are on different domains
   - Used for testing CORS configurations and cross-domain functionality

## Testing Modes

### Development Mode
- **React Component Testing**: Uses the main web/index.html as the entry point for the Vite dev server
- **Embedding Script (Dev)**: Tests the embedding script in development mode
- **Access**: All via http://localhost:5173 (Vite dev server)

### Production Mode
- **CDN/Hosted Script**: Tests the production-ready embedding script (finclip-chat.iife.js or finclip-chat-embed.iife.js)
- **Cross-Domain Testing**: Simulates a real-world scenario with multiple domains:
  - Chat widget script: http://localhost:3001
  - Embedding page: http://localhost:3002 or file:// protocol
  - Backend API: http://localhost:5678
  - Streaming server: http://localhost:5679

## Running the Examples

### Development Mode
```bash
# From the web directory
cd /path/to/cxagent/web
bun run dev

# Access examples at:
# http://localhost:5173/examples/
```

### Production Mode (Cross-Domain Testing)
```bash
# Build the production files
cd /path/to/cxagent/web
bun run build

# Serve the files using the included serve.ts
bun serve.ts 3001 ./dist
```

## Alternative Web Servers

The included `serve.ts` script is a simple Bun-based HTTP server, but it's not mandatory. You can use any web server to serve the built files:

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

### CORS Configuration for Alternative Servers

When using an alternative server for cross-domain testing, ensure proper CORS headers are set:

```
Access-Control-Allow-Origin: * (or specific origins)
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

# Serve the production files from port 3001
cd /path/to/cxagent/web/dist-production
npx http-server -p 3001 --cors

# In another terminal, serve the examples from port 3002
cd /path/to/cxagent/web
npx http-server -p 3002 --cors

# Start the backend API and streaming servers
cd /path/to/cxagent
bun run start

# Access the cross-domain test at:
# http://localhost:3002/examples/cross-domain-test.html
```

## CORS Requirements

For cross-domain testing to work properly, the backend servers must have proper CORS headers:

```
Access-Control-Allow-Origin: [specific origin]
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

The chat widget handles credentials conditionally based on whether the API URL is localhost.
