# FinClip Agent Mini-Program Chat

A WeChat mini-program implementation of the FinClip Agent chat interface.

## Features

- Full-screen chat interface optimized for mobile
- Real-time streaming responses using chunked transfer
- Suggestion chips for common queries
- Copy-to-clipboard functionality
- Error handling and retry capabilities
- Markdown-like text formatting

## Getting Started

### Prerequisites

- [WeChat Developer Tools](https://developers.weixin.qq.com/miniprogram/en/dev/devtools/download.html)
- A registered WeChat Mini-Program AppID (update in project.config.json)

### Setup

1. Open the project in WeChat Developer Tools
2. Update the AppID in `project.config.json`
3. Configure your backend URLs in `app.js`:
   ```javascript
   globalData: {
     apiUrl: 'http://localhost:5678',  // Your FinClip Agent REST API endpoint
     streamingUrl: 'http://localhost:5679',  // Your FinClip Agent streaming endpoint
     sessionId: null,
     userInfo: null
   }
   ```

4. Add avatar images to the assets folder:
   - `assets/user-avatar.png`
   - `assets/assistant-avatar.png`

## Implementation Notes

- Uses WeChat's native chunked transfer capability instead of SSE
- API communication is centralized in `utils/api.js`
- Simple Markdown parsing in `utils/markdown.js`
- Fully compatible with the existing FinClip Agent backend

## Customization

### Changing Suggestions

Modify the `DEFAULT_SUGGESTIONS` array in `pages/chat/chat.js`:

```javascript
const DEFAULT_SUGGESTIONS = [
  "What is a SuperApp?",
  "Explain to me Mini-program technology",
  "How does SuperApp empower digital business?"
];
```

### Styling

The mini-program uses CSS variables for consistent theming. Edit the variables in `app.wxss`:

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

## Development

This implementation leverages WeChat's `enableChunked: true` option and `onChunkReceived` handler to provide streaming capabilities similar to Server-Sent Events (SSE) in the web version.

### Key Files

- `app.js` - Main application entry point
- `pages/chat/chat.js` - Chat page logic
- `pages/chat/chat.wxml` - Chat page template
- `pages/chat/chat.wxss` - Chat page styling
- `utils/api.js` - API communication utilities
- `utils/markdown.js` - Markdown parsing utilities

## Deployment

1. Test thoroughly in the WeChat Developer Tools simulator
2. Upload for review in the WeChat Mini-Program dashboard
3. Once approved, the mini-program will be available to users

## Relationship to Web Implementation

This mini-program implementation mirrors the functionality of the web version (`/web`) while adapting to WeChat's platform constraints and capabilities. Both implementations use the same backend API endpoints but use different streaming technologies:

- Web: Uses Server-Sent Events (EventSource API)
- Mini-Program: Uses chunked HTTP transfer (wx.request with enableChunked)
