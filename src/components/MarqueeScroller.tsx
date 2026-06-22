
interface FoodHighlight {
  name: string;
  image: string;
}

const FOOD_ITEMS: FoodHighlight[] = [
  {
    name: 'برجر كينج الحار 🍔',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
  },
  {
    name: 'دجاج كرسبي مقرمش 🍗',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80',
  },
  {
    name: 'بطاطس مقرمشة ذهبية 🍟',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80',
  },
  {
    name: 'تويستر دجاج سبايسي 🌯',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400&q=80',
  },
  {
    name: 'كولا مثلجة ومنعشة 🥤',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
  },
  {
    name: 'حلقات البصل الذهبية 🧅',
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&q=80',
  },
  {
    name: 'سلطة كولسلو طازجة 🥗',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&q=80',
  },
  {
    name: 'آيس كريم الشوكولاتة 🍦',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80',
  }
];

const DOUBLE_FOOD_ITEMS = [...FOOD_ITEMS, ...FOOD_ITEMS];

export const MarqueeScroller = () => {
  return (
    <div 
      className="relative w-full overflow-hidden py-6 select-none"
      style={{
        maskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
      }}
    >
      <div className="animate-marquee flex gap-6">
        {DOUBLE_FOOD_ITEMS.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="group relative h-32 w-52 shrink-0 flex items-end justify-center rounded-3xl overflow-hidden shadow-lg border border-slate-100/50 hover:scale-105 transition-all duration-300"
          >
            {/* Background Image */}
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-500"
            />
            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
            {/* Text Label */}
            <span className="relative z-20 text-white font-bold text-xs p-4 w-full text-center tracking-wide leading-tight">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
