import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, DollarSign, Eye, RefreshCw } from 'lucide-react';

interface AdminDashboardProps {
  onBackToMenu: () => void;
}

const MOCK_ORDERS = [
  {
    id: 'CR-7842',
    customerName: 'المهندس أشرف قُصيلة',
    customerPhone: '777xxxxxx',
    deliveryType: 'DELIVERY',
    address: 'صنعاء، شارع حدة، عمارة الأمل الدور الثالث',
    status: 'PENDING',
    totalPrice: 4300,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago
    items: [
      {
        id: 'oi-1',
        quantity: 1,
        price: 3500,
        customizations: JSON.stringify([{ name: 'حجم كبير (مع بطاطس ومشروب ضخم)' }, { name: 'جبنة شيدر إضافية' }]),
        menuItem: { name: 'تويستر كينج الحار' }
      }
    ]
  },
  {
    id: 'CR-1948',
    customerName: 'أحمد علي',
    customerPhone: '733xxxxxx',
    deliveryType: 'PICKUP',
    address: 'استلام من الفرع الرئيسي',
    status: 'PREPARING',
    totalPrice: 12500,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    items: [
      {
        id: 'oi-2',
        quantity: 1,
        price: 12000,
        customizations: JSON.stringify([{ name: 'دجاج حار' }, { name: 'إضافة صوص الثوم' }]),
        menuItem: { name: 'دلو التوفير المقرمش (8 قطع)' }
      }
    ]
  },
  {
    id: 'CR-9042',
    customerName: 'محمد حسين',
    customerPhone: '711xxxxxx',
    deliveryType: 'DELIVERY',
    address: 'عدن، كريتر، بجانب البريد العام',
    status: 'COMPLETED',
    totalPrice: 5500,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    items: [
      {
        id: 'oi-3',
        quantity: 1,
        price: 4000,
        customizations: JSON.stringify([{ name: 'شريحة لحم إضافية' }]),
        menuItem: { name: 'برجر رويال لحم' }
      },
      {
        id: 'oi-4',
        quantity: 1,
        price: 1500,
        customizations: JSON.stringify([]),
        menuItem: { name: 'بطاطس مقرمشة ذهبية' }
      }
    ]
  }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToMenu }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.warn('Backend server offline, using local admin mockup data:', err);
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status on server:', err);
      // Offline local update fallback
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 6000); // Live poll every 6 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Stats calculation
  const totalRevenue = orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.totalPrice, 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'COMPLETED').length;
  const completedOrdersCount = orders.filter(o => o.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-gray-900">لوحة تحكم كرسبي كينج 👑</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة ومراقبة الطلبات الحية وتحديث حالة التسليم للعملاء</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchOrders} 
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-full font-bold text-xs bg-white shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> تحديث البيانات
          </button>
          <button 
            onClick={onBackToMenu}
            className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-red-700 transition-all text-xs shadow-md"
          >
            العودة لواجهة المنيو
          </button>
        </div>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-5">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{totalRevenue} ريال</div>
            <div className="text-xs text-gray-400 font-bold mt-1">إجمالي المبيعات المكتملة</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-5">
          <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{activeOrdersCount} طلبات</div>
            <div className="text-xs text-gray-400 font-bold mt-1">الطلبات النشطة حالياً</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-5">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{completedOrdersCount} طلبات</div>
            <div className="text-xs text-gray-400 font-bold mt-1">الطلبات المسلمة بالكامل</div>
          </div>
        </div>
      </div>

      {/* Orders details grid splitting layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Orders list table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-lg">الطلبات الواردة ({orders.length})</h3>
          </div>

          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto pr-1">
            {orders.length === 0 ? (
              <p className="text-center py-12 text-gray-400 font-bold">لا يوجد أي طلبات واردة بعد</p>
            ) : (
              orders.map(order => {
                const statusLabels: Record<string, string> = {
                  PENDING: 'بانتظار التحضير',
                  PREPARING: 'جاري التحضير',
                  OUT_FOR_DELIVERY: 'خرج للتوصيل',
                  COMPLETED: 'تم التوصيل'
                };
                const statusColors: Record<string, string> = {
                  PENDING: 'bg-yellow-50 text-yellow-600 border-yellow-200',
                  PREPARING: 'bg-orange-50 text-orange-600 border-orange-200',
                  OUT_FOR_DELIVERY: 'bg-blue-50 text-blue-600 border-blue-200',
                  COMPLETED: 'bg-green-50 text-green-600 border-green-200'
                };

                return (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className={`p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-red-50/10 transition-colors ${
                      selectedOrder?.id === order.id ? 'bg-red-50/20' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-display font-black text-gray-900 text-base">{order.id}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusColors[order.status] || ''}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-bold mt-2">
                        العميل: {order.customerName} - {order.customerPhone}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1 max-w-sm truncate">
                        العنوان: {order.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:text-left self-end sm:self-auto">
                      <div className="text-right sm:text-left">
                        <div className="font-black text-red-600">{order.totalPrice} ريال</div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Order Details and controls */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs h-fit space-y-6">
          <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3 mb-4">تفاصيل الطلب المحدد</h3>
          
          {selectedOrder ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Order Info */}
              <div className="text-sm space-y-2.5">
                <div><span className="text-gray-400 font-bold">معرف الطلب:</span> <span className="font-display font-black text-gray-800">{selectedOrder.id}</span></div>
                <div><span className="text-gray-400 font-bold">العميل:</span> <span className="font-bold text-gray-800">{selectedOrder.customerName}</span></div>
                <div><span className="text-gray-400 font-bold">الجوال:</span> <span className="font-bold text-gray-800">{selectedOrder.customerPhone}</span></div>
                <div><span className="text-gray-400 font-bold">نوع الاستلام:</span> <span className="font-bold text-red-600">{selectedOrder.deliveryType === 'DELIVERY' ? '🚀 توصيل' : '🏪 استلام'}</span></div>
                <div><span className="text-gray-400 font-bold">العنوان:</span> <p className="font-bold text-gray-700 text-xs mt-1 bg-gray-50 p-2.5 rounded-lg leading-relaxed">{selectedOrder.address}</p></div>
              </div>

              {/* Items List */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <span className="text-xs text-gray-400 font-black block">الوجبات المطلوبة:</span>
                {selectedOrder.items.map((item: any) => {
                  const customizations = JSON.parse(item.customizations || '[]');
                  return (
                    <div key={item.id} className="text-xs flex justify-between items-start border-b border-gray-50 pb-2.5">
                      <div>
                        <div className="font-bold text-gray-900">{item.menuItem.name} <span className="text-red-500 font-normal">x{item.quantity}</span></div>
                        {customizations.length > 0 && (
                          <div className="text-[10px] text-gray-400 mt-1 flex flex-wrap gap-1">
                            {customizations.map((c: any, i: number) => (
                              <span key={i} className="bg-gray-100 px-1.5 py-0.5 rounded-md font-bold">{c.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-gray-800">{item.price * item.quantity} ريال</span>
                    </div>
                  );
                })}
              </div>

              {/* Status Update Controls */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <span className="text-xs text-gray-400 font-black block">تغيير حالة الطلب الحية:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'PENDING')} 
                    className={`p-2.5 rounded-xl border font-bold transition-all ${
                      selectedOrder.status === 'PENDING' 
                        ? 'bg-yellow-500 text-white border-yellow-500' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    قيد الانتظار
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'PREPARING')} 
                    className={`p-2.5 rounded-xl border font-bold transition-all ${
                      selectedOrder.status === 'PREPARING' 
                        ? 'bg-orange-500 text-white border-orange-500' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    بدء التحضير
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'OUT_FOR_DELIVERY')} 
                    className={`p-2.5 rounded-xl border font-bold transition-all ${
                      selectedOrder.status === 'OUT_FOR_DELIVERY' 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    خروج للتوصيل
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'COMPLETED')} 
                    className={`p-2.5 rounded-xl border font-bold transition-all ${
                      selectedOrder.status === 'COMPLETED' 
                        ? 'bg-green-500 text-white border-green-500' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    تم التسليم
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center py-20 text-gray-400 text-xs font-bold">حدد أحد الطلبات من القائمة لمشاهدة تفاصيله والتحكم به.</p>
          )}
        </div>
      </div>
    </div>
  );
};
