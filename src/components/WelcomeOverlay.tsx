import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Crown, Gem, CheckCircle2 } from 'lucide-react';
import { Analysis } from '../types';
import { useLanguage } from '../lib/LanguageContext';
import archetypes from '../data/archetypes.json';

interface WelcomeOverlayProps {
  result: Analysis;
  onClose: () => void;
  previewUrl: string | null;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({
  result,
  onClose,
  previewUrl
}) => {
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Suppress scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const name = result.name?.trim() || "";
  const season = result.season;
  const subType = result.subType;
  const metal = result.jewelry;

  // Friendly greetings config based on language context
  const isIndo = language === 'id';
  const greetingTitle = name 
    ? (`Hi ${name}!`) 
    : ("Hi gorgeous!");

  const welcomeSub = isIndo 
    ? `Selamat Datang di Keluarga ${season}!`
    : `Welcome to the ${season} Family!`;

  // Season-specific aesthetic guidelines (gradients, shadows, highlight colors)
  const getSubthemeAesthetic = (seasonName: string) => {
    const s = seasonName.toLowerCase();
    if (s.includes('spring')) {
      return {
        grad: 'from-amber-400 via-[#FF7043] to-rose-400',
        glow: 'rgba(245, 158, 11, 0.4)',
        bgOverlay: 'from-[#FFFDF5] via-[#FFF9E6] to-[#FFF0D4]/40',
        tagBg: 'bg-amber-100 text-amber-800 border-amber-200',
        metalGrad: 'from-amber-400 to-yellow-500',
        orbColors: ['bg-amber-300/30', 'bg-emerald-300/20', 'bg-rose-300/20'],
        watermark: 'SPRING'
      };
    } else if (s.includes('summer')) {
      return {
        grad: 'from-sky-400 via-indigo-400 to-pink-400',
        glow: 'rgba(56, 189, 248, 0.4)',
        bgOverlay: 'from-[#F3F9FE] via-[#F3EEFA] to-[#FAEBF4]/40',
        tagBg: 'bg-sky-100 text-sky-800 border-sky-200',
        metalGrad: 'from-slate-300 to-neutral-400',
        orbColors: ['bg-sky-300/20', 'bg-indigo-300/20', 'bg-pink-300/20'],
        watermark: 'SUMMER'
      };
    } else if (s.includes('autumn')) {
      return {
        grad: 'from-[#A16A38] via-[#E65100] to-[#FFAB40]',
        glow: 'rgba(161, 106, 56, 0.4)',
        bgOverlay: 'from-[#FDF7F2] via-[#F8EFEA] to-[#F1E0D3]/40',
        tagBg: 'bg-orange-100 text-orange-900 border-orange-200',
        metalGrad: 'from-amber-500 to-orange-700',
        orbColors: ['bg-orange-300/20', 'bg-amber-400/15', 'bg-olive-300/15'],
        watermark: 'AUTUMN'
      };
    } else {
      // Winter
      return {
        grad: 'from-[#1A237E] via-[#283593] to-[#880E4F]',
        glow: 'rgba(26, 35, 126, 0.4)',
        bgOverlay: 'from-[#F4F6FC] via-[#FCEFF3] to-[#EBEEFD]/40',
        tagBg: 'bg-indigo-100 text-indigo-900 border-indigo-200',
        metalGrad: 'from-slate-200 to-zinc-400',
        orbColors: ['bg-indigo-300/25', 'bg-purple-300/20', 'bg-cyan-300/20'],
        watermark: 'WINTER'
      };
    }
  };

  const aes = getSubthemeAesthetic(season);

  // Parse color border from JSON for the spinning ring
  const borderColors = (archetypes.color_archetypes as any)[season]?.[`${subType} ${season}`]?.border || [];
  const defaultBorderColors = ["A8BD37","EFB45C","F3BF39","E88957","E06625","D53A21","B14720","8A78A8","5AA78F","4E9743"];
  const activeColors = borderColors.length > 0 ? borderColors : defaultBorderColors;

  // Prepare colors for conic spin gradient
  let twentyColors: string[] = [];
  while (twentyColors.length < 24) {
    twentyColors = twentyColors.concat(activeColors);
  }
  twentyColors = twentyColors.slice(0, 24);

  const conicGradientParts = twentyColors.map((col: string, index: number) => {
    const startPercent = (index / twentyColors.length) * 100;
    const endPercent = ((index + 1) / twentyColors.length) * 100;
    const hex = col.startsWith('#') ? col : `#${col}`;
    return `${hex} ${startPercent}% ${endPercent}%`;
  });
  const ringGradientStyle = `conic-gradient(from 0deg at 50% 50%, ${conicGradientParts.join(', ')})`;

  // Display image logic
  const portraitUrl = result.cleanedImageUrl || result.imageUrl || previewUrl || "/mascots/fallback.png";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none">
      {/* Immersive Blurred Multi-layered Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 bg-[#07090F]/90 backdrop-blur-3xl z-0"
      />

      {/* Floating Orbs for extra luxury feels */}
      <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 0.9, 1],
            x: [0, 60, -40, 0],
            y: [0, -50, 40, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute w-72 h-72 sm:w-[25rem] sm:h-[25rem] rounded-full filter blur-[80px] -top-12 -left-12 ${aes.orbColors[0]}`}
        />
        <motion.div 
          animate={{ 
            scale: [1.1, 0.85, 1.15, 1.1],
            x: [0, -50, 70, 0],
            y: [0, 40, -60, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute w-80 h-80 sm:w-[28rem] sm:h-[28rem] rounded-full filter blur-[100px] -bottom-16 -right-16 ${aes.orbColors[1]}`}
        />
        <motion.div 
          animate={{ 
            scale: [0.9, 1.1, 0.95, 0.9],
            x: [0, 40, -20, 0],
            y: [0, 60, -30, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute w-60 h-60 rounded-full filter blur-[90px] top-1/3 left-1/2 -translate-x-1/2 ${aes.orbColors[2]}`}
        />
      </div>

      {/* Main Luxury Modal Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: -25 }}
        transition={{ type: "spring", damping: 24, stiffness: 120 }}
        className="w-full max-w-lg bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-6 sm:p-10 relative overflow-hidden z-10 text-center flex flex-col items-center"
      >
        {/* Subtle Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none pointer-events-none">
          <span className="font-display font-black text-[12vw] tracking-widest uppercase">
            {aes.watermark}
          </span>
        </div>

        {/* Title & Welcome Headers */}
        <div className="space-y-2 mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl sm:text-3.5xl font-black text-white tracking-tight leading-tight font-display"
          >
            {greetingTitle}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-xs sm:text-sm text-slate-300 font-medium"
          >
            {welcomeSub}
          </motion.p>
        </div>

        {/* Beautiful Dynamic Profile Photo Frame with Spinning Conic Gradient */}
        <div className="relative mb-8 flex justify-center items-center">
          {/* Outer Rotating Chroma Halo Ring using performance-friendly GPU/CSS animations */}
          <div 
            className="w-44 h-44 sm:w-48 sm:h-48 rounded-full p-[3px] shadow-2xl relative animate-slow-spin"
            style={{ background: ringGradientStyle }}
          />

          {/* Faint Glowing Pulse Circle under frame using CSS scale/opacity */}
          <div 
            className="absolute inset-0 rounded-full blur-xl filter opacity-45 mix-blend-screen animate-gentle-pulse"
            style={{ background: ringGradientStyle }}
          />

          {/* User Face Centered Frame Border */}
          <div className="absolute w-[10.1rem] h-[10.1rem] sm:w-[11.1rem] sm:h-[11.1rem] rounded-full bg-slate-950 p-[4px] flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-900 border border-white/5">
              <img 
                src={portraitUrl} 
                alt="Your Diagnostics Profile" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none scale-105"
              />
              {/* Highlight glass shine reflection cover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            </div>
          </div>

          {/* Miniature Overlay Verified Badge on the image */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", damping: 10 }}
            className="absolute bottom-1 right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-1.5 shadow-lg border border-slate-950 flex items-center justify-center"
          >
            <CheckCircle2 size={16} className="fill-white/10" />
          </motion.div>
        </div>

        {/* Detailed Horizontal Subtype Badges */}
        <div className="w-full flex flex-wrap justify-center gap-2.5 mb-8">
          {/* Badge 1: Season Details */}
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={`px-3.5 py-1.5 rounded-2xl text-[11px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${aes.tagBg}`}
          >
            <Crown size={12} className="shrink-0" />
            {subType} {season}
          </motion.div>

          {/* Badge 2: Metal recommendation */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="px-3.5 py-1.5 rounded-2xl text-[11px] font-black uppercase tracking-wider bg-slate-950/50 border border-white/10 text-white flex items-center gap-1.5"
          >
            <Gem size={12} className="text-slate-400 shrink-0" />
            <span className="text-slate-400 font-semibold">{isIndo ? "Aksesoris" : "Jewelry"}:</span>
            <span className={`bg-gradient-to-r ${aes.metalGrad} bg-clip-text text-transparent`}>
              {metal}
            </span>
          </motion.div>

          {/* Badge 3: Face shape outline */}
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="px-3.5 py-1.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider bg-slate-950/50 border border-white/10 text-slate-300 flex items-center gap-1"
          >
            <span className="text-slate-400 font-semibold">{isIndo ? "Wajah" : "Face"}:</span>
            <span className="truncate max-w-[90px] text-white">
              {result.faceShape}
            </span>
          </motion.div>
        </div>

        {/* Animated Action Prompt button */}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className={`w-full group relative cursor-pointer font-bold select-none text-white text-sm tracking-wider uppercase py-4 rounded-2xl shadow-xl transition-all duration-300 bg-gradient-to-r ${aes.grad} hover:brightness-110 flex items-center justify-center gap-2 font-mono overflow-hidden`}
        >
          {/* Flare Animation Effect */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-shine" />
          
          <span>
            {isIndo ? "Lihat Laporan Varnally" : "See Varnally Report"}
          </span>
          <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300 shrink-0" />
        </motion.button>
      </motion.div>
    </div>
  );
};
