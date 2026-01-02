
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CredentialResponse } from '@react-oauth/google';
import { User } from '../types';
import { ADMIN_EMAIL, GAS_WEB_APP_URL } from '../constants';

// --- API ---
const callApi = async (action: string, token: string, data: object = {}) => {
  const res = await fetch(`${GAS_WEB_APP_URL}?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, ...data }),
  });
  if (!res.ok) throw new Error('Error en la comunicación con el servidor.');
  const result = await res.json();
  if (result.status === 'error') throw new Error(result.message);
  return result;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentialResponse: CredentialResponse) => Promise<void>;
  logout: () => void;
  callApi: (action: string, data?: object) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    try {
      const idToken = credentialResponse.credential;
      if (!idToken) throw new Error("No se recibió el token de ID de Google.");

      const decodedToken: { email: string, name: string, picture: string } = JSON.parse(atob(idToken.split('.')[1]));

      const newUser: User = {
        id: decodedToken.email,
        email: decodedToken.email,
        nombre: decodedToken.name,
        avatar: decodedToken.picture,
        isAdmin: decodedToken.email.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
        orders: []
      };

      setUser(newUser);
      setToken(idToken);

    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const authenticatedApiCall = useCallback(async (action: string, data: object = {}) => {
    if (!token) throw new Error("Usuario no autenticado.");
    return callApi(action, token, data);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, callApi: authenticatedApiCall }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  return context;
};
