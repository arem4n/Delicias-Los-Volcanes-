
export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen_url: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  orders: SavedOrder[];
  isAdmin?: boolean;
}

export type OrderStatus = 'Pendiente' | 'Confirmado' | 'Entregado' | 'Cancelado';

export interface SavedOrder {
  id: string;
  date: string;
  items: { id: string; nombre: string; quantity: number; precio: number }[];
  total: number;
  status: OrderStatus;
  cliente?: {
    nombre: string;
    email: string;
  };
}

export interface GASResponse {
  status: 'success' | 'error';
  message: string;
  data?: any;
}
