// chat.js
const app = getApp();
const markdown = require('../../utils/markdown');
const DEFAULT_SUGGESTIONS = [
  "What is a SuperApp?",
  "Explain to me Mini-program technology",
  "How does SuperApp empower digital business?"
];

Page({
  data: {
    messages: [],
    inputValue: '',
    isTyping: false,
    error: null,
    suggestions: DEFAULT_SUGGESTIONS,
    lastMessageId: null,
    isStreaming: false,
    textareaFocused: false,
    textareaHeight: 40, // Initial height in pixels
    isShiftKeyPressed: false // Track if Shift is pressed (limited support)
  },

  onLoad: function() {
    // Initialize buffer for partial JSON chunks
    this.chunkBuffer = '';
    this.createSession('Hello');
  },

  // Enhanced input change handler with key detection for desktop
  onInputWithKeyWatch: function(e) {
    const value = e.detail.value;
    const cursor = e.detail.cursor;
    const keyCode = e.detail.keyCode;
    
    // Detect if Enter key was pressed (desktop emulator)
    // keyCode 13 is Enter
    const lastChar = value.charAt(cursor - 1);
    const isEnterKeyEvent = keyCode === 13 || lastChar === '\n';
    
    // Special handling for Enter key on desktop
    if (isEnterKeyEvent && !e.detail.value.endsWith('\n\n')) { 
      // If Shift key isn't pressed (check for keyCode or a standalone newline)
      // This is a simplified heuristic since we can't directly detect Shift on mini-program
      const isShiftEnter = this.data.isShiftKeyPressed;
      
      if (!isShiftEnter && value.trim() && !this.data.isTyping) {
        console.log('Enter key detected in desktop environment');
        
        // If this looks like a standalone Enter for sending (not Shift+Enter for newline)
        // Let's submit the form
        setTimeout(() => {
          // Remove the trailing newline from the input
          const cleanValue = value.endsWith('\n') ? value.slice(0, -1) : value;
          
          // First update the input value without the newline
          this.setData({ inputValue: cleanValue });
          
          // Then submit
          this.onFormSubmit({ detail: { value: { message: cleanValue } } });
        }, 10);
        
        return;
      }
    }
    
    // Normal input handling
    this.setData({
      inputValue: value
    });
    
    // Calculate height based on input text
    this.calculateTextareaHeight(value);
  },
  
  // Calculate textarea height based on content
  calculateTextareaHeight: function(text) {
    // Constants for calculations
    const LINE_HEIGHT = 20; // Line height in pixels
    const MIN_HEIGHT = 40;  // Minimum height (pixels)
    const MAX_HEIGHT = 200; // Maximum height (pixels)
    const PADDING = 20;     // Total padding (top + bottom)
    const CHARS_PER_LINE = 24; // Approximate characters per line
    
    let numLines = 1;
    
    if (!text) {
      // Empty text - use min height
      numLines = 1;
    } else {
      // Count explicit newlines
      const newlines = (text.match(/\n/g) || []).length;
      
      // Count character-based line wrapping
      // Get text without newlines to calculate wrapping
      const textWithoutNewlines = text.replace(/\n/g, '');
      const wrappedLines = Math.ceil(textWithoutNewlines.length / CHARS_PER_LINE);
      
      // Total lines is newlines + wrapped lines
      numLines = newlines + wrappedLines;
    }
    
    // Calculate height based on lines (plus padding)
    let height = (numLines * LINE_HEIGHT) + PADDING;
    
    // Bound within min/max
    height = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, height));
    
    // Only update if height changed
    if (this.data.textareaHeight !== height) {
      this.setData({
        textareaHeight: height
      });
    }
  },

  onTextareaFocus: function() {
    this.setData({
      textareaFocused: true
    });
    // Scroll to bottom when focusing the textarea
    this.scrollToBottom();
  },

  onTextareaBlur: function() {
    this.setData({
      textareaFocused: false
    });
  },

  // Handle form submit (triggered by Enter key or submit button)
  onFormSubmit: function(e) {
    console.log('Form submitted:', e);
    
    // Don't proceed if we're already typing a response
    if (this.data.isTyping) return;
    
    // Get message from form, or use the current inputValue
    const message = e.detail.value.message || this.data.inputValue;
    
    // Only send if there's actual content
    if (message && message.trim()) {
      // Use the onSend method
      this.onSend();
    }
  },
  
  // Handle keyboard events for additional context
  onKeyboardEvent: function(e) {
    console.log('Keyboard event:', e.detail);
    
    // We could use this to detect Shift key in some environments
    // but it's not consistently available in mini-program
  },

  onSend: function() {
    const { inputValue } = this.data;
    if (!inputValue.trim() || this.data.isTyping) return;
    
    // Get the trimmed input value
    const trimmedInput = inputValue.trim();
    
    // Add user message to chat
    this.appendUserMessage(trimmedInput);
    
    // Reset input and maintain focus
    this.setData({ 
      inputValue: '' 
    });
    
    // Send the message
    this.sendMessage(trimmedInput);
    
    // Set focus back to textarea after a short delay
    setTimeout(() => {
      this.setData({
        textareaFocused: true
      });
    }, 100);
  },

  onSuggestionTap: function(e) {
    const suggestion = e.currentTarget.dataset.suggestion;
    
    // Add user message to chat
    this.appendUserMessage(suggestion);
    
    // Clear input
    this.setData({ inputValue: '' });
    
    // Send the message
    this.sendMessage(suggestion);
  },

  createSession: function(initialMessage) {
    const that = this;
    wx.showLoading({ title: 'Connecting...' });
    
    wx.request({
      url: `${app.globalData.apiUrl}/createSession`,
      method: 'POST',
      data: {
        owner: 'miniprogram-user',
        description: initialMessage,
        enhancePrompt: false
      },
      success: function(res) {
        if (res.statusCode === 200 && res.data.sessionId) {
          console.log('Session created:', res.data.sessionId);
          app.globalData.sessionId = res.data.sessionId;
          // Add welcome message
          that.appendAssistantMessage('Hello! I\'m your FinClip Assistant. How can I help you today?');
        } else {
          console.error('Failed to create session:', res);
          that.setData({
            error: 'Failed to connect to assistant. Please try again.'
          });
        }
      },
      fail: function(err) {
        console.error('Create session request failed:', err);
        that.setData({
          error: 'Network error. Please check your connection.'
        });
      },
      complete: function() {
        wx.hideLoading();
      }
    });
  },

  sendMessage: function(content) {
    if (!app.globalData.sessionId) {
      console.error('No active session');
      this.createSession(content);
      return;
    }

    // Show typing indicator
    this.setData({ isTyping: true });

    // Send message to API
    wx.request({
      url: `${app.globalData.apiUrl}/chat`,
      method: 'POST',
      data: {
        sessionId: app.globalData.sessionId,
        message: content
      },
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('Message sent successfully');
          // Start streaming for response
          this.startStreaming();
        } else {
          console.error('Send message failed:', res);
          this.setData({
            error: 'Failed to send message. Please try again.',
            isTyping: false
          });
        }
      },
      fail: (err) => {
        console.error('Send message request failed:', err);
        this.setData({
          error: 'Network error. Please check your connection.',
          isTyping: false
        });
      }
    });
  },

  startStreaming: function() {
    if (!app.globalData.sessionId) {
      console.error('No active session for streaming');
      this.setData({ isTyping: false });
      return;
    }

    this.setData({ isStreaming: true });
    
    const streamUrl = `${app.globalData.streamingUrl}/session/${app.globalData.sessionId}`;
    console.log('Stream URL:', streamUrl);
    
    // Create streaming request with chunked transfer
    const requestTask = wx.request({
      url: streamUrl,
      method: 'GET',
      header: {
        'X-Client-Type': 'miniprogram' // Identify as a mini-program client
      },
      responseType: 'text',
      enableChunked: true,
      success: (res) => {
        console.log('Stream connection established');
      },
      fail: (error) => {
        console.error('Failed to establish stream connection:', error);
        this.setData({ 
          isStreaming: false,
          isTyping: false,
          error: 'Failed to connect to assistant stream. Please try again.'
        });
      },
      complete: (res) => {
        if (res.statusCode !== 200) {
          console.error('Stream request failed with status:', res.statusCode);
          this.setData({ 
            isStreaming: false,
            isTyping: false 
          });
        }
      }
    });

    // Add event handler for chunks
    requestTask.onChunkReceived((res) => {
      console.log('Chunk received');
      
      // Convert chunk to text
      const arrayBuffer = res.data;
      const uint8Array = new Uint8Array(arrayBuffer);
      const chunk = new TextDecoder('utf-8').decode(uint8Array);
      
      this.processStreamChunk(chunk);
    });
  },

  processStreamChunk: function(chunk) {
    if (!chunk || chunk.trim() === '') {
      // Skip empty chunks
      return;
    }

    // For keepalive messages in JSON format
    if (chunk.includes('"type":"keepalive"')) {
      console.log('Received keepalive');
      return;
    }
    
    // Check for completion signal in raw text
    if (chunk.includes('"type":"completion"') && chunk.includes('"reason":"stop"')) {
      console.log('Completion signal received in raw format');
      this.setData({ 
        isStreaming: false,
        isTyping: false
      });
      return;
    }

    // Add the chunk to our buffer
    this.chunkBuffer += chunk;
    
    try {
      // First, try to extract valid JSON objects from the buffer
      this.processBufferedChunks();
      
      // If we still have content in the buffer, it might be plain text
      if (this.chunkBuffer.trim()) {
        // Check if buffer ends with what looks like an incomplete JSON
        if (this.isIncompleteJson(this.chunkBuffer)) {
          console.log('Buffer contains incomplete JSON, waiting for more chunks');
          return;
        }
        
        // Otherwise treat remaining buffer as plain text
        console.log('Processing remaining buffer as plain text');
        this.appendAssistantMessage(this.chunkBuffer);
        this.chunkBuffer = '';
      }
    } catch (err) {
      console.error('Error processing stream chunk:', err);
      this.setData({ 
        isStreaming: false,
        isTyping: false
      });
    }
  },
  
  // Process any complete JSON objects in buffer
  processBufferedChunks: function() {
    let buffer = this.chunkBuffer;
    let validObjects = [];
    let currentPosition = 0;
    
    // Try to find complete JSON objects in buffer
    while (currentPosition < buffer.length) {
      try {
        // Try to find a JSON object starting at current position
        let startPos = buffer.indexOf('{', currentPosition);
        if (startPos === -1) break;
        
        // Find matching closing brace
        let depth = 0;
        let endPos = -1;
        
        for (let i = startPos; i < buffer.length; i++) {
          if (buffer[i] === '{') depth++;
          else if (buffer[i] === '}') {
            depth--;
            if (depth === 0) {
              endPos = i + 1;
              break;
            }
          }
        }
        
        if (endPos === -1) {
          // No complete JSON object found
          currentPosition = startPos + 1;
          continue;
        }
        
        // Extract and parse the JSON object
        let jsonStr = buffer.substring(startPos, endPos);
        let jsonObj = JSON.parse(jsonStr);
        
        // Process the JSON object
        this.processJsonObject(jsonObj);
        
        // Remove the processed object from buffer
        buffer = buffer.substring(0, startPos) + buffer.substring(endPos);
        currentPosition = 0; // Reset position since we modified the buffer
      } catch (e) {
        console.log('Error processing JSON in buffer:', e);
        currentPosition++;
      }
    }
    
    // Update the buffer with any remaining content
    this.chunkBuffer = buffer;
  },
  
  // Process a single valid JSON object
  processJsonObject: function(data) {
    console.log('Processing JSON object:', data);
    
    // Handle completion signal
    if (data.type === 'completion' && data.reason === 'stop') {
      console.log('Streaming complete');
      this.setData({ 
        isStreaming: false,
        isTyping: false
      });
      return;
    }
    
    // Handle connected message
    if (data.type === 'connected') {
      console.log('Stream connected, session:', data.sessionId);
      return;
    }
    
    // Handle content message
    if (data.type === 'content' || data.content) {
      this.appendAssistantMessage(data.content);
      return;
    }
    
    // Handle error messages
    if (data.type === 'error') {
      console.error('Server error:', data.message || data.error);
      this.setData({
        error: data.message || data.error || 'Server error',
        isStreaming: false,
        isTyping: false
      });
      return;
    }
    
    // Handle choices/delta structure (OpenAI compatible format)
    if (data.choices && data.choices[0] && data.choices[0].delta) {
      const delta = data.choices[0].delta;
      if (delta.content) {
        this.appendAssistantMessage(delta.content);
      }
      return;
    }
  },
  
  // Check if string looks like an incomplete JSON object
  isIncompleteJson: function(str) {
    // Count opening and closing braces
    let openBraces = (str.match(/\{/g) || []).length;
    let closeBraces = (str.match(/\}/g) || []).length;
    
    // If we have unbalanced braces, it's likely incomplete JSON
    return openBraces !== closeBraces && str.includes('{');
  },

  appendUserMessage: function(content) {
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content,
      timestamp: new Date().toISOString()
    };
    
    this.setData({
      messages: [...this.data.messages, userMessage],
      lastMessageId: `msg-${userMessage.id}`
    });
    
    this.scrollToBottom();
  },

  appendAssistantMessage: function(content) {
    const messages = this.data.messages;
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    
    if (lastMessage && lastMessage.role === 'assistant') {
      // Append to the existing assistant message
      lastMessage.content += content;
      
      // Process markdown for rich text display
      try {
        lastMessage.formattedContent = markdown.markdownToNodes(lastMessage.content);
      } catch (e) {
        console.error('Error parsing markdown:', e);
        // If markdown parsing fails, formattedContent will remain undefined
        // and the UI will fall back to plain text
      }
      
      this.setData({
        messages: [...messages.slice(0, -1), lastMessage],
        lastMessageId: `msg-${lastMessage.id}`,
        isTyping: true
      });
    } else {
      // Create a new assistant message
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: content,
        timestamp: new Date().toISOString()
      };
      
      // Process markdown for rich text display
      try {
        assistantMessage.formattedContent = markdown.markdownToNodes(content);
      } catch (e) {
        console.error('Error parsing markdown:', e);
        // If markdown parsing fails, formattedContent will remain undefined
      }
      
      this.setData({
        messages: [...messages, assistantMessage],
        lastMessageId: `msg-${assistantMessage.id}`,
        isTyping: true
      });
    }
    
    this.scrollToBottom();

    // Set a short timeout to give the UI time to update
    // before marking "typing" as false (to make transitions smooth)
    setTimeout(() => {
      this.setData({ isTyping: false });
    }, 500);
  },

  scrollToBottom: function() {
    // Use a short delay to ensure rendered content is available
    setTimeout(() => {
      wx.createSelectorQuery()
        .select('.message-list')
        .boundingClientRect(rect => {
          if (rect && this.data.lastMessageId) {
            wx.pageScrollTo({
              selector: `#${this.data.lastMessageId}`,
              duration: 300
            });
          }
        })
        .exec();
    }, 200);
  },

  copyMessage: function(e) {
    const { content } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: 'Copied to clipboard',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },

  onResetError: function() {
    this.setData({ error: null });
  },

  onUnload: function() {
    this.setData({ isStreaming: false });
  }
})
