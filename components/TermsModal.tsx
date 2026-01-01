
import React from 'react';
import { X, ShieldCheck, Truck, CreditCard, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-brown/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-brand-cream w-full max-w-2xl h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-brand-brown/10 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-brand-gold/20 text-brand-gold p-3 rounded-2xl">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-2xl font-bold text-brand-brown font-display leading-none">Términos y Condiciones</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-brown/5 rounded-full text-brand-brown transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-brand-gold">
              <Clock size={20} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Horarios y Disponibilidad</h3>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed">
              En <strong>Delicias Los Volcanes</strong> horneamos diariamente para asegurar la máxima frescura. Los pedidos están sujetos a stock diario. Si un producto se agota después de tu orden, te contactaremos inmediatamente vía WhatsApp para ofrecerte una alternativa o la devolución de tu dinero.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-brand-gold">
              <Truck size={20} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Entregas y Despacho</h3>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed">
              Realizamos entregas dentro del radio urbano de <strong>Puerto Montt</strong> de Lunes a Sábado. El costo de envío se calculará y confirmará vía WhatsApp según tu ubicación exacta. Los tiempos de entrega estimados son entre 2 y 4 horas una vez confirmado el pago.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-brand-gold">
              <CreditCard size={20} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Pagos y Cancelaciones</h3>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed">
              Aceptamos transferencias electrónicas y pagos con tarjeta (vía link de pago). El pedido se considera "Confirmado" solo tras recibir el comprobante de pago. Una vez horneado el pedido, no se aceptan cancelaciones debido a la naturaleza perecedera de nuestros productos artesanales.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="font-bold uppercase tracking-widest text-xs text-brand-gold">Privacidad</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Tus datos (nombre, email y dirección) son utilizados exclusivamente para procesar tu pedido y mejorar tu experiencia de compra. No compartimos tu información con terceros.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-brand-brown/5 bg-white shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-brand-brown text-brand-cream py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-dark transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
