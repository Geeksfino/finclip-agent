// Development version of the embed script
import React from 'react'
import ReactDOM from 'react-dom/client'
import { FloatingChatWidget } from './components/FloatingChatWidget'
import './index.css'

interface FinClipChatConfig {
  buttonLabel?: string
  initialOpen?: boolean
  suggestions?: string[]
  suggestionsLabel?: string
  apiUrl?: string
  streamingUrl?: string
}

declare global {
  interface Window {
    initFinClipChat: (config?: FinClipChatConfig) => void
  }
}

// Function to initialize the chat widget
window.initFinClipChat = (config = {}) => {
  // Get API URLs from script data attributes if not provided in config
  if (!config.apiUrl || !config.streamingUrl) {
    const scriptTag = document.querySelector('script[data-finclip-chat]') as HTMLScriptElement | null
    if (scriptTag) {
      config.apiUrl = config.apiUrl || scriptTag.getAttribute('data-api-url') || 'http://localhost:5678'
      config.streamingUrl = config.streamingUrl || scriptTag.getAttribute('data-streaming-url') || 'http://localhost:5679'
    }
  }
  
  console.log('Initializing FinClip Chat Widget with config:', config)
  
  // Create container if it doesn't exist
  let container = document.getElementById('finclip-chat-widget')
  
  if (!container) {
    container = document.createElement('div')
    container.id = 'finclip-chat-widget'
    document.body.appendChild(container)
  }
  
  // Render the widget
  ReactDOM.createRoot(container).render(
    React.createElement(FloatingChatWidget, config)
  )
}

// Auto-initialize if data attribute is present
document.addEventListener('DOMContentLoaded', () => {
  const script = document.querySelector('script[data-finclip-chat]')
  if (script) {
    window.initFinClipChat()
  }
})
