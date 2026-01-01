
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Loader2, CheckCircle2, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { GAS_WEB_APP_URL } from '../constants';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CheckoutForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const { cart, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    direccion: '',
    notas: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    setError(null);

    const orderData = {
      cliente_nombre: formData.nombre,
      cliente_email: formData.email,
      direccion: formData.direccion,
      notas: formData.notas,
      detalle_json: JSON.stringify(cart.map(i => ({ nombre: i.nombre, precio: i.precio, quantity: i.quantity }))),
      total: total
    };

    try {
      if (GAS_WEB_APP_URL.includes("YOUR_GOOGLE_APPS_SCRIPT_URL")) {
        // Simulación de delay de red para demostrar el estado de carga
        await new Promise(r => setTimeout(r, 1500));
      } else {
        await fetch(GAS_WEB_APP_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(orderData),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      // Animación sutil de éxito en el botón
      setLoading(false);
      setCompleted(true);
      
      // Esperamos un momento para que el usuario vea el check en el botón
      await new Promise(r => setTimeout(r, 1200));

      setSuccess(true);
      setTimeout(() => {
        clearCart();
        onSuccess();
      }, 3000);
    } catch (err) {
      setError("Hubo un problema al procesar tu pedido. Por favor intenta de nuevo.");
      setLoading(false);
      console.error(err);
    }
  };

  if (success) {
    return (
      <div className="p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="bg-green-100 p-6 rounded-full">
            <CheckCircle2 size={64} className="text-green-600 animate-bounce" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold font-display text-brand-brown">¡Pedido Recibido!</h2>
          <p className="text-stone-500 font-light">
            Hemos enviado los detalles a tu correo. El Maestro se pondrá en contacto contigo pronto para coordinar el despacho.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-brand-brown mb-2">Nombre Completo</label>
          <input
            required
            type="text"
            className="w-full px-5 py-4 rounded-2xl bg-white border border-brand-brown/10 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all font-medium"
            value={formData.nombre}
            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-brand-brown mb-2">Correo Electrónico</label>
          <input
            required
            type="email"
            className="w-full px-5 py-4 rounded-2xl bg-white border border-brand-brown/10 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all font-medium"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="tu@correo.com"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-brand-brown mb-2">Dirección de Entrega (Puerto Montt)</label>
          <textarea
            required
            className="w-full px-5 py-4 rounded-2xl bg-white border border-brand-brown/10 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all resize-none h-28 font-medium"
            value={formData.direccion}
            onChange={e => setFormData({ ...formData, direccion: e.target.value })}
            placeholder="Calle, Número, Depto/Casa..."
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-brand-brown mb-2">Notas Especiales (Opcional)</label>
          <input
            type="text"
            className="w-full px-5 py-4 rounded-2xl bg-white border border-brand-brown/10 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all font-medium"
            value={formData.notas}
            onChange={e => setFormData({ ...formData, notas: e.target.value })}
            placeholder="Ej: Tocar el timbre fuerte, dejar en conserjería..."
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 text-sm border border-red-100 animate-in shake-2 duration-300">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-5 border border-brand-brown/10 rounded-2xl font-bold text-brand-brown hover:bg-white transition-all text-sm uppercase tracking-widest"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={loading || completed || cart.length === 0}
          className={`flex-[2] py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] ${
            completed 
            ? 'bg-green-500 text-white scale-105' 
            : 'bg-brand-brown text-brand-cream hover:bg-brand-brown/95 shadow-brand-brown/20'
          } disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none disabled:cursor-not-allowed`}
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={20} /> Procesando...</>
          ) : completed ? (
            <><Check size={24} strokeWidth={3} className="animate-in zoom-in duration-300" /> ¡Listo!</>
          ) : (
            <span className="flex items-center gap-2">
              Confirmar Pedido (${total.toLocaleString('es-CL')})
              <ArrowRight size={18} />
            </span>
          )}
        </button>
      </div>
    </form>
  );
};
