import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative w-full max-w-[1400px] mx-auto rounded-[48px] bg-gray-950 overflow-hidden h-[600px] flex flex-col border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)]">
      {/* Background Image Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <img
          src="/hero-bg.jpg"
          alt="Background"
          className="w-full h-full object-cover scale-100"
        />
        {/* Dark overlay starting from the right side for text readability in RTL */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/50 to-transparent" />
      </div>

      {/* Hero Text Content Wrapper */}
      <div className="relative z-20 flex-1 px-8 md:px-16 pt-16 md:pt-20 flex flex-col items-start justify-start text-right">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[580px] flex flex-col items-start gap-5"
        >
          {/* Headline */}
          <h1 className="font-display text-[42px] md:text-[56px] font-black leading-[1.1] tracking-tight text-white drop-shadow-md text-right">
            Crunch it &<br />Live the Deliciousness!
          </h1>

          {/* Subheadline */}
          <p className="font-sans text-[16px] md:text-[18px] font-bold leading-relaxed text-red-500 max-w-[500px] text-right">
            قرمشها وعيش اللذاذة
          </p>

          {/* Contact Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="mt-2 bg-red-600 text-white text-[14px] font-bold px-8 py-3.5 rounded-full shadow-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            اطلب الآن
          </motion.button>
        </motion.div>
      </div>

      {/* Floating Bottom Navbar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 w-auto px-4">
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4 bg-white/90 backdrop-blur-2xl px-1.5 py-1.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/40 whitespace-nowrap"
        >
          {/* Logo Placeholder */}
          <div className="w-9 h-9 bg-white border border-slate-100 shadow-sm flex items-center justify-center rounded-full text-[#0a1b33] text-sm font-semibold select-none">
            ✦
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1.5">
            <button className="text-[12px] font-semibold text-slate-500 hover:text-[#0a1b33] px-3 py-1.5 transition-colors cursor-pointer">
              Products
            </button>
            <button className="text-[12px] font-semibold text-slate-500 hover:text-[#0a1b33] px-3 py-1.5 transition-colors cursor-pointer">
              Docs
            </button>
          </div>

          {/* "Get in touch" Button */}
          <button className="flex items-center gap-1 bg-white px-5 py-2 rounded-full text-[12px] font-semibold text-[#0a1b33] border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all cursor-pointer">
            Get in touch
            <ChevronRight className="w-3.5 h-3.5 text-[#0a1b33] stroke-[2.5]" />
          </button>
        </motion.nav>
      </div>
    </section>
  );
};
