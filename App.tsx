
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { CartProvider, useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import { ProductCard } from './components/ProductCard';
import { CartSidebar } from './components/CartSidebar';
import { OrdersHistory } from './components/OrdersHistory';
import { AdminPanel } from './components/AdminPanel';
import { TermsModal } from './components/TermsModal';
import { 
  Flame, 
  MessageCircle, 
  Cookie, 
  Instagram, 
  Timer,
  MapPin,
  LogOut,
  History,
  Settings,
  Heart
} from 'lucide-react';
import { Product } from './types';
import { GAS_WEB_APP_URL, MOCK_PRODUCTS, WHATSAPP_NUMBER } from './constants';

const LOGO_URL = "https://i.postimg.cc/CKMHjDPz/Delicias-20251231-164022-0000.png";
const HERO_PRODUCT_IMAGE = "https://i.postimg.cc/BnXV2rjG/Volcan-de-merengue-erupcion-de-mantequilla-choco.png";

const MainContent: React.FC = () => {
  const { cart, total, clearCart } = useCart();
  const { user, login, logout, callApi } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
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
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await fetch(`${GAS_WEB_APP_URL}?action=getProducts`);
        const data = await res.json();
        if (data.status === 'error' || !Array.isArray(data)) {
          console.warn("API falló. Usando productos de muestra.");
          setProducts(MOCK_PRODUCTS);
        } else {
          setProducts(data);
        }
      } catch (e) {
        console.error("Error al cargar productos:", e);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  const scrollToId = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, []);

  const handleWhatsAppCheckout = async () => {
    try {
      const orderData = {
        items: cart.map(i => ({ id: i.id, nombre: i.nombre, quantity: i.quantity, precio: i.precio })),
        total: total,
      };
      await callApi('createOrder', orderData);
      const greeting = user ? `¡Hola! 🌋 Soy ${user.nombre}.` : `¡Hola! 🌋`;
      const message = encodeURIComponent(
        `${greeting} Quería hacer un pedido...\n\n` +
        cart.map(item => `- ${item.quantity}x ${item.nombre}`).join('\n') +
        `\n\n*Total: $${total.toLocaleString('es-CL')}*`
      );
      window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`, '_blank');
      clearCart();
      setIsCartOpen(false);
    } catch (error) {
      console.error("Error al crear el pedido:", error);
      alert("Hubo un error al procesar tu pedido.");
    }
  };

  return (
    <div className="min-h-screen selection:bg-brand-gold selection:text-brand-brown scroll-smooth relative z-10">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[60] bg-white/70 backdrop-blur-xl border-b border-brand-brown/5 h-20 md:h-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 md:gap-3 group">
            <img src={LOGO_URL} alt="Logo" className="h-12 md:h-16 w-auto object-contain transition-transform group-hover:scale-105" />
            <div className="hidden sm:flex flex-col border-l border-brand-brown/10 pl-4 text-left">
              <span className="text-xl md:text-2xl font-bold text-brand-brown font-display leading-none tracking-tight">Los Volcanes</span>
              <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold mt-1">Puerto Montt</span>
            </div>
          </button>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 bg-brand-brown/5 p-1.5 rounded-2xl">
              {user?.isAdmin && (
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="p-2 md:p-3 bg-brand-brown text-brand-gold rounded-xl hover:bg-brand-dark transition-all flex items-center gap-2 font-bold text-xs"
                >
                  <Settings size={16} /> <span className="hidden lg:inline uppercase tracking-widest">Maestro</span>
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsOrdersOpen(true)}
                    className="p-2 md:p-3 bg-brand-gold text-brand-brown rounded-xl hover:bg-brand-gold/90 transition-all shadow-md flex items-center gap-2 font-bold text-xs"
                  >
                    <History size={16} /> <span className="hidden lg:inline uppercase tracking-widest">Mis Compras</span>
                  </button>
                  <button onClick={logout} className="p-2 text-stone-400 hover:text-red-500 transition-colors" title="Cerrar Sesión">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={login}
                  onError={() => console.log('Login Failed')}
                  useOneTap
                  shape="pill"
                  size="medium"
                />
              )}
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative p-3 md:p-4 bg-brand-brown text-brand-gold rounded-2xl hover:scale-105 transition-all shadow-xl shadow-brand-brown/20 border-2 border-brand-gold/20 ${bumpCart ? 'animate-cart-bump' : ''}`}
            >
              <Cookie size={20} className="md:w-6 md:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-brown text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-brand-brown shadow-lg animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center pt-24 md:pt-32 pb-16 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16 z-10">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-brown/5 text-brand-brown text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-brand-brown/10 backdrop-blur-sm">
              <MapPin size={14} className="text-brand-gold" /> Puerto Montt, Chile
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-brand-brown mb-8 md:mb-10 leading-[1] tracking-tighter font-display">
              El placer de <br/>
              <span className="text-brand-gold italic">lo artesanal</span> <br/>
              <span className="text-brand-brown/80 text-4xl md:text-6xl">hecho con alma</span>
            </h1>
            <p className="text-stone-500 text-lg md:text-2xl max-w-xl font-light leading-relaxed mb-12 md:mb-16">
              Galletas horneadas diariamente con ingredientes nobles de nuestra zona. Sin pretensiones, solo sabor real.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <button
                onClick={() => scrollToId('menu')}
                className="bg-brand-brown text-brand-gold px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-dark transition-all shadow-2xl shadow-brand-brown/30 border border-brand-gold/10 active:scale-95"
              >
                Probar la Experiencia
              </button>
              <div className="flex items-center gap-3 text-brand-brown/40 font-black text-[10px] uppercase tracking-widest">
                <Flame size={18} className="text-brand-gold" /> Horneado Hoy
              </div>
            </div>
          </div>
          <div className="relative flex justify-center items-center animate-in fade-in zoom-in duration-1000 delay-300">
            <img src={HERO_PRODUCT_IMAGE} alt="Volcán de Merengue" className="w-full max-w-sm md:max-w-md lg:max-w-none drop-shadow-[0_35px_35px_rgba(62,39,35,0.3)] hover:scale-105 transition-transform duration-700" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-brand-gold/10 rounded-full blur-[100px] -z-10" />
          </div>
        </div>
      </header>

      {/* Menu Section */}
      <main id="menu" className="max-w-7xl mx-auto px-6 py-24 md:py-32 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-10 border-b border-brand-brown/5 pb-12">
          <div className="max-w-2xl text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-bold text-brand-brown mb-6 font-display">Nuestras Galletas</h2>
            <p className="text-stone-500 text-lg md:text-xl font-light italic">Selección limitada de horneado diario para garantizar máxima frescura.</p>
          </div>
          <div className="flex justify-center md:justify-start">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-brand-brown bg-brand-gold px-8 py-5 rounded-2xl shadow-xl shadow-brand-gold/20">
              <Timer size={18} /> Disponibles Ahora
            </div>
          </div>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
             {[1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-stone-100 rounded-[3rem] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {products.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </main>

      {/* Chocolate Footer */}
      <footer className="bg-brand-brown py-20 md:py-24 px-6 border-t border-brand-gold/20 text-brand-cream relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16 md:gap-20">
          <div className="max-w-md w-full text-center md:text-left">
            <img src={LOGO_URL} alt="Logo" className="h-20 md:h-28 w-auto mb-8 md:mb-10 mx-auto md:mx-0 brightness-0 invert opacity-90" />
            <p className="text-brand-cream/60 text-lg mb-8 md:mb-10 leading-relaxed font-light">
              Llevamos la maestría de la pastelería profesional a la calidez de tu hogar. Calidad sureña en cada detalle.
            </p>
            <div className="flex justify-center md:justify-start gap-6">
              <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-brand-gold hover:text-brand-brown transition-all"><Instagram size={20} /></a>
              <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-brand-gold hover:text-brand-brown transition-all"><MessageCircle size={20} /></a>
            </div>
          </div>

          <div className="flex flex-col gap-10 items-center md:items-end w-full md:w-auto">
            <div className="text-center md:text-right">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold mb-6">Pedidos y Consultas</h4>
              <a
                href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent("¡Hola! Me gustaría hacer una consulta sobre Delicias Los Volcanes 🌋")}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-brand-gold text-brand-brown px-10 py-6 rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-black/40 border border-white/20 active:scale-95"
              >
                <MessageCircle size={28} /> Hablar ahora
              </a>
            </div>
            <div className="space-y-2 text-center md:text-right">
              <p className="text-brand-gold font-bold text-sm tracking-widest uppercase">Puerto Montt, Región de los Lagos</p>
              <p className="text-brand-cream/40 text-xs">Entregas de Lunes a Sábado</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-20 md:mt-24 pt-12 md:pt-16 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-brand-cream/30 text-[10px] uppercase tracking-widest font-bold">© {new Date().getFullYear()} Delicias Los Volcanes</p>

            <div className="flex flex-col items-center gap-6">
              <div className="flex gap-8 md:gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-brand-cream/50">
                <button onClick={() => scrollToId('menu')} className="hover:text-brand-gold transition-colors">Menú</button>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-brand-gold transition-colors">Inicio</button>
                <button onClick={() => setIsTermsOpen(true)} className="hover:text-brand-gold transition-colors">Términos</button>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold/70">
                Diseñador <span className="text-brand-gold hover:text-white transition-colors cursor-default underline decoration-brand-gold/30 underline-offset-4">arem4n</span> <Heart size={10} className="fill-brand-gold text-brand-gold animate-pulse mx-1" /> Los Volcanes
              </div>
            </div>
          </div>
        </div>
      </footer>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={handleWhatsAppCheckout} />
      <OrdersHistory
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        onRepeatOrder={() => setIsCartOpen(true)}
        products={products}
      />
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
};

const App: React.FC = () => (
  <MainContent />
);

export default App;
