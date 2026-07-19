import { motion } from 'motion/react';

interface HeroSectionProps {
  onOrderClick: () => void;
  title: string;
  subtitle: string;
  backgroundImage: string;
  videoUrl?: string;
}

export const HeroSection = ({ onOrderClick, title, subtitle, backgroundImage, videoUrl }: HeroSectionProps) => {
  const defaultVideo = "/hero-video.mp4";
  const activeVideo = videoUrl || defaultVideo;

  return (
    <section className="relative w-full max-w-[1400px] mx-auto rounded-[20px] sm:rounded-[36px] md:rounded-[48px] bg-gray-950 overflow-hidden h-[250px] sm:h-[380px] md:h-[600px] flex flex-col border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)]">
      {/* Background Video/Image Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center"
          poster={backgroundImage || "/hero-bg.jpg"}
          key={activeVideo}
        >
          <source src={activeVideo} type="video/mp4" />
          <img
            src={backgroundImage || "/hero-bg.jpg"}
            alt="Background Poster"
            className="w-full h-full object-cover object-center"
          />
        </video>
        {/* Dark overlay starting from the bottom for centered text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
      </div>

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 sm:gap-4 text-center w-full max-w-2xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-1.5 sm:gap-3.5"
        >
          {/* Headline */}
          <h1 className="font-display text-[18px] sm:text-[30px] md:text-[50px] font-black leading-[1.15] tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] whitespace-pre-line">
            {title || `Crunch it &\nLive the Deliciousness!`}
          </h1>

          {/* Subheadline */}
          <p className="font-sans text-[11px] sm:text-[15px] md:text-[20px] font-black text-red-500 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            {subtitle || 'قرمشها وعيش اللذاذة'}
          </p>

          {/* Centered Order Button */}
          <motion.button
            onClick={onOrderClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="mt-1 sm:mt-4 bg-red-600 text-white text-[11px] sm:text-[14px] md:text-[15px] font-bold px-6 py-2 sm:px-10 sm:py-3.5 md:px-12 md:py-4 rounded-full shadow-xl hover:bg-red-700 transition-all cursor-pointer shadow-red-500/20 hover:shadow-red-500/40"
          >
            اطلب الآن
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
