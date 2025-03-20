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
