import { useState, useEffect, useRef } from 'react'
import { ChatApp } from './ChatApp'
import { MessageCircle, X } from 'lucide-react'

interface FloatingChatWidgetProps {
  buttonLabel?: string
  initialOpen?: boolean
  suggestions?: string[]
  suggestionsLabel?: string
  apiUrl?: string
  streamingUrl?: string
}

export function FloatingChatWidget({ 
  buttonLabel = "Chat with us", 
  initialOpen = false,
  suggestions = [],
  suggestionsLabel,
  apiUrl,
  streamingUrl
}: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  // Monitor for new messages and scroll to bottom
  useEffect(() => {
    if (!isOpen) return;
    
    // Function to scroll chat messages to bottom
    const scrollToBottom = () => {
      // Find the scrollable container in the chat component
      const chatMessagesContainer = document.querySelector('.overflow-y-auto');
      if (chatMessagesContainer) {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
      }
    };
    
    // Initial scroll with a delay to ensure content is rendered
    const initialScrollTimeout = setTimeout(scrollToBottom, 300);
    
    // Set up observer for message changes
    const observer = new MutationObserver(() => {
      // Always scroll to bottom when content changes
      setTimeout(scrollToBottom, 100);
    });
    
    // Find the chat container to observe
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      // Observe the entire subtree for any changes
      observer.observe(chatContainer, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
    
    return () => {
      clearTimeout(initialScrollTimeout);
      observer.disconnect();
    };
  }, [isOpen])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat Panel (conditionally rendered) */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-2 bg-blue-600 text-white flex justify-between items-center">
            <span className="font-semibold">FinClip Assistant</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-1 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div ref={chatContainerRef} className="flex-1 overflow-hidden">
            <ChatApp 
              suggestions={suggestions} 
              suggestionsLabel={suggestionsLabel}
              apiUrl={apiUrl}
              streamingUrl={streamingUrl}
            />
          </div>
        </div>
      )}
      
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full ${
          isOpen ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
        } text-white p-4 shadow-lg flex items-center transition-all duration-300`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 mr-2" />
            <span>{buttonLabel}</span>
          </>
        )}
      </button>
    </div>
  )
}
