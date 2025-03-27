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
  // Get configuration from script data attributes if not provided in config
  const scriptTag = document.querySelector('script[data-finclip-chat]') as HTMLScriptElement | null
  if (scriptTag) {
    // Get API URLs
    if (!config.apiUrl || !config.streamingUrl) {
      config.apiUrl = config.apiUrl || scriptTag.getAttribute('data-api-url') || 'http://localhost:5678'
      config.streamingUrl = config.streamingUrl || scriptTag.getAttribute('data-streaming-url') || 'http://localhost:5679'
    }
    
    // Get suggestions
    if (!config.suggestions) {
      const suggestionsAttr = scriptTag.getAttribute('data-suggestions')
      if (suggestionsAttr) {
        config.suggestions = suggestionsAttr.split(',').map(s => s.trim())
      }
    }
    
    // Get suggestions label
    if (!config.suggestionsLabel) {
      config.suggestionsLabel = scriptTag.getAttribute('data-suggestions-label') || undefined
    }
    
    // Get button label
    if (!config.buttonLabel) {
      config.buttonLabel = scriptTag.getAttribute('data-button-label') || undefined
    }
  }
  
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
