
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Package, 
  Settings, 
  Plus, 
  Save, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Clock, 
  Truck,
  Image as ImageIcon
} from 'lucide-react';
import { Product, OrderStatus, SavedOrder } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (newProducts: Product[]) => void;
}

export const AdminPanel: React.FC<Props> = ({ isOpen, onClose, products, onUpdateProducts }) => {
  const { allOrders, updateOrderStatus } = useAuth();
  const [tab, setTab] = useState<'pedidos' | 'productos'>('pedidos');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  if (!isOpen) return null;

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    let newProducts;
    if (products.find(p => p.id === editingProduct.id)) {
      newProducts = products.map(p => p.id === editingProduct.id ? editingProduct : p);
    } else {
      newProducts = [...products, { ...editingProduct, id: Math.random().toString(36).substr(2, 9) }];
    }
    
    onUpdateProducts(newProducts);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('¿Eliminar este producto?')) {
      onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-brown/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative bg-brand-cream w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        
        {/* Header */}
        <div className="p-8 border-b border-brand-brown/10 flex items-center justify-between bg-white">
          <div className="flex items-center gap-6">
            <div className="bg-brand-brown text-brand-gold p-3 rounded-2xl shadow-lg">
              <Settings size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-brand-brown font-display leading-none">Panel del Maestro</h2>
              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => setTab('pedidos')}
                  className={`text-[10px] font-black uppercase tracking-widest ${tab === 'pedidos' ? 'text-brand-gold' : 'text-stone-400'}`}
                >
                  Gestionar Pedidos
                </button>
                <button 
                  onClick={() => setTab('productos')}
                  className={`text-[10px] font-black uppercase tracking-widest ${tab === 'productos' ? 'text-brand-gold' : 'text-stone-400'}`}
                >
                  Catálogo & Stock
                </button>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-brown/5 rounded-full text-brand-brown">
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {tab === 'pedidos' ? (
            <div className="space-y-6">
              {allOrders.length === 0 ? (
                <div className="text-center py-20 text-stone-400">No hay pedidos registrados.</div>
              ) : (
                allOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-[2rem] p-6 border border-brand-brown/5 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            order.status === 'Confirmado' ? 'bg-blue-100 text-blue-600' :
                            order.status === 'Entregado' ? 'bg-green-100 text-green-600' :
                            'bg-brand-gold/20 text-brand-gold'
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-stone-300 font-bold text-xs">#{order.id.slice(-6)}</span>
                        </div>
                        <h4 className="text-xl font-bold text-brand-brown">
                          {order.cliente?.nombre || 'Cliente Anónimo'} 
                          <span className="text-sm font-light text-stone-400 ml-2">({order.cliente?.email})</span>
                        </h4>
                        <div className="text-sm text-stone-500">
                          {order.items.map(item => `${item.quantity}x ${item.nombre}`).join(', ')}
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end justify-between">
                        <span className="text-2xl font-black text-brand-brown">${order.total.toLocaleString('es-CL')}</span>
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => handleStatusChange(order.id, 'Pendiente')}
                            className="p-2 rounded-xl bg-stone-100 text-stone-400 hover:text-brand-gold transition-colors"
                            title="Pendiente"
                          ><Clock size={18} /></button>
                          <button 
                            onClick={() => handleStatusChange(order.id, 'Confirmado')}
                            className="p-2 rounded-xl bg-stone-100 text-stone-400 hover:text-blue-500 transition-colors"
                            title="Confirmar"
                          ><CheckCircle size={18} /></button>
                          <button 
                            onClick={() => handleStatusChange(order.id, 'Entregado')}
                            className="p-2 rounded-xl bg-stone-100 text-stone-400 hover:text-green-500 transition-colors"
                            title="Entregado"
                          ><Truck size={18} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-brand-brown font-display">Administrar Productos</h3>
                <button 
                  onClick={() => setEditingProduct({ id: '', nombre: '', descripcion: '', precio: 0, stock: 0, imagen_url: '' })}
                  className="flex items-center gap-2 bg-brand-gold text-brand-brown px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                >
                  <Plus size={16} /> Nuevo Producto
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p.id} className="bg-white p-5 rounded-[2rem] border border-brand-brown/5 group">
                    <img src={p.imagen_url} className="w-full h-32 object-cover rounded-2xl mb-4" />
                    <h4 className="font-bold text-brand-brown mb-1">{p.nombre}</h4>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-brand-gold font-black">${p.precio}</span>
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${p.stock < 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                        Stock: {p.stock}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingProduct(p)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-stone-100 rounded-xl text-stone-500 hover:bg-brand-brown hover:text-white transition-all text-[10px] font-black uppercase"
                      >
                        <Edit size={12} /> Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-brown/60 backdrop-blur-md" onClick={() => setEditingProduct(null)} />
          <form 
            onSubmit={handleSaveProduct}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 space-y-5 animate-in zoom-in duration-300 shadow-2xl"
          >
            <h3 className="text-2xl font-bold font-display text-brand-brown mb-4">
              {editingProduct.id ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Nombre</label>
                <input 
                  required
                  className="w-full p-4 bg-brand-cream rounded-xl border border-brand-brown/5 outline-none focus:ring-2 focus:ring-brand-gold"
                  value={editingProduct.nombre}
                  onChange={e => setEditingProduct({ ...editingProduct, nombre: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Precio ($)</label>
                  <input 
                    type="number" required
                    className="w-full p-4 bg-brand-cream rounded-xl border border-brand-brown/5 outline-none focus:ring-2 focus:ring-brand-gold"
                    value={editingProduct.precio}
                    onChange={e => setEditingProduct({ ...editingProduct, precio: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Stock</label>
                  <input 
                    type="number" required
                    className="w-full p-4 bg-brand-cream rounded-xl border border-brand-brown/5 outline-none focus:ring-2 focus:ring-brand-gold"
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Imagen URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input 
                    required
                    className="w-full pl-12 pr-4 py-4 bg-brand-cream rounded-xl border border-brand-brown/5 outline-none focus:ring-2 focus:ring-brand-gold"
                    value={editingProduct.imagen_url}
                    onChange={e => setEditingProduct({ ...editingProduct, imagen_url: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Descripción</label>
                <textarea 
                  required
                  className="w-full p-4 bg-brand-cream rounded-xl border border-brand-brown/5 outline-none focus:ring-2 focus:ring-brand-gold h-24 resize-none"
                  value={editingProduct.descripcion}
                  onChange={e => setEditingProduct({ ...editingProduct, descripcion: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" onClick={() => setEditingProduct(null)}
                className="flex-1 py-4 text-stone-400 font-bold text-xs uppercase tracking-widest"
              >Cancelar</button>
              <button 
                type="submit"
                className="flex-[2] bg-brand-brown text-brand-cream py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2"
              >
                <Save size={16} /> Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
