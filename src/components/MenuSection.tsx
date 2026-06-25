import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import type { Category, MenuItem } from '../types';

export const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'cat-burgers',
    name: 'البرجر',
    slug: 'burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
  },
  {
    id: 'cat-chicken',
    name: 'كرسبي دجاج',
    slug: 'crispy-chicken',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80',
  },
  {
    id: 'cat-pizza',
    name: 'البيتزا',
    slug: 'pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
  },
  {
    id: 'cat-drinks',
    name: 'المشروبات',
    slug: 'drinks',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&q=80',
  },
  {
    id: 'cat-desserts',
    name: 'الحلويات',
    slug: 'desserts',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
  }
];

export const FALLBACK_MENU: MenuItem[] = [
  // --- BURGERS ---
  {
    id: 'b1',
    name: 'برجر رويال لحم',
    description: 'شريحة لحم مشوي على اللهب مع الطماطم، الخس، المخلل، وصوص رويال المدخن.',
    price: 4000.0,
    calories: 620,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
    categoryId: 'cat-burgers',
    isAvailable: true,
    options: [
      { id: 'b1-o1', menuItemId: 'b1', name: 'حجم عادي', price: 0.0, category: 'SIZE' },
      { id: 'b1-o2', menuItemId: 'b1', name: 'تحويل لوجبة مع بطاطس ومشروب', price: 1000.0, category: 'SIZE' },
      { id: 'b1-o3', menuItemId: 'b1', name: 'شريحة لحم إضافية', price: 1500.0, category: 'ADDON' },
      { id: 'b1-o4', menuItemId: 'b1', name: 'جبنة شيدر إضافية', price: 500.0, category: 'ADDON' },
    ]
  },
  {
    id: 'b2',
    name: 'برجر كلاسيك دجاج',
    description: 'صدر دجاج مقرمش ذهبي مع الخس، المايونيز والجبنة.',
    price: 3500.0,
    calories: 550,
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&q=80',
    categoryId: 'cat-burgers',
    isAvailable: true,
    options: [
      { id: 'b2-o1', menuItemId: 'b2', name: 'حجم عادي', price: 0.0, category: 'SIZE' },
      { id: 'b2-o2', menuItemId: 'b2', name: 'تحويل لوجبة مع بطاطس ومشروب', price: 1000.0, category: 'SIZE' },
      { id: 'b2-o3', menuItemId: 'b2', name: 'جبنة شيدر إضافية', price: 500.0, category: 'ADDON' },
      { id: 'b2-o4', menuItemId: 'b2', name: 'بارد (عادي)', price: 0.0, category: 'EXCLUDE' },
      { id: 'b2-o5', menuItemId: 'b2', name: 'حار سبايسي', price: 0.0, category: 'EXCLUDE' },
    ]
  },
  {
    id: 'b3',
    name: 'برجر الجبن المزدوج',
    description: 'شريحتان من اللحم المشوي مع طبقتين من جبنة الشيدر وصوص كرسبي كينج.',
    price: 4800.0,
    calories: 780,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80',
    categoryId: 'cat-burgers',
    isAvailable: true,
    options: [
      { id: 'b3-o1', menuItemId: 'b3', name: 'حجم عادي', price: 0.0, category: 'SIZE' },
      { id: 'b3-o2', menuItemId: 'b3', name: 'تحويل لوجبة مع بطاطس ومشروب', price: 1000.0, category: 'SIZE' },
      { id: 'b3-o3', menuItemId: 'b3', name: 'شريحة لحم إضافية', price: 1500.0, category: 'ADDON' },
    ]
  },
  {
    id: 'b4',
    name: 'تويستر كينج الحار',
    description: 'صدر دجاج مقرمش حار ملفوف بخبز التورتيلا مع الخس والطماطم وصوص رانش.',
    price: 3500.0,
    calories: 580,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80',
    categoryId: 'cat-burgers',
    isAvailable: true,
    options: [
      { id: 'b4-o1', menuItemId: 'b4', name: 'حجم عادي', price: 0.0, category: 'SIZE' },
      { id: 'b4-o2', menuItemId: 'b4', name: 'تحويل لوجبة مع بطاطس ومشروب', price: 1000.0, category: 'SIZE' },
    ]
  },
  // --- CRISPY CHICKEN ---
  {
    id: 'c1',
    name: 'دلو التوفير المقرمش (8 قطع)',
    description: '8 قطع دجاج مقرمش ذهبي مع بطاطس عائلية، صوص الثومية، والخبز.',
    price: 12000.0,
    calories: 1450,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
    categoryId: 'cat-chicken',
    isAvailable: true,
    options: [
      { id: 'c1-o1', menuItemId: 'c1', name: 'نكهة عادية', price: 0.0, category: 'SIZE' },
      { id: 'c1-o2', menuItemId: 'c1', name: 'نكهة حارة', price: 0.0, category: 'SIZE' },
      { id: 'c1-o3', menuItemId: 'c1', name: 'صوص ثومية إضافي', price: 300.0, category: 'ADDON' },
    ]
  },
  {
    id: 'c2',
    name: 'وجبة سوبر كرسبي (4 قطع)',
    description: '4 قطع استربس دجاج مقرمش يقدم مع البطاطس، صوص الثومية والخبز.',
    price: 6500.0,
    calories: 850,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80',
    categoryId: 'cat-chicken',
    isAvailable: true,
    options: [
      { id: 'c2-o1', menuItemId: 'c2', name: 'نكهة عادية', price: 0.0, category: 'SIZE' },
      { id: 'c2-o2', menuItemId: 'c2', name: 'نكهة حارة', price: 0.0, category: 'SIZE' },
    ]
  },
  {
    id: 'c3',
    name: 'أصابع استربس الدجاج (5 قطع)',
    description: 'أصابع الدجاج المقرمشة الذهبية تقدم مع صوص خردل بالعسل.',
    price: 3200.0,
    calories: 450,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500&q=80',
    categoryId: 'cat-chicken',
    isAvailable: true,
    options: [
      { id: 'c3-o1', menuItemId: 'c3', name: 'نكهة عادية', price: 0.0, category: 'SIZE' },
      { id: 'c3-o2', menuItemId: 'c3', name: 'نكهة حارة', price: 0.0, category: 'SIZE' },
    ]
  },
  // --- PIZZA ---
  {
    id: 'p1',
    name: 'بيتزا مارغريتا كينج',
    description: 'صلصة الطماطم الغنية مغطاة بجبنة الموزاريلا الفاخرة وأوراق الريحان.',
    price: 4500.0,
    calories: 720,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
    categoryId: 'cat-pizza',
    isAvailable: true,
    options: [
      { id: 'p1-o1', menuItemId: 'p1', name: 'حجم وسط', price: 0.0, category: 'SIZE' },
      { id: 'p1-o2', menuItemId: 'p1', name: 'حجم كبير', price: 1500.0, category: 'SIZE' },
      { id: 'p1-o3', menuItemId: 'p1', name: 'خضار إضافي', price: 500.0, category: 'ADDON' },
    ]
  },
  {
    id: 'p2',
    name: 'بيتزا البيبروني الفاخرة',
    description: 'جبنة موزاريلا مع قطع بيبيروني لحم بقري وصوص البيتزا الإيطالي.',
    price: 5500.0,
    calories: 890,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80',
    categoryId: 'cat-pizza',
    isAvailable: true,
    options: [
      { id: 'p2-o1', menuItemId: 'p2', name: 'حجم وسط', price: 0.0, category: 'SIZE' },
      { id: 'p2-o2', menuItemId: 'p2', name: 'حجم كبير', price: 1500.0, category: 'SIZE' },
      { id: 'p2-o3', menuItemId: 'p2', name: 'جبنة موزاريلا إضافية', price: 800.0, category: 'ADDON' },
    ]
  },
  {
    id: 'p3',
    name: 'بيتزا كرسبي دجاج',
    description: 'قطع الدجاج المقرمش مع الفلفل الألوان والموزاريلا وصوص الرانش اللذيذ.',
    price: 5800.0,
    calories: 920,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
    categoryId: 'cat-pizza',
    isAvailable: true,
    options: [
      { id: 'p3-o1', menuItemId: 'p3', name: 'حجم وسط', price: 0.0, category: 'SIZE' },
      { id: 'p3-o2', menuItemId: 'p3', name: 'حجم كبير', price: 1500.0, category: 'SIZE' },
    ]
  },
  // --- DRINKS ---
  {
    id: 'd1',
    name: 'كولا مثلجة',
    description: 'مشروب غازي منعش يقدم بارداً جداً.',
    price: 1000.0,
    calories: 140,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80',
    categoryId: 'cat-drinks',
    isAvailable: true,
    options: [
      { id: 'd1-o1', menuItemId: 'd1', name: 'حجم وسط', price: 0.0, category: 'SIZE' },
      { id: 'd1-o2', menuItemId: 'd1', name: 'حجم كبير', price: 400.0, category: 'SIZE' },
      { id: 'd1-o3', menuItemId: 'd1', name: 'بدون ثلج', price: 0.0, category: 'EXCLUDE' },
    ]
  },
  {
    id: 'd2',
    name: 'عصير ليمون بالنعناع طبيعي',
    description: 'عصير طبيعي طازج محضر من الليمون والنعناع.',
    price: 1500.0,
    calories: 120,
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&q=80',
    categoryId: 'cat-drinks',
    isAvailable: true,
    options: [
      { id: 'd2-o1', menuItemId: 'd2', name: 'حجم عادي', price: 0.0, category: 'SIZE' },
      { id: 'd2-o2', menuItemId: 'd2', name: 'سكر خفيف', price: 0.0, category: 'EXCLUDE' },
    ]
  },
  {
    id: 'd3',
    name: 'مياه معدنية',
    description: 'مياه شرب معبأة ومنعشة.',
    price: 500.0,
    calories: 0,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500&q=80',
    categoryId: 'cat-drinks',
    isAvailable: true,
    options: []
  },
  // --- DESSERTS ---
  {
    id: 'de1',
    name: 'كيك الشوكولاتة الدافئ',
    description: 'كيك شوكولاتة غني يقدم مع صوص فادج الشوكولاتة الساخن.',
    price: 2500.0,
    calories: 420,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&q=80',
    categoryId: 'cat-desserts',
    isAvailable: true,
    options: [
      { id: 'de1-o1', menuItemId: 'de1', name: 'إضافة بول آيس كريم فانيليا', price: 800.0, category: 'ADDON' },
    ]
  },
  {
    id: 'de2',
    name: 'وافل مقرمش بالنوتيلا',
    description: 'وافل بلجيكي مغطى بالنوتيلا الغنية وقطع الموز والفراولة.',
    price: 2800.0,
    calories: 510,
    image: 'https://images.unsplash.com/photo-1695304781788-2ae3f1b02ccc?w=500&q=80',
    categoryId: 'cat-desserts',
    isAvailable: true,
    options: [
      { id: 'de2-o1', menuItemId: 'de2', name: 'إضافة بول آيس كريم', price: 800.0, category: 'ADDON' },
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

        if (!catsRes.ok || !menuRes.ok) {
          throw new Error('Failed to fetch menu data from server');
        }

        const catsData = await catsRes.json();
        const menuData = await menuRes.json();

        if (!Array.isArray(catsData) || !Array.isArray(menuData)) {
          throw new Error('Expected array of items from server');
        }

        setCategories(catsData);
        setMenuItems(menuData);
        if (catsData.length > 0) {
          setActiveSlug(catsData[0].slug);
        }
      } catch (error) {
        console.warn('Backend server unreachable, using local fallback menu data:', error);
        const storedCats = localStorage.getItem('local_categories');
        const storedMenu = localStorage.getItem('local_menu_items');
        const cats = storedCats ? JSON.parse(storedCats) : FALLBACK_CATEGORIES;
        const menu = storedMenu ? JSON.parse(storedMenu) : FALLBACK_MENU;
        setCategories(cats);
        setMenuItems(menu);
        if (cats.length > 0) {
          setActiveSlug(cats[0].slug);
        }
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
    return cat?.slug === activeSlug && item.isAvailable !== false;
  });
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12 relative">
      {/* Radial Backing Glow Backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-glow-radial rounded-full opacity-60"></div>
        <div className="absolute top-[50%] left-[5%] w-[450px] h-[450px] bg-glow-radial rounded-full opacity-40"></div>
      </div>



      {/* Categories Filter Tabs */}
      <div className="relative z-10 flex gap-4 overflow-x-auto pb-4 mb-4 border-b border-neutral-900 scrollbar-none scroll-smooth" dir="rtl">
        {categories.map(cat => {
          let catSymbol = '🍔';
          if (cat.slug.includes('chicken') || cat.slug.includes('مقرمش')) catSymbol = '🍗';
          else if (cat.slug.includes('pizza')) catSymbol = '🍕';
          else if (cat.slug.includes('drink') || cat.slug.includes('مشروب')) catSymbol = '🥤';
          else if (cat.slug.includes('dessert') || cat.slug.includes('حلو')) catSymbol = '🧇';

          const isActive = activeSlug === cat.slug;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveSlug(cat.slug)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-extrabold text-sm transition-all duration-300 whitespace-nowrap cursor-pointer hover:scale-[1.03] ${
                isActive
                  ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.55)] scale-105 border border-red-500'
                  : 'bg-neutral-950 text-neutral-400 border border-neutral-900 hover:border-red-900/50 hover:text-white hover:bg-neutral-900/60'
              }`}
            >
              <span className="text-xl">{catSymbol}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Menu Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
        {filteredItems.map(item => (
          <div 
            key={item.id} 
            className="group flex flex-col justify-between overflow-hidden rounded-[2.2rem] bg-neutral-950/80 border border-neutral-900/90 backdrop-blur-md transition-all duration-300 hover:border-red-900/40 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] hover:-translate-y-1.5"
          >
            {/* Image Container with rounded top corners */}
            <div className="relative h-60 overflow-hidden bg-neutral-950">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60"></div>
              
              <span className="absolute bottom-4 left-4 bg-black/75 font-bold px-3.5 py-1.5 rounded-full text-xs text-neutral-300 border border-neutral-800/80 backdrop-blur-xs flex items-center gap-1">
                🔥 {item.calories} سعرة
              </span>
            </div>
            
            {/* Description & Metadata Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white group-hover:text-red-500 transition-colors duration-200">
                  {item.name}
                </h3>
                <p className="text-neutral-400 text-xs font-medium leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
              
              {/* Bottom Price & Call to Action Row */}
              <div className="flex justify-between items-center pt-2 border-t border-neutral-900/80">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">السعر</span>
                  <span className="text-lg font-black text-amber-500">
                    {item.price.toLocaleString('ar-YE')} <span className="text-xs font-bold text-neutral-300">ريال</span>
                  </span>
                </div>
                
                <button
                  onClick={() => onSelectItem(item)}
                  className="bg-red-600 text-white font-extrabold px-6 py-2.5 rounded-full hover:bg-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all text-xs hover:-translate-y-0.5 cursor-pointer"
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
