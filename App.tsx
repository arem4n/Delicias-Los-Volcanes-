
import React, { useState, useEffect, useCallback } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import { ProductCard } from './components/ProductCard';
import { CartSidebar } from './components/CartSidebar';
import { AuthModal } from './components/AuthModal';
import { OrdersHistory } from './components/OrdersHistory';
import { AdminPanel } from './components/AdminPanel';
import { TermsModal } from './components/TermsModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { 
  Flame, 
  MessageCircle, 
  Cookie, 
  Instagram, 
  MapPin,
  User as UserIcon,
  Settings,
  Heart,
  Clock
} from 'lucide-react';
import { Product, SavedOrder } from './types';
import { GAS_WEB_APP_URL, MOCK_PRODUCTS, WHATSAPP_NUMBER } from './constants';

const LOGO_URL = "https://i.postimg.cc/CKMHjDPz/Delicias-20251231-164022-0000.png";

const MainContent: React.FC = () => {
  const { cart, total, clearCart } = useCart();
  const { user, addOrderToHistory } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bumpCart, setBumpCart] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (cartCount > 0) {
      setBumpCart(true);
      const timer = setTimeout(() => setBumpCart(false), 400);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const localProducts = localStorage.getItem('delicias_products');
        if (localProducts) {
          setProducts(JSON.parse(localProducts));
        } else if (GAS_WEB_APP_URL && !GAS_WEB_APP_URL.includes("YOUR_GOOGLE_APPS_SCRIPT_URL")) {
          const res = await fetch(GAS_WEB_APP_URL);
          const data = await res.json();
          setProducts(data);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch (e) {
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('delicias_products', JSON.stringify(newProducts));
  };

  const scrollToId = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, []);

  const handleWhatsAppCheckout = () => {
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      }
      return p;
    });
    handleUpdateProducts(updatedProducts);

    const newOrder: SavedOrder = {
      id: orderId,
      date: new Date().toISOString(),
      items: cart.map(i => ({ id: i.id, nombre: i.nombre, quantity: i.quantity, precio: i.precio })),
      total: total,
      status: 'Pendiente'
    };

    const greeting = user ? `¡Hola! 🌋 Soy ${user.nombre}.` : `¡Hola! 🌋`;
    const message = encodeURIComponent(
      `${greeting} Quería hacer un pedido de Delicias Los Volcanes:\n\n` +
      cart.map(item => `- ${item.quantity}x ${item.nombre} ($${(item.precio * item.quantity).toLocaleString('es-CL')})`).join('\n') +
      `\n\n*Total: $${total.toLocaleString('es-CL')}*\n\n¿Me podrías confirmar disponibilidad para entrega? ¡Muchas gracias!`
    );
    
    addOrderToHistory(newOrder);
    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`, '_blank');
    
    clearCart();
    setIsConfirmOpen(false);
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen selection:bg-brand-gold/30 selection:text-brand-brown scroll-smooth bg-brand-cream">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-brand-cream/80 backdrop-blur-md h-20 flex items-center px-6 border-b border-brand-brown/5">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center">
            <img src={LOGO_URL} alt="Delicias Los Volcanes" className="h-14 w-auto object-contain" />
          </button>
          
          <div className="flex items-center gap-3 md:gap-6">
            {user?.isAdmin && (
              <button onClick={() => setIsAdminOpen(true)} className="p-2 text-brand-brown/40 hover:text-brand-brown transition-colors" title="Panel Maestro">
                <Settings size={22} />
              </button>
            )}
            
            <button 
              onClick={() => (user ? setIsOrdersOpen(true) : setIsAuthOpen(true))} 
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-100 rounded-full md:rounded-2xl shadow-sm text-brand-brown hover:border-brand-gold transition-all"
            >
              <UserIcon size={20} />
              <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em]">
                {user ? (user.isAdmin ? 'Sesión Maestro' : 'Mi Perfil') : 'Iniciar Sesión'}
              </span>
            </button>

            <button 
              onClick={() => setIsCartOpen(true)}
              className={`relative flex items-center gap-3 px-4 md:px-6 py-2.5 bg-brand-brown text-brand-gold rounded-full md:rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 ${bumpCart ? 'animate-bounce' : ''}`}
            >
              <Cookie size={20} />
              <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em]">Carrito</span>
              {cartCount > 0 && (
                <span className="md:relative absolute -top-1 -right-1 md:top-0 md:right-0 bg-brand-gold text-brand-brown text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-brand-brown md:border-none">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-36 pb-20 px-6 flex flex-col items-center text-center max-w-4xl mx-auto space-y-10">
        <div className="bg-stone-100/80 px-4 py-1.5 rounded-full border border-stone-200 text-stone-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
          <MapPin size={12} className="text-brand-brown/30" /> PUERTO MONTT, CHILE
        </div>

        <h1 className="heading-main text-5xl md:text-7xl text-brand-brown">
          El placer de <br/>
          <span className="heading-accent text-brand-gold">lo artesanal</span> <br/>
          hecho con alma
        </h1>

        <p className="text-stone-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl px-4">
          Galletas horneadas diariamente con ingredientes nobles de nuestra zona. Sin pretensiones, solo sabor real.
        </p>

        <div className="flex flex-col items-center gap-6 w-full">
          <button 
            onClick={() => scrollToId('menu')}
            className="w-full sm:w-auto bg-brand-brown text-brand-gold px-12 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:brightness-110 shadow-xl transition-all active:scale-95"
          >
            PROBAR LA EXPERIENCIA
          </button>
          
          <div className="flex items-center gap-2 text-stone-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            <Flame size={14} className="text-brand-gold" /> HORNEADO HOY
          </div>
        </div>

        <div className="pt-16 w-full max-w-sm flex justify-center">
          <img 
            src={LOGO_URL} 
            alt="Delicias Los Volcanes" 
            className="w-full h-auto drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]" 
          />
        </div>
      </header>

      {/* Products Section */}
      <main id="menu" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-24 flex flex-col items-center">
        <div className="text-center mb-16 space-y-4 flex flex-col items-center">
          <h2 className="heading-main text-4xl md:text-6xl text-brand-brown uppercase">Nuestras Galletas</h2>
          <p className="text-stone-400 text-lg md:text-xl max-w-lg font-medium">
            Selección limitada de horneado diario para garantizar máxima frescura.
          </p>
          <div className="bg-brand-gold text-brand-brown px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-lg">
            <Clock size={16} strokeWidth={3} /> DISPONIBLES AHORA
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
             {[1,2,3].map(i => <div key={i} className="aspect-[4/5] bg-stone-100 rounded-[2.5rem] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
            {products.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark py-24 px-6 text-center text-brand-cream">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col items-center space-y-8">
            <img src={LOGO_URL} alt="Logo" className="h-20 w-auto brightness-0 invert" />
            <p className="text-lg max-w-md font-light leading-relaxed mx-auto opacity-80">
              Llevando el sabor artesanal de Puerto Montt a tu mesa. Calidad y frescura en cada mordisco.
            </p>
          </div>
          
          <div className="flex flex-col items-center space-y-6">
            <a 
              href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`} 
              target="_blank" rel="noopener noreferrer"
              className="bg-brand-gold text-brand-brown px-12 py-5 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-all flex items-center gap-4"
            >
              <MessageCircle size={24} /> Pedir por WhatsApp
            </a>
            <div className="flex gap-4">
              <a href="#" className="p-4 bg-white/5 rounded-2xl hover:bg-brand-gold hover:text-brand-brown transition-all"><Instagram size={20} /></a>
            </div>
          </div>

          <div className="pt-20 border-t border-white/5 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-40 italic">© Delicias Los Volcanes · Puerto Montt</p>
            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-gold">
              Diseñado por <a href="https://areman.vercel.app" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-brand-gold/30 hover:decoration-brand-gold transition-all">arem4n</a> <Heart size={10} className="fill-brand-gold" />
            </div>
          </div>
        </div>
      </footer>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={() => setIsConfirmOpen(true)} />
      <OrderConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleWhatsAppCheckout} items={cart} total={total} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <OrdersHistory isOpen={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} products={products} onRepeatOrder={() => setIsCartOpen(true)} />
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} products={products} onUpdateProducts={handleUpdateProducts} />
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
};

const App: React.FC = () => (
  <CartProvider>
    <MainContent />
  </CartProvider>
);

export default App;
