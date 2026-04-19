import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill window.storage usando localStorage
if (!window.storage) {
  window.storage = {
    async get(k) {
      try {
        const v = localStorage.getItem('lf5_' + k);
        return v !== null ? { key: k, value: v } : null;
      } catch { return null; }
    },
    async set(k, v) {
      try {
        localStorage.setItem('lf5_' + k, v);
        return { key: k, value: v };
      } catch { return null; }
    },
    async delete(k) {
      try {
        localStorage.removeItem('lf5_' + k);
        return { key: k, deleted: true };
      } catch { return null; }
    },
    async list(p) {
      try {
        const keys = Object.keys(localStorage)
          .filter(k => k.startsWith('lf5_' + (p || '')))
          .map(k => k.replace('lf5_', ''));
        return { keys };
      } catch { return { keys: [] }; }
    }
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
