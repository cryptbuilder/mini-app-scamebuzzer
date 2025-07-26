import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './entrypoints/popup/App.tsx';
import './entrypoints/popup/style.css';
import { AuthProvider } from '@/context/AuthContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
); 