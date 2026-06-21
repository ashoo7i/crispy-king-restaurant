import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onCartToggle: () => void;
  onNavigate: (page: string) => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartToggle, onNavigate, activePage }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
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

        {/* Shopping Cart button & Counter */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('menu')} 
            className="bg-red-600 text-white font-sans font-bold px-6 py-2.5 rounded-full hover:bg-red-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
          >
            اطلب الآن
          </button>
          
          <button 
            onClick={onCartToggle} 
            className="relative p-2.5 bg-gray-50 rounded-full text-gray-800 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
