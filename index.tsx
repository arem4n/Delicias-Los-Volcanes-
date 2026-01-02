
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, GAS_WEB_APP_URL } from './constants';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const isConfigured =
  GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('YOUR_') &&
  GAS_WEB_APP_URL && !GAS_WEB_APP_URL.startsWith('YOUR_');

const ConfigurationError = () => (
  <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
    <h1>Error de Configuración</h1>
    <p>Por favor, asegúrate de haber añadido tu <strong>Client ID de Google</strong> y la <strong>URL de Google Apps Script</strong> en el archivo <code>constants.ts</code>.</p>
    <p>La aplicación no puede iniciarse hasta que estos valores estén configurados.</p>
  </div>
);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {isConfigured ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    ) : (
      <ConfigurationError />
    )}
  </React.StrictMode>
);
