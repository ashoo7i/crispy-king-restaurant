import { motion } from 'motion/react';

interface HeroSectionProps {
  onOrderClick: () => void;
}

export const HeroSection = ({ onOrderClick }: HeroSectionProps) => {
  return (
    <section className="relative w-full max-w-[1400px] mx-auto rounded-[48px] bg-gray-950 overflow-hidden h-[600px] flex flex-col border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)]">
      {/* Background Image Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <img
          src="/hero-bg.jpg"
          alt="Background"
          className="w-full h-full object-cover scale-100"
        />
        {/* Dark overlay starting from the bottom for centered text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
      </div>

      {/* Hero Text & Button Content (Centered at the bottom replacing the old white template menu) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 text-center w-full max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3.5"
        >
          {/* Headline */}
          <h1 className="font-display text-[32px] md:text-[50px] font-black leading-[1.15] tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            Crunch it &<br />Live the Deliciousness!
          </h1>

          {/* Subheadline */}
          <p className="font-sans text-[16px] md:text-[20px] font-black text-red-500 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            قرمشها وعيش اللذاذة
          </p>

          {/* Centered Order Button replacing the white template bar */}
          <motion.button
            onClick={onOrderClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="mt-4 bg-red-600 text-white text-[15px] font-bold px-12 py-4 rounded-full shadow-xl hover:bg-red-700 transition-all cursor-pointer shadow-red-500/20 hover:shadow-red-500/40"
          >
            اطلب الآن
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
