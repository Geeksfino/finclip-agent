import { useState, useCallback, useRef, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: Date
}

export interface UseChatOptions {
  id?: string
  initialMessages?: ChatMessage[]
  onFinish?: (message: ChatMessage) => void
  onError?: (error: Error) => void
  apiUrl?: string
  streamingUrl?: string
}

export function useChat({
  id = 'user',
  initialMessages = [],
  onFinish,
  onError,
  apiUrl = 'http://localhost:5678',
  streamingUrl = 'http://localhost:5679'
}: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const sessionRef = useRef<string | null>(null)
  const streamRef = useRef<EventSource | null>(null)
  const processedKeysRef = useRef<Set<string>>(new Set())

  // Clean up event source on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.close()
      }
    }
  }, [])

  const appendUserMessage = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date()
    }
    
    setMessages((prevMessages: ChatMessage[]) => [...prevMessages, userMessage])
    return userMessage
  }, [])

  const appendAssistantMessage = useCallback((content: string) => {
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content,
      createdAt: new Date()
    }
    
    setMessages((prevMessages: ChatMessage[]) => {
      // Check if we already have an assistant message as the last message
      const lastMessage = prevMessages[prevMessages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        // Append to the last message content instead of replacing it
        return [
          ...prevMessages.slice(0, -1),
          { ...lastMessage, content: lastMessage.content + content }
        ]
      }
      
      // Otherwise add a new message
      return [...prevMessages, assistantMessage]
    })
    
    onFinish?.(assistantMessage)
    return assistantMessage
  }, [onFinish])

  const createSession = useCallback(async (message: string): Promise<string | undefined> => {
    try {
      console.log('Creating new session...')
      const response = await fetch(`${apiUrl}/createSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Only include credentials if not on localhost
        ...(apiUrl.includes('localhost') ? {} : { credentials: 'include' }),
        body: JSON.stringify({ 
          owner: id,
          description:message,
          enhancePrompt: false
        })
      })
      
      console.log(`Response status: ${response.status} ${response.statusText}`)
      
      if (!response.ok) {
        // Handle CORS errors specifically
        if (response.status === 0) {
          throw new Error('CORS error: The server is not allowing cross-origin requests. Check server CORS configuration.')
        }
        throw new Error(`Failed to create session: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Session created:', data)
      
      if (!data?.sessionId) {
        throw new Error('Session creation failed - no session ID returned')
      }
      
      sessionRef.current = data.sessionId
      return data.sessionId
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create session')
      console.error(`Error creating session: ${error.message}`)
      setError(error)
      onError?.(error)
      return undefined
    }
  }, [id, onError, apiUrl])

  const setupResponseHandling = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!sessionRef.current) {
        reject(new Error('No active session'));
        return;
      }
      
      //const url = `${streamingUrl}/session/${sessionRef.current}`// don't remove
      const url = `${streamingUrl}/raw`
      console.log(`Setting up event source at ${url}`)
      
      // Close existing stream if any
      if (streamRef.current) {
        streamRef.current.close()
      }
      
      try {
        // Create new event source with explicit credentials setting
        const eventSource = new EventSource(url, {
          withCredentials: false // Set back to false until backend CORS is updated
        })
        streamRef.current = eventSource
        
        // Reset processed keys for this new stream
        processedKeysRef.current = new Set<string>()
        
        // Setup timeout to detect stalled connections
        let timeoutId: ReturnType<typeof setTimeout>;
        
        // Handle connection open
        eventSource.onopen = () => {
          console.log("EventSource connection opened");
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            console.error("Response timeout after 120s");
            const timeoutError = new Error('Connection timeout after 120 seconds');
            setError(timeoutError);
            onError?.(timeoutError);
            eventSource.close();
            setIsGenerating(false);
            setIsLoading(false);
            reject(timeoutError);
          }, 120000); // 2 minutes timeout
        };
        
        eventSource.onmessage = (event) => {
          console.log('EventSource message:', event)
          try {
            // Reset timeout on each message
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              console.error("Response timeout after 120s");
              const timeoutError = new Error('Connection timeout after 120 seconds');
              setError(timeoutError);
              onError?.(timeoutError);
              eventSource.close();
              setIsGenerating(false);
              setIsLoading(false);
              reject(timeoutError);
            }, 120000);
            
            // Skip keepalive messages
            if (!event.data || event.data.startsWith(':')) {
              console.log('Received keepalive');
              return;
            }
            
            const rawData = event.data;
            console.log('Received message data:', rawData);
            
            try {
              // Try to parse as JSON first
              let jsonData;
              try {
                jsonData = JSON.parse(rawData);
                console.log('Parsed as JSON:', jsonData);
                
                // Handle completion signal
                if (jsonData.type === 'completion' && jsonData.reason === 'stop') {
                  console.log('Completion stopped');
                  setIsGenerating(false);
                  setIsLoading(false);
                  return;
                }
                
                // Handle error messages
                if (jsonData.type === 'error') {
                  console.error(`Server error: ${jsonData.message}`);
                  const serverError = new Error(jsonData.message || 'Server error');
                  setError(serverError);
                  onError?.(serverError);
                  eventSource.close();
                  setIsGenerating(false);
                  setIsLoading(false);
                  reject(serverError);
                  return;
                }
                
                // Handle connection messages
                if (jsonData.type === 'connected') {
                  console.log('Connected to stream');
                  resolve();
                  return;
                }
                
                // Handle message with content field
                if (jsonData.content) {
                  appendAssistantMessage(jsonData.content);
                  return;
                }
              } catch (e) {
                // Not JSON, treat as plain text content
                console.log('Not JSON, treating as text content');
                appendAssistantMessage(rawData);
              }
              
              // Start a timer to reset state after receiving content
              // This ensures UI resets even without explicit completion signal
              setTimeout(() => {
                setIsGenerating(false);
                setIsLoading(false);
              }, 500);
            } catch (err) {
              console.error('Error processing message:', err);
            }
          } catch (err) {
            console.error('Error parsing event data:', err)
          }
        }
        
        eventSource.onerror = (err) => {
          console.error('EventSource error:', err)
          
          // Check connection state
          if (eventSource.readyState === EventSource.CLOSED) {
            console.error('Connection was closed');
            const connectionError = new Error('Connection to server lost');
            setError(connectionError);
            onError?.(connectionError);
            setIsGenerating(false);
            setIsLoading(false);
            reject(connectionError);
          } else if (eventSource.readyState === EventSource.CONNECTING) {
            console.error('Connection is reconnecting');
            return; // Don't reject while reconnecting
          }
          
          // Handle other errors
          eventSource.close();
          setIsGenerating(false);
          setIsLoading(false);
          
          const error = new Error('Connection to server lost');
          setError(error);
          onError?.(error);
          clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('Error setting up event source:', error);
        setIsGenerating(false);
        setIsLoading(false);
        setError(error instanceof Error ? error : new Error('Unknown error'));
        onError?.(error instanceof Error ? error : new Error('Unknown error'));
        reject(error);
      }
    });
  }, [onError, appendAssistantMessage, setIsGenerating, setIsLoading, setError, streamingUrl])

  const handleSubmit = useCallback(async (e?: FormEvent) => {
    e?.preventDefault()
    
    if (!input.trim() || isLoading) return
    
    // Add user message to the chat
    appendUserMessage(input)
    
    // Clear input and set loading state
    setInput('')
    setIsLoading(true)
    setIsGenerating(true)
    setError(null)
    
    try {
      // Create session if needed
      if (!sessionRef.current) {
        const sessionId = await createSession(input)
        if (!sessionId) {
          throw new Error('Failed to create session')
        }
        
        // Set up event source for streaming responses
        try {
          await setupResponseHandling()
          console.log('Response handling setup successfully')
        } catch (error) {
          console.error('Failed to setup response handling:', error)
          const streamError = error instanceof Error ? error : new Error('Failed to connect to streaming server')
          setError(streamError)
          onError?.(streamError)
          setIsGenerating(false)
          setIsLoading(false)
        }
      } else {
        // Send message to existing session
        const response = await fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Only include credentials if not on localhost
          ...(apiUrl.includes('localhost') ? {} : { credentials: 'include' }),
          body: JSON.stringify({ 
            sessionId: sessionRef.current,
            message: input
          })
        })
        
        if (!response.ok) {
          // Handle CORS errors specifically
          if (response.status === 0) {
            throw new Error('CORS error: The server is not allowing cross-origin requests. Check server CORS configuration.')
          }
          throw new Error(`Failed to send message: ${response.statusText}`)
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error during chat')
      console.error(error)
      setError(error)
      onError?.(error)
      
      // Reset loading state
      setIsLoading(false)
      setIsGenerating(false)
    }
  }, [
    input, 
    isLoading, 
    appendUserMessage, 
    createSession, 
    setupResponseHandling, 
    onError, 
    apiUrl
  ])
          
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }, [])
  
  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.close()
      streamRef.current = null
    }
    
    setIsGenerating(false)
    setIsLoading(false)
  }, [])
  const reset = useCallback(() => {
    setMessages(initialMessages)
    setInput('')
    setIsLoading(false)
    setIsGenerating(false)
    setError(null)
    
    // Close existing stream
    if (streamRef.current) {
      streamRef.current.close()
      streamRef.current = null
    }
    
    // Clear session
    sessionRef.current = null
  }, [initialMessages])
                  
  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    isGenerating,
    error,
    stop,
    reset,
    append: appendUserMessage
  }
}
