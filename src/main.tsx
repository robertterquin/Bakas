import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// In development: completely unregister any active Service Worker and purge caches
// to prevent stale scripts from hijacking Vite HMR and dev updates.
if (import.meta.env.DEV) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
        console.log('[Dev] Unregistered stale Service Worker:', registration.scope);
      }
    });
  }
  if (typeof caches !== 'undefined') {
    caches.keys().then((keys) => {
      for (const key of keys) {
        caches.delete(key);
      }
    });
  }
} else {
  // In production: purge legacy cache keys
  if (typeof caches !== 'undefined') {
    ['bakas-tiles-v1', 'bakas-tiles-v2', 'bakas-tiles-v3', 'bakas-shell-v1', 'bakas-shell-v2', 'bakas-shell-v3'].forEach((name) => {
      caches.delete(name).catch(() => {});
    });
  }

  // Register Service Worker for offline tile caching and PWA support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.update();
          console.log('Bakas PWA Service Worker active:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
