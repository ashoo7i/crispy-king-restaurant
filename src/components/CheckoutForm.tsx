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

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'WALLET'>('CASH');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [walletType, setWalletType] = useState('الكريمي جوال');
  const [walletAccount, setWalletAccount] = useState('');

  const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryType === 'DELIVERY' ? 12 : 0;
  const grandTotal = subTotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || (deliveryType === 'DELIVERY' && !address)) return;

    setSubmitting(true);
    
    // Format payment information string for tracking/receipt details
    let paymentDetailsText: string = paymentMethod;
    if (paymentMethod === 'CARD') {
      paymentDetailsText = `بطاقة ائتمانية (ينتهي بـ ${cardNumber.slice(-4)})`;
    } else if (paymentMethod === 'WALLET') {
      paymentDetailsText = `محفظة (${walletType} - ${walletAccount})`;
    }

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
          paymentMethod: paymentDetailsText,
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
            paymentMethod: paymentDetailsText,
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
        paymentMethod: paymentDetailsText,
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
        <h2 className="text-3xl font-black text-white">تفاصيل الدفع وإتمام الطلب</h2>
        <button 
          type="button" 
          onClick={onBackToMenu}
          className="text-red-500 font-bold hover:underline text-sm flex items-center gap-1"
        >
          ← العودة لتعديل الطلبات
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Delivery Details Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-gray-900 p-8 rounded-3xl shadow-xs border border-gray-800 space-y-6 text-white">
          <div>
            <label className="block text-sm font-bold text-gray-200 mb-3">نوع الاستلام</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDeliveryType('DELIVERY')}
                className={`py-3.5 rounded-2xl font-bold transition-all border-2 text-sm ${
                  deliveryType === 'DELIVERY'
                    ? 'border-red-600 bg-red-950/20 text-red-500 shadow-xs'
                    : 'border-gray-850 hover:border-gray-700 text-gray-300'
                }`}
              >
                🚀 توصيل للعنوان
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('PICKUP')}
                className={`py-3.5 rounded-2xl font-bold transition-all border-2 text-sm ${
                  deliveryType === 'PICKUP'
                    ? 'border-red-600 bg-red-950/20 text-red-500 shadow-xs'
                    : 'border-gray-850 hover:border-gray-700 text-gray-300'
                }`}
              >
                🏪 استلام من الفرع
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">اسم المستلم</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="الاسم بالكامل"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-800 bg-gray-950 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">رقم الجوال</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="77xxxxxxx"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-800 bg-gray-950 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm text-right font-display"
              dir="ltr"
            />
          </div>

          {deliveryType === 'DELIVERY' && (
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">عنوان التوصيل بالتفصيل</label>
              <textarea
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="الحي، اسم الشارع، رقم المنزل، تفاصيل المعالم القريبة"
                rows={3}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-800 bg-gray-950 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
              />
            </div>
          )}

          {/* Payment Method Selector Section */}
          <div className="border-t border-gray-800 pt-6 space-y-4">
            <label className="block text-sm font-bold text-gray-200 mb-1">طريقة الدفع</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-3 rounded-2xl font-bold transition-all border-2 text-xs flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'CASH'
                    ? 'border-red-600 bg-red-950/20 text-red-500'
                    : 'border-gray-850 hover:border-gray-700 text-gray-300'
                }`}
              >
                <span className="text-lg">💵</span>
                <span>نقداً عند الاستلام</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`py-3 rounded-2xl font-bold transition-all border-2 text-xs flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'CARD'
                    ? 'border-red-600 bg-red-950/20 text-red-500'
                    : 'border-gray-850 hover:border-gray-700 text-gray-300'
                }`}
              >
                <span className="text-lg">💳</span>
                <span>بطاقة ائتمانية</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('WALLET')}
                className={`py-3 rounded-2xl font-bold transition-all border-2 text-xs flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'WALLET'
                    ? 'border-red-600 bg-red-950/20 text-red-500'
                    : 'border-gray-850 hover:border-gray-700 text-gray-300'
                }`}
              >
                <span className="text-lg">📱</span>
                <span>محفظة إلكترونية</span>
              </button>
            </div>

            {/* Cash instructions */}
            {paymentMethod === 'CASH' && (
              <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 text-xs text-gray-400 font-bold text-center leading-relaxed">
                سيتم سداد المبلغ بالكامل نقدًا عند استلام الوجبة من مندوب التوصيل أو الفرع بالهناء والشفاء.
              </div>
            )}

            {/* Credit Card Mock Form */}
            {paymentMethod === 'CARD' && (
              <div className="bg-gray-950 p-5 rounded-2xl border border-gray-800 space-y-3">
                <p className="text-[10px] text-amber-500 bg-amber-950/40 border border-amber-900/50 p-2.5 rounded-xl text-center font-bold">
                  ⚠️ وضع الدفع التجريبي نشط: الرجاء إدخال أي أرقام وهمية لتأكيد العملية.
                </p>
                <div>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="رقم البطاقة (16 رقم)"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    className="w-full px-4 py-3 rounded-xl border border-gray-800 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs text-center font-display"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="تاريخ الانتهاء MM/YY"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-800 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs text-center font-display"
                  />
                  <input
                    type="password"
                    required
                    maxLength={3}
                    placeholder="رمز التحقق CVV"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-800 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs text-center font-display"
                  />
                </div>
              </div>
            )}

            {/* Electronic Wallet Mock Form */}
            {paymentMethod === 'WALLET' && (
              <div className="bg-gray-950 p-5 rounded-2xl border border-gray-800 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1.5">اختر المحفظة اليمنيّة</label>
                  <select
                    value={walletType}
                    onChange={e => setWalletType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-800 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-xs font-bold text-gray-300"
                  >
                    <option value="جوال الكريمي">جوال الكريمي (Kuraimi)</option>
                    <option value="محفظة حاسب">حاسب (Haseb)</option>
                    <option value="محفظة كاش">كاش (Kuraimi Cash)</option>
                    <option value="إم فلوس">إم فلوس (M-Floos)</option>
                    <option value="محفظة جيب">جيب (Jeeb)</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="رقم الهاتف أو الحساب المرتبط بالمحفظة"
                    value={walletAccount}
                    onChange={e => setWalletAccount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-800 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs text-right font-display"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg disabled:bg-gray-800 disabled:text-gray-500 text-sm tracking-wide disabled:cursor-not-allowed"
          >
            {submitting ? 'جاري إرسال طلبك للتحضير...' : 'تأكيد الطلب وإرساله للمطبخ'}
          </button>
        </form>

        {/* Bill Calculations Card */}
        <div className="lg:col-span-5 bg-gray-900 p-6 rounded-3xl shadow-xs border border-gray-800 flex flex-col justify-between h-fit text-white">
          <h3 className="font-bold text-white text-lg mb-6 border-b border-gray-800 pb-3">ملخص الحساب</h3>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2 scrollbar-thin">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-800/60 pb-3">
                <div className="flex-1 pl-4">
                  <div className="font-bold text-white">{item.name} <span className="text-gray-500 font-normal">x{item.quantity}</span></div>
                  {item.customizations.length > 0 && (
                    <span className="text-[10px] text-red-500 font-bold block mt-1">{item.customizations.map(c => c.name).join(', ')}</span>
                  )}
                </div>
                <span className="font-bold text-white">{item.price * item.quantity} ريال يمني</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-800 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>المجموع الفرعي لطلبك:</span>
              <span>{subTotal} ريال يمني</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>رسوم التوصيل:</span>
              <span>{deliveryFee} ريال يمني</span>
            </div>
            <div className="flex justify-between font-bold text-white text-lg pt-2 border-t border-gray-800">
              <span>المجموع الكلي:</span>
              <span className="text-red-500">{grandTotal} ريال يمني</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
