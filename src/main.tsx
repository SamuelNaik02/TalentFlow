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
    
    // Start MSW in development
    if (import.meta.env.DEV) {
      const { worker } = await import('./mocks/browser');
      await worker.start();
      console.log('MSW started successfully');
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
