
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { X, Package, ChevronDown, ChevronUp, RefreshCcw, Info, Loader } from 'lucide-react';
import { Product, SavedOrder } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRepeatOrder: () => void;
  products: Product[];
}

export const OrdersHistory: React.FC<Props> = ({ isOpen, onClose, onRepeatOrder, products }) => {
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

  if (!isOpen) return null;

  const handleRepeatOrder = (orderItems: { id: string; nombre: string; quantity: number }[]) => {
    const itemsToRepeat = orderItems.map(item => {
      const currentProduct = products.find(p => p.id === item.id);
      if (currentProduct && currentProduct.stock > 0) {
        return { product: currentProduct, quantity: Math.min(item.quantity, currentProduct.stock) };
      }
      return null;
    }).filter((item): item is { product: Product; quantity: number } => item !== null);

    if (itemsToRepeat.length > 0) {
      bulkAddToCart(itemsToRepeat);
      onClose();
      onRepeatOrder();
    } else {
      alert("Ninguno de los productos de este pedido está disponible actualmente.");
    }
  };

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
            <div className="h-full flex flex-col items-center justify-center text-red-500 text-center">
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
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        order.status === 'Confirmado' ? 'bg-blue-100 text-blue-600' :
                        order.status === 'Entregado' ? 'bg-green-100 text-green-600' :
                        'bg-brand-gold/10 text-brand-gold'
                      }`}>
                        {order.status || 'Pendiente'}
                      </span>
                      <span className="text-[10px] text-stone-300 font-bold uppercase tracking-tighter">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-brand-brown">Pedido #{order.id.slice(-6).toUpperCase()}</h3>
                  </div>
                  <span className="bg-brand-cream text-brand-brown px-4 py-1.5 rounded-full text-sm font-bold">
                    ${order.total.toLocaleString('es-CL')}
                  </span>
                </div>

                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full flex items-center justify-between py-3 border-t border-stone-100 text-brand-gold font-bold text-xs"
                >
                  {expandedOrder === order.id ? 'Ocultar detalles' : 'Ver productos'}
                  {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {expandedOrder === order.id && (
                  <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-stone-500">
                          <span>{item.quantity}x {item.nombre}</span>
                          <span className="font-medium">${(item.precio * item.quantity).toLocaleString('es-CL')}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleRepeatOrder(order.items)}
                      className="w-full bg-brand-brown text-brand-cream py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-brown/95 transition-all shadow-lg flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      <RefreshCcw size={14} /> Repetir Pedido
                    </button>
                  </div>
                )}

                <div className="mt-4 p-3 bg-brand-gold/5 rounded-xl border border-brand-gold/10 flex items-start gap-3">
                  <Info size={14} className="text-brand-gold shrink-0 mt-0.5" />
                  <p className="text-[10px] text-stone-500 italic leading-tight">
                    {order.status === 'Pendiente' ? 'El Maestro está revisando tu mensaje de WhatsApp.' :
                     order.status === 'Confirmado' ? '¡Pago confirmado! El Maestro está horneando tus delicias.' :
                     'Este pedido ya fue entregado con éxito.'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
