
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
  History,
  LayoutGrid,
  Image as ImageIcon,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  RotateCcw
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
  const [tab, setTab] = useState<'pedidos' | 'catalogo' | 'historial'>('pedidos');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDeliveryOrder, setConfirmDeliveryOrder] = useState<SavedOrder | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  if (!isOpen) return null;

  const activeOrders = allOrders.filter(o => o.status === 'Pendiente' || o.status === 'Confirmado');
  const finishedOrders = allOrders.filter(o => o.status === 'Entregado' || o.status === 'Cancelado');

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    if (status === 'Entregado') {
      const order = allOrders.find(o => o.id === orderId);
      if (order) setConfirmDeliveryOrder(order);
    } else {
      updateOrderStatus(orderId, status);
    }
  };

  const confirmDelivery = () => {
    if (confirmDeliveryOrder) {
      updateOrderStatus(confirmDeliveryOrder.id, 'Entregado');
      setConfirmDeliveryOrder(null);
    }
  };

  const formatImageUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/file\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
      if (idMatch && idMatch[1]) {
        return `https://docs.google.com/uc?export=view&id=${idMatch[1]}`;
      }
    }
    return url;
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const formattedProduct = {
      ...editingProduct,
      imagen_url: formatImageUrl(editingProduct.imagen_url)
    };

    let newProducts;
    if (formattedProduct.id && products.find(p => p.id === formattedProduct.id)) {
      newProducts = products.map(p => p.id === formattedProduct.id ? formattedProduct : p);
    } else {
      const newProduct = { 
        ...formattedProduct, 
        id: 'PROD-' + Math.random().toString(36).substr(2, 9).toUpperCase() 
      };
      newProducts = [newProduct, ...products];
    }
    
    onUpdateProducts(newProducts);
    setEditingProduct(null);
  };

  const executeDelete = () => {
    if (productToDelete) {
      const updatedProducts = products.filter(p => p.id !== productToDelete);
      onUpdateProducts(updatedProducts);
      setProductToDelete(null);
    }
  };

  const handleClearAll = () => {
    onUpdateProducts([]);
    setShowClearAllConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-brand-brown/95 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative bg-brand-cream w-full max-w-6xl h-full md:h-[94vh] md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/10 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* HEADER */}
        <div className="bg-white border-b border-brand-brown/5 px-4 md:px-12 py-4 md:py-6 shrink-0 flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="bg-brand-brown text-brand-gold p-2.5 rounded-xl shadow-lg rotate-3">
                <Settings size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-brand-brown uppercase tracking-tighter leading-none">Oficina Maestro</h2>
                <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Gestión Unipersonal</p>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="p-2.5 bg-brand-cream hover:bg-red-50 text-brand-brown hover:text-red-500 rounded-full transition-all border border-brand-brown/5"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex bg-brand-cream p-1 rounded-2xl border border-brand-brown/5 w-full overflow-hidden">
            {[
              { id: 'pedidos', icon: <Package size={14} />, label: `Pedidos` },
              { id: 'catalogo', icon: <LayoutGrid size={14} />, label: 'Catálogo' },
              { id: 'historial', icon: <History size={14} />, label: 'Archivo' }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-brand-brown text-brand-gold shadow-md' : 'text-stone-400 hover:text-brand-brown'}`}
              >
                {t.icon} <span className="hidden xs:inline">{t.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* TRABAJO */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-brand-cream/40 p-4 md:p-10">
          
          {tab === 'pedidos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeOrders.length === 0 ? (
                <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center">
                  <Package size={48} className="mb-4" />
                  <p className="font-bold uppercase tracking-widest text-[10px]">Sin trabajo pendiente</p>
                </div>
              ) : (
                activeOrders.map(order => (
                  <div key={order.id} className={`p-6 rounded-[2rem] border-2 shadow-sm ${order.status === 'Pendiente' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${order.status === 'Confirmado' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'}`}>
                          {order.status === 'Pendiente' ? 'Por Validar' : 'Confirmado'}
                        </span>
                        <h4 className="text-lg font-black text-brand-brown tracking-tighter">{order.cliente?.nombre || 'Cliente'}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-stone-300 uppercase">#{order.id.slice(-6).toUpperCase()}</p>
                        <p className="text-lg font-black text-brand-brown">${order.total.toLocaleString('es-CL')}</p>
                      </div>
                    </div>
                    <div className="bg-white/50 rounded-xl p-3 mb-4 space-y-1 border border-white/20">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-[10px] font-bold text-brand-brown/70">
                          <span>{item.quantity}x {item.nombre}</span>
                          <span className="text-stone-400">${(item.precio * item.quantity).toLocaleString('es-CL')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {order.status === 'Pendiente' ? (
                        <button 
                          onClick={() => handleStatusChange(order.id, 'Confirmado')}
                          className="col-span-2 py-3 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:brightness-110 flex items-center justify-center gap-2 transition-all"
                        >
                          <CheckCircle size={14} /> Validar Pago
                        </button>
                      ) : (
                        <>
                          <button onClick={() => handleStatusChange(order.id, 'Pendiente')} className="py-3 bg-white border border-blue-100 text-blue-400 rounded-xl font-black text-[8px] uppercase tracking-widest">Revertir</button>
                          <button onClick={() => handleStatusChange(order.id, 'Entregado')} className="py-3 bg-brand-brown text-brand-gold rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"><Truck size={14} /> Entregar</button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'catalogo' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] border border-brand-brown/5 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-brand-brown uppercase tracking-tighter">Mi Vitrina</h3>
                  <p className="text-[8px] text-stone-400 font-bold uppercase tracking-widest">Gestiona tus horneados</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setShowClearAllConfirm(true)}
                    className="flex-1 sm:flex-none p-3 text-red-400 hover:text-red-600 transition-colors flex items-center justify-center gap-2 font-black text-[8px] uppercase tracking-widest border border-red-50 rounded-xl"
                  >
                    <RotateCcw size={14} /> Limpiar Vitrina
                  </button>
                  <button 
                    onClick={() => setEditingProduct({ id: '', nombre: '', descripcion: '', precio: 0, stock: 0, imagen_url: '' })}
                    className="flex-[2] sm:flex-none bg-brand-gold text-brand-brown px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Nueva Delicia
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-[2rem] border border-brand-brown/5 group hover:border-brand-gold/40 transition-all shadow-sm flex flex-col">
                    <div className="relative h-32 mb-4 overflow-hidden rounded-2xl bg-brand-cream">
                      <img src={p.imagen_url} className="w-full h-full object-cover" alt={p.nombre} />
                      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${p.stock < 10 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                        STOCK: {p.stock}
                      </div>
                    </div>
                    <h4 className="font-black text-brand-brown text-base tracking-tight mb-1 truncate">{p.nombre}</h4>
                    <p className="text-brand-gold font-black text-lg mb-4">${p.precio.toLocaleString('es-CL')}</p>
                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={() => setEditingProduct(p)} 
                        className="flex-1 py-2.5 bg-brand-cream text-brand-brown rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-brand-brown hover:text-brand-gold transition-all"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setProductToDelete(p.id); }} 
                        className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'historial' && (
            <div className="max-w-3xl mx-auto space-y-3 pb-12">
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-base font-black text-brand-brown uppercase tracking-tight flex items-center gap-2"><History className="text-brand-gold" size={16} /> Registro de Ventas</h3>
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">{finishedOrders.length} Éxitos</span>
              </div>
              
              {finishedOrders.length === 0 ? (
                <div className="py-20 text-center opacity-20"><History size={40} className="mx-auto" /></div>
              ) : (
                finishedOrders.map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-[1.5rem] border border-brand-brown/5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-row items-center gap-4">
                      <div className="bg-green-50 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-black text-brand-brown text-sm truncate">{order.cliente?.nombre || 'Cliente'}</h4>
                          <span className="text-[7px] font-black text-stone-300 uppercase px-1.5 py-0.5 bg-stone-50 rounded-md shrink-0">#{order.id.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[8px] text-stone-400 font-bold uppercase tracking-widest">
                          <span>📅 {new Date(order.date).toLocaleDateString()}</span>
                          <span className="text-green-600">ENTREGADO</span>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <span className="text-lg font-black text-brand-brown tracking-tighter">${order.total.toLocaleString('es-CL')}</span>
                        <button onClick={() => handleStatusChange(order.id, 'Confirmado')} className="p-2 text-stone-200 hover:text-brand-brown transition-colors"><History size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: FORMULARIO PRODUCTO */}
      {editingProduct && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-brown/95 backdrop-blur-md" onClick={() => setEditingProduct(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-6 md:p-8 animate-in zoom-in duration-300 border border-white/20 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-black text-brand-brown uppercase tracking-tight mb-6">{editingProduct.id ? 'Refinar Galleta' : 'Nueva Creación'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[8px] font-black uppercase text-stone-400 mb-1 block px-1">Nombre</label>
                  <input required className="w-full px-4 py-3 rounded-xl bg-brand-cream border-none font-bold text-brand-brown outline-none text-sm" value={editingProduct.nombre} onChange={e => setEditingProduct({...editingProduct, nombre: e.target.value})} />
                </div>
                <div><label className="text-[8px] font-black uppercase text-stone-400 mb-1 block px-1">Precio ($)</label><input required type="number" className="w-full px-4 py-3 rounded-xl bg-brand-cream border-none font-black text-brand-brown outline-none text-sm" value={editingProduct.precio} onChange={e => setEditingProduct({...editingProduct, precio: parseInt(e.target.value) || 0})} /></div>
                <div><label className="text-[8px] font-black uppercase text-stone-400 mb-1 block px-1">Stock</label><input required type="number" className="w-full px-4 py-3 rounded-xl bg-brand-cream border-none font-black text-brand-brown outline-none text-sm" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})} /></div>
                <div className="col-span-2"><label className="text-[8px] font-black uppercase text-stone-400 mb-1 block px-1">Descripción</label><textarea required className="w-full px-4 py-3 rounded-xl bg-brand-cream border-none h-16 resize-none font-medium italic text-brand-brown text-xs" value={editingProduct.descripcion} onChange={e => setEditingProduct({...editingProduct, descripcion: e.target.value})} /></div>
                <div className="col-span-2">
                  <label className="text-[8px] font-black uppercase text-stone-400 mb-1 block px-1">Imagen URL (Drive ok)</label>
                  <input required className="w-full px-4 py-3 rounded-xl bg-brand-cream border-none text-[9px] font-mono text-brand-brown/60" value={editingProduct.imagen_url} onChange={e => setEditingProduct({...editingProduct, imagen_url: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 py-3.5 font-bold text-stone-300 uppercase tracking-widest text-[8px]">Cancelar</button>
                <button type="submit" className="flex-[2] bg-brand-brown text-brand-gold py-3.5 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] shadow-lg flex items-center justify-center gap-2"><Save size={14} /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMACIÓN ELIMINAR INDIVIDUAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-brown/95 backdrop-blur-md" onClick={() => setProductToDelete(null)} />
          <div className="relative bg-white w-full max-w-xs rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner"><AlertTriangle size={28} /></div>
            <h3 className="text-xl font-black text-brand-brown uppercase tracking-tighter mb-2">¿Quitar Galleta?</h3>
            <p className="text-stone-500 text-[10px] mb-6 leading-relaxed font-medium italic">Esta acción no se puede deshacer.</p>
            <div className="space-y-2">
              <button onClick={executeDelete} className="w-full bg-red-500 text-white py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md">Sí, Eliminar</button>
              <button onClick={() => setProductToDelete(null)} className="w-full py-2.5 text-stone-300 font-bold text-[8px] uppercase tracking-widest">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMACIÓN BORRAR TODO */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-brown/95 backdrop-blur-md" onClick={() => setShowClearAllConfirm(false)} />
          <div className="relative bg-white w-full max-w-xs rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"><RotateCcw size={28} /></div>
            <h3 className="text-xl font-black text-brand-brown uppercase tracking-tighter mb-2">¿Vaciar Vitrina?</h3>
            <p className="text-stone-500 text-[10px] mb-6 leading-relaxed font-medium italic">Eliminarás todas las galletas del catálogo actual.</p>
            <div className="space-y-2">
              <button onClick={handleClearAll} className="w-full bg-red-600 text-white py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg">Sí, Borrar Todo</button>
              <button onClick={() => setShowClearAllConfirm(false)} className="w-full py-2.5 text-stone-300 font-bold text-[8px] uppercase tracking-widest">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMACIÓN ENTREGA */}
      {confirmDeliveryOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-brown/95 backdrop-blur-md" onClick={() => setConfirmDeliveryOrder(null)} />
          <div className="relative bg-white w-full max-w-xs rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-green-50 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Truck size={28} /></div>
            <h3 className="text-xl font-black text-brand-brown uppercase tracking-tighter mb-2">¿Entregado?</h3>
            <div className="space-y-2">
              <button onClick={confirmDelivery} className="w-full bg-brand-brown text-brand-gold py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md">Confirmar</button>
              <button onClick={() => setConfirmDeliveryOrder(null)} className="w-full py-2.5 text-stone-300 font-bold text-[8px] uppercase tracking-widest">Volver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
