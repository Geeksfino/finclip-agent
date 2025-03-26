# FinClip Chat Widget

This directory contains the cross-domain chat widget that can be embedded on third-party websites to provide chat functionality powered by the CxAgent backend.

## Project Structure

- `src/` - Source code for the chat widget
  - `components/FloatingChatWidget.tsx` - Main widget component
  - `embed.ts` - Entry point for the development embed script
  - `embed-production.ts` - Entry point for the production embed script
- `public/` - Static assets and demo pages
  - `chat-widget.html` - Standalone chat widget for development
  - `embed-demo.html` - Demo page showing how to embed the widget
- `cross-domain-test.html` - Test page for cross-domain functionality
- `dist/` - Build output (not committed to Git)
- `dist-production/` - Clean distribution files for production (not committed to Git)

## Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Prepare clean distribution files
bun run prepare-dist
```

## Distribution

The chat widget is not meant to be published to npm. Instead, the contents of the `dist-production/` folder should be uploaded to a CDN or web server after building:

1. Run `bun run build && bun run prepare-dist`
2. Upload the contents of `dist-production/` to your CDN or web server
3. Use the URLs from your CDN in your embedding code

## Embedding the Widget

### Basic Implementation

```html
<!-- Add the CSS file -->
<link rel="stylesheet" href="https://your-cdn.com/style.css">

<!-- Add the script with data attributes -->
<script 
  src="https://your-cdn.com/finclip-chat-embed.iife.js" 
  data-finclip-chat 
  data-api-url="https://your-api-server.com" 
  data-streaming-url="https://your-streaming-server.com">
</script>
```

### Advanced Configuration

```html
<!-- Add the CSS file -->
<link rel="stylesheet" href="https://your-cdn.com/style.css">

<!-- Add the script -->
<script src="https://your-cdn.com/finclip-chat-embed.iife.js"></script>

<script>
  window.initFinClipChat({
    buttonLabel: "Chat with Support",
    initialOpen: false,
    suggestions: ["How do I get started?", "What are your pricing plans?"],
    suggestionsLabel: "Frequently Asked Questions",
    apiUrl: "https://your-api-server.com",
    streamingUrl: "https://your-streaming-server.com"
  });
</script>
```

## Backend Requirements

For the chat widget to work correctly in a cross-domain environment, the backend servers must have proper CORS headers:

```
Access-Control-Allow-Origin: [specific origin]
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Testing

### Local Development

1. Start the development server: `bun run dev`
2. Open `http://localhost:5173` to see the main app
3. Open `http://localhost:5173/embed-demo.html` to see the embedded widget demo

### Cross-Domain Testing

1. Start the preview server: `bun run preview --port 3001`
2. Start a separate server for the test page: `npx http-server -p 8001`
3. Open `http://localhost:8001/cross-domain-test.html` to test cross-domain functionality

## Bundle Size Optimization

The current bundle is quite large. For future improvements, consider:

1. Code splitting to reduce initial load size
2. Tree-shaking to remove unused code
3. Lazy-loading non-critical components
