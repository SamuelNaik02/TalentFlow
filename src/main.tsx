import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './style.css'

// Start MSW in development
// Temporarily disabled for debugging
// if (import.meta.env.DEV) {
//   import('./mocks/browser').then(({ worker }) => {
//     worker.start()
//   })
// }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
