
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { GAS_WEB_APP_URL, WHATSAPP_NUMBER, MOCK_PRODUCTS } from './constants';

const LOGO_URL = "https://i.postimg.cc/CKMHjDPz/Delicias-20251231-164022-0000.png";
const HERO_PRODUCT_IMAGE = "https://i.postimg.cc/BnXV2rjG/Volcan-de-merengue-erupcion-de-mantequilla-choco.png";

// --- Componente Principal del Contenido ---
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

  // Efecto de rebote en el carrito
  useEffect(() => {
    if (cartCount > 0) {
      setBumpCart(true);
      const timer = setTimeout(() => setBumpCart(false), 400);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  // Cargar productos desde el backend seguro
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
    // ...
  }, []);

  // Proceso de compra seguro a través del backend
  const handleWhatsAppCheckout = async () => {
    try {
      const orderData = {
        items: cart.map(i => ({ id: i.id, nombre: i.nombre, quantity: i.quantity, precio: i.precio })),
        total: total,
      };
      await callApi('createOrder', orderData);
      const greeting = user ? `¡Hola! 🌋 Soy ${user.nombre}.` : `¡Hola! 🌋`;
      const message = encodeURIComponent(
        `${greeting} Quería hacer un pedido de Delicias Los Volcanes:\n\n` +
        cart.map(item => `- ${item.quantity}x ${item.nombre} ($${(item.precio * item.quantity).toLocaleString('es-CL')})`).join('\n') +
        `\n\n*Total: $${total.toLocaleString('es-CL')}*\n\n¿Me podrías confirmar disponibilidad para entrega? ¡Muchas gracias!`
      );
      window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`, '_blank');
      clearCart();
      setIsCartOpen(false);
    } catch (error) {
      console.error("Error al crear el pedido:", error);
      alert("Hubo un error al procesar tu pedido. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <div className="min-h-screen selection:bg-brand-gold selection:text-brand-brown scroll-smooth relative z-10">
      <nav className="fixed top-0 w-full z-[60] bg-white/70 backdrop-blur-xl border-b border-brand-brown/5 h-20 md:h-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3 group">
                <img src={LOGO_URL} alt="Logo" className="h-12 md:h-16 w-auto object-contain transition-transform group-hover:scale-105" />
                <div className="hidden sm:flex flex-col border-l border-brand-brown/10 pl-4 text-left">
                    <span className="text-xl md:text-2xl font-bold text-brand-brown font-display leading-none tracking-tight">Los Volcanes</span>
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold mt-1">Puerto Montt</span>
                </div>
            </div>
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
                    onError={() => {
                        console.error('Error en el inicio de sesión con Google');
                        alert('Hubo un error al iniciar sesión. Por favor, intenta de nuevo.');
                    }}
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
      {/* ... (Hero, Footer, etc.) */}
    </div>
  );
};

const App: React.FC = () => {
  return <MainContent />;
};

export default App;
