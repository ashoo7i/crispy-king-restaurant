import React, { useState } from 'react';
import { ShoppingBag, ClipboardList, X, ArrowLeft, Clock } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onCartToggle: () => void;
  onNavigate: (page: string) => void;
  activePage: string;
  onTrackOrder: (orderId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  onCartToggle, 
  onNavigate, 
  activePage, 
  onTrackOrder 
}) => {
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [myOrders, setMyOrders] = useState<any[]>([]);

  // Open modal and load orders from localStorage
  const handleOpenOrdersModal = () => {
    try {
      const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
      setMyOrders(localOrders);
    } catch (e) {
      console.error('Failed to load local orders:', e);
      setMyOrders([]);
    }
    setIsOrdersModalOpen(true);
  };

  const handleTrackSingleOrder = (orderId: string) => {
    setIsOrdersModalOpen(false);
    onTrackOrder(orderId);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand/Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
          <span className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-extrabold text-2xl shadow-md border-2 border-white ring-2 ring-red-600">
            C
          </span>
          <span className="font-display font-black text-2xl tracking-tight text-gray-900">
            كرسبي<span className="text-red-600">كينج</span>
          </span>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 font-sans font-medium text-gray-700">
          <button 
            onClick={() => onNavigate('home')} 
            className={`hover:text-red-600 transition-colors ${activePage === 'home' ? 'text-red-600 font-bold' : ''}`}
          >
            الرئيسية
          </button>
          <button 
            onClick={() => onNavigate('menu')} 
            className={`hover:text-red-600 transition-colors ${activePage === 'menu' ? 'text-red-600 font-bold' : ''}`}
          >
            قائمة الطعام
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => onNavigate('menu')} 
            className="hidden sm:block bg-red-600 text-white font-sans font-bold px-6 py-2.5 rounded-full hover:bg-red-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm animate-pulse"
          >
            اطلب الآن
          </button>

          {/* My Orders Button */}
          <button 
            onClick={handleOpenOrdersModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-full font-bold text-xs transition-colors"
          >
            <ClipboardList className="w-4 h-4 text-red-600" />
            <span>طلباتي</span>
          </button>
          
          {/* Shopping Cart Button */}
          <button 
            onClick={onCartToggle} 
            className="relative p-2.5 bg-gray-50 rounded-full text-gray-800 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* My Orders Modal */}
      {isOrdersModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg p-6 rounded-3xl border border-gray-100 shadow-2xl space-y-4 text-right flex flex-col max-h-[80vh]" dir="rtl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                📋 قائمة طلباتك النشطة والسابقة
              </h3>
              <button 
                onClick={() => setIsOrdersModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Orders List) */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {myOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-bold space-y-2">
                  <span className="text-4xl block">🍗</span>
                  <p className="text-sm">لم تقم بطلب أي وجبة بعد.</p>
                  <button 
                    onClick={() => {
                      setIsOrdersModalOpen(false);
                      onNavigate('menu');
                    }}
                    className="text-red-600 text-xs font-bold hover:underline"
                  >
                    ابدأ تصفح المنيو الآن
                  </button>
                </div>
              ) : (
                myOrders.map((order) => {
                  const statusLabels: Record<string, string> = {
                    PENDING: 'بانتظار التحضير',
                    PREPARING: 'جاري التحضير',
                    OUT_FOR_DELIVERY: 'خرج للتوصيل',
                    COMPLETED: 'تم التسليم'
                  };
                  const statusColors: Record<string, string> = {
                    PENDING: 'bg-yellow-50 text-yellow-600 border-yellow-100',
                    PREPARING: 'bg-orange-50 text-orange-600 border-orange-100',
                    OUT_FOR_DELIVERY: 'bg-blue-50 text-blue-600 border-blue-100',
                    COMPLETED: 'bg-green-50 text-green-600 border-green-100'
                  };

                  return (
                    <div 
                      key={order.id} 
                      className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-red-50/5 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-gray-900 text-sm">{order.id}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusColors[order.status] || ''}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold">
                          المبلغ: <span className="text-red-600">{order.totalPrice} ريال يمني</span>
                        </p>
                        <p className="text-[9px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString('ar-YE', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>

                      <button 
                        onClick={() => handleTrackSingleOrder(order.id)}
                        className="w-full sm:w-auto flex items-center justify-center gap-1 bg-white hover:bg-red-600 hover:text-white border border-gray-200 hover:border-red-600 text-gray-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                      >
                        <span>تتبع حالة الطلب</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
