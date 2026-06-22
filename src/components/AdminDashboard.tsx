import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { Clock, CheckCircle2, DollarSign, Eye, RefreshCw, Lock, ShieldAlert, KeyRound, LogOut, Bell, Volume2 } from 'lucide-react';
import { playNewOrderAlert } from '../utils/audio';

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
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    items: [
      {
        id: 'oi-2',
        quantity: 1,
        price: 12000,
        customizations: JSON.stringify([{ name: 'دجاج حار' }, { name: 'إضافة صوص الثوم' }]),
        menuItem: { name: 'دلو التوفير المقرمش (8 قطع)' }
      }
    ]
  }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToMenu }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [shake, setShake] = useState(false);
  
  // Change password modal state
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Notification states
  const [newOrderToast, setNewOrderToast] = useState<any | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    // Check session storage for existing auth
    const auth = sessionStorage.getItem('admin_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      const data = await res.json();
      
      // Check for new orders to trigger sound/notifications
      if (orders.length > 0) {
        const currentIds = new Set(orders.map(o => o.id));
        const newOrders = data.filter((o: any) => !currentIds.has(o.id));
        
        if (newOrders.length > 0) {
          playNewOrderAlert(); // Play double ping sound
          
          // Trigger browser native push notification
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('👑 طلب جديد وارد!', {
              body: `العميل: ${newOrders[0].customerName}\nالمجموع: ${newOrders[0].totalPrice} ريال`,
              tag: newOrders[0].id
            });
          }
          
          // Trigger custom slide-in UI toast
          setNewOrderToast(newOrders[0]);
          setTimeout(() => setNewOrderToast(null), 6000);
        }
      }
      
      setOrders(data);
    } catch (err) {
      console.warn('Backend server offline, loading local localStorage orders:', err);
      const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
      const activeLocal = localOrders.length > 0 ? localOrders : MOCK_ORDERS;
      
      // Also diff for offline local orders
      if (orders.length > 0) {
        const currentIds = new Set(orders.map(o => o.id));
        const newOrders = activeLocal.filter((o: any) => !currentIds.has(o.id));
        
        if (newOrders.length > 0) {
          playNewOrderAlert();
          
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('👑 طلب جديد وارد (محلي)!', {
              body: `العميل: ${newOrders[0].customerName}\nالمجموع: ${newOrders[0].totalPrice} ريال`,
              tag: newOrders[0].id
            });
          }
          
          setNewOrderToast(newOrders[0]);
          setTimeout(() => setNewOrderToast(null), 6000);
        }
      }
      
      setOrders(localOrders.length > 0 ? localOrders : MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 6000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Handle authentication login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
      } else {
        throw new Error(data.error || 'رمز الدخول غير صحيح');
      }
    } catch (err: any) {
      // Fallback to local storage passcode check
      const localPasscode = localStorage.getItem('admin_passcode') || 'admin123';
      if (passcode === localPasscode) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
      } else {
        setLoginError('رمز المرور المدخل غير صحيح!');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (newPass !== confirmPass) {
      setModalError('كلمات المرور الجديدة غير متطابقة!');
      return;
    }
    if (newPass.length < 4) {
      setModalError('يجب أن تكون كلمة المرور مكونة من 4 رموز على الأقل!');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPasscode: currentPass, newPasscode: newPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('admin_passcode', newPass); // local sync
        setModalSuccess('تم تغيير كلمة المرور بنجاح!');
        setTimeout(() => {
          setIsChangeModalOpen(false);
          setCurrentPass('');
          setNewPass('');
          setConfirmPass('');
          setModalSuccess('');
        }, 1500);
      } else {
        throw new Error(data.error || 'فشل التغيير');
      }
    } catch (err) {
      // Fallback update in local storage
      const localPass = localStorage.getItem('admin_passcode') || 'admin123';
      if (currentPass === localPass) {
        localStorage.setItem('admin_passcode', newPass);
        setModalSuccess('تم تغيير كلمة المرور محلياً بنجاح!');
        setTimeout(() => {
          setIsChangeModalOpen(false);
          setCurrentPass('');
          setNewPass('');
          setConfirmPass('');
          setModalSuccess('');
        }, 1500);
      } else {
        setModalError('كلمة المرور الحالية غير صحيحة!');
      }
    }
  };

  // Logout function
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.warn('Failed to update status on server, updating locally:', err);
      
      const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
      const updated = localOrders.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o);
      localStorage.setItem('local_orders', JSON.stringify(updated));
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    }
  };

  // Render Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className={`w-full max-w-md bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-xl text-center space-y-6 text-white ${shake ? 'animate-bounce' : ''}`}>
          <div className="w-16 h-16 bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto border-2 border-red-900/40 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">شاشة التحقق والأمان 🔐</h2>
            <p className="text-xs text-gray-400 font-bold mt-1.5">الوصول إلى لوحة إدارة الطلبات محمي بكلمة مرور</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password"
                placeholder="أدخل كلمة المرور (الافتراضية: admin123)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full text-center px-4 py-3 rounded-2xl border border-gray-850 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-sm"
                required
              />
            </div>

            {loginError && (
              <div className="text-xs text-red-500 bg-red-950/20 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-red-900/50">
                <ShieldAlert className="w-3.5 h-3.5" /> {loginError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={onBackToMenu}
                className="w-1/2 border border-gray-800 text-gray-400 py-3 rounded-2xl hover:bg-gray-800 font-bold text-xs transition-colors bg-gray-950"
              >
                العودة للمنيو
              </button>
              <button 
                type="submit"
                className="w-1/2 bg-red-600 text-white py-3 rounded-2xl hover:bg-red-700 font-bold text-xs transition-all shadow-md shadow-red-950"
              >
                تأكيد الدخول
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalRevenue = orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.totalPrice, 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'COMPLETED').length;
  const completedOrdersCount = orders.filter(o => o.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300 text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6 border-b border-gray-800">
        <div>
          <h2 className="text-3xl font-black text-white">لوحة تحكم كرسبي كينج 👑</h2>
          <p className="text-sm text-gray-400 mt-1">إدارة ومراقبة الطلبات الحية وتحديث حالة التسليم للعملاء</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {typeof Notification !== 'undefined' && notificationPermission !== 'granted' && (
            <button 
              onClick={async () => {
                const res = await Notification.requestPermission();
                setNotificationPermission(res);
              }}
              className="flex items-center gap-2 px-4 py-2.5 border border-yellow-800/80 hover:border-yellow-700 text-yellow-500 rounded-full font-bold text-xs bg-yellow-950/20 shadow-xs transition-colors"
            >
              <Bell className="w-3.5 h-3.5" /> تفعيل الإشعارات 🔔
            </button>
          )}
          <button 
            onClick={fetchOrders} 
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-800 hover:border-gray-700 text-gray-300 rounded-full font-bold text-xs bg-gray-900 shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> تحديث البيانات
          </button>
          <button 
            onClick={() => setIsChangeModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-880 hover:border-gray-700 text-gray-300 rounded-full font-bold text-xs bg-gray-900 shadow-xs transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" /> تغيير رمز المرور
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-950 hover:bg-gray-850 text-gray-300 rounded-full font-bold text-xs transition-colors border border-gray-800"
          >
            <LogOut className="w-3.5 h-3.5" /> خروج
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
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xs flex items-center gap-5 text-white">
          <div className="w-12 h-12 bg-red-950/20 text-red-500 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalRevenue} ريال</div>
            <div className="text-xs text-gray-400 font-bold mt-1">إجمالي المبيعات المكتملة</div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xs flex items-center gap-5 text-white">
          <div className="w-12 h-12 bg-yellow-950/20 text-yellow-500 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{activeOrdersCount} طلبات</div>
            <div className="text-xs text-gray-400 font-bold mt-1">الطلبات النشطة حالياً</div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xs flex items-center gap-5 text-white">
          <div className="w-12 h-12 bg-green-950/20 text-green-500 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{completedOrdersCount} طلبات</div>
            <div className="text-xs text-gray-400 font-bold mt-1">الطلبات المسلمة بالكامل</div>
          </div>
        </div>
      </div>

      {/* Orders details grid splitting layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-gray-900 rounded-3xl border border-gray-800 shadow-xs overflow-hidden text-white">
          <div className="p-6 border-b border-gray-800 bg-gray-950/50">
            <h3 className="font-bold text-white text-lg">الطلبات الواردة ({orders.length})</h3>
          </div>

          <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto pr-1">
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
                  PENDING: 'bg-yellow-950/40 text-yellow-500 border-yellow-900/50',
                  PREPARING: 'bg-orange-950/40 text-orange-500 border-orange-900/50',
                  OUT_FOR_DELIVERY: 'bg-blue-950/40 text-blue-500 border-blue-900/50',
                  COMPLETED: 'bg-green-950/40 text-green-500 border-green-900/50'
                };

                return (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className={`p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-red-955/10 transition-colors ${
                      selectedOrder?.id === order.id ? 'bg-red-950/20' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-display font-black text-white text-base">{order.id}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusColors[order.status] || ''}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-bold mt-2">
                        العميل: {order.customerName} - {order.customerPhone}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1 max-w-sm truncate">
                        العنوان: {order.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:text-left self-end sm:self-auto">
                      <div className="text-right sm:text-left">
                        <div className="font-black text-red-500">{order.totalPrice} ريال</div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-950 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Order Details */}
        <div className="lg:col-span-4 bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xs h-fit space-y-6 text-white">
          <h3 className="font-bold text-white text-lg border-b border-gray-800 pb-3 mb-4">تفاصيل الطلب المحدد</h3>
          {selectedOrder ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-sm space-y-2.5">
                <div><span className="text-gray-400 font-bold">معرف الطلب:</span> <span className="font-display font-black text-white">{selectedOrder.id}</span></div>
                <div><span className="text-gray-400 font-bold">العميل:</span> <span className="font-bold text-white">{selectedOrder.customerName}</span></div>
                <div><span className="text-gray-400 font-bold">الجوال:</span> <span className="font-bold text-white">{selectedOrder.customerPhone}</span></div>
                <div><span className="text-gray-400 font-bold">طريقة الدفع:</span> <span className="font-bold text-blue-400">{selectedOrder.paymentMethod || 'CASH'}</span></div>
                <div><span className="text-gray-400 font-bold">نوع الاستلام:</span> <span className="font-bold text-red-500">{selectedOrder.deliveryType === 'DELIVERY' ? '🚀 توصيل' : '🏪 استلام'}</span></div>
                <div><span className="text-gray-400 font-bold">العنوان:</span> <p className="font-bold text-gray-300 text-xs mt-1 bg-gray-950 p-2.5 rounded-lg leading-relaxed border border-gray-850">{selectedOrder.address}</p></div>
              </div>

              <div className="border-t border-gray-800 pt-4 space-y-3">
                <span className="text-xs text-gray-400 font-black block">الوجبات المطلوبة:</span>
                {selectedOrder.items.map((item: any) => {
                  const customizations = JSON.parse(item.customizations || '[]');
                  return (
                    <div key={item.id} className="text-xs flex justify-between items-start border-b border-gray-800/60 pb-2.5">
                      <div>
                        <div className="font-bold text-white">{item.menuItem.name} <span className="text-red-500 font-normal">x{item.quantity}</span></div>
                        {customizations.length > 0 && (
                          <div className="text-[10px] text-gray-400 mt-1 flex flex-wrap gap-1">
                            {customizations.map((c: any, i: number) => (
                              <span key={i} className="bg-gray-950 px-1.5 py-0.5 rounded-md font-bold text-gray-300 border border-gray-850">{c.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-gray-200">{item.price * item.quantity} ريال</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-800 pt-4 space-y-3">
                <span className="text-xs text-gray-400 font-black block">تغيير حالة الطلب الحية:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'COMPLETED'].map((status) => {
                    const labels: Record<string, string> = { PENDING: 'قيد الانتظار', PREPARING: 'بدء التحضير', OUT_FOR_DELIVERY: 'خروج للتوصيل', COMPLETED: 'تم التسليم' };
                    const activeColors: Record<string, string> = { PENDING: 'bg-yellow-500 text-white border-yellow-500', PREPARING: 'bg-orange-500 text-white border-orange-500', OUT_FOR_DELIVERY: 'bg-blue-500 text-white border-blue-500', COMPLETED: 'bg-green-500 text-white border-green-500' };
                    return (
                      <button 
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)} 
                        className={`p-2.5 rounded-xl border font-bold transition-all ${
                          selectedOrder.status === status 
                            ? activeColors[status] 
                            : 'border-gray-800 hover:border-gray-700 text-gray-300 bg-gray-955'
                        }`}
                      >
                        {labels[status]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center py-20 text-gray-400 text-xs font-bold">حدد أحد الطلبات من القائمة لمشاهدة تفاصيله والتحكم به.</p>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangeModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-gray-900 w-full max-w-md p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-5 text-right text-white" dir="rtl">
            <h3 className="text-xl font-black text-white border-b border-gray-800 pb-3">تغيير رمز مرور الإدارة 🔑</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">رمز المرور الحالي</label>
                <input 
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-800 text-sm font-bold bg-gray-955 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">رمز المرور الجديد</label>
                <input 
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-800 text-sm font-bold bg-gray-955 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">تأكيد رمز المرور الجديد</label>
                <input 
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-800 text-sm font-bold bg-gray-955 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {modalError && <p className="text-xs text-red-500 bg-red-955/20 p-2.5 rounded-xl border border-red-900/50 font-bold">{modalError}</p>}
              {modalSuccess && <p className="text-xs text-green-500 bg-green-955/20 p-2.5 rounded-xl border border-green-900/50 font-bold">{modalSuccess}</p>}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsChangeModalOpen(false);
                    setModalError('');
                    setModalSuccess('');
                  }}
                  className="w-1/2 border border-gray-850 text-gray-300 py-2.5 rounded-xl hover:bg-gray-850 font-bold text-xs transition-colors bg-gray-955"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 font-bold text-xs transition-all shadow-md shadow-red-950"
                >
                  حفظ التغييرات
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* New Order Toast Alert */}
      {newOrderToast && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm bg-gray-900 border-2 border-red-600 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 flex items-center gap-4 text-right" dir="rtl">
          <div className="w-12 h-12 bg-red-955/20 text-red-500 rounded-2xl flex items-center justify-center shrink-0 border border-red-900/50">
            <Volume2 className="w-6 h-6 animate-bounce" />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-sm text-white">👑 طلب جديد وارد للتو!</h4>
            <p className="text-xs text-gray-400 mt-1 font-bold">العميل: {newOrderToast.customerName}</p>
            <p className="text-xs text-red-500 font-bold mt-0.5">{newOrderToast.totalPrice} ريال | معرف: {newOrderToast.id}</p>
          </div>
          <button 
            onClick={() => {
              setSelectedOrder(newOrderToast);
              setNewOrderToast(null);
            }}
            className="text-xs bg-red-600 text-white font-bold px-3.5 py-2 rounded-xl hover:bg-red-700 transition-colors"
          >
            عرض
          </button>
        </div>
      )}
    </div>
  );
};
