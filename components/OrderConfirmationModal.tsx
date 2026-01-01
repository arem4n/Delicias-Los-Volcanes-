
import React from 'react';
import { X, MessageCircle, Info } from 'lucide-react';
import { CartItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  items: CartItem[];
  total: number;
}

export const OrderConfirmationModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, items, total }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-brown/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-brand-brown/5 rounded-full text-brand-brown">
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="bg-brand-gold/10 text-brand-gold w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info size={28} />
          </div>
          <h2 className="text-2xl font-bold text-brand-brown font-display">Revisión Final</h2>
          <p className="text-stone-500 text-sm mt-1">Confirma tu pedido para contactar al Maestro.</p>
        </div>

        <div className="bg-brand-cream rounded-2xl p-5 mb-8 max-h-48 overflow-y-auto border border-brand-brown/5">
          <ul className="space-y-3">
            {items.map(item => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-stone-600 font-medium">{item.quantity}x {item.nombre}</span>
                <span className="text-brand-brown font-bold">${(item.precio * item.quantity).toLocaleString('es-CL')}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-brand-brown/10 flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-stone-400">Total a Pagar</span>
            <span className="text-xl font-black text-brand-brown font-display">${total.toLocaleString('es-CL')}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full bg-brand-brown text-brand-cream py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-brown/95 transition-all shadow-xl flex items-center justify-center gap-3"
          >
            <MessageCircle size={18} /> Confirmar y Abrir WhatsApp
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 text-stone-400 font-bold text-xs uppercase tracking-widest hover:text-brand-brown transition-colors"
          >
            Seguir Comprando
          </button>
        </div>
        
        <p className="mt-6 text-[10px] text-center text-stone-400 leading-relaxed uppercase tracking-tighter">
          Al confirmar, el pedido se registrará como pendiente y <br/> serás redirigido para coordinar el pago y entrega.
        </p>
      </div>
    </div>
  );
};
