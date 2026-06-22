import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import type { Category, MenuItem } from '../types';

const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'cat-burgers',
    name: 'برجر وبطاطس',
    slug: 'burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
  },
  {
    id: 'cat-chicken',
    name: 'دجاج مقلي مقرمش',
    slug: 'chicken',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80',
  },
  {
    id: 'cat-drinks',
    name: 'المشروبات والحلويات',
    slug: 'drinks',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&q=80',
  }
];

const FALLBACK_MENU: MenuItem[] = [
  {
    id: 'item-1',
    name: 'تويستر كينج الحار',
    description: 'صدر دجاج مقرمش حار مع الخس والمايونيز والجبنة في خبز البريوش الفاخر.',
    price: 3500.0,
    calories: 580,
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&q=80',
    categoryId: 'cat-burgers',
    isAvailable: true,
    options: [
      { id: 'opt-1-1', menuItemId: 'item-1', name: 'حجم عادي', price: 0.0, category: 'SIZE' },
      { id: 'opt-1-2', menuItemId: 'item-1', name: 'حجم كبير (مع بطاطس ومشروب ضخم)', price: 1000.0, category: 'SIZE' },
      { id: 'opt-1-3', menuItemId: 'item-1', name: 'جبنة شيدر إضافية', price: 500.0, category: 'ADDON' },
      { id: 'opt-1-4', menuItemId: 'item-1', name: 'صوص رانش إضافي', price: 300.0, category: 'ADDON' },
      { id: 'opt-1-5', menuItemId: 'item-1', name: 'بدون بصل', price: 0.0, category: 'EXCLUDE' }
    ]
  },
  {
    id: 'item-2',
    name: 'دلو التوفير المقرمش (8 قطع)',
    description: '8 قطع من الدجاج المقرمش الذهبي مع اختيارك من النكهة العادية أو الحارة، يقدم مع بطاطس عائلية.',
    price: 12000.0,
    calories: 1450,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
    categoryId: 'cat-chicken',
    isAvailable: true,
    options: [
      { id: 'opt-2-1', menuItemId: 'item-2', name: 'دجاج حار', price: 0.0, category: 'SIZE' },
      { id: 'opt-2-2', menuItemId: 'item-2', name: 'دجاج خلطة سرية عادية', price: 0.0, category: 'SIZE' },
      { id: 'opt-2-3', menuItemId: 'item-2', name: 'إضافة صوص الثوم', price: 500.0, category: 'ADDON' }
    ]
  },
  {
    id: 'item-3',
    name: 'برجر رويال لحم',
    description: 'شريحة لحم مشوي على اللهب مع الطماطم، الخس، المخلل، وصوص رويال المدخن.',
    price: 4000.0,
    calories: 620,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
    categoryId: 'cat-burgers',
    isAvailable: true,
    options: [
      { id: 'opt-3-1', menuItemId: 'item-3', name: 'حجم عادي', price: 0.0, category: 'SIZE' },
      { id: 'opt-3-2', menuItemId: 'item-3', name: 'حجم كبير مكس', price: 1000.0, category: 'SIZE' },
      { id: 'opt-3-3', menuItemId: 'item-3', name: 'شريحة لحم إضافية', price: 1500.0, category: 'ADDON' },
      { id: 'opt-3-4', menuItemId: 'item-3', name: 'جبنة إضافية', price: 500.0, category: 'ADDON' }
    ]
  },
  {
    id: 'item-4',
    name: 'بطاطس مقرمشة ذهبية',
    description: 'أصابع البطاطس المقلية المقرمشة والمملحة بشكل مثالي.',
    price: 1500.0,
    calories: 320,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80',
    categoryId: 'cat-burgers',
    isAvailable: true,
    options: [
      { id: 'opt-4-1', menuItemId: 'item-4', name: 'حجم وسط', price: 0.0, category: 'SIZE' },
      { id: 'opt-4-2', menuItemId: 'item-4', name: 'حجم كبير جداً', price: 500.0, category: 'SIZE' },
      { id: 'opt-4-3', menuItemId: 'item-4', name: 'إضافة بهارات حارة', price: 200.0, category: 'ADDON' },
      { id: 'opt-4-4', menuItemId: 'item-4', name: 'إضافة صوص الجبنة', price: 500.0, category: 'ADDON' }
    ]
  },
  {
    id: 'item-5',
    name: 'كولا مثلجة',
    description: 'مشروب غازي منعش يقدم بارداً مع الثلج.',
    price: 1000.0,
    calories: 140,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80',
    categoryId: 'cat-drinks',
    isAvailable: true,
    options: [
      { id: 'opt-5-1', menuItemId: 'item-5', name: 'حجم وسط', price: 0.0, category: 'SIZE' },
      { id: 'opt-5-2', menuItemId: 'item-5', name: 'حجم كبير', price: 400.0, category: 'SIZE' },
      { id: 'opt-5-3', menuItemId: 'item-5', name: 'بدون ثلج', price: 0.0, category: 'EXCLUDE' }
    ]
  }
];

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
        const catsRes = await fetch(`${API_BASE_URL}/api/categories`);
        const menuRes = await fetch(`${API_BASE_URL}/api/menu`);
        const catsData = await catsRes.json();
        const menuData = await menuRes.json();

        setCategories(catsData);
        setMenuItems(menuData);
        if (catsData.length > 0) {
          setActiveSlug(catsData[0].slug);
        }
      } catch (error) {
        console.warn('Backend server unreachable, using local fallback menu data:', error);
        setCategories(FALLBACK_CATEGORIES);
        setMenuItems(FALLBACK_MENU);
        setActiveSlug(FALLBACK_CATEGORIES[0].slug);
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
      <div className="flex gap-4 overflow-x-auto pb-4 mb-10 border-b border-gray-800 scrollbar-none scroll-smooth">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveSlug(cat.slug)}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-full font-bold transition-all duration-200 whitespace-nowrap ${
              activeSlug === cat.slug
                ? 'bg-red-600 text-white shadow-lg shadow-red-950 scale-105'
                : 'bg-gray-900 text-gray-300 border border-gray-800 hover:bg-gray-800'
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
          <div key={item.id} className="bg-gray-900 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-800 group flex flex-col justify-between">
            <div className="relative h-60 bg-gray-950 overflow-hidden">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <span className="absolute bottom-4 left-4 bg-gray-950/90 font-bold px-3 py-1 rounded-full text-xs text-gray-200 backdrop-blur-xs">
                🔥 {item.calories} سعرة
              </span>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors">{item.name}</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2">{item.description}</p>
              </div>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-xl font-black text-red-500">{item.price} ريال يمني</span>
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
