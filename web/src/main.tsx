import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { DemoPage } from './pages/DemoPage'
// import { ChatApp } from './components/ChatApp'
// import { TestComponent } from './components/TestComponent'
// import { SimpleTest } from './components/SimpleTest'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DemoPage />
  </React.StrictMode>,
)
