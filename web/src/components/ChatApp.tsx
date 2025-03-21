import { useChat } from './hooks/use-chat'
import { ChatContainer, ChatForm, ChatMessages } from './ui/chat'
import { MessageInput } from './ui/message-input'
import { MessageList } from './ui/message-list'
import { PromptSuggestions } from './ui/prompt-suggestions'
import { CopyButton } from './ui/copy-button'

// Define props interface for ChatApp
interface ChatAppProps {
  suggestions?: string[];
  suggestionsLabel?: string;
  apiUrl?: string;
  streamingUrl?: string;
}

export function ChatApp({ 
  suggestions = [], 
  suggestionsLabel = "Try these prompts ",
  apiUrl = "http://localhost:5678",
  streamingUrl = "http://localhost:5679"
}: ChatAppProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isGenerating,
    error,
    stop,
    reset,
    setInput
  } = useChat({ apiUrl, streamingUrl })

  // Use default suggestions if none provided
  const defaultSuggestions = [
    "What is a SuperApp?",
    "Explain to me Mini-program technology",
    "How does SuperApp empower digital business?"
  ]
  
  // Use provided suggestions or fallback to defaults
  const promptSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions

  return (
    <div className="flex flex-col h-full">
      <header className="border-b p-4 flex items-center justify-between">
        {isGenerating && (
          <div className="flex items-center text-blue-600">
            <span className="text-xs ml-2">Thinking...</span>
          </div>
        )}
      </header>
      
      <ChatContainer className="flex-1 flex flex-col overflow-hidden">
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mx-4 mt-4">
            Reminder: {error.message}
            <button 
              onClick={reset}
              className="ml-2 underline text-sm"
            >
              Reset
            </button>
          </div>
        )}
        
        <ChatMessages messages={messages}>
          <div className="px-3 pt-3"> {/* Adjusted padding with top spacing */}
            {messages.length === 0 && suggestions?.length ? (
              <div className="py-4 px-2">
                <PromptSuggestions
                  label={suggestionsLabel}
                  suggestions={promptSuggestions}
                  append={(message) => {
                    // Only set the input value without auto-submitting
                    setInput(message.content);
                    
                    // Don't auto-submit - let the user decide when to send
                    // This gives them a chance to review or modify the suggestion
                    // or select a different suggestion
                  }}
                />
              </div>
            ) : (
              <MessageList 
                messages={messages} 
                isTyping={isGenerating} 
                messageOptions={(message) => ({
                  actions: message.role === "assistant" ? (
                    <CopyButton
                      content={message.content}
                      copyMessage="Copied response to clipboard!"
                    />
                  ) : undefined,
                })}
              />
            )}
          </div>
        </ChatMessages>
        
        <ChatForm
          className="flex-shrink-0 border-t bg-background p-4"
          isPending={isGenerating}
          handleSubmit={(event) => {
            if (event?.preventDefault) event.preventDefault();
            handleSubmit();
          }}
        >
          {({ files, setFiles }: { files: File[] | null; setFiles: React.Dispatch<React.SetStateAction<File[] | null>> }) => (
            <MessageInput
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about FinClip..."
              disabled={isGenerating}
              files={files}
              setFiles={setFiles}
              isGenerating={isGenerating}
              stop={stop}
            />
          )}
        </ChatForm>
      </ChatContainer>
    </div>
  )
}
