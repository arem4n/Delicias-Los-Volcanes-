
import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, ShoppingCart, MessageCircle, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSidebar: React.FC<Props> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateQuantity, total, removeFromCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-brand-brown/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-brand-cream h-full shadow-2xl flex flex-col border-l border-brand-brown/5">
          <div className="flex items-center justify-between p-6 md:p-8 border-b border-brand-brown/10 bg-white">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-brand-brown font-display uppercase tracking-tight">
              <ShoppingCart className="text-brand-gold" /> Tu Pedido
            </h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-brand-brown/5 rounded-full transition-colors text-brand-brown"
              aria-label="Cerrar carrito"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-300 space-y-6">
                <div className="bg-white p-10 rounded-full shadow-inner">
                  <ShoppingCart size={80} strokeWidth={1} />
                </div>
                <p className="text-xl font-light">¿Tentado con algo?</p>
                <button 
                  onClick={onClose}
                  className="text-brand-gold font-black uppercase tracking-widest text-xs hover:underline"
                >
                  Explorar la selección
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="group flex gap-4 bg-white p-5 rounded-[2rem] shadow-sm border border-brand-brown/5 hover:border-brand-gold/20 transition-all">
                  <div className="relative shrink-0">
                    <img 
                      src={item.imagen_url} 
                      alt={item.nombre} 
                      className="w-20 h-20 object-cover rounded-2xl"
                    />
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute -top-2 -left-2 bg-white text-stone-400 p-1.5 rounded-full shadow-md hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label={`Eliminar ${item.nombre} del carrito`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-brand-brown leading-tight mb-1">{item.nombre}</h4>
                    <p className="text-brand-gold font-black text-sm mb-3">
                      ${item.precio.toLocaleString('es-CL')}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 bg-brand-cream p-1 rounded-xl border border-brand-brown/5">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2 hover:bg-white rounded-lg text-brand-brown transition-all"
                          aria-label={`Disminuir cantidad de ${item.nombre}`}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold min-w-[2rem] text-center text-brand-brown text-sm" aria-label={`Cantidad: ${item.quantity}`}>
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={item.quantity >= item.stock}
                          className={`p-2 rounded-lg transition-all ${
                            item.quantity >= item.stock 
                            ? 'text-stone-300 cursor-not-allowed' 
                            : 'hover:bg-white text-brand-brown'
                          }`}
                          aria-label={`Aumentar cantidad de ${item.nombre}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-8 border-t border-brand-brown/10 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-center mb-8">
                <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Total del Pedido</span>
                <span className="text-4xl font-black text-brand-brown font-display tracking-tighter">
                  ${total.toLocaleString('es-CL')}
                </span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full flex items-center justify-center gap-4 bg-brand-brown text-brand-cream py-6 rounded-[2rem] font-black text-lg hover:bg-brand-brown/95 transition-all shadow-2xl shadow-brand-brown/20 active:scale-[0.98]"
              >
                Confirmar vía WhatsApp <MessageCircle size={22} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
