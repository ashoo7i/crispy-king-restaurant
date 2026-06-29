import React, { useState, useEffect } from 'react';
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
  const [logoClickCount, setLogoClickCount] = useState(0);

  useEffect(() => {
    if (logoClickCount > 0) {
      const timer = setTimeout(() => {
        setLogoClickCount(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [logoClickCount]);

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        onNavigate('admin');
        return 0;
      }
      return next;
    });
    onNavigate('home');
  };

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
    <header className="sticky top-0 z-40 w-full bg-gray-950/95 backdrop-blur-md border-b border-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand/Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
          <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full object-cover border border-gray-800" />
          <span className="font-display font-black text-2xl tracking-tight text-white">
            Ashoo<span className="text-red-600">spy</span>
          </span>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 font-sans font-medium text-gray-300">
          <button 
            onClick={() => onNavigate('home')} 
            className={`hover:text-white transition-colors ${activePage === 'home' ? 'text-red-500 font-bold' : ''}`}
          >
            الرئيسية
          </button>
          <button 
            onClick={() => onNavigate('menu')} 
            className={`hover:text-white transition-colors ${activePage === 'menu' ? 'text-red-500 font-bold' : ''}`}
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
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-gray-200 hover:bg-gray-800 hover:text-white rounded-full font-bold text-xs transition-colors"
          >
            <ClipboardList className="w-4 h-4 text-red-500" />
            <span>طلباتي</span>
          </button>
          
          {/* Shopping Cart Button */}
          <button 
            onClick={onCartToggle} 
            className="relative p-2.5 bg-gray-900 rounded-full text-gray-200 hover:bg-gray-800 hover:text-white transition-colors duration-200"
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-gray-900 w-full max-w-lg p-6 rounded-3xl border border-gray-800 shadow-2xl space-y-4 text-right flex flex-col max-h-[80vh] text-white" dir="rtl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                📋 قائمة طلباتك النشطة والسابقة
              </h3>
              <button 
                onClick={() => setIsOrdersModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-800 transition-colors"
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
                    className="text-red-500 text-xs font-bold hover:underline"
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
                    PENDING: 'bg-yellow-950/40 text-yellow-500 border-yellow-900/50',
                    PREPARING: 'bg-orange-950/40 text-orange-500 border-orange-900/50',
                    OUT_FOR_DELIVERY: 'bg-blue-950/40 text-blue-500 border-blue-900/50',
                    COMPLETED: 'bg-green-950/40 text-green-500 border-green-900/50'
                  };

                  return (
                    <div 
                      key={order.id} 
                      className="p-4 bg-gray-950/50 rounded-2xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-red-950/5 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-white text-sm">{order.id}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusColors[order.status] || ''}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold">
                          المبلغ: <span className="text-red-500">{order.totalPrice} ريال يمني</span>
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
                        className="w-full sm:w-auto flex items-center justify-center gap-1 bg-gray-950 hover:bg-red-600 hover:text-white border border-gray-800 hover:border-red-600 text-gray-300 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
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
