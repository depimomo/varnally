import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Palette, 
  Smile, 
  Glasses, 
  Heart, 
  History,
  Share2,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import archetypes from '../data/archetypes.json';
import landingSeasons from '../data/landing_seasons.json';

interface LandingHeroProps {
  onStart: () => void;
}

// Seasonal Archetypes, extracted static descriptors and default background color schemes config
const DEFAULT_PALETTES = landingSeasons.default_palettes;

// Extract seasonal color palettes from archetypes.json dynamically
const getSeasonPalette = (seasonKey: string, subtypeKey: string): string[] => {
  const border = (archetypes.color_archetypes as any)[seasonKey]?.[subtypeKey]?.border || [];
  return border.map((hex: string) => hex.startsWith('#') ? hex : `#${hex}`);
};

const PALETTES = [
  getSeasonPalette('Spring', 'True Spring').length > 0 ? getSeasonPalette('Spring', 'True Spring') : DEFAULT_PALETTES[0],
  getSeasonPalette('Summer', 'True Summer').length > 0 ? getSeasonPalette('Summer', 'True Summer') : DEFAULT_PALETTES[1],
  getSeasonPalette('Autumn', 'True Autumn').length > 0 ? getSeasonPalette('Autumn', 'True Autumn') : DEFAULT_PALETTES[2],
  getSeasonPalette('Winter', 'True Winter').length > 0 ? getSeasonPalette('Winter', 'True Winter') : DEFAULT_PALETTES[3]
];

const VarnaColorRaysBackdrop: React.FC = () => {
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPaletteIndex((prev) => (prev + 1) % 4);
    }, 4550);
    return () => clearInterval(timer);
  }, []);

  const activePalette = PALETTES[paletteIndex] || DEFAULT_PALETTES[0];

  if (isMobile) {
    // Ultra-lightweight background representation for mobile/low-end devices.
    // Absolutely no multi-layer dynamic rotators, keyframes, or rays to avoid browser compositing lag.
    return (
      <div className="absolute inset-0 flex items-center justify-center -z-15 overflow-hidden pointer-events-none select-none">
        <div 
          className="absolute w-72 h-72 rounded-full blur-[65px] opacity-25 transition-all duration-[2000ms] ease-in-out"
          style={{
            backgroundColor: activePalette[0] || '#FF8A65'
          }}
        />
        <div 
          className="absolute w-56 h-56 rounded-full blur-[55px] opacity-20 transition-all duration-[2000ms] ease-in-out ml-6 mt-6"
          style={{
            backgroundColor: activePalette[1] || '#4DB6AC'
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center -z-15 overflow-visible pointer-events-none select-none">
      <div className="relative w-0 h-0 flex items-center justify-center">
        
        {/* Layer 1: Clockwise slow rotation - larger and highly blurred color sweeps */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute w-[680px] h-[680px] flex items-center justify-center"
        >
          {activePalette.map((color, i) => (
            <motion.div
              key={`ray-cw-${i}`}
              className="absolute w-14 h-[350px] rounded-full blur-[65px] opacity-[0.25]"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: 'center center',
                transform: `translate(-50%, -50%) rotate(${i * 36}deg) translateY(-140px)`,
              }}
              animate={{
                backgroundColor: color,
                scaleY: [1, 1.2, 0.9, 1],
                opacity: [0.22, 0.32, 0.22, 0.22],
              }}
              transition={{
                backgroundColor: { duration: 2.2, ease: "easeInOut" },
                scaleY: { duration: 5 + (i % 3), repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 5 + (i % 3), repeat: Infinity, ease: "easeInOut" }
              }}
            />
          ))}
        </motion.div>

        {/* Layer 2: Counter-Clockwise slow rotation - smaller/sharper rays for dynamic texture */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          className="absolute w-[500px] h-[500px] flex items-center justify-center"
        >
          {activePalette.map((color, i) => (
            <motion.div
              key={`ray-ccw-${i}`}
              className="absolute w-10 h-[260px] rounded-full blur-[40px] opacity-[0.28]"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: 'center center',
                transform: `translate(-50%, -50%) rotate(${i * 36 + 18}deg) translateY(-100px)`,
              }}
              animate={{
                backgroundColor: color,
                scaleY: [0.95, 1.15, 0.85, 0.95],
                opacity: [0.25, 0.35, 0.25, 0.25],
              }}
              transition={{
                backgroundColor: { duration: 2.2, ease: "easeInOut" },
                scaleY: { duration: 6 - (i % 2), repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 6 - (i % 2), repeat: Infinity, ease: "easeInOut" }
              }}
            />
          ))}
        </motion.div>

        {/* Layer 3: Central Ambient Core Pulse */}
        <motion.div
          animate={{
            backgroundColor: activePalette[0],
            scale: [0.85, 1.15, 0.85],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            backgroundColor: { duration: 2.2, ease: "easeInOut" },
            scale: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 7, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute w-96 h-96 rounded-full blur-[70px]"
        />
        
        {/* Layer 4: Extremely subtle crisp concentric circles for a spatial target look */}
        <div className="absolute w-[320px] h-[320px] rounded-full border border-gray-950/[0.03] -z-10" />
        <div className="absolute w-[480px] h-[480px] rounded-full border border-gray-950/[0.015] -z-10" />
      </div>
    </div>
  );
};


export const LandingHero: React.FC<LandingHeroProps> = ({ onStart }) => {
  const { language, t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative space-y-16 py-4 md:py-8 overflow-hidden min-h-screen">
      
      {/* Dynamic Ambient Background Glow Orbs */}
      <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none -z-20">
        {!isMobile ? (
          <>
            <motion.div 
              animate={{
                x: [0, 45, -25, 0],
                y: [0, -35, 25, 0],
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-brand-primary/20 blur-[110px]"
            />
            <motion.div 
              animate={{
                x: [0, -35, 35, 0],
                y: [0, 45, -45, 0],
              }}
              transition={{
                duration: 19,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-60 right-[15%] w-96 h-96 rounded-full bg-brand-secondary/25 blur-[130px]"
            />
            <motion.div 
              animate={{
                x: [0, 50, -35, 0],
                y: [0, 25, 55, 0],
              }}
              transition={{
                duration: 23,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-40 left-[20%] w-80 h-80 rounded-full bg-indigo-500/15 blur-[120px]"
            />
            <motion.div 
              animate={{
                x: [0, -45, 25, 0],
                y: [0, -55, 25, 0],
              }}
              transition={{
                duration: 21,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-10 right-[25%] w-85 h-85 rounded-full bg-pink-500/15 blur-[110px]"
            />
          </>
        ) : (
          /* Simple, static lightweight orbs for mobile - zero frame processing and dynamic layout repaints */
          <>
            <div className="absolute top-20 left-[5%] w-52 h-52 rounded-full bg-brand-primary/10 blur-[80px]" />
            <div className="absolute top-60 right-[10%] w-64 h-64 rounded-full bg-brand-secondary/12 blur-[90px]" />
            <div className="absolute bottom-32 left-[10%] w-56 h-56 rounded-full bg-indigo-500/8 blur-[80px]" />
          </>
        )}
      </div>

      {/* 1. Hero Title Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6 px-4 md:px-0 relative z-10 overflow-visible min-h-[calc(100vh-9rem)] sm:min-h-[calc(100vh-12rem)] flex flex-col justify-center items-center pb-12 sm:pb-16">
        <VarnaColorRaysBackdrop />
        <motion.div 
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-brand-primary/15 via-rose-500/10 to-brand-secondary/15 border border-brand-primary/25 rounded-full text-brand-primary text-xs font-bold uppercase tracking-wider font-mono shadow-sm"
        >
          <Sparkles size={14} className="animate-pulse text-brand-secondary" />
          <span>{t.varnaColorRaysTag}</span>
        </motion.div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tight leading-tight text-gray-950">
          <span className="bg-gradient-to-r from-brand-primary via-[#FF7043] to-brand-secondary bg-clip-text text-transparent">
            {t.trueColors}
          </span> <br />
          <span className="relative inline-block text-gray-900 mt-1">
            {t.bestAlly}
            <span className="absolute left-0 right-0 bottom-2 h-4 sm:h-5 bg-gradient-to-r from-brand-primary/25 via-pink-400/20 to-brand-secondary/25 rounded-full -z-10" />
          </span>
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-2xl mx-auto font-semibold leading-relaxed">
          {t.heroIntro}
        </p>

        {/* Primary CTA */}
        <div className="pt-4">
          <motion.button 
            whileHover={{ scale: 1.03, boxShadow: "0 20px 30px -10px rgba(255,110,64,0.3)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="inline-flex items-center gap-3.5 px-8 py-4 sm:px-9 sm:py-5 bg-gradient-to-r from-gray-900 via-gray-850 to-gray-950 text-white rounded-3xl font-bold text-base sm:text-lg shadow-2xl shadow-gray-950/20 hover:text-[#FFA726] transition-all cursor-pointer group"
          >
            <span>{t.startBtn}</span>
            <ArrowRight size={20} className="text-brand-primary group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>



      {/* Archetypes & Mascots Showcase Section - Premium Character Showcase */}
      <div className="space-y-12 w-full relative z-10">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-2.5">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono">
            {t.exploreArchetypesTag || "THE 12 ARCHETYPES"}
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 leading-tight">
            {t.exploreArchetypesTitle || "Discover Your Color Archetype"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto font-semibold leading-relaxed">
            {t.exploreArchetypesSub || "We map your natural traits onto 12 fine-tuned seasons and persona archetypes. Explore the beautiful ecosystem below."}
          </p>
        </div>

        <div className="w-full">
          {[
            { 
              key: 'Spring', 
              bgClass: 'from-[#EBF8F0] via-[#FCFBE5] to-[#E3F7EB]', 
              glowClass: 'bg-emerald-400/12', 
              tagBg: 'bg-emerald-50/80 text-emerald-800 border-emerald-100/50',
              accentColor: 'text-emerald-950',
              seasonNature: t.seasonSpringNature || 'Warm & Bright'
            },
            { 
              key: 'Summer', 
              bgClass: 'from-[#E6F0FA] via-[#FAEDF6] to-[#E4EEFA]', 
              glowClass: 'bg-sky-400/10', 
              tagBg: 'bg-indigo-50/80 text-indigo-800 border-indigo-100/50',
              accentColor: 'text-indigo-950',
              seasonNature: t.seasonSummerNature || 'Cool & Soft'
            },
            { 
              key: 'Autumn', 
              bgClass: 'from-[#FBF1E6] via-[#FCFAF0] to-[#FCE7D9]', 
              glowClass: 'bg-amber-400/12', 
              tagBg: 'bg-orange-50/80 text-orange-800 border-orange-100/50',
              accentColor: 'text-orange-950',
              seasonNature: t.seasonAutumnNature || 'Warm & Muted'
            },
            { 
              key: 'Winter', 
              bgClass: 'from-[#E1ECFD] via-[#F0F5FE] to-[#E5EDFC]', 
              glowClass: 'bg-blue-400/10', 
              tagBg: 'bg-blue-50/80 text-blue-800 border-blue-100/50',
              accentColor: 'text-blue-950',
              seasonNature: t.seasonWinterNature || 'Cool & Brilliant'
            }
          ].map((season) => {
            let seasonName = "";
            if (season.key === 'Spring') {
              seasonName = t.seasonSpringName || 'Spring';
            } else if (season.key === 'Summer') {
              seasonName = t.seasonSummerName || 'Summer';
            } else if (season.key === 'Autumn') {
              seasonName = t.seasonAutumnName || 'Autumn';
            } else if (season.key === 'Winter') {
              seasonName = t.seasonWinterName || 'Winter';
            }

            const seasonArchetypes = (archetypes.color_archetypes as any)[season.key] || {};

            return (
              <div 
                key={season.key} 
                className={`w-full bg-gradient-to-r ${season.bgClass} animate-gradient-bg py-16 sm:py-24 relative overflow-hidden`}
              >
                {/* 16Personalities style large faint backdrop watermark name - positioned physically higher so it is readable and not fully blocked */}
                <div className="absolute top-10 sm:top-14 left-0 right-0 flex justify-center select-none pointer-events-none z-0 w-full px-4 overflow-hidden">
                  <span className="font-display font-black text-[13vw] sm:text-8xl md:text-[10rem] lg:text-[12rem] tracking-[0.06em] sm:tracking-[0.12em] leading-none uppercase text-white/60 text-center whitespace-nowrap block">
                    {seasonName}
                  </span>
                </div>

                {/* Mascot profiles with float animations, pedestal shadows, and glowing backlights */}
                <div className="max-w-5xl mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-y-16 gap-x-10 sm:gap-x-12 pt-16 sm:pt-20">
                  {Object.entries(seasonArchetypes).map(([fullName, data]: [string, any]) => {
                    const nicknameLower = data.nickname.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
                    
                    const parts = fullName.split(' ');
                    const subPart = parts[0]; 
                    const seasonPart = parts[1] || ''; 
                    
                    const subTypeMap: Record<string, string> = {
                      'Bright': t.subTypeBright || 'Bright',
                      'True': t.subTypeTrue || 'True',
                      'Dark': t.subTypeDark || 'Dark',
                      'Light': t.subTypeLight || 'Light',
                      'Soft': t.subTypeSoft || 'Soft'
                    };
                    const seasonMap: Record<string, string> = {
                      'Spring': t.seasonSpringName || 'Spring',
                      'Summer': t.seasonSummerName || 'Summer',
                      'Autumn': t.seasonAutumnName || 'Autumn',
                      'Winter': t.seasonWinterName || 'Winter'
                    };
                    const localizedFullName = `${subTypeMap[subPart] || subPart} ${seasonMap[seasonPart] || seasonPart}`;

                    return (
                      <div 
                        key={fullName} 
                        className="transition-all duration-300 group flex flex-col items-center text-center h-full focus:outline-none select-none relative z-10"
                      >
                        {/* Elegant Mascot Frame - crop transparent spacing & zoom */}
                        <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto relative flex items-end justify-center mb-5">
                          {/* Ambient radial color glow background of standard premium layouts */}
                          <div className={`absolute inset-2 rounded-full blur-2xl opacity-80 scale-90 ${season.glowClass} transition-transform duration-500 group-hover:scale-110`} />
                          
                          {/* Radial floor pedestal shadow under floating character */}
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-2 bg-black/[0.08] blur-[5px] rounded-full transition-all duration-500 group-hover:w-20 group-hover:opacity-45" />

                          {/* Mascot with float on hover */}
                          <img 
                            src={`/mascot/${nicknameLower}.png`}
                            alt={data.nickname}
                            className="w-36 h-36 object-contain max-w-none relative z-10 select-none pointer-events-none scale-[1.35] transform transition-all duration-500 group-hover:scale-[1.45] group-hover:-translate-y-3"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        
                        {/* Text Information block with balanced typography */}
                        <div className="space-y-2 pointer-events-none">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF8A65] uppercase leading-none block">
                              {localizedFullName}
                            </span>
                            <h4 className="text-xl font-display font-black text-gray-950 leading-snug transition-colors duration-300 group-hover:text-brand-primary">
                              {data.nickname}
                            </h4>
                          </div>
                          
                          <p className="text-xs text-gray-650 font-semibold leading-relaxed max-w-[240px] mx-auto line-clamp-3">
                            {data.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Complete System Feature Grid */}
      <div className="space-y-10 max-w-5xl mx-auto px-4 relative z-10">
        <div className="text-center space-y-3">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono">
            {t.analyticalEngineTag}
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900">{t.featuresTitle}</h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto font-semibold">
            {t.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1: Seasonal Analysis */}
          <div className="p-6 bg-white hover:bg-gradient-to-b hover:from-white hover:to-[#FF8A65]/5 rounded-[2rem] border border-black/5 hover:border-brand-primary/20 transition-all flex flex-col justify-between space-y-6 shadow-sm group">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-pink-50 text-brand-primary rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <Palette size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-display">{t.feat1Title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                {t.feat1Desc}
              </p>
            </div>
            {/* Visual colored swatches grid */}
            <div className="flex gap-2 bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-100 items-center justify-between">
              <span className="text-[9px] font-bold text-gray-400 font-mono">CHROMA:</span>
              <div className="flex gap-1">
                <span className="w-4.5 h-4.5 rounded-full bg-[#FA5C96] block shadow-sm border border-white" />
                <span className="w-4.5 h-4.5 rounded-full bg-[#20B09E] block shadow-sm border border-white" />
                <span className="w-4.5 h-4.5 rounded-full bg-[#FABD50] block shadow-sm border border-white" />
                <span className="w-4.5 h-4.5 rounded-full bg-[#7D4EA0] block shadow-sm border border-white" />
              </div>
            </div>
          </div>

          {/* Feature 2: Face Shape */}
          <div className="p-6 bg-white hover:bg-gradient-to-b hover:from-white hover:to-brand-secondary/5 rounded-[2rem] border border-black/5 hover:border-brand-secondary/20 transition-all flex flex-col justify-between space-y-6 shadow-sm group">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-brand-secondary rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <Smile size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-display">{t.feat2Title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                {t.feat2Desc}
              </p>
            </div>
            <div className="flex bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-100 items-center justify-between">
              <span className="text-[9px] font-bold text-brand-secondary font-mono uppercase tracking-wider">Geometric Analytics</span>
              <span className="text-[10px] font-black text-gray-400 font-mono">LIVE MAPPING</span>
            </div>
          </div>

          {/* Feature 3: Glasses Frames */}
          <div className="p-6 bg-white hover:bg-gradient-to-b hover:from-white hover:to-amber-500/5 rounded-[2rem] border border-black/5 hover:border-amber-500/20 transition-all flex flex-col justify-between space-y-6 shadow-sm group">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <Glasses size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-display">{t.feat3Title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                {t.feat3Desc}
              </p>
            </div>
            <div className="flex bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-100 items-center justify-between">
              <span className="text-[9px] font-bold text-amber-600 font-mono uppercase">Optical Showcase</span>
              <span className="text-[10px] font-black text-gray-400 font-mono">AXIS FIT</span>
            </div>
          </div>

          {/* Feature 4: Cosmetics */}
          <div className="p-6 bg-white hover:bg-gradient-to-b hover:from-white hover:to-purple-500/5 rounded-[2rem] border border-black/5 hover:border-purple-500/20 transition-all flex flex-col justify-between space-y-6 shadow-sm group">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <Heart size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-display">{t.feat4Title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                {t.feat4Desc}
              </p>
            </div>
            {/* Visual swatches inline */}
            <div className="flex gap-1.5 bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-100 items-center justify-between">
              <span className="text-[9px] font-bold text-purple-600 font-mono uppercase">Colors:</span>
              <div className="flex gap-1">
                <span className="w-4 h-4 rounded-full bg-[#E54B64] block shadow-sm border border-white" />
                <span className="w-4 h-4 rounded-full bg-[#FA9A9C] block shadow-sm border border-white" />
                <span className="w-4 h-4 rounded-full bg-[#DCA988] block shadow-sm border border-white" />
              </div>
            </div>
          </div>

          {/* Feature 5: Glow Me Up */}
          <div className="p-6 bg-white hover:bg-gradient-to-b hover:from-white hover:to-amber-500/5 rounded-[2rem] border border-black/5 hover:border-amber-500/20 transition-all flex flex-col justify-between space-y-6 shadow-sm group">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <Sparkles size={24} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 font-display">{t.feat5Title}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white font-mono animate-pulse">
                  {language === 'id' ? 'BARU' : 'NEW'}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                {t.feat5Desc}
              </p>
            </div>
            <div className="flex bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-100 items-center justify-between">
              <span className="text-[9px] font-bold text-amber-600 font-mono uppercase">Interactive Try-on</span>
              <span className="text-[10px] font-bold text-emerald-600 font-mono flex items-center gap-1">
                <Sparkles size={10} className="text-amber-500 animate-pulse" /> AI POWERED
              </span>
            </div>
          </div>

          {/* Feature 6: Stylize Me */}
          <div className="p-6 bg-white hover:bg-gradient-to-b hover:from-white hover:to-rose-500/5 rounded-[2rem] border border-black/5 hover:border-rose-500/20 transition-all flex flex-col justify-between space-y-6 shadow-sm group">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <Share2 size={24} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 font-display">{t.feat6Title}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-500 border border-neutral-200 font-mono">
                  {language === 'id' ? 'DIRENCANAKAN' : 'IN PLANNING'}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                {t.feat6Desc}
              </p>
            </div>
            <div className="flex bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-100 items-center justify-between">
              <span className="text-[9px] font-bold text-rose-600 font-mono uppercase">Wardrobe & Style</span>
              <span className="text-[10px] font-bold text-purple-600 font-mono">COMING SOON</span>
            </div>
          </div>

        </div>
      </div>

      {/* 5. Bottom Secondary Call to Action Card with colorful aura gradient */}
      <div className="relative text-center pt-8 max-w-2xl mx-auto space-y-6 px-4 z-10">
        <div className="absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-brand-primary via-pink-400 to-brand-secondary opacity-30 blur-2xl -z-10" />
        
        <div className="bg-white/90 backdrop-blur-xl border border-black/5 p-8 sm:p-10 rounded-[2.5rem] shadow-xl space-y-4">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-gray-950">
            {t.uncoverChemistryQuery}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed font-semibold">
            {t.uncoverChemistrySub}
          </p>
          <div className="pt-2">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="px-8 py-4 bg-brand-primary text-white hover:bg-brand-primary/95 rounded-2xl font-bold flex items-center gap-2 mx-auto justify-center cursor-pointer shadow-lg shadow-brand-primary/10 hover:scale-[1.01] transition-all text-sm"
            >
              <span>{t.beginFreeScan}</span>
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>
      </div>

    </div>
  );
};
