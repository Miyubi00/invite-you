// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css' // Import CSS yang sudah ada Tailwind
import { initializeMidtrans } from './lib/midtransConfig'

// Initialize Midtrans payment gateway if configured
if (import.meta.env.VITE_MIDTRANS_CLIENT_KEY) {
  const midtransReady = initializeMidtrans();
  if (midtransReady) {
    console.log('[Midtrans] Payment gateway initialized successfully');
  }
} else {
  console.info('[Midtrans] Payment gateway is disabled. Using manual payment (WhatsApp) only.');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter membungkus seluruh aplikasi */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)