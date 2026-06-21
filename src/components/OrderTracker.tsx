import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Truck, ShieldCheck, RefreshCw } from 'lucide-react';

interface OrderTrackerProps {
  orderId: string;
  onBackToMenu: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId, onBackToMenu }) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/orders/${orderId}`);
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error('Failed to load tracking order:', err);
    } finally {
      setLoading(false);
    }
  };

  const advanceStatus = async (nextStatus: string) => {
    try {
      await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchOrder();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 4000); // Live update every 4 seconds
    return () => clearInterval(interval);
  }, [orderId]);

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
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-right">
          <h2 className="text-2xl font-black text-gray-900">رقم تتبع طلبك: <span className="text-red-600 font-display">{order.id}</span></h2>
          <p className="text-sm text-gray-500 mt-1">العميل: {order.customerName} - {order.customerPhone}</p>
        </div>
        <button 
          onClick={fetchOrder} 
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-full font-bold text-xs bg-gray-50 hover:bg-gray-100 transition-all shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> تحديث الحالة يدوياً
        </button>
      </div>

      {/* Visual Timeline component */}
      <div className="bg-white p-8 rounded-3xl shadow-xs border border-gray-100 space-y-8">
        {statuses.map((step, idx) => {
          const IconComp = step.icon;
          const isCompleted = idx <= currentIdx;
          const isActive = idx === currentIdx;

          return (
            <div key={step.key} className="relative flex items-start gap-6">
              {/* Connector line */}
              {idx < statuses.length - 1 && (
                <div className={`absolute top-10 right-5 -mr-0.5 w-1 h-14 bg-gray-100 transition-all duration-300 ${
                  idx < currentIdx ? 'bg-red-600' : ''
                }`} />
              )}

              {/* Status Circle */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-xs shrink-0 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-red-600 border-red-600 text-white shadow-md' 
                  : 'bg-white border-gray-200 text-gray-400'
              } ${isActive ? 'ring-4 ring-red-100 scale-110' : ''}`}>
                <IconComp className="w-5 h-5" />
              </div>

              {/* Description texts */}
              <div>
                <h3 className={`font-bold transition-all duration-300 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.key === 'PENDING' ? 'تم استلام الطلب' : step.key === 'PREPARING' ? 'تحضير الطلب' : step.key === 'OUT_FOR_DELIVERY' ? 'توصيل الطلب' : 'تم الاكتمال'}
                </h3>
                <p className={`text-sm mt-0.5 transition-all duration-300 ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>{step.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secret Admin panel simulation simulator */}
      <div className="bg-red-50 p-6 rounded-3xl border border-red-100/70 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚙️</span>
          <h4 className="font-bold text-red-950 text-sm">لوحة محاكاة الإدارة (اضغط على الحالات لاختبار تفاعل العميل المباشر)</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => advanceStatus('PENDING')} className="px-4 py-2.5 bg-white text-gray-700 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all shadow-xs">قيد الانتظار</button>
          <button onClick={() => advanceStatus('PREPARING')} className="px-4 py-2.5 bg-white text-gray-700 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all shadow-xs">بدء التحضير</button>
          <button onClick={() => advanceStatus('OUT_FOR_DELIVERY')} className="px-4 py-2.5 bg-white text-gray-700 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all shadow-xs">خروج للتوصيل</button>
          <button onClick={() => advanceStatus('COMPLETED')} className="px-4 py-2.5 bg-white text-gray-700 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all shadow-xs">تم التوصيل</button>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={onBackToMenu}
          className="bg-gray-900 text-white font-bold px-8 py-3.5 rounded-full hover:bg-gray-800 transition-all text-sm shadow-md"
        >
          الرجوع للمنيو لطلب وجبة أخرى
        </button>
      </div>
    </div>
  );
};
