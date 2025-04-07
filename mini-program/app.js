// app.js
App({
  globalData: {
    apiUrl: 'http://localhost:5678',
    streamingUrl: 'http://localhost:5679',
    wsUrl: 'ws://localhost:5680', // WebSocket URL (port+1 from streaming)
    useWebSocket: true, // Feature toggle for WebSocket
    sessionId: null,
    userInfo: null
  },
  onLaunch() {
    console.log('App launched');
  }
})
