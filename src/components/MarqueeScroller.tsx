interface Logo {
  name: string;
  src: string;
  gradient: {
    from: string;
    to: string;
  };
}

const LOGOS: Logo[] = [
  {
    name: 'Procure',
    src: 'https://cdn.svgl.app/library/procure.svg',
    gradient: { from: '#3b82f6', to: '#1d4ed8' }, // blue gradient
  },
  {
    name: 'Shopify',
    src: 'https://cdn.svgl.app/library/shopify.svg',
    gradient: { from: '#f59e0b', to: '#d97706' }, // yellow gradient
  },
  {
    name: 'Blender',
    src: 'https://cdn.svgl.app/library/blender.svg',
    gradient: { from: '#2563eb', to: '#1d4ed8' }, // blue gradient
  },
  {
    name: 'Figma',
    src: 'https://cdn.svgl.app/library/figma.svg',
    gradient: { from: '#a855f7', to: '#7e22ce' }, // purple gradient
  },
  {
    name: 'Spotify',
    src: 'https://cdn.svgl.app/library/spotify.svg',
    gradient: { from: '#ec4899', to: '#be185d' }, // pink/red gradient
  },
  {
    name: 'Lottielab',
    src: 'https://cdn.svgl.app/library/lottielab.svg',
    gradient: { from: '#eab308', to: '#22c55e' }, // yellow/green gradient
  },
  {
    name: 'Google Cloud',
    src: 'https://cdn.svgl.app/library/google-cloud.svg',
    gradient: { from: '#38bdf8', to: '#0284c7' }, // light blue
  },
  {
    name: 'Bing',
    src: 'https://cdn.svgl.app/library/bing.svg',
    gradient: { from: '#06b6d4', to: '#0f766e' }, // cyan/teal
  },
];

// Double the list for seamless infinite looping
const DOUBLE_LOGOS = [...LOGOS, ...LOGOS];

export const MarqueeScroller = () => {
  return (
    <div 
      className="relative w-full overflow-hidden py-4 select-none"
      style={{
        maskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
      }}
    >
      <div className="animate-marquee flex gap-6">
        {DOUBLE_LOGOS.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className="group relative h-24 w-40 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all overflow-hidden"
          >
            {/* Hover Gradient Overlay */}
            <div
              className="absolute inset-0 opacity-0 scale-150 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${logo.gradient.from}, ${logo.gradient.to})`,
              }}
            />
            
            {/* Logo Image */}
            <img
              src={logo.src}
              alt={logo.name}
              className="h-7 w-auto max-w-[100px] object-contain relative z-10 transition-all duration-300 group-hover:brightness-0 group-hover:invert"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
