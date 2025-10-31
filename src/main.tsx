import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './style.css'
import { initializeDatabase } from './db/database'

// Initialize database and start MSW
const initializeApp = async () => {
  try {
    // Initialize IndexedDB with seed data if empty
    await initializeDatabase();
    
    // Start MSW in all environments (needed for GitHub Pages demo where API is mocked)
    try {
      const { worker } = await import('./mocks/browser');
      // Use root path for local development, base path for GitHub Pages
      const isDev = import.meta.env.DEV;
      const baseUrl = import.meta.env.BASE_URL || './';
      // In dev mode, always use root path; in production use base path
      const workerUrl = isDev 
        ? '/mockServiceWorker.js'
        : (baseUrl === './' || baseUrl === '/') 
          ? '/mockServiceWorker.js' 
          : `${baseUrl}mockServiceWorker.js`.replace(/\/\//g, '/');
      
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: workerUrl,
        },
      });
      console.log('MSW started successfully');
    } catch (err) {
      console.warn('MSW failed to start:', err);
    }
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

// Initialize app before rendering
initializeApp().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
});
