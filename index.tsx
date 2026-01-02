
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("No se pudo encontrar el elemento root. Asegúrate de que id='root' existe en el HTML.");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Error al renderizar la aplicación:", error);
  }
}
