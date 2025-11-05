import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Disabilita eventuali service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(regs => regs.forEach(r => r.unregister()))
    .catch(err => console.warn("ServiceWorker unregister failed:", err));
}

// Funzione per avviare l'app
function renderApp() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } else {
    console.error("Root element not found");
  }
}

// Attendi che il DOM sia pronto (compatibile Safari)
if (document.readyState === "complete" || document.readyState === "interactive") {
  renderApp();
} else {
  document.addEventListener("DOMContentLoaded", renderApp);
}