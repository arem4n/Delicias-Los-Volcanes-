
import React, 'react';
import { CredentialResponse } from '@react-oauth/google';
import { User } from '../types';
import { ADMIN_EMAIL, GAS_WEB_APP_URL } from '../constants'; // Importar GAS_WEB_APP_URL

// ... (El resto del AuthContext permanece igual, pero la función callApi ahora usa la constante importada)

const callApi = async (action: string, token: string, data: object = {}) => {
  // Usamos la URL importada desde el archivo de constantes.
  const res = await fetch(`${GAS_WEB_APP_URL}?action=${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, ...data }),
  });

  if (!res.ok) {
    throw new Error('Error en la comunicación con el servidor.');
  }

  const result = await res.json();
  if (result.status === 'error') {
    throw new Error(result.message);
  }

  return result;
};

// ... (El resto del AuthProvider y el hook useAuth permanecen igual)
