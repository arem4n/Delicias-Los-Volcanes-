
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Mail, LogIn, AlertCircle } from 'lucide-react';
import { ADMIN_EMAIL } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isLoggingAsAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    // Verificación de autenticidad para el Maestro: el nombre debe ser igual al mail
    if (isLoggingAsAdmin && nombre.trim().toLowerCase() !== email.trim().toLowerCase()) {
      setError("Acceso Maestro Denegado: Para validar tu identidad, debes ingresar tu email también en el campo de Nombre.");
      return;
    }

    if (!email || !nombre) {
      setError("Por favor completa todos los campos.");
      return;
    }

    login(email, nombre);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-brown/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-brand-cream w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 md:p-10 animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-brand-brown/5 rounded-full text-brand-brown">
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="bg-brand-brown text-brand-gold w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-brown/20">
            <User size={32} />
          </div>
          <h2 className="text-3xl font-bold text-brand-brown font-display uppercase tracking-tight">¡Bienvenido!</h2>
          <p className="text-stone-500 font-light mt-2 italic">Inicia sesión para una mejor experiencia.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[11px] font-bold flex items-start gap-2 border border-red-100 animate-in shake-2 duration-300">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              required
              type="email"
              placeholder="Tu correo electrónico"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-brand-brown/10 focus:ring-2 focus:ring-brand-gold outline-none transition-all text-brand-brown font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              required
              type="text"
              placeholder="Tu nombre completo"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-brand-brown/10 focus:ring-2 focus:ring-brand-gold outline-none transition-all text-brand-brown font-medium"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-brown text-brand-cream py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-brown/90 transition-all shadow-xl shadow-brand-brown/20 flex items-center justify-center gap-2"
          >
            <LogIn size={20} /> Entrar
          </button>

          <p className="text-[10px] text-center text-stone-400 font-bold uppercase tracking-widest leading-relaxed mt-4 px-2">
            Nota: Si eres el <span className="text-brand-gold">Maestro</span>, ingresa tu email también como nombre para validar autenticidad.
          </p>
        </form>
      </div>
    </div>
  );
};
