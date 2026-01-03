
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SavedOrder, OrderStatus } from '../types';
import { ADMIN_EMAIL } from '../constants';

interface AuthContextType {
  user: User | null;
  allOrders: SavedOrder[];
  login: (email: string, nombre: string) => void;
  logout: () => void;
  addOrderToHistory: (order: SavedOrder) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allOrders, setAllOrders] = useState<SavedOrder[]>([]);

  // Carga inicial desde persistencia
  useEffect(() => {
    const savedUser = localStorage.getItem('delicias_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const savedAllOrders = localStorage.getItem('delicias_all_orders');
    if (savedAllOrders) {
      setAllOrders(JSON.parse(savedAllOrders));
    }
  }, []);

  // Sincronización constante del pool global de pedidos
  useEffect(() => {
    localStorage.setItem('delicias_all_orders', JSON.stringify(allOrders));
  }, [allOrders]);

  const login = (email: string, nombre: string) => {
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const usersStore = JSON.parse(localStorage.getItem('delicias_users_db') || '{}');
    let currentUser = usersStore[email];

    if (!currentUser) {
      currentUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        nombre,
        orders: [],
        isAdmin
      };
      usersStore[email] = currentUser;
      localStorage.setItem('delicias_users_db', JSON.stringify(usersStore));
    }

    setUser(currentUser);
    localStorage.setItem('delicias_user', JSON.stringify(currentUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('delicias_user');
  };

  const addOrderToHistory = (order: SavedOrder) => {
    const orderWithClient = {
      ...order,
      cliente: user ? { nombre: user.nombre, email: user.email } : undefined
    };

    // Agregar al pool global del Maestro
    setAllOrders(prev => [orderWithClient, ...prev]);

    // Agregar al historial personal del cliente
    if (user) {
      const updatedUser = {
        ...user,
        orders: [orderWithClient, ...user.orders]
      };
      setUser(updatedUser);
      localStorage.setItem('delicias_user', JSON.stringify(updatedUser));
      
      const usersStore = JSON.parse(localStorage.getItem('delicias_users_db') || '{}');
      usersStore[user.email] = updatedUser;
      localStorage.setItem('delicias_users_db', JSON.stringify(usersStore));
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    // 1. Actualizar Pool Global (Lo que ve el Maestro)
    setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    
    // 2. Sincronizar con DB de Usuarios (Para que el cliente vea el cambio al loguearse)
    const usersStore = JSON.parse(localStorage.getItem('delicias_users_db') || '{}');
    Object.keys(usersStore).forEach(email => {
      const userInDb = usersStore[email];
      if (userInDb.orders) {
        userInDb.orders = userInDb.orders.map((o: SavedOrder) => o.id === orderId ? { ...o, status } : o);
      }
    });
    localStorage.setItem('delicias_users_db', JSON.stringify(usersStore));

    // 3. Actualizar sesión actual si el usuario es el dueño
    if (user) {
      const isMyOrder = user.orders.some(o => o.id === orderId);
      if (isMyOrder) {
        const updatedUser = {
          ...user,
          orders: user.orders.map(o => o.id === orderId ? { ...o, status } : o)
        };
        setUser(updatedUser);
        localStorage.setItem('delicias_user', JSON.stringify(updatedUser));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, allOrders, login, logout, addOrderToHistory, updateOrderStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
