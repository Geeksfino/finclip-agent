// chat.js
const app = getApp();
const markdown = require('../../utils/towxml-helper');
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
    
    // Add initial welcome message without creating a session
    const welcomeMessage = {
      role: 'assistant',
      content: 'Hello! I\'m your FinClip Assistant. How can I help you today?',
      id: 'welcome-message',
      // Process through markdown to get consistent styling
      rendered: markdown.markdownToNodes('Hello! I\'m your FinClip Assistant. How can I help you today?', 'light')
    };
    
    this.setData({
      messages: [welcomeMessage]
    });
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

  onSend: function(message) {
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
    wx.showLoading({ title: 'Starting conversation...' });
    
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
          
          // Now that we have a session, send the first message
          that.sendMessage(initialMessage);
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
          error: 'Network error. Please check your connection.',
          isTyping: false
        });
      },
      complete: function() {
        wx.hideLoading();
      }
    });
  },

  sendMessage: function(content) {
    // If no active session exists, create one first
    if (!app.globalData.sessionId) {
      console.log('Creating new session for first message');
      this.createSession(content);
      return;
    }

    // Show typing indicator and disable input
    this.setData({ 
      isTyping: true,
      inputDisabled: true
    });

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
    this.streamingStarted = false; // Reset streaming state
    
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

  // Helper to find the end of a complete JSON object
  findJsonEnd: function(str) {
    let stack = [];
    let inString = false;
    let escaped = false;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === '\\') {
          escaped = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }
      
      if (char === '"') {
        inString = true;
      } else if (char === '{') {
        stack.push(char);
      } else if (char === '}') {
        stack.pop();
        if (stack.length === 0) {
          return i;
        }
      }
    }
    return -1;
  },

  processStreamChunk: function(chunk) {
    try {
      if (!chunk || chunk.trim() === '') return;
      
      let remaining = chunk;
      let content = '';
      
      // Find and process all JSON objects in the chunk
      while (true) {
        const jsonStart = remaining.indexOf('{');
        if (jsonStart === -1) {
          // No more JSON objects, all content
          content += remaining;
          break;
        }
        
        // Add any text before the JSON as content
        if (jsonStart > 0) {
          content += remaining.substring(0, jsonStart);
        }
        
        const jsonEnd = this.findJsonEnd(remaining.substring(jsonStart));
        if (jsonEnd === -1) {
          // Incomplete JSON, treat rest as content
          content += remaining.substring(jsonStart);
          break;
        }
        
        try {
          const jsonStr = remaining.substring(jsonStart, jsonStart + jsonEnd + 1);
          const jsonData = JSON.parse(jsonStr);
          
          // Handle control messages
          if (jsonData.type === 'keepalive' || 
              jsonData.type === 'connected' || 
              jsonData.type === 'error' || 
              (jsonData.type === 'completion' && jsonData.reason === 'stop')) {
            
            // Only finalize on completion
            if (jsonData.type === 'completion' && jsonData.reason === 'stop') {
              if (content.trim()) {
                this.handleRawContent(content);
              }
              this.finalizeContent();
              return;
            }
            
            // Skip other control messages
            remaining = remaining.substring(jsonStart + jsonEnd + 1);
            continue;
          }
          
          // Not a control message, treat as content
          content += jsonStr;
          remaining = remaining.substring(jsonStart + jsonEnd + 1);
        } catch (e) {
          // Not valid JSON, treat as content
          content += remaining.substring(jsonStart);
          break;
        }
      }
      
      // Process any accumulated content
      if (content.trim()) {
        this.handleRawContent(content);
      }
    } catch (err) {
      console.error('Error processing stream chunk:', err);
      this.finalizeContent();
    }
  },

  // Helper to find the end of a JSON object
  findJsonEnd: function(str) {
    let stack = [];
    let inString = false;
    let escaped = false;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      
      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === '\\') {
          escaped = true;
          continue;
        }
        if (char === '"') {
          inString = false;
        }
        continue;
      }
      
      if (char === '"') {
        inString = true;
        continue;
      }
      
      if (char === '{') {
        stack.push(char);
      } else if (char === '}') {
        stack.pop();
        if (stack.length === 0) {
          return i;
        }
      }
    }
    
    return -1; // No complete JSON object found
  },

// Handle raw markdown content directly
handleRawContent: function(content) {
  // Skip empty content
  if (!content || content.trim() === '') return;
  
  // Initialize the streaming process if needed
  if (!this.streamingStarted) {
    this.streamingStarted = true;
    this.rawContentBuffer = '';
    
    // Create a new blank assistant message only when streaming begins
    const messageId = Date.now().toString();
    const initialMessage = {
      id: messageId,
      role: 'assistant',
      content: '',
      rendered: null
    };
    
    // Add the initial message to the messages array
    const updatedMessages = [...this.data.messages, initialMessage];
    this.setData({
      messages: updatedMessages,
      lastMessageId: `msg-${messageId}`,
      isTyping: true,
      inputDisabled: true
    });
  }
  
  // Append new content to the buffer
  if (!this.rawContentBuffer.endsWith(content)) {
    this.rawContentBuffer += content;
  }
  
  // Update the existing message with new content
  this.updateExistingMessage();
},

// Update the existing assistant message with new content
updateExistingMessage: function() {
  try {
    if (!this.data.lastMessageId) {
      console.error('No message ID to update');
      return;
    }
    
    const messages = this.data.messages;
    const messageId = this.data.lastMessageId.replace('msg-', '');
    
    // Log the raw content being sent to towxml
    console.log('Raw content for towxml:', this.rawContentBuffer);
    
    // Process with towxml - first check if we have valid content to process
    if (!this.rawContentBuffer || this.rawContentBuffer.trim() === '') {
      console.log('No content to process yet');
      return;
    }
      
    try {
      // Process the content using the imported markdown helper module
      // This calls the markdownToNodes function from towxml-helper.js
      const assistantMessage = messages.find(msg => msg.id === messageId);
      assistantMessage.rendered = markdown.markdownToNodes(this.rawContentBuffer, 'light');
        
      // Update the message in the messages array
      // Find the message with our ID and update it
      const updatedMessages = [...messages];
      const messageIndex = updatedMessages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex !== -1) {
        // Update the existing message with new content
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: this.rawContentBuffer,
          rendered: assistantMessage.rendered
        };
        
        // Update the UI
        this.setData({
          messages: updatedMessages
        });
      } else {
        console.error('Could not find message with ID:', messageId);
      }
        
      this.scrollToBottom();
      console.log('Towxml processed content successfully');
    } catch (towxmlErr) {
      // If towxml fails, fall back to plain text
      console.error('Towxml processing failed, falling back to plain text:', towxmlErr);
      assistantMessage.rendered = null; // Use plain text fallback in template
        
      // Find the message with our ID and update it
      const updatedMessages = [...messages];
      const messageIndex = updatedMessages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex !== -1) {
        // Update the existing message with plain text content
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: this.rawContentBuffer,
          rendered: null // Use plain text fallback
        };
        
        // Update the UI
        this.setData({
          messages: updatedMessages
        });
      } else {
        console.error('Could not find message with ID:', messageId);
      }
      
      this.scrollToBottom();
    }
  } catch (err) {
    console.error('Error in updateContentDisplay:', err);
  }
},

// Final processing when streaming is complete
finalizeContent: function() {
  if (!this.rawContentBuffer) {
    // Even if there's no content, we need to reset the UI state
    this.setData({
      isStreaming: false,
      isTyping: false
    });
    return;
  }
  
  // Final update with all content
  this.updateExistingMessage();
  
  // Clear the buffer after final processing
  this.rawContentBuffer = '';
  this.contentAccumulator = '';
  this.streamingStarted = false;
  
  // Ensure UI is reset properly
  this.setData({
    isStreaming: false,
    isTyping: false,
    inputDisabled: false,
  });
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
        
        // Check for line breaks around the JSON object to preserve
        const prefixText = buffer.substring(0, startPos);
        const suffixText = buffer.substring(endPos);
        
        // Get characters before and after the JSON object
        const charBefore = startPos > 0 ? buffer.charAt(startPos - 1) : '';
        const charAfter = endPos < buffer.length ? buffer.charAt(endPos) : '';
        
        // Preserve line breaks around the JSON object
        let replacement = '';
        
        // Check for a line break pattern before the JSON (preserve multiple consecutive line breaks)
        if (charBefore === '\n') {
          // Line break before JSON - keep it in the output
          replacement = '\n';
        }
        
        // Check for a line break pattern after the JSON (preserve multiple consecutive line breaks)
        if (charAfter === '\n') {
          // Line break after JSON - keep it in the output
          replacement += '\n';
        }
        
        // Special case: if JSON appears in the middle of content (no line breaks on either side)
        // but it's a control message (keepalive, connected, etc.), add a space to preserve word boundaries
        if (!charBefore && !charAfter && jsonObj.type && 
            (jsonObj.type === 'keepalive' || jsonObj.type === 'connected')) {
          replacement = ' ';
        }
        
        // Remove the processed object from buffer and insert the proper replacement
        buffer = prefixText + replacement + suffixText;
        
        // Log what we did for debugging
        console.log(`Replaced JSON with ${replacement.length ? 'line breaks/spaces' : 'nothing'} (${replacement.split('').map(c => c === '\n' ? '\\n' : c).join('')})`);
        
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
      this.finalizeContent();
      this.setData({ 
        isStreaming: false,
        isTyping: false
      });
      // Reset all streaming state
      this.contentAccumulator = '';
      this.rawContentBuffer = '';
      this.streamingStarted = false;
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
  isIncompleteJson: function(text) {
    // Check if text ends with a partial JSON object
    const lastOpenBrace = text.lastIndexOf('{');
    const lastCloseBrace = text.lastIndexOf('}');
    
    // If we have an open brace after the last closing brace, it's incomplete
    if (lastOpenBrace > lastCloseBrace) {
      return true;
    }
    
    // Check for unclosed quotes
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '"' && (i === 0 || text[i-1] !== '\\')) {
        inQuotes = !inQuotes;
      }
    }
    
    return inQuotes;
  },

  cleanStreamBuffer: function(buffer) {
    console.log('Cleaning buffer of length:', buffer.length);
    
    // Remove any JSON objects from the buffer
    let cleaned = buffer;
    
    // Remove any JSON-like fragments that might cause duplication
    cleaned = cleaned.replace(/\{"type":"[^"]*"[^\}]*\}/g, '');
    
    // PHASE 1: Find and eliminate whole section duplications
    // This tackles the case where entire sections like "**FinClip SDK in 2 Points:**" are duplicated
    
    // Find sections by looking for markdown headers or numbered list items
    const sectionPattern = /\*\*[^*]+\*\*|\d+\.\s+\*\*[^*]+\*\*|##?#?\s+[^\n]+/g;
    let sections = [];
    let match;
    
    while ((match = sectionPattern.exec(cleaned)) !== null) {
      sections.push({
        text: match[0],
        index: match.index
      });
    }
    
    // Look for duplicate sections
    if (sections.length > 1) {
      console.log('Found', sections.length, 'potential sections');
      const seenSections = new Set();
      const duplicateSections = [];
      
      for (const section of sections) {
        if (seenSections.has(section.text)) {
          duplicateSections.push(section);
        } else {
          seenSections.add(section.text);
        }
      }
      
      // Remove duplicate sections and any content between them and the next section
      if (duplicateSections.length > 0) {
        console.log('Found', duplicateSections.length, 'duplicate sections');
        
        // Sort duplicates by index in descending order to avoid index shifts when removing text
        duplicateSections.sort((a, b) => b.index - a.index);
        
        for (const duplicate of duplicateSections) {
          // Find the next section after this duplicate
          const nextSectionIndex = sections.findIndex(s => s.index > duplicate.index);
          let endIndex;
          
          if (nextSectionIndex !== -1) {
            endIndex = sections[nextSectionIndex].index;
          } else {
            // If no next section, use the end of the buffer
            endIndex = cleaned.length;
          }
          
          // Remove this duplicate section and content up to the next section
          cleaned = cleaned.substring(0, duplicate.index) + cleaned.substring(endIndex);
        }
      }
    }
    
    // PHASE 2: Line-by-line deduplication for remaining content
    const lines = cleaned.split('\n');
    const uniqueLines = [];
    const seenPhrases = new Map(); // Change to Map to store indices
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        uniqueLines.push(lines[i]); // Keep original whitespace
        continue;
      }
      
      // For non-empty lines, check if we've seen a similar line
      // Create a signature - use more characters for better accuracy
      const signature = line.substring(0, Math.min(30, line.length));
      
      // If we've seen this signature before, check if it's a complete duplicate
      if (seenPhrases.has(signature)) {
        const prevIndex = seenPhrases.get(signature);
        const prevLine = lines[prevIndex].trim();
        
        // Only consider it a duplicate if the line is nearly identical
        // or one is a subset of the other
        if (line === prevLine || 
            line.includes(prevLine) || 
            prevLine.includes(line)) {
          continue; // Skip this line
        }
      }
      
      seenPhrases.set(signature, i);
      uniqueLines.push(lines[i]); // Keep original whitespace
    }
    
    // Rejoin the unique lines
    cleaned = uniqueLines.join('\n');
    
    // PHASE 3: Special handling for tables - keep only one instance of each table
    const tableRegex = /(\|[^\n]+\|\n\|[\s-:|]+\|[\s\S]*?(?=\n\n|$))/g;
    const tables = [];
    let tableMatch;
    
    while ((tableMatch = tableRegex.exec(cleaned)) !== null) {
      tables.push(tableMatch[0]);
    }
    
    // If we found tables, remove all tables from the text and then add back unique ones
    if (tables.length > 0) {
      // Remove all tables
      cleaned = cleaned.replace(tableRegex, '');
      
      // Add back only unique tables
      const uniqueTables = [...new Set(tables)];
      cleaned += '\n\n' + uniqueTables.join('\n\n');
    }
    
    // PHASE 4: Final pass to remove repeated paragraphs
    // Split by double newlines (paragraph boundaries)
    const paragraphs = cleaned.split('\n\n');
    const uniqueParagraphs = [];
    const seenParagraphs = new Set();
    
    for (const para of paragraphs) {
      if (para.trim() && para.trim().length > 10) {
        // For longer paragraphs, use a fuzzy signature
        const paraSignature = para.trim().substring(0, Math.min(40, para.length));
        
        if (!seenParagraphs.has(paraSignature)) {
          seenParagraphs.add(paraSignature);
          uniqueParagraphs.push(para);
        }
      } else {
        // Keep shorter paragraphs as-is
        uniqueParagraphs.push(para);
      }
    }
    
    cleaned = uniqueParagraphs.join('\n\n');
    
    // Remove any excessive newlines (more than 2 in a row)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Trim any extra whitespace
    cleaned = cleaned.trim();
    
    console.log('Original length:', buffer.length, 'Cleaned length:', cleaned.length);
    return cleaned;
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
    console.log('Append assistant message with content length:', content.length);
    
    // Use our raw content handling approach for consistency
    if (!this.rawContentBuffer) {
      this.rawContentBuffer = '';
    }
    
    // Add content to the buffer
    this.rawContentBuffer += content;
    
    // Update the display immediately
    this.updateContentDisplay();
  },

  // Fix content boundaries to prevent word jumbling when chunks are combined
  fixContentBoundaries: function(existingContent, newContent) {
    if (!existingContent || !newContent) {
      return (existingContent || '') + (newContent || '');
    }
    
    // Check if we need to add a space between chunks to prevent word jumbling
    const lastChar = existingContent.charAt(existingContent.length - 1);
    const firstChar = newContent.charAt(0);
    
    // If the last character of existing content is a letter/number and
    // the first character of new content is also a letter/number, add a space
    const needsSpace = /[a-zA-Z0-9]/.test(lastChar) && /[a-zA-Z0-9]/.test(firstChar);
    
    // Special case: Don't add space if we're in the middle of a markdown formatting sequence
    const isInMarkdown = (
      // Check for markdown formatting sequences that might be split across chunks
      existingContent.endsWith('*') || 
      existingContent.endsWith('_') || 
      existingContent.endsWith('`') || 
      existingContent.endsWith('[') || 
      existingContent.endsWith('](') ||
      // Check for URLs or paths that might be split
      existingContent.endsWith('/') ||
      existingContent.endsWith('-') ||
      // Check for hyphenated words
      (existingContent.endsWith('-') && /[a-zA-Z0-9]/.test(firstChar))
    );
    
    if (needsSpace && !isInMarkdown) {
      return existingContent + ' ' + newContent;
    }
    
    return existingContent + newContent;
  },
  
  // Normalize markdown content for proper rendering
  normalizeMarkdownContent: function(content) {
    if (!content) return '';
    
    let normalized = content;
    console.log('Original content:', content);
    
    // 1. Ensure consistent line break characters
    normalized = normalized.replace(/\r\n/g, '\n');
    
    // 2. Detect and preserve structured markdown patterns
    // Handle specific patterns we see in our content
    const patterns = [
      // Numbered list with emoji patterns (1️⃣, 2️⃣, etc.)
      { 
        regex: /(\n|^)(\d)?(?:\d)?(?:\ufe0f)?(?:\u20e3)?\s*\*\*(.*?)\*\*\s*$/gm,
        replacement: '$1$2$3\n\n**$4**\n'
      },
      // Bullet item indentation (preserving multi-level lists)
      { 
        regex: /(\n|^)(\s*)[-*+]\s+([^\n]+)$/gm, 
        replacement: '$1$2- $3\n' 
      },
      // Numbered items in lists
      { 
        regex: /(\n|^)(\s*)(\d+\.)\s+([^\n]+)$/gm, 
        replacement: '$1$2$3 $4\n' 
      },
      // Headers with colons (like "**Key Topics I Can Help With:**")
      { 
        regex: /(\*\*[^*:\n]+:\*\*)([^\n])/g, 
        replacement: '$1\n$2' 
      },
      // Emoji followed by text (ensure proper spacing)
      {
        regex: /([\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}])([a-zA-Z])/gu,
        replacement: '$1 $2'
      },
      // Fix for the example's numbered list with descriptions
      {
        regex: /(\d+\.)\s+\*\*([^*]+)\*\*\s*$/gm,
        replacement: '$1 **$2**\n'
      },
      // Main points and examples separation
        {
        regex: /(\s*-\s+.*?)\s+(-\s+.*)/g,
        replacement: '$1\n   $2'
      }
    ];
    
    // Apply all pattern fixes
    patterns.forEach(pattern => {
      normalized = normalized.replace(pattern.regex, pattern.replacement);
    });
    
    // 3. Ensure paragraph separation with double line breaks
    // Look for sentences that should be separated by paragraph breaks
    normalized = normalized.replace(/([.!?])\s+([A-Z])/g, '$1\n\n$2');
    
    // 4. Fix specific numbered list patterns with points and sub-points
    const numberedListRegex = /(\d+\.)\s+\*\*(.*?)\*\*\s*\n\s*-\s+/g;
    normalized = normalized.replace(numberedListRegex, (match, number, title) => {
      return `${number} **${title}**\n   - `;
    });
    
    // 5. Ensure proper indentation for lists and sub-lists
    const lines = normalized.split('\n');
    let inList = false;
    let listIndentLevel = 0;
    
    for (let i = 0; i < lines.length; i++) {
      // Detect list items
      if (/^\s*[-*+]\s/.test(lines[i])) {
        inList = true;
        // Calculate indentation level
        const leadingSpaces = (lines[i].match(/^\s*/) || [''])[0].length;
        listIndentLevel = Math.floor(leadingSpaces / 2);
      } 
      // Detect the end of a list
      else if (inList && lines[i].trim() === '') {
        inList = false;
        listIndentLevel = 0;
        // Ensure a blank line after lists
        if (i + 1 < lines.length && lines[i + 1].trim() !== '') {
          lines[i] = ''; // Keep the blank line
        }
      }
    }
    
    normalized = lines.join('\n');
    
    // 6. Fix table formatting
    normalized = normalized.replace(/\|\s*([^\|\n]+)\s*\|/g, '| $1 |');
    
    // 7. Fix emphasis and strong formatting
    normalized = normalized.replace(/\*\s+([^\*\n]+)\s+\*/g, '*$1*');
    normalized = normalized.replace(/\*\*\s+([^\*\n]+)\s+\*\*/g, '**$1**');
    
    // 8. Fix specific patterns for the example
    // Ensure "**Let's dive into:**" has proper formatting
    normalized = normalized.replace(/(\*\*[^*]*(?:dive|summary|points)[^*]*:\*\*)\s*([^\n])/gi, '$1\n\n$2');
    
    // 9. Fix patterns like "- **Title**" to be properly formatted
    normalized = normalized.replace(/^-(\s*)(\*\*[^*]+\*\*)/gm, '- $2');
    
    // 10. Ensure proper line breaks around headings and sections
    normalized = normalized.replace(/(\n|^)(#{1,6}\s+[^\n]+)\n(?!\n)/g, '$1$2\n\n');
    
    // 11. Fix for "Why it matters?" pattern
    normalized = normalized.replace(/(\*\*Why it matters\?\*\*)([^\n])/g, '$1\n$2');
    
    // 12. Ensure emoji has proper spacing
    normalized = normalized.replace(/(🚀|👋|✓|✗)([A-Za-z])/g, '$1 $2');
    
    console.log('Normalized markdown:', normalized);
    return normalized;
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
