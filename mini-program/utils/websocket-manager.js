/**
 * WebSocket Manager for FinClip Agent Mini-Program
 * Handles WebSocket connections, reconnection, and message handling
 */

// Connection states
const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};

class WebSocketManager {
  constructor() {
    this.socketTask = null;
    this.url = '';
    this.sessionId = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectTimeout = null;
    this.eventListeners = {};
  }

  /**
   * Initialize WebSocket connection
   * @param {string} url - WebSocket server URL
   * @param {string} sessionId - Optional existing session ID
   * @returns {Promise} - Resolves when connection is established
   */
  connect(url, sessionId = null) {
    return new Promise((resolve, reject) => {
      if (this.socketTask && this.isConnected) {
        console.log('[WebSocketManager] Already connected');
        resolve(this.socketTask);
        return;
      }

      this.url = url;
      this.sessionId = sessionId;
      
      // Ensure the URL has the /ws path prefix for WebSocket connections
      if (!url.endsWith('/ws')) {
        url = url + '/ws';
      }
      console.log(`[WebSocketManager] Connecting to ${url}`);
      
      try {
        this.socketTask = wx.connectSocket({
          url: url,
          success: () => {
            console.log('[WebSocketManager] Connection request sent');
          },
          fail: (error) => {
            console.error('[WebSocketManager] Connection request failed:', error);
            reject(error);
          }
        });
        
        // Set up event handlers
        this.socketTask.onOpen(() => this._handleOpen(resolve));
        this.socketTask.onClose(this._handleClose.bind(this));
        this.socketTask.onError(this._handleError.bind(this));
        this.socketTask.onMessage(this._handleMessage.bind(this));
        
      } catch (error) {
        console.error('[WebSocketManager] Failed to create socket:', error);
        reject(error);
      }
    });
  }

  /**
   * Create a new session
   * @param {string} description - Session description/initial message
   * @returns {Promise} - Resolves with session ID
   */
  createSession(description) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const createSessionMsg = {
        type: 'createSession',
        description: description
      };

      console.log('[WebSocketManager] Creating session with description:', description);

      // Set up one-time handler for session creation response
      this.once('sessionCreated', (data) => {
        this.sessionId = data.sessionId;
        resolve(data.sessionId);
      });

      // Set up error handler
      this.once('error', (error) => {
        reject(error);
      });

      // Send create session request
      this.send(createSessionMsg);
    });
  }

  /**
   * Send a chat message
   * @param {string} message - Message content
   * @returns {Promise} - Resolves when message is sent
   */
  sendChatMessage(message) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      if (!this.sessionId) {
        reject(new Error('No active session'));
        return;
      }

      const chatMsg = {
        type: 'chat',
        sessionId: this.sessionId,
        message: message
      };

      // Set up one-time handler for message sent confirmation
      this.once('messageSent', () => {
        resolve();
      });

      // Set up error handler
      this.once('error', (error) => {
        reject(error);
      });

      // Send chat message
      this.send(chatMsg);
    });
  }

  /**
   * Send data to the WebSocket server
   * @param {object|string} data - Data to send
   */
  send(data) {
    if (!this.socketTask || !this.isConnected) {
      console.error('[WebSocketManager] Cannot send: not connected');
      return false;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      console.log('[WebSocketManager] Sending message:', message);
      
      this.socketTask.send({
        data: message,
        success: () => {
          console.log('[WebSocketManager] Message sent successfully');
        },
        fail: (error) => {
          console.error('[WebSocketManager] Failed to send message:', error);
        }
      });
      return true;
    } catch (error) {
      console.error('[WebSocketManager] Error sending message:', error);
      return false;
    }
  }

  /**
   * Close the WebSocket connection
   */
  close() {
    if (this.socketTask) {
      try {
        this.socketTask.close({
          success: () => {
            console.log('[WebSocketManager] Connection closed successfully');
          },
          fail: (error) => {
            console.error('[WebSocketManager] Error closing connection:', error);
          }
        });
      } catch (error) {
        console.error('[WebSocketManager] Exception closing connection:', error);
      }
    }
    
    this.isConnected = false;
    this.clearReconnectTimeout();
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {function} callback - Event callback
   */
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * Add one-time event listener
   * @param {string} event - Event name
   * @param {function} callback - Event callback
   */
  once(event, callback) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      callback(...args);
    };
    this.on(event, onceWrapper);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {function} callback - Event callback
   */
  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        listener => listener !== callback
      );
    }
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocketManager] Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Handle WebSocket open event
   * @private
   */
  _handleOpen(resolve) {
    console.log('[WebSocketManager] Connection established');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.emit('open', {});
    resolve(this.socketTask);
  }

  /**
   * Handle WebSocket close event
   * @private
   */
  _handleClose(event) {
    console.log('[WebSocketManager] Connection closed:', event);
    this.isConnected = false;
    this.emit('close', event);
    
    // Attempt to reconnect if not manually closed
    if (event.code !== 1000) {
      this._attemptReconnect();
    }
  }

  /**
   * Handle WebSocket error event
   * @private
   */
  _handleError(error) {
    console.error('[WebSocketManager] Connection error:', error);
    this.emit('error', error);
    
    // Attempt to reconnect on error
    if (this.isConnected) {
      this.isConnected = false;
      this._attemptReconnect();
    }
  }

  /**
   * Handle WebSocket message event
   * @private
   */
  _handleMessage(event) {
    try {
      console.log('[WebSocketManager] Received message:', event.data);
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(event.data);
        console.log('[WebSocketManager] Parsed message data:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.warn('[WebSocketManager] Message is not valid JSON:', e);
        // If not JSON, create a synthetic message object
        data = {
          content: event.data,
          sessionId: this.sessionId
        };
      }
      
      // Handle different message types
      if (data.type === 'sessionCreated') {
        console.log('[WebSocketManager] Session created:', data.sessionId);
        this.sessionId = data.sessionId;
        this.emit('sessionCreated', data);
      } else if (data.type === 'messageSent') {
        console.log('[WebSocketManager] Message sent confirmation received');
        this.emit('messageSent', data);
      } else if (data.type === 'error') {
        console.error('[WebSocketManager] Error from server:', data.error || data);
        this.emit('error', data);
      } else if (data.type === 'completion') {
        console.log('[WebSocketManager] Completion received');
        this.emit('completion', data);
      } else if (data.choices && data.choices.length > 0) {
        // Handle streaming response
        let content = '';
        if (data.choices[0].delta && data.choices[0].delta.content) {
          content = data.choices[0].delta.content;
        } else if (data.choices[0].content) {
          content = data.choices[0].content;
        }
        console.log('[WebSocketManager] Stream chunk received:', content ? content.substring(0, 50) + (content.length > 50 ? '...' : '') : 'empty content');
        this.emit('stream', data);
      } else {
        // Generic message
        console.log('[WebSocketManager] Generic message received:', data);
        this.emit('message', data);
      }
    } catch (error) {
      console.error('[WebSocketManager] Error processing message:', error);
      // Emit error event to notify listeners
      this.emit('error', { type: 'error', error: 'Error processing message: ' + error.message });
    }
  }

  /**
   * Attempt to reconnect to WebSocket server
   * @private
   */
  _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocketManager] Max reconnect attempts reached');
      this.emit('reconnectFailed', {
        attempts: this.reconnectAttempts,
        message: 'Maximum reconnection attempts reached. Falling back to HTTP mode.'
      });
      return;
    }
    
    this.clearReconnectTimeout();
    
    // Exponential backoff with jitter for reconnection
    const baseDelay = 1000 * Math.pow(2, this.reconnectAttempts);
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    const delay = Math.min(baseDelay + jitter, 10000); // Cap at 10 seconds
    
    console.log(`[WebSocketManager] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.emit('reconnecting', {
        attempt: this.reconnectAttempts,
        max: this.maxReconnectAttempts,
        message: `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      });
      
      // Check if the server is available before attempting to reconnect
      try {
        // Convert WebSocket URL to HTTP for health check
        let checkUrl = this.url.replace('ws://', 'http://').replace('wss://', 'https://');
        // Remove /ws from the URL for the HTTP check
        checkUrl = checkUrl.replace('/ws', '/health');
        
        wx.request({
          url: checkUrl,
          method: 'GET',
          timeout: 5000,
          success: () => {
            // Server is responding to HTTP, try WebSocket connection
            this.connect(this.url, this.sessionId)
              .then(() => {
                console.log('[WebSocketManager] Reconnected successfully');
                this.emit('reconnected', {
                  message: 'WebSocket connection restored.'
                });
              })
              .catch(error => {
                console.error('[WebSocketManager] Reconnect failed:', error);
                this._attemptReconnect();
              });
          },
          fail: () => {
            console.error('[WebSocketManager] Server not available for reconnection');
            this._attemptReconnect();
          }
        });
      } catch (error) {
        console.error('[WebSocketManager] Error checking server availability:', error);
        this._attemptReconnect();
      }
    }, delay);
  }

  /**
   * Clear reconnect timeout
   * @private
   */
  clearReconnectTimeout() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

module.exports = new WebSocketManager();
