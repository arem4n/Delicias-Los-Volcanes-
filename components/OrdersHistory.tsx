
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { X, Package, ChevronDown, ChevronUp, RefreshCcw, Info, Loader } from 'lucide-react';
import { SavedOrder } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRepeatOrder: () => void;
}

export const OrdersHistory: React.FC<Props> = ({ isOpen, onClose, onRepeatOrder }) => {
  const { user, callApi } = useAuth();
  const { bulkAddToCart } = useCart();

  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const userOrders = await callApi('getOrders');
          setOrders(userOrders);
        } catch (err) {
          setError('No se pudieron cargar los pedidos.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrders();
    }
  }, [isOpen, user, callApi]);

  const handleRepeatOrder = (orderItems: any[]) => {
    // La lógica para repetir un pedido necesitará una refactorización
    // para obtener los detalles actuales del producto desde el estado global de productos
    // o hacer una llamada a la API. Por ahora, lo dejamos como placeholder.
    console.log("Repetir pedido - Lógica a implementar", orderItems);
    // onClose();
    // onRepeatOrder();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-brown/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-brand-cream w-full max-w-2xl h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="p-8 border-b border-brand-brown/5 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold text-brand-brown p-2.5 rounded-2xl">
              <Package size={24} />
            </div>
            <h2 className="text-3xl font-bold text-brand-brown font-display">Mis Pedidos</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-brown/5 rounded-full text-brand-brown">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400">
              <Loader className="animate-spin mb-4" />
              <p>Cargando tus pedidos...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-red-500">
              <p>{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center space-y-4">
              <Package size={64} strokeWidth={1} />
              <p className="text-xl font-light">Aún no tienes pedidos.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-brand-brown/5">
                {/* ... El resto del JSX del pedido sigue siendo el mismo ... */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
