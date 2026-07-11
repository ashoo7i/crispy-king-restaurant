import React from 'react';
import type { CartItem } from '../types';
import { X, Plus, Minus, Trash2 } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, onUpdateQuantity, onCheckout }) => {
  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark backdrop overlay */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300" onClick={onClose} />
      
      {/* Sliding Drawer Container */}
      <div className="absolute inset-y-0 left-0 max-w-full flex pr-10">
        <div className="w-screen max-w-md bg-gray-900 text-white border-r border-gray-850 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">سلة طلباتك ({cart.length})</h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of items in the cart */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-24 space-y-4">
                <span className="text-6xl block">🛒</span>
                <p className="text-gray-400 font-bold">سلة المشتريات فارغة حالياً</p>
                <button 
                  onClick={onClose} 
                  className="text-red-500 text-sm font-bold hover:underline"
                >
                  العودة لتصفح المنيو
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex gap-4 border-b border-gray-800 pb-5">
                  <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover shadow-xs border border-gray-800" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      {item.customizations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.customizations.map(c => (
                            <span key={c.id} className="text-[10px] bg-red-950/20 text-red-500 px-2.5 py-0.5 rounded-full font-bold border border-red-900/45">
                              {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-bold text-red-500 text-sm">{item.price * item.quantity} ريال يمني</span>
                      
                      {/* Increment/Decrement controls */}
                      <div className="flex items-center gap-3 bg-gray-950 px-3 py-1.5 rounded-full border border-gray-850 shadow-inner">
                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-0.5 text-gray-400 hover:text-red-500 transition-colors">
                          {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
                        </button>
                        <span className="font-black text-gray-200 text-xs w-4 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-0.5 text-gray-400 hover:text-red-500 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer block */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-800 bg-gray-950/70 space-y-4">
              <div className="flex justify-between items-center font-bold text-white">
                <span>المجموع الفرعي للطلب:</span>
                <span className="text-2xl text-red-500">{total} ريال يمني</span>
              </div>
              <button 
                onClick={onCheckout}
                className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl hover:bg-red-700 shadow-md hover:shadow-lg transition-all text-center block text-sm tracking-wide"
              >
                الذهاب للدفع وإتمام الطلب
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
