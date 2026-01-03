
import React, { memo, useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Plus, Ban, AlertTriangle, Check } from 'lucide-react';

interface Props {
  product: Product;
}

export const ProductCard = memo(({ product }: Props) => {
  const { addToCart, cart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  
  const cartItem = cart.find(item => item.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;
  const isOutOfStock = product.stock < 1;
  const isLowStock = product.stock > 0 && product.stock < 5;
  const isMaxedInCart = currentQuantity >= product.stock;

  const handleAddToCart = () => {
    if (!isOutOfStock && !isMaxedInCart) {
      addToCart(product);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  return (
    <div className="group bg-white rounded-[3rem] overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(44,27,24,0.15)] border border-stone-100 transition-all duration-700 hover:-translate-y-4 hover:border-brand-gold/30 flex flex-col h-full relative z-10">
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-cream">
        <img 
          src={product.imagen_url} 
          alt={product.nombre}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${(isOutOfStock || isMaxedInCart) ? 'grayscale opacity-40' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-6 left-6 z-10">
            <span className="bg-brand-gold text-brand-brown px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl border border-white/30 backdrop-blur-sm">
              <AlertTriangle size={12} strokeWidth={3} /> {product.stock} piezas
            </span>
          </div>
        )}

        {(!isOutOfStock && !isMaxedInCart) && (
          <button
            onClick={handleAddToCart}
            aria-label={`Añadir ${product.nombre} al carrito`}
            className={`absolute bottom-8 right-8 p-6 rounded-[1.5rem] shadow-2xl transform translate-y-24 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:scale-110 active:scale-95 border border-white/20 z-20 ${
              justAdded ? 'bg-green-500 text-white translate-y-0 opacity-100' : 'bg-brand-brown text-brand-gold hover:bg-brand-dark'
            }`}
          >
            {justAdded ? <Check size={24} strokeWidth={3} className="animate-[zoom-in_0.3s_ease-out]" /> : <Plus size={24} strokeWidth={3} />}
          </button>
        )}
        
        {(isOutOfStock || isMaxedInCart) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-brand-brown/90 text-brand-cream px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 border border-brand-gold/40 backdrop-blur-xl">
              <Ban size={16} /> {isOutOfStock ? 'Sold Out' : 'Sin Stock'}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-10 flex flex-col flex-1">
        <div className="flex flex-col mb-6">
          <h3 className="text-2xl font-bold text-brand-brown leading-none group-hover:text-brand-gold transition-colors font-display uppercase tracking-tight mb-4">
            {product.nombre}
          </h3>
          <span className="font-black text-brand-gold text-3xl tracking-tighter">
            ${product.precio.toLocaleString('es-CL')}
          </span>
        </div>
        
        <p className="text-stone-400 text-base mb-10 line-clamp-2 font-light leading-relaxed flex-1 italic">
          "{product.descripcion}"
        </p>
        
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isMaxedInCart}
          className={`w-full py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] border-2 transition-all duration-500 flex items-center justify-center gap-3 ${
            (isOutOfStock || isMaxedInCart)
            ? 'border-stone-100 text-stone-300 cursor-not-allowed' 
            : justAdded 
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-brand-brown/10 text-brand-brown hover:bg-brand-brown hover:text-brand-gold hover:border-brand-brown shadow-sm active:scale-[0.98]'
          }`}
        >
          {isOutOfStock ? 'No Disponible' : isMaxedInCart ? 'Límite alcanzado' : justAdded ? (
            <><Check size={18} strokeWidth={3} /> Añadido</>
          ) : (
            <><ShoppingCart size={18} /> Pedir Ahora</>
          )}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
