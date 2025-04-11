# FinClip Agent Mini-Program Chat

A FinClip/WeChat mini-program implementation of the FinClip Agent chat interface. This mini-program is easily embeddable into any iOS or Android app using the FinClip SDK.

## Features

- Full-screen chat interface optimized for mobile
- Real-time streaming responses using chunked transfer
- Suggestion chips for common queries
- Copy-to-clipboard functionality
- Error handling and retry capabilities
- Markdown-like text formatting

## Getting Started

### Prerequisites

- [FinClip Studio](https://en.finclip.com/products/finclip-studio) - the official IDE for FinClip mini-program development (alternatively, you can use WeChat Developer Tools)
- A registered FinClip Developer account (register at [FinClip Developer Platform](https://en.finclip.com))
- A registered FinClip Mini-Program AppID (obtained from the FinClip Developer Platform)

### Setup

1. Open the project in FinClip Studio or WeChat Developer Tools
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

- API communication is centralized in `utils/api.js`
- Simple Markdown parsing in `utils/markdown.js`
- Fully compatible with the existing FinClip Agent backend

### Streaming Implementation Status

This mini-program supports two methods for streaming responses:

1. **HTTP Chunked Transfer** - Uses WeChat's native chunked transfer capability instead of SSE, since SSE is not supported in mini-program. This method is currently partially implemented but may be abandoned in future versions.
   - **Status**: Partially implemented but may be abandoned in future versions
   - **Limitations**: Some compatibility issues across different mini-program platforms

2. **WebSocket** - Uses WebSocket connections for real-time streaming
   - **Status**: Experimental, under active development
   - **Advantages**: Better cross-platform compatibility and performance
   - **Usage**: Configure in `utils/api.js` by setting `useWebSocket: true`

We recommend using the WebSocket implementation for new projects despite its experimental status.

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

## Developing with FinClip Technology

### Development Workflow

#### Step 1: Set Up the Project in FinClip Studio

1. Download and install [FinClip Studio](https://en.finclip.com/resources/downloads)
2. Open FinClip Studio and log in with your developer account
3. Click the '+' button to create a new project or import an existing one
4. Enter a project name and select the project directory

#### Step 2: Configure the Project

1. Update the `project.config.json` file with your AppID (obtained from the FinClip Developer Platform)
2. Modify the `app.json` to configure pages, window styles, and other global settings
3. Update the API endpoint in `utils/api.js` to point to your FinClip Agent backend

#### Step 3: Local Development and Testing

1. Use the built-in simulator in FinClip Studio to preview the mini-program
2. Make code changes and see them reflected in real-time
3. Debug using the Developer Tools panel (Console, Network, Storage, etc.)
4. Test API connectivity with your backend

#### Step 4: Preview on Real Device

1. Click the "Preview" button in FinClip Studio
2. Scan the generated QR code with a device that has the FinClip App installed
3. Test the mini-program on the actual device to ensure proper functionality

### Deployment Process

#### Step 1: Create Mini-Program on FinClip Platform

1. Log in to the [FinClip Developer Platform](https://en.finclip.com)
2. Create a new mini-program entry and obtain an AppID
3. Configure the basic information (name, icon, description, etc.)

#### Step 2: Upload Mini-Program Code

1. In FinClip Studio, ensure you're logged in with your developer account
2. Associate your local project with the mini-program created on the platform
3. Click the "Upload" button to submit your code
4. A development version will be created on the platform

#### Step 3: Submit for Review

**Note**: The FinClip public platform is currently used by developers for testing and development purposes. So this review process is skipped. But if you are deploying to your own platform, you can enable the review process and approve yourself.

1. Log in to the FinClip Developer Platform
2. Navigate to the mini-program management section
3. Find the uploaded version and submit it for review
4. Provide necessary documentation and testing accounts if required

#### Step 4: Release the Mini-Program

1. Once the review is passed, you can release the mini-program
2. Choose between staged release (gradual rollout) or full release
3. The mini-program will be available in the FinClip App and any SuperApps that integrate the FinClip SDK

### Integration with SuperApps

To make your mini-program available in a SuperApp:

1. The SuperApp must integrate the FinClip SDK
2. The SuperApp owner needs to add your mini-program to their approved list
3. Users can then access your mini-program through the SuperApp's mini-program marketplace

### Embedding FinClip SDK in Your App

If you want to quickly add an agent/chatbot to your existing mobile application, we highly recommend embedding the FinClip SDK:

1. **What is FinClip SDK?**
   - A mini-program runtime and security sandbox
   - Allows any mini-program to run within your app
   - Provides isolation and security for third-party code

2. **Benefits for Agent Integration:**
   - Rapid deployment of this chatbot UI without extensive native development
   - Comparable to embedding the web version of the chat widget in a website
   - Updates to the agent can be deployed without updating the host app
   - Consistent user experience across different platforms

3. **Implementation:**
   - Integrate the FinClip SDK into your iOS/Android app
   - Deploy this mini-program to your FinClip developer account
   - Configure your app to automatically open this mini-program
   - Customize the appearance and behavior through the SDK

This approach provides the fastest path to adding a full-featured agent to your existing mobile application while maintaining security and flexibility.

## Relationship to Web Implementation

This mini-program implementation mirrors the functionality of the web version (`/web`) while adapting to the FinClip platform capabilities. Both implementations use the same backend API endpoints but use different streaming technologies:

- **Web**: Uses Server-Sent Events (EventSource API)
- **Mini-Program**: 
  - Primary method: WebSocket connections (experimental but recommended)
  - Alternative method: Chunked HTTP transfer (partially implemented, may be deprecated)

The mini-program approach offers similar benefits to embedding the web chat widget in a website, but with better mobile integration and native-like performance. For web applications, use the web implementation; for mobile apps, either embed this mini-program via FinClip SDK or use the web implementation in a WebView.

## Cross-Platform Compatibility

### FinClip and WeChat Compatibility

FinClip and WeChat mini-programs share the same fundamental framework and syntax, making them highly compatible. This mini-program can be deployed on both platforms with minimal modifications. We recommend developing and testing with FinClip first using the FinClip App or FinClip For Enterprise (both available on iOS and Android platforms), then adapting for WeChat if needed.

### Deploying on WeChat Platform

If you want to deploy this mini-program on WeChat as well, follow these steps:

#### Prerequisites for WeChat

1. Register for a [WeChat Developer account](https://mp.weixin.qq.com/)
2. Create a WeChat Mini-Program and obtain an AppID
3. Download and install [WeChat Developer Tools](https://developers.weixin.qq.com/miniprogram/en/dev/devtools/download.html)

#### Development Process for WeChat

1. Open the project in WeChat Developer Tools
2. Update the AppID in `project.config.json` with your WeChat Mini-Program AppID
3. Test the mini-program in the WeChat simulator
4. Make any necessary adjustments for WeChat-specific APIs

#### Deployment on WeChat

1. Test thoroughly in the WeChat Developer Tools simulator
2. Upload for review in the WeChat Mini-Program dashboard
3. Once approved, the mini-program will be available to WeChat users

#### Key Differences to Consider

- API endpoints: Ensure your backend is accessible from WeChat's network
- Network requests: WeChat has specific security requirements for network requests
- User authentication: WeChat uses its own authentication system

### Recommended Approach

For the best cross-platform experience:

1. Develop and test with FinClip Studio first
2. Use FinClip App or FinClip For Enterprise for real device testing
3. Adapt for WeChat as a secondary platform if needed
4. Maintain a single codebase with conditional logic for platform-specific features

## Resources

### FinClip Resources

- [FinClip Official Website](https://en.finclip.com)
- [FinClip Documentation](https://www.finclip.com/mop-en/document/)
- [FinClip Studio Download](https://en.finclip.com/resources/downloads)
- [FinClip Developer Community](https://en.finclip.com/community/)

### WeChat Resources

- [WeChat Mini-Program Documentation](https://developers.weixin.qq.com/miniprogram/en/dev/)
- [WeChat Developer Tools](https://developers.weixin.qq.com/miniprogram/en/dev/devtools/download.html)
