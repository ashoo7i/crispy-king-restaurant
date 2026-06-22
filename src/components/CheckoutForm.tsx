import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import type { CartItem } from '../types';

interface CheckoutFormProps {
  cart: CartItem[];
  onOrderSuccess: (orderId: string) => void;
  onBackToMenu: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ cart, onOrderSuccess, onBackToMenu }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryType === 'DELIVERY' ? 12 : 0;
  const grandTotal = subTotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || (deliveryType === 'DELIVERY' && !address)) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          deliveryType,
          address: deliveryType === 'DELIVERY' ? address : 'استلام من الفرع الرئيسي',
          totalPrice: grandTotal,
          items: cart.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        // Save locally too as a fallback trace
        try {
          const mockOrder = {
            id: data.orderId,
            customerName: name,
            customerPhone: phone,
            deliveryType,
            address: deliveryType === 'DELIVERY' ? address : 'استلام من الفرع الرئيسي',
            status: 'PENDING',
            totalPrice: grandTotal,
            createdAt: new Date().toISOString(),
            items: cart.map((item, idx) => ({
              id: `oi-${idx}`,
              quantity: item.quantity,
              price: item.price,
              customizations: JSON.stringify(item.customizations),
              menuItem: { name: item.name }
            }))
          };
          const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
          localStorage.setItem('local_orders', JSON.stringify([mockOrder, ...localOrders]));
        } catch (e) {
          console.warn('Could not cache order details locally:', e);
        }

        onOrderSuccess(data.orderId);
      } else {
        alert('حدث خطأ أثناء تقديم طلبك. يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.warn('Backend server offline, creating a mock order locally:', err);
      // Generate a mock order ID and structure
      const mockOrderId = 'CR-' + Math.floor(1000 + Math.random() * 9000);
      const newMockOrder = {
        id: mockOrderId,
        customerName: name,
        customerPhone: phone,
        deliveryType,
        address: deliveryType === 'DELIVERY' ? address : 'استلام من الفرع الرئيسي',
        status: 'PENDING',
        totalPrice: grandTotal,
        createdAt: new Date().toISOString(),
        items: cart.map((item, idx) => ({
          id: `oi-${idx}`,
          quantity: item.quantity,
          price: item.price,
          customizations: JSON.stringify(item.customizations),
          menuItem: { name: item.name }
        }))
      };

      // Save to localStorage under local_orders
      try {
        const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
        localStorage.setItem('local_orders', JSON.stringify([newMockOrder, ...localOrders]));
      } catch (storageErr) {
        console.error('LocalStorage write failed:', storageErr);
      }

      // Call onOrderSuccess with the mock order ID
      onOrderSuccess(mockOrderId);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-black text-gray-900">تفاصيل الدفع وإتمام الطلب</h2>
        <button 
          type="button" 
          onClick={onBackToMenu}
          className="text-red-600 font-bold hover:underline text-sm flex items-center gap-1"
        >
          ← العودة لتعديل الطلبات
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Delivery Details Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-xs border border-gray-100/80 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">نوع الاستلام</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDeliveryType('DELIVERY')}
                className={`py-3.5 rounded-2xl font-bold transition-all border-2 text-sm ${
                  deliveryType === 'DELIVERY'
                    ? 'border-red-600 bg-red-50/50 text-red-600 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                🚀 توصيل للعنوان
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('PICKUP')}
                className={`py-3.5 rounded-2xl font-bold transition-all border-2 text-sm ${
                  deliveryType === 'PICKUP'
                    ? 'border-red-600 bg-red-50/50 text-red-600 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                🏪 استلام من الفرع
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">اسم المستلم</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="الاسم بالكامل"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">رقم الجوال</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="05xxxxxxx"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all text-sm text-right"
              dir="ltr"
            />
          </div>

          {deliveryType === 'DELIVERY' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عنوان التوصيل بالتفصيل</label>
              <textarea
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="الحي، اسم الشارع، رقم المنزل، تفاصيل المعالم القريبة"
                rows={3}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all text-sm"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg disabled:bg-gray-400 text-sm tracking-wide disabled:cursor-not-allowed"
          >
            {submitting ? 'جاري إرسال طلبك للتحضير...' : 'تأكيد الطلب والدفع عند الاستلام'}
          </button>
        </form>

        {/* Bill Calculations Card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-xs border border-gray-100/80 flex flex-col justify-between h-fit">
          <h3 className="font-bold text-gray-900 text-lg mb-6 border-b border-gray-100 pb-3">ملخص الحساب</h3>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2 scrollbar-thin">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                <div className="flex-1 pl-4">
                  <div className="font-bold text-gray-900">{item.name} <span className="text-gray-400 font-normal">x{item.quantity}</span></div>
                  {item.customizations.length > 0 && (
                    <span className="text-[10px] text-red-600 font-bold block mt-1">{item.customizations.map(c => c.name).join(', ')}</span>
                  )}
                </div>
                <span className="font-bold text-gray-900">{item.price * item.quantity} ريال يمني</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>المجموع الفرعي لطلبك:</span>
              <span>{subTotal} ريال يمني</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>رسوم التوصيل:</span>
              <span>{deliveryFee} ريال يمني</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-200">
              <span>المجموع الكلي:</span>
              <span className="text-red-600">{grandTotal} ريال يمني</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
