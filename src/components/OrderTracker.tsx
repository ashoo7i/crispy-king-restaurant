import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { CheckCircle2, Clock, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { playPreparingChime, playDeliveryChime, playCompletedChime } from '../utils/audio';

interface OrderTrackerProps {
  orderId: string;
  onBackToMenu: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId, onBackToMenu }) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [prevStatus, setPrevStatus] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
      if (!res.ok) throw new Error('Not found on server');
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.warn('Backend offline or order not found on server, searching locally:', err);
      const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
      const found = localOrders.find((o: any) => o.id === orderId);
      if (found) {
        setOrder(found);
      } else {
        console.error('Order not found locally either.');
      }
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 4000); // Live update every 4 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (order) {
      if (prevStatus && order.status !== prevStatus) {
        if (order.status === 'PREPARING') {
          playPreparingChime();
        } else if (order.status === 'OUT_FOR_DELIVERY') {
          playDeliveryChime();
        } else if (order.status === 'COMPLETED') {
          playCompletedChime();
        }

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          let bodyText = '';
          if (order.status === 'PREPARING') bodyText = 'بدأنا في تحضير طلبك بشغف 🍳';
          else if (order.status === 'OUT_FOR_DELIVERY') bodyText = 'المندوب في طريقه إليك الآن 🛵';
          else if (order.status === 'COMPLETED') bodyText = 'تم تسليم طلبك بالهناء والشفاء! شكراً لك ❤️';
          
          if (bodyText) {
            new Notification('🔔 تحديث حالة طلبك!', {
              body: bodyText,
              icon: '/logo.png'
            });
          }
        }
      }
      setPrevStatus(order.status);
    }
  }, [order?.status, prevStatus]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-4">
        <p className="text-red-600 font-bold text-lg">لم يتم العثور على هذا الطلب!</p>
        <button onClick={onBackToMenu} className="bg-red-600 text-white font-bold px-6 py-2 rounded-full shadow-md hover:bg-red-700">
          العودة لقائمة الطعام
        </button>
      </div>
    );
  }

  const statuses = [
    { key: 'PENDING', label: 'تم استلام طلبك وبانتظار المراجعة', icon: Clock },
    { key: 'PREPARING', label: 'جاري تحضير الوجبة بشغف وعناية', icon: ShieldCheck },
    { key: 'OUT_FOR_DELIVERY', label: 'المندوب في طريقه إليك الآن', icon: Truck },
    { key: 'COMPLETED', label: 'تم تسليم الطلب بالهناء والعافية', icon: CheckCircle2 }
  ];

  const currentIdx = statuses.findIndex(s => s.key === order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-300">
      {/* Tracker Banner */}
      <div className="bg-gray-900 p-6 rounded-3xl shadow-xs border border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-white">
        <div className="text-center sm:text-right">
          <h2 className="text-2xl font-black text-white">رقم تتبع طلبك: <span className="text-red-500 font-display">{order.id}</span></h2>
          <p className="text-sm text-gray-400 mt-1">العميل: {order.customerName} - {order.customerPhone}</p>
        </div>
        <button 
          onClick={fetchOrder} 
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-800 hover:border-gray-700 text-gray-350 rounded-full font-bold text-xs bg-gray-950 hover:bg-gray-900 transition-all shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> تحديث الحالة يدوياً
        </button>
      </div>

      {order.status === 'COMPLETED' && (
        <div className="bg-gradient-to-r from-red-900/40 via-red-950/20 to-red-900/40 p-8 rounded-3xl border border-red-800/40 text-center space-y-3">
          <span className="text-4xl block">🍗❤️</span>
          <h3 className="text-xl font-black text-white">شكراً لطلبك من Ashoospy!</h3>
          <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed">
            نأمل أن تكون وجبتك مقرمشة ولذيذة وتصنع يومك. نحن فخورون بخدمتك ونتطلع لطلبك القادم!
          </p>
        </div>
      )}

      {/* Visual Timeline component */}
      <div className="bg-gray-900 p-8 rounded-3xl shadow-xs border border-gray-800 space-y-8">
        {statuses.map((step, idx) => {
          const IconComp = step.icon;
          const isCompleted = idx <= currentIdx;
          const isActive = idx === currentIdx;

          return (
            <div key={step.key} className="relative flex items-start gap-6">
              {/* Connector line */}
              {idx < statuses.length - 1 && (
                <div className={`absolute top-10 right-5 -mr-0.5 w-1 h-14 bg-gray-800 transition-all duration-300 ${
                  idx < currentIdx ? 'bg-red-600' : ''
                }`} />
              )}

              {/* Status Circle */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-xs shrink-0 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-red-600 border-red-600 text-white shadow-md' 
                  : 'bg-gray-900 border-gray-800 text-gray-400'
              } ${isActive ? 'ring-4 ring-red-950/30 scale-110' : ''}`}>
                <IconComp className="w-5 h-5" />
              </div>

              {/* Description texts */}
              <div>
                <h3 className={`font-bold transition-all duration-300 ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                  {step.key === 'PENDING' ? 'تم استلام الطلب' : step.key === 'PREPARING' ? 'تحضير الطلب' : step.key === 'OUT_FOR_DELIVERY' ? 'توصيل الطلب' : 'تم الاكتمال'}
                </h3>
                <p className={`text-sm mt-0.5 transition-all duration-300 ${isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>{step.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <button 
          onClick={onBackToMenu}
          className="bg-gray-800 text-white font-bold px-8 py-3.5 rounded-full hover:bg-gray-700 transition-all text-sm shadow-md border border-gray-700"
        >
          الرجوع للمنيو لطلب وجبة أخرى
        </button>
      </div>
    </div>
  );
};
