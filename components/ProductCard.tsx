
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
    <div className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl border border-stone-100 transition-all duration-500 hover:-translate-y-2 hover:border-brand-gold/30 flex flex-col h-full relative z-10">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={product.imagen_url} 
          alt={product.nombre}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${(isOutOfStock || isMaxedInCart) ? 'grayscale opacity-60' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-4 left-4 z-10 animate-in fade-in zoom-in">
            <span className="bg-brand-gold text-brand-brown px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg border border-white/20">
              <AlertTriangle size={10} strokeWidth={3} /> {product.stock} disponibles
            </span>
          </div>
        )}

        {(!isOutOfStock && !isMaxedInCart) && (
          <button
            onClick={handleAddToCart}
            aria-label={`Añadir ${product.nombre} al carrito`}
            className={`absolute bottom-6 right-6 p-5 rounded-2xl shadow-2xl transform translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-90 border border-white/20 z-20 ${
              justAdded ? 'bg-green-500 text-white translate-y-0 opacity-100' : 'bg-brand-gold text-brand-brown hover:bg-brand-brown hover:text-brand-gold'
            }`}
          >
            {justAdded ? <Check size={24} strokeWidth={3} className="animate-in zoom-in" /> : <Plus size={24} strokeWidth={3} />}
          </button>
        )}
        
        {(isOutOfStock || isMaxedInCart) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-brand-brown/95 text-brand-cream px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-brand-gold/40 backdrop-blur-sm">
              <Ban size={14} /> {isOutOfStock ? 'Agotado' : 'Sin stock'}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-7 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4 gap-4">
          <h3 className="text-xl font-bold text-brand-brown leading-tight group-hover:text-brand-gold transition-colors font-display">
            {product.nombre}
          </h3>
          <span className="font-black text-brand-gold whitespace-nowrap text-2xl tracking-tighter">
            ${product.precio.toLocaleString('es-CL')}
          </span>
        </div>
        
        <p className="text-stone-500 text-sm mb-8 line-clamp-2 font-light leading-relaxed flex-1">
          {product.descripcion}
        </p>
        
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isMaxedInCart}
          className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
            (isOutOfStock || isMaxedInCart)
            ? 'border-stone-100 text-stone-300 cursor-not-allowed' 
            : justAdded 
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-brand-brown/10 text-brand-brown hover:bg-brand-brown hover:text-brand-gold hover:border-brand-brown hover:scale-[1.03] shadow-sm active:scale-95'
          }`}
        >
          {isOutOfStock ? 'No disponible' : isMaxedInCart ? 'Sin más stock' : justAdded ? (
            <><Check size={16} strokeWidth={3} /> ¡Añadido!</>
          ) : (
            <><ShoppingCart size={16} /> Agregar al Pedido</>
          )}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
