// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css' // Import CSS yang sudah ada Tailwind

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter membungkus seluruh aplikasi */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)