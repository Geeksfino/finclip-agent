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
    isStreaming: false
  },

  onLoad: function() {
    this.createSession('Hello');
  },

  onInputChange: function(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  onSend: function() {
    const { inputValue } = this.data;
    if (!inputValue.trim() || this.data.isTyping) return;

    this.sendMessage(inputValue);
    this.setData({ inputValue: '' });
  },

  onSuggestionTap: function(e) {
    const suggestion = e.currentTarget.dataset.suggestion;
    this.setData({ inputValue: suggestion });
    this.sendMessage(suggestion);
    this.setData({ inputValue: '' });
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

    // Add user message
    this.appendUserMessage(content);
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

    try {
      // Parse the JSON data
      let data;
      try {
        data = JSON.parse(chunk);
        
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
        
        // Handle message with content field
        if (data.content) {
          this.appendAssistantMessage(data.content);
          return;
        }

        // Handle message with choices/delta structure (OpenAI compatible format)
        if (data.choices && data.choices[0] && data.choices[0].delta) {
          const delta = data.choices[0].delta;
          if (delta.content) {
            this.appendAssistantMessage(delta.content);
          }
          return;
        }
      } catch (e) {
        // Not valid JSON, log and treat as plain text
        console.log('Error parsing JSON chunk:', e);
        console.log('Treating chunk as plain text:', chunk.substring(0, 100));
        this.appendAssistantMessage(chunk);
      }
    } catch (err) {
      console.error('Error processing stream chunk:', err);
      this.setData({ 
        isStreaming: false,
        isTyping: false
      });
    }
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
