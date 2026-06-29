import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MarqueeScroller } from './components/MarqueeScroller';
import { MenuSection } from './components/MenuSection';
import { CustomizationModal } from './components/CustomizationModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutForm } from './components/CheckoutForm';
import { OrderTracker } from './components/OrderTracker';
import { AdminDashboard } from './components/AdminDashboard';
import type { CartItem, MenuItem, CustomizationOption } from './types';
import { playSuccessPing } from './utils/audio';
import { API_BASE_URL } from './config';

function App() {
  const [activePage, setActivePage] = useState<string>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const [heroSettings, setHeroSettings] = useState(() => {
    try {
      const local = localStorage.getItem('local_settings');
      if (local) {
        const parsed = JSON.parse(local);
        return {
          hero_title: parsed.hero_title || 'Crunch it &\nLive the Deliciousness!',
          hero_subtitle: parsed.hero_subtitle || 'قرمشها وعيش اللذاذة',
          hero_image: parsed.hero_image || '/hero-bg.jpg'
        };
      }
    } catch (e) {
      console.warn('Error loading settings from localStorage:', e);
    }
    return {
      hero_title: 'Crunch it &\nLive the Deliciousness!',
      hero_subtitle: 'قرمشها وعيش اللذاذة',
      hero_image: '/hero-bg.jpg'
    };
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          const settings = {
            hero_title: data.hero_title || 'Crunch it &\nLive the Deliciousness!',
            hero_subtitle: data.hero_subtitle || 'قرمشها وعيش اللذاذة',
            hero_image: data.hero_image || '/hero-bg.jpg'
          };
          setHeroSettings(settings);
          localStorage.setItem('local_settings', JSON.stringify(settings));
        }
      } catch (err) {
        console.warn('Backend server offline, loading local settings:', err);
        const localSettings = JSON.parse(localStorage.getItem('local_settings') || '{}');
        setHeroSettings({
          hero_title: localSettings.hero_title || 'Crunch it &\nLive the Deliciousness!',
          hero_subtitle: localSettings.hero_subtitle || 'قرمشها وعيش اللذاذة',
          hero_image: localSettings.hero_image || '/hero-bg.jpg'
        });
      }
    };
    fetchSettings();
  }, []);

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
    playSuccessPing(); // Play iPhone-like ping sound
    setActiveOrderId(orderId);
    setCart([]);
    setIsCartOpen(false);
    onNavigate('tracking');
  };

  const handleTrackOrder = (orderId: string) => {
    setActiveOrderId(orderId);
    onNavigate('tracking');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      <Navbar 
        cartCount={cartCount} 
        onCartToggle={() => setIsCartOpen(!isCartOpen)} 
        onNavigate={onNavigate}
        activePage={activePage}
        onTrackOrder={handleTrackOrder}
      />

      <main className="flex-1">
        {activePage === 'home' && (
          <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <HeroSection 
              onOrderClick={() => onNavigate('menu')} 
              title={heroSettings.hero_title}
              subtitle={heroSettings.hero_subtitle}
              backgroundImage={heroSettings.hero_image}
            />
            <div className="mt-8">
              <MarqueeScroller />
            </div>
            
            <div className="mt-16 text-center">
              <h2 className="text-3xl font-display font-black text-white">لماذا Ashoospy؟</h2>
              <p className="mt-4 text-gray-300 max-w-xl mx-auto">نصنع كل وجبة بشغف وعناية فائقة، باستخدام أجود صدور الدجاج الطازجة والمقرمشة يومياً!</p>
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

        {activePage === 'admin' && (
          <AdminDashboard onBackToMenu={() => onNavigate('menu')} />
        )}
      </main>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={() => {
          onNavigate('checkout');
          setIsCartOpen(false);
        }}
      />

      {selectedItem && (
        <CustomizationModal 
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <footer className="bg-gray-900 text-white py-12 mt-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© 2026 Ashoospy. جميع الحقوق محفوظة. | Developed by Eng. Ashraf Qusailah</p>
          <button 
            onClick={() => onNavigate('admin')}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            🔐 لوحة الإدارة
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
