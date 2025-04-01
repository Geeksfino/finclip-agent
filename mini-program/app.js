// app.js
App({
  globalData: {
    apiUrl: 'http://localhost:5678',
    streamingUrl: 'http://localhost:5679',
    sessionId: null,
    userInfo: null
  },
  onLaunch() {
    console.log('App launched');
  }
})
