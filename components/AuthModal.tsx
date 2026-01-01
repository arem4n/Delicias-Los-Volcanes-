
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Mail, LogIn } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !nombre) return;
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
          <h2 className="text-3xl font-bold text-brand-brown font-display">¡Bienvenido!</h2>
          <p className="text-stone-500 font-light mt-2">Inicia sesión para guardar tus pedidos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              required
              type="email"
              placeholder="Tu correo electrónico"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-brand-brown/10 focus:ring-2 focus:ring-brand-gold outline-none transition-all text-brand-brown"
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
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-brand-brown/10 focus:ring-2 focus:ring-brand-gold outline-none transition-all text-brand-brown"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-brown text-brand-cream py-4 rounded-2xl font-bold text-lg hover:bg-brand-brown/90 transition-all shadow-xl shadow-brand-brown/20 flex items-center justify-center gap-2"
          >
            <LogIn size={20} /> Entrar
          </button>
        </form>
      </div>
    </div>
  );
};
