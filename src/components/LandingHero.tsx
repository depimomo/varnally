import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
const SEASONS_DATA = landingSeasons.seasons_data;
const DEFAULT_PALETTES = landingSeasons.default_palettes;

// Helper to translate core physical seasons definitions dynamically using localizations keys
const getLocalizedSeason = (season: any, t: any) => {
  const translations: Record<string, { name: string; nature: string; description: string }> = {
    'spring': {
      name: t.seasonSpringName || 'Spring',
      nature: t.seasonSpringNature || 'Warm & Bright',
      description: t.seasonSpringDesc || 'Fresh colors capturing the first morning sun light, crisp buttercup yellow, and warm peach tints.'
    },
    'summer': {
      name: t.seasonSummerName || 'Summer',
      nature: t.seasonSummerNature || 'Cool & Soft',
      description: t.seasonSummerDesc || 'Gentle pastel shades refreshed by ocean waters, misty lavender mountains, and powdery rose garden blossoms.'
    },
    'autumn': {
      name: t.seasonAutumnName || 'Autumn',
      nature: t.seasonAutumnNature || 'Warm & Muted',
      description: t.seasonAutumnDesc || 'Earthy tones capturing spiced cinnamon, baked terracotta, roasted pecan nuts, and olive tree leaves.'
    },
    'winter': {
      name: t.seasonWinterName || 'Winter',
      nature: t.seasonWinterNature || 'Cool & Brilliant',
      description: t.seasonWinterDesc || 'High-contrast vivid jewel tones like royal cobalt blue, deep royal crimson, and platinum glacier crystal.'
    }
  };
  const localized = translations[season.id];
  return localized ? { ...season, ...localized } : season;
};

const getBenefits = (t: any) => {
  return [
    {
      emoji: "✨",
      title: t.benefit1Title || "Styling Confidence",
      desc: t.benefit1Desc || "Stop guessing lipstick keys, hair tints, or jackets that leave you feeling washed out. Locking down your precise season alignment saves you time and secures total wardrobe certainty."
    },
    {
      emoji: "📐",
      title: t.benefit2Title || "Geometric Equilibrium",
      desc: t.benefit2Desc || "Your face is a beautiful biological machine of lines, ratios, and anchors. We define your structural parameters to isolate the matching glasses shapes that balance your chin and cheekbones."
    },
    {
      emoji: "🪞",
      title: t.benefit3Title || "Origins of Varna",
      desc: t.benefit3Desc || "Our brand pays tribute to the term Varna (Sanskrit for color and light spectrum). We don't paint a generic cover on your beautiful facial base—we empower your native organic shades."
    }
  ];
};

const getLocalizedColorName = (name: string, t: any) => {
  const map: Record<string, string> = {
    'Young Mint': t.colorYoungMint || 'Young Mint',
    'Golden Marigold': t.colorGoldenMarigold || 'Golden Marigold',
    'Coral Poppy': t.colorCoralPoppy || 'Coral Poppy',
    'Powder Breeze': t.colorPowderBreeze || 'Powder Breeze',
    'Toasted Pecan': t.colorToastedPecan || 'Toasted Pecan',
    'Spiced Clay': t.colorSpicedClay || 'Spiced Clay',
  };
  return map[name] || name;
};

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

  useEffect(() => {
    const timer = setInterval(() => {
      setPaletteIndex((prev) => (prev + 1) % 4);
    }, 4550);
    return () => clearInterval(timer);
  }, []);

  const activePalette = PALETTES[paletteIndex] || DEFAULT_PALETTES[0];

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
  const { t } = useLanguage();
  const [selectedSeason, setSelectedSeason] = useState(SEASONS_DATA[0]);

  const activeSeasonTranslated = getLocalizedSeason(selectedSeason, t);
  const benefits = getBenefits(t);

  return (
    <div className="relative space-y-16 py-4 md:py-8 overflow-hidden min-h-screen">
      
      {/* Dynamic Ambient Background Glow Orbs */}
      <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none -z-20">
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
      </div>

      {/* 1. Hero Title Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6 px-4 md:px-0 relative z-10 overflow-visible">
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

      {/* 2. Interactive Varna Spectrum Dock */}
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-[2.5rem] shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest font-mono">
                {t.tasteOfScienceTag}
              </p>
              <h3 className="text-xl font-bold text-gray-900 font-display">{t.varnaDockTitle}</h3>
            </div>
            {/* Tab buttons */}
            <div className="flex flex-wrap gap-1 bg-gray-100/80 p-1 rounded-2xl">
              {SEASONS_DATA.map((season) => (
                <button
                  key={season.id}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSeason.id === season.id 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {season.name}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSeason.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`p-6 rounded-[2rem] bg-gradient-to-tr ${selectedSeason.gradient} border ${selectedSeason.border} grid grid-cols-1 md:grid-cols-12 gap-6 items-center`}
            >
              <div className="md:col-span-12 lg:col-span-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${selectedSeason.tagColor}`}>
                    {activeSeasonTranslated.nature}
                  </span>
                </div>
                <h4 className="text-lg font-black text-gray-900 font-display">{activeSeasonTranslated.name}</h4>
                <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                  {activeSeasonTranslated.description}
                </p>
              </div>

              {/* Dynamic Color Waves */}
              <div className="md:col-span-12 lg:col-span-7 grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-5 gap-4 md:gap-3 font-mono">
                {selectedSeason.colors.map((c: any, i: number) => (
                  <motion.div 
                    key={c.name}
                    whileHover={{ y: -6, scale: 1.04 }}
                    className="flex flex-col items-center gap-2 cursor-pointer pt-2 group"
                  >
                    <div 
                      className="w-12 h-12 rounded-2xl shadow-md border-2 border-white/80 transition-all duration-300 group-hover:shadow-lg relative"
                      style={{ backgroundColor: c.hex }}
                    >
                      {/* Highlight reflection */}
                      <div className="absolute top-1 left-1.5 w-3 h-1.5 bg-white/25 rounded-full blur-[0.5px]" />
                    </div>
                    <span className="text-[10px] sm:text-[9px] font-bold text-gray-800 text-center tracking-tight leading-tight w-full px-1 break-normal">
                      {getLocalizedColorName(c.name, t)}
                    </span>
                    <span className="text-[9px] sm:text-[8px] font-mono text-gray-400 uppercase select-all">
                      {c.hex}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Education / Benefits Block */}
      <div className="bg-gradient-to-br from-white/90 via-white/70 to-white/40 backdrop-blur-md border border-black/5 rounded-[3rem] p-8 md:p-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 shadow-lg relative z-10">
        {benefits.map((benefit, index) => (
          <div key={index} className="space-y-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-brand-primary to-orange-400 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">
              {benefit.emoji}
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">
              {benefit.title}
            </h3>
            <p className="text-xs text-gray-650 leading-relaxed font-semibold">
              {benefit.desc}
            </p>
          </div>
        ))}
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

          {/* Feature 5: Saved Varna Records */}
          <div className="p-6 bg-white hover:bg-gradient-to-b hover:from-white hover:to-sky-500/5 rounded-[2rem] border border-black/5 hover:border-sky-500/20 transition-all flex flex-col justify-between space-y-6 shadow-sm group">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <History size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-display">{t.feat5Title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                {t.feat5Desc}
              </p>
            </div>
            <div className="flex bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-100 items-center justify-between">
              <span className="text-[9px] font-bold text-sky-600 font-mono uppercase">Local database</span>
              <span className="text-[10px] font-bold text-emerald-600 font-mono">PERSISTED</span>
            </div>
          </div>

          {/* Feature 6: Custom Shareable Poster */}
          <div className="p-6 bg-white hover:bg-gradient-to-b hover:from-white hover:to-rose-500/5 rounded-[2rem] border border-black/5 hover:border-rose-500/20 transition-all flex flex-col justify-between space-y-6 shadow-sm group">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <Share2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-display">{t.feat6Title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                {t.feat6Desc}
              </p>
            </div>
            <div className="flex bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-100 items-center justify-between">
              <span className="text-[9px] font-bold text-rose-600 font-mono uppercase">Ready to share</span>
              <span className="text-[10px] font-bold text-purple-600 font-mono">9:16 RATIO</span>
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
