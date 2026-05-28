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
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import archetypes from '../data/archetypes.json';
import landingSeasons from '../data/landing_seasons.json';

interface LandingHeroProps {
  onStart: () => void;
  onGlowMeUp?: () => void;
  onStylizeMe?: () => void;
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


export const LandingHero: React.FC<LandingHeroProps> = ({ onStart, onGlowMeUp, onStylizeMe }) => {
  const { language, t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [clickedStyle, setClickedStyle] = useState<'left' | 'right' | null>(null);

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

        </div>
      </div>

      {/* 4.5 Varnally Hub Showcase Section */}
      <div className="space-y-16 max-w-6xl mx-auto px-4 relative z-10 pt-14 pb-10">
        
        {/* Playful Ambient Background Blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
          <div className="absolute top-1/4 left-10 w-80 h-80 bg-amber-300/25 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-rose-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[60%] left-1/3 w-64 h-64 bg-indigo-300/15 rounded-full blur-[70px]" />
        </div>

        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 shadow-sm animate-bounce">
            <span className="w-2 h-2 rounded-full bg-brand-secondary animate-ping" />
            <span className="text-[10px] font-black text-brand-secondary uppercase tracking-widest font-mono">
              {language === 'id' ? 'TAMAN BERMAIN GAYA INTERAKTIF' : 'INTERACTIVE STYLING PLAYGROUND'}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tight uppercase">
            Varnally Hub
          </h2>
          <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto font-semibold leading-relaxed">
            {language === 'id' 
              ? 'Lepaskan batasan frame biasa! Eksplorasi fitur interaktif kami dengan desain melengkung organik yang dirancang khusus untuk kenyamanan visual Anda.'
              : 'Break free from rigid grids. Dive into our playful interactive sandboxes wrapped in responsive organic shapes and fluid energy.'}
          </p>
        </div>

        {/* Asymmetrical organic-shaped items */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Sub-section 1: Glow Me Up */}
          <div className="lg:col-span-6 p-8 md:p-10 bg-white/70 backdrop-blur-md rounded-[5rem_3rem_6rem_2.5rem] border-2 border-amber-300/40 hover:border-amber-400/70 shadow-[0_20px_50px_rgba(245,158,11,0.06)] hover:shadow-[0_30px_60px_rgba(245,158,11,0.12)] transition-all duration-500 flex flex-col justify-between space-y-8 relative overflow-hidden group">
            
            {/* Soft internal liquid background */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-100/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest font-mono flex items-center gap-1.5 bg-amber-100/60 px-3 py-1 rounded-full">
                  <Sparkles size={13} className="animate-spin text-amber-500" /> {language === 'id' ? 'COBA RIASAN' : 'MAKEUP TRY-ON'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-amber-500 text-white animate-pulse shadow-md shadow-amber-500/20">
                  {language === 'id' ? 'BARU' : 'NEW'}
                </span>
              </div>
              <h3 className="text-3xl font-black text-neutral-900 font-display tracking-tight flex items-center gap-2">
                Glow Me Up
              </h3>
              <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-semibold">
                {language === 'id'
                  ? 'Uji paduan riasan wajah terbaik Anda secara virtual dengan AI instan. Gunakan slider pembanding super mulus di bawah untuk mengamati perubahan menakjubkan pada wajah!'
                  : 'Immersive artificial cosmetics visualization. Slide left and right to inspect customized, hyper-realistic makeup overlays mapped perfectly over portrait geometries.'}
              </p>
            </div>

            {/* Slider container with custom surrounding fluid aesthetic */}
            <div className="w-full max-w-xs mx-auto space-y-3 select-none relative z-10">
              <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest font-mono text-neutral-500 px-2 bg-neutral-100/50 py-1.5 rounded-full border border-neutral-250/30">
                <span className="flex items-center gap-1.5 text-neutral-600">
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  {language === 'id' ? 'SEBELUM' : 'BEFORE'}
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  {language === 'id' ? 'SESUDAH' : 'AFTER'}
                </span>
              </div>

              {/* Interactive Dragging Slider inside an asymmetrical capsule */}
              <div className="aspect-[4/5] relative w-full rounded-[3.5rem_2rem_3rem_2.5rem] overflow-hidden border-2 border-amber-300 shadow-[0_15px_30px_rgba(0,0,0,0.08)] bg-neutral-100 group/slider touch-none">
                {/* Before Image */}
                <img
                  src="/sample/potrait.jpeg"
                  alt="Original Portrait"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  referrerPolicy="no-referrer"
                />

                {/* After Image (Clipped) */}
                <div 
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ 
                    clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` 
                  }}
                >
                  <img
                    src="/sample/potrait_after.png"
                    alt="Makeup Try-On Preview"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Divider Line & Handle */}
                <div 
                  className="absolute top-0 bottom-0 w-[3px] bg-gradient-to-b from-amber-400 to-amber-200 shadow-xl cursor-ew-resize z-2 pointer-events-none"
                  style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-amber-400 border-2 border-white shadow-2xl flex items-center justify-center text-white transition-transform duration-150 group-hover/slider:scale-110">
                    <span className="flex items-center gap-[2.5px]">
                      <span className="w-[3px] h-3.5 bg-white rounded-full" />
                      <span className="w-[3px] h-3.5 bg-white rounded-full" />
                    </span>
                  </div>
                </div>

                {/* Invisible input range overlay */}
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10 touch-none"
                  aria-label="Before/After interactive slider"
                />

                {sliderPos === 50 && (
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-mono px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-black pointer-events-none z-5 shadow-lg border border-amber-300 animate-bounce">
                    {language === 'id' ? '← GESER UNTUK COBA →' : '← SLIDE TO TRY →'}
                  </div>
                )}
              </div>
            </div>

            {/* Playful call-to-action button */}
            <div className="pt-2 text-center relative z-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGlowMeUp}
                className="w-full max-w-xs mx-auto py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 text-xs tracking-wider uppercase"
              >
                <span>{language === 'id' ? 'Coba Riasan Virtual ✧' : 'Launch Virtual Try-On ✧'}</span>
                <ArrowRight size={14} />
              </motion.button>
            </div>

          </div>

          {/* Sub-section 2: Stylize Me - with counter curves */}
          <div className="lg:col-span-6 p-8 md:p-10 bg-white/70 backdrop-blur-md rounded-[3rem_6rem_2.5rem_5rem] border-2 border-rose-300/40 hover:border-rose-400/70 shadow-[0_20px_50px_rgba(244,63,94,0.06)] hover:shadow-[0_30px_60px_rgba(244,63,94,0.12)] transition-all duration-500 flex flex-col justify-between space-y-8 relative overflow-hidden group">
            
            {/* Soft internal liquid background */}
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-rose-100/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-rose-600 uppercase tracking-widest font-mono flex items-center gap-1.5 bg-rose-100/60 px-3 py-1 rounded-full">
                  <Palette size={13} className="text-rose-500" /> {language === 'id' ? 'ASISTEN STYLING' : 'PERSONAL STYLIST'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20">
                  {language === 'id' ? 'TREN VIRAL 🔥' : 'HOT TREND 🔥'}
                </span>
              </div>
              <h3 className="text-3xl font-black text-neutral-900 font-display tracking-tight flex items-center gap-2">
                Stylize Me
              </h3>
              <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-semibold">
                {language === 'id'
                  ? 'Temukan harmoni busana impian secara presisi. Sangat disesuaikan dengan tipe warna kulit Anda sendiri guna menghindari kesalahan mix-and-match!'
                  : 'Establish perfect wardrobe synchronicities. Compare seasonal apparel options side-by-side to understand which styles amplify your glowing nature.'}
              </p>
            </div>

            {/* Speech Bubble Chat Style Question */}
            <div className="w-full max-w-xs mx-auto flex flex-col items-center pt-2 relative z-10">
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative w-full rounded-3xl p-4 text-xs text-center border font-bold transition-all duration-300 shadow-md ${
                  clickedStyle === null 
                    ? 'bg-gradient-to-r from-rose-50/80 to-amber-50/80 border-rose-100 text-rose-850' 
                    : clickedStyle === 'right'
                      ? 'bg-gradient-to-r from-emerald-50/95 to-teal-50/95 border-emerald-100 text-emerald-850'
                      : 'bg-gradient-to-r from-rose-50 to-rose-100/50 border-rose-200 text-rose-900'
                }`}
              >
                {clickedStyle === null ? (
                  <>
                    <p className="leading-relaxed text-[13px]">
                      {language === 'id' 
                        ? '✨ "Yang mana busana paling cocok untuk tipe warna Light Summer?"' 
                        : '✨ "Which style is most suitable for the Light Summer season?"'}
                    </p>
                    <span className="text-[9px] font-black tracking-wider uppercase text-rose-500/70 block mt-1.5 animate-pulse">
                      {language === 'id' ? '👉 Coba Tebak! Klik salah satu foto di bawah!' : '👉 Click an image below to guess!'}
                    </span>
                  </>
                ) : clickedStyle === 'right' ? (
                  <>
                    <p className="leading-relaxed text-[13px]">
                      {language === 'id'
                        ? '🎉 Benar Sekali! Tipe warna Light Summer bercahaya maksimal dengan warna cerah, dingin, dan lembut di kanan!'
                        : '🎉 Bingo! Light Summer seasonal palettes thrive with clear, light, cool-undertoned coordinates on the right!'}
                    </p>
                    <button 
                      type="button"
                      onClick={() => setClickedStyle(null)}
                      className="mt-2 text-[10px] font-black uppercase text-emerald-600 bg-white border border-emerald-200 px-3 py-1 rounded-full shadow-sm hover:bg-emerald-50 transition-colors cursor-pointer block mx-auto"
                    >
                      {language === 'id' ? 'Main Lagi ↺' : 'Try Another ↺'}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="leading-relaxed text-[13px]">
                      {language === 'id'
                        ? '😅 Belum Tepat! Warna baju kiri bertabrakan dengan rona alami Light Summer yang lembut, membuat kulit kusam.'
                        : '😅 Not matching! The heavy warm profile on the left clashes with delicate Light Summer hues, casting shadows.'}
                    </p>
                    <button 
                      type="button"
                      onClick={() => setClickedStyle(null)}
                      className="mt-2 text-[10px] font-black uppercase text-rose-600 bg-white border border-rose-200 px-3 py-1 rounded-full shadow-sm hover:bg-rose-50 transition-colors cursor-pointer block mx-auto"
                    >
                      {language === 'id' ? 'Coba Lagi ↺' : 'Try Again ↺'}
                    </button>
                  </>
                )}
                {/* Bubble speech tail orientation pointing downward */}
                <div className={`absolute top-full left-1/2 -translate-x-1/2 -translate-y-1.5 w-3.5 h-3.5 rotate-45 border-r border-b transition-colors duration-300 ${
                  clickedStyle === null 
                    ? 'bg-amber-50 border-rose-100' 
                    : clickedStyle === 'right'
                      ? 'bg-teal-50 border-emerald-100'
                      : 'bg-rose-100/50 border-rose-200'
                }`} />
              </motion.div>
            </div>

            {/* Stylize Me Comparison Row with asymmetric picture mounts */}
            <div className="w-full max-w-xs mx-auto grid grid-cols-2 gap-5 select-none pt-2 relative z-10">
              
              {/* Clashing style (style_1.webp) */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    if (clickedStyle === null) setClickedStyle('left');
                  }}
                  disabled={clickedStyle !== null}
                  className={`relative aspect-[4/5] rounded-[3rem_1.5rem_2rem_2.5rem] overflow-hidden border-2 bg-neutral-100 transition-all duration-300 text-left block w-full outline-none shadow-[0_10px_20px_rgba(0,0,0,0.06)] ${
                    clickedStyle === null 
                      ? 'border-neutral-200 hover:border-rose-400 hover:scale-[1.04] active:scale-95 cursor-pointer hover:shadow-lg' 
                      : clickedStyle === 'left'
                        ? 'border-rose-450 ring-4 ring-rose-500/20'
                        : 'border-neutral-200/50 opacity-50 filter grayscale'
                  }`}
                >
                  <img
                    src="/sample/style_1.webp"
                    alt="Clashing Style"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Subtle red overlay when answer is revealed */}
                  {clickedStyle !== null && (
                    <div className="absolute inset-0 bg-rose-500/10" />
                  )}

                  {/* Red X icon - revealed only after a selection has been made */}
                  {clickedStyle !== null && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute top-4 left-4 bg-rose-500 text-white p-1.5 rounded-full shadow-lg border border-white flex items-center justify-center"
                    >
                      <X size={15} className="stroke-[3.5px]" />
                    </motion.div>
                  )}
                </button>

                {/* Left Description Revealed after Click */}
                {clickedStyle !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-rose-50 py-1.5 px-2 rounded-2xl border border-rose-100/70"
                  >
                    <span className="text-[11px] font-mono font-black uppercase tracking-wider text-rose-600 block">
                      {language === 'id' ? 'Clashing' : 'Clashing Tone'}
                    </span>
                    <span className="text-[9px] text-neutral-500 font-semibold block mt-0.5">
                      {language === 'id' ? 'Kulit tampak kusam' : 'Slightly washes out'}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Matching style (style_2.webp) */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    if (clickedStyle === null) setClickedStyle('right');
                  }}
                  disabled={clickedStyle !== null}
                  className={`relative aspect-[4/5] rounded-[1.5rem_3rem_2.5rem_2rem] overflow-hidden border-2 bg-neutral-100 transition-all duration-300 text-left block w-full outline-none shadow-[0_10px_20px_rgba(0,0,0,0.06)] ${
                    clickedStyle === null 
                      ? 'border-neutral-200 hover:border-emerald-400 hover:scale-[1.04] active:scale-95 cursor-pointer hover:shadow-lg' 
                      : clickedStyle === 'right'
                        ? 'border-emerald-450 ring-4 ring-emerald-500/20 shadow-emerald-200'
                        : 'border-neutral-200/50 opacity-50 filter grayscale'
                  }`}
                >
                  <img
                    src="/sample/style_2.webp"
                    alt="Harmony Style"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Subtle green overlay when answer is revealed */}
                  {clickedStyle !== null && (
                    <div className="absolute inset-0 bg-emerald-500/5" />
                  )}

                  {/* Green check icon - revealed only after a selection has been made */}
                  {clickedStyle !== null && (
                    <motion.div 
                      initial={{ scale: 0, rotate: 45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute top-4 left-4 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border border-white flex items-center justify-center"
                    >
                      <Check size={15} className="stroke-[3.5px]" />
                    </motion.div>
                  )}
                </button>

                {/* Right Description Revealed after Click */}
                {clickedStyle !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-emerald-50 py-1.5 px-2 rounded-2xl border border-emerald-100/70"
                  >
                    <span className="text-[11px] font-mono font-black uppercase tracking-wider text-emerald-700 block">
                      {language === 'id' ? 'Harmonis!' : 'Perfect Gold!'}
                    </span>
                    <span className="text-[9px] text-neutral-500 font-semibold block mt-0.5">
                      {language === 'id' ? 'Instan bercahaya!' : 'Instantly illuminates!'}
                    </span>
                  </motion.div>
                )}
              </div>

            </div>

            {/* Playful call-to-action button */}
            <div className="pt-2 text-center relative z-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStylizeMe}
                className="w-full max-w-xs mx-auto py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-500/20 text-xs tracking-wider uppercase"
              >
                <span>{language === 'id' ? 'Coba Pilih Busana ✧' : 'Launch Style Matcher ✧'}</span>
                <ArrowRight size={14} />
              </motion.button>
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
