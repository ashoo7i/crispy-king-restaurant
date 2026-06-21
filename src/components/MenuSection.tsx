import React, { useEffect, useState } from 'react';
import type { Category, MenuItem } from '../types';

interface MenuSectionProps {
  onSelectItem: (item: MenuItem) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onSelectItem }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catsRes = await fetch('http://localhost:3001/api/categories');
        const menuRes = await fetch('http://localhost:3001/api/menu');
        const catsData = await catsRes.json();
        const menuData = await menuRes.json();

        setCategories(catsData);
        setMenuItems(menuData);
        if (catsData.length > 0) {
          setActiveSlug(catsData[0].slug);
        }
      } catch (error) {
        console.error('Failed to load menu data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredItems = menuItems.filter(item => {
    const cat = categories.find(c => c.id === item.categoryId);
    return cat?.slug === activeSlug;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Categories Filter Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-10 border-b border-gray-100 scrollbar-none scroll-smooth">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveSlug(cat.slug)}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-full font-bold transition-all duration-200 whitespace-nowrap ${
              activeSlug === cat.slug
                ? 'bg-red-600 text-white shadow-lg shadow-red-100 scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-full object-cover border-2 border-white/50" />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100/80 group flex flex-col justify-between">
            <div className="relative h-60 bg-gray-50 overflow-hidden">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <span className="absolute bottom-4 left-4 bg-white/90 font-bold px-3 py-1 rounded-full text-xs text-gray-800 backdrop-blur-xs">
                🔥 {item.calories} سعرة
              </span>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">{item.name}</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed line-clamp-2">{item.description}</p>
              </div>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-xl font-black text-red-600">{item.price} ر.س</span>
                <button
                  onClick={() => onSelectItem(item)}
                  className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-red-700 shadow-md hover:shadow-lg transition-all text-sm hover:-translate-y-0.5"
                >
                  أضف للطلب
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
