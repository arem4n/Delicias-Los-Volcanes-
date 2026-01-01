
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, Settings, Plus, Save, Trash2, Edit, CheckCircle, Clock, Truck,
  Image as ImageIcon, Loader
} from 'lucide-react';
import { Product, OrderStatus, SavedOrder } from '../types';
import { GAS_WEB_APP_URL } from '../constants'; // Importar desde la fuente central

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const { callApi } = useAuth();
  const [tab, setTab] = useState<'pedidos' | 'productos'>('pedidos');

  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const [ordersData, productsData] = await Promise.all([
            callApi('getAllOrders'),
            fetch(GAS_WEB_APP_URL + '?action=getProducts').then(res => res.json())
          ]);
          setOrders(ordersData);
          setProducts(productsData);
        } catch (err) {
          setError('No se pudieron cargar los datos del panel.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, callApi]);

  // ... (El resto del componente permanece igual)
};
