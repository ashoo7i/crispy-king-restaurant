import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MarqueeScroller } from './components/MarqueeScroller';
import { MenuSection } from './components/MenuSection';
import { CustomizationModal } from './components/CustomizationModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutForm } from './components/CheckoutForm';
import { OrderTracker } from './components/OrderTracker';
import type { CartItem, MenuItem, CustomizationOption } from './types';

function App() {
  const [activePage, setActivePage] = useState<string>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const onNavigate = (page: string) => {
    setActivePage(page);
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (item: MenuItem, quantity: number, customizations: CustomizationOption[]) => {
    const activeSizePrice = customizations.find(opt => opt.category === 'SIZE')?.price || 0;
    const addonsPrice = customizations.filter(opt => opt.category === 'ADDON').reduce((sum, opt) => sum + opt.price, 0);
    const unitPrice = item.price + activeSizePrice + addonsPrice;

    // Unique ID combining item and selected customized sub-options
    const customId = `${item.id}-${customizations.map(c => c.id).sort().join('-')}`;

    setCart(prevCart => {
      const existing = prevCart.find(i => i.id === customId);
      if (existing) {
        return prevCart.map(i => i.id === customId ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prevCart, {
        id: customId,
        menuItemId: item.id,
        name: item.name,
        price: unitPrice,
        quantity,
        image: item.image,
        customizations
      }];
    });

    setSelectedItem(null);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = item.quantity + delta;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    }).filter((x): x is CartItem => x !== null));
  };

  const handleOrderSuccess = (orderId: string) => {
    setActiveOrderId(orderId);
    setCart([]);
    setIsCartOpen(false);
    onNavigate('tracking');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar 
        cartCount={cartCount} 
        onCartToggle={() => setIsCartOpen(!isCartOpen)} 
        onNavigate={onNavigate}
        activePage={activePage}
      />

      <main className="flex-1">
        {activePage === 'home' && (
          <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <HeroSection />
            <div className="mt-8">
              <MarqueeScroller />
            </div>
            
            <div className="mt-16 text-center">
              <h2 className="text-3xl font-display font-black text-gray-900">لماذا كرسبي كينج؟</h2>
              <p className="mt-4 text-gray-600 max-w-xl mx-auto">نصنع كل وجبة بشغف وعناية فائقة، باستخدام أجود صدور الدجاج الطازجة والمقرمشة يومياً!</p>
              <button 
                onClick={() => onNavigate('menu')} 
                className="mt-6 bg-red-600 text-white font-bold px-8 py-3.5 rounded-full hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
              >
                استكشف المنيو الكامل
              </button>
            </div>
          </div>
        )}

        {activePage === 'menu' && (
          <MenuSection onSelectItem={(item) => setSelectedItem(item)} />
        )}

        {activePage === 'checkout' && (
          <CheckoutForm 
            cart={cart} 
            onOrderSuccess={handleOrderSuccess} 
            onBackToMenu={() => onNavigate('menu')}
          />
        )}

        {activePage === 'tracking' && activeOrderId && (
          <OrderTracker 
            orderId={activeOrderId} 
            onBackToMenu={() => onNavigate('menu')}
          />
        )}
      </main>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={() => onNavigate('checkout')}
      />

      {selectedItem && (
        <CustomizationModal 
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <footer className="bg-gray-900 text-white py-12 mt-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-gray-400">© 2026 كرسبي كينج. جميع الحقوق محفوظة. | Developed by Eng. Ashraf Qusailah</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
