// api.js - Handles API communication
const app = getApp();

/**
 * Creates a new chat session
 * @param {string} initialMessage - Initial message for the session
 * @returns {Promise} Promise resolving to the session info
 */
function createSession(initialMessage) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiUrl}/createSession`,
      method: 'POST',
      data: {
        owner: 'miniprogram-user',
        description: initialMessage,
        enhancePrompt: false
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.sessionId) {
          app.globalData.sessionId = res.data.sessionId;
          resolve(res.data);
        } else {
          reject(new Error('Failed to create session'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * Sends a message to the API
 * @param {string} message - User message
 * @returns {Promise} Promise resolving when message is sent
 */
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    if (!app.globalData.sessionId) {
      reject(new Error('No active session'));
      return;
    }

    wx.request({
      url: `${app.globalData.apiUrl}/chat`,
      method: 'POST',
      data: {
        sessionId: app.globalData.sessionId,
        message: message
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error('Failed to send message'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * Creates a streaming request for receiving assistant responses
 * @param {function} onChunk - Callback for received chunks
 * @param {function} onError - Callback for errors
 * @param {function} onComplete - Callback for completion
 * @returns {object} The request task object (can be used to abort)
 */
function createStreamRequest(onChunk, onError, onComplete) {
  if (!app.globalData.sessionId) {
    onError(new Error('No active session'));
    return null;
  }

  const streamUrl = `${app.globalData.streamingUrl}/session/${app.globalData.sessionId}`;
  
  const requestTask = wx.request({
    url: streamUrl,
    method: 'GET',
    header: {
      'X-Client-Type': 'miniprogram' // Identify as a mini-program client
    },
    responseType: 'text',
    enableChunked: true,
    success: () => {
      console.log('Stream connection established');
    },
    fail: (error) => {
      console.error('Failed to establish stream connection:', error);
      onError(error);
    },
    complete: (res) => {
      if (res.statusCode !== 200) {
        onError(new Error(`Stream request failed with status: ${res.statusCode}`));
      }
      onComplete && onComplete(res);
    }
  });

  // Add handler for received chunks
  requestTask.onChunkReceived((res) => {
    // Convert chunk to text
    const arrayBuffer = res.data;
    const uint8Array = new Uint8Array(arrayBuffer);
    const chunk = new TextDecoder('utf-8').decode(uint8Array);
    
    onChunk(chunk);
  });

  return requestTask;
}

module.exports = {
  createSession,
  sendMessage,
  createStreamRequest
};
