import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Palette, 
  Smile, 
  Glasses, 
  Heart, 
  UserCheck, 
  ArrowRight,
  Compass,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';

interface LandingHeroProps {
  onStart: () => void;
}

// Seasonal Archetypes with color recipes for the Interactive Varna Spectrum Dock
const SEASONS_DATA = [
  {
    id: 'spring',
    name: 'Spring',
    nature: 'Warm & Bright',
    description: 'Fresh, radiant shades resembling early sunrise, buttercups, and peach blossoms.',
    gradient: 'from-[#FF8A65]/20 via-[#FFD54F]/20 to-[#81C784]/20',
    border: 'border-[#FFB300]/30',
    tagColor: 'text-amber-600 bg-amber-50 border-amber-200',
    colors: [
      { hex: '#FF6B6B', name: 'Coral Poppy' },
      { hex: '#FFBE0B', name: 'Golden Marigold' },
      { hex: '#3A86C8', name: 'Sky Cerulean' },
      { hex: '#06D6A0', name: 'Young Mint' },
      { hex: '#FF9F1C', name: 'Warm Apricot' }
    ]
  },
  {
    id: 'summer',
    name: 'Summer',
    nature: 'Cool & Soft',
    description: 'Chilled, sea-washed pastels, hazy lavender mountains, and soft powdered roses.',
    gradient: 'from-[#B3E5FC]/20 via-[#E1BEE7]/20 to-[#F8BBD0]/20',
    border: 'border-[#0288D1]/20',
    tagColor: 'text-sky-600 bg-sky-50 border-sky-100',
    colors: [
      { hex: '#B39DDB', name: 'Wisteria Mist' },
      { hex: '#90CAF9', name: 'Powder Breeze' },
      { hex: '#F06292', name: 'Orchid Petal' },
      { hex: '#80CBC4', name: 'Ocean Sage' },
      { hex: '#E0F7FA', name: 'Glacier Blue' }
    ]
  },
  {
    id: 'autumn',
    name: 'Autumn',
    nature: 'Warm & Muted',
    description: 'Rich earthy values, spiced cinnamon, toasted terracotta, and olive forest canopies.',
    gradient: 'from-[#FFCC80]/20 via-[#D7CCC8]/20 to-[#C5E1A5]/20',
    border: 'border-[#E65100]/30',
    tagColor: 'text-orange-700 bg-orange-50 border-orange-250',
    colors: [
      { hex: '#D84315', name: 'Spiced Clay' },
      { hex: '#5D4037', name: 'Toasted Pecan' },
      { hex: '#F57C00', name: 'Saffron Crust' },
      { hex: '#558B2F', name: 'Indian Olive' },
      { hex: '#D4AF37', name: 'Antique Brass' }
    ]
  },
  {
    id: 'winter',
    name: 'Winter',
    nature: 'Cool & Deep',
    description: 'Bold, high-contrast jewel shades of midnight cobalt, royal magenta, and icy platinum.',
    gradient: 'from-[#C5CAE9]/20 via-[#F8BBD0]/20 to-[#B2DFDB]/20',
    border: 'border-[#3F51B5]/30',
    tagColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    colors: [
      { hex: '#1A237E', name: 'Vedic Indigo' },
      { hex: '#880E4F', name: 'Royal Plum' },
      { hex: '#006064', name: 'Deep Emerald' },
      { hex: '#ECEFF1', name: 'Siberian Ash' },
      { hex: '#D500F9', name: 'Laser Fuchsia' }
    ]
  }
];

export const LandingHero: React.FC<LandingHeroProps> = ({ onStart }) => {
  const [selectedSeason, setSelectedSeason] = useState(SEASONS_DATA[0]);

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
      <div className="text-center max-w-4xl mx-auto space-y-6 px-4 md:px-0 relative z-10">
        <motion.div 
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center gap-2.5 px-4_5 py-2 px-2 bg-gradient-to-r from-brand-primary/15 via-rose-500/10 to-brand-secondary/15 border border-brand-primary/25 rounded-full text-brand-primary text-xs font-bold uppercase tracking-wider font-mono shadow-sm"
        >
          <Sparkles size={14} className="animate-pulse text-brand-secondary" />
          <span>Formulating Your Personal Harmony</span>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-tight text-gray-950">
          <span className="bg-gradient-to-r from-brand-primary via-[#FF7043] to-brand-secondary bg-clip-text text-transparent">Your true colors,</span> <br />
          <span className="relative inline-block text-gray-900 mt-1">
            your best ally.
            <span className="absolute left-0 right-0 bottom-2 h-4 sm:h-5 bg-gradient-to-r from-brand-primary/25 via-pink-400/20 to-brand-secondary/25 rounded-full -z-10" />
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-550 max-w-2xl mx-auto font-medium leading-relaxed">
          Discover the custom micro-pigmentation science & anatomical balance calculated uniquely for you. Find the signature palettes and frame contours designed to celebrate your authentic self.
        </p>

        {/* Primary CTA */}
        <div className="pt-4">
          <motion.button 
            whileHover={{ scale: 1.03, boxShadow: "0 20px 30px -10px rgba(255,110,64,0.3)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="inline-flex items-center gap-3.5 px-9 py-5 bg-gradient-to-r from-gray-900 via-gray-850 to-gray-950 text-white rounded-3xl font-bold text-lg shadow-2xl shadow-gray-950/20 hover:text-[#FFA726] transition-all cursor-pointer group"
          >
            <span>Scan My Varna Spectrum</span>
            <ArrowRight size={20} className="text-brand-primary group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>

      {/* 2. Interactive Varna Spectrum Dock */}
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-[2.5rem] shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest font-mono">Taste of the Science</p>
              <h3 className="text-xl font-bold text-gray-900 font-display">Interactive Season Spectrum</h3>
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
                  {season.name.split(' ')[0]}
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
              <div className="md:col-span-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${selectedSeason.tagColor}`}>
                    {selectedSeason.nature}
                  </span>
                </div>
                <h4 className="text-lg font-black text-gray-900 font-display">{selectedSeason.name}</h4>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {selectedSeason.description}
                </p>
              </div>

              {/* Dynamic Color Waves */}
              <div className="md:col-span-7 grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-5 gap-4 md:gap-3">
                {selectedSeason.colors.map((c, i) => (
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
                      {c.name}
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
        <div className="space-y-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-brand-primary to-orange-400 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-brand-primary/25">
            ✨
          </div>
          <h3 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">
            Styling Confidence
          </h3>
          <p className="text-xs text-gray-650 leading-relaxed font-semibold">
            Stop guessing lipstick keys, hair tints, or jackets that leave you feeling washed out. Locking down your precise season alignment saves you time and secures total wardrobe certainty.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#00A09E] to-teal-400 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-brand-secondary/25">
            📐
          </div>
          <h3 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">
            Geometric Equilibrium
          </h3>
          <p className="text-xs text-gray-650 leading-relaxed font-semibold">
            Your face is a beautiful biological machine of lines, ratios, and anchors. We define your structural parameters to isolate the matching glasses shapes that balance your chin and cheeckbones.
          </p>
        </div>

        <div className="space-y-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#714990] to-pink-500 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-purple-500/25">
            🪞
          </div>
          <h3 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">
            Origins of Varna
          </h3>
          <p className="text-xs text-gray-650 leading-relaxed font-semibold">
            Our brand pays tribute to the term <strong>Varna</strong> (Sanskrit for color and light spectrum). We don't paint a generic cover on your beautiful facial base—we empower your native organic shades.
          </p>
        </div>
      </div>

      {/* 4. Complete System Feature Grid */}
      <div className="space-y-10 max-w-5xl mx-auto px-4 relative z-10">
        <div className="text-center space-y-3">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono">Precision Analytical Engine</p>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-gray-900">What Varnally Maps for You</h2>
          <p className="text-sm text-gray-550 max-w-lg mx-auto">
            Our intelligent multi-dimensional vision layout runs real pixel color calibration, chroma profiling, and facial boundary geometry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1: Seasonal Analysis */}
          <div className="p-6 bg-white hover:bg-gradient-to-b hover:from-white hover:to-[#FF8A65]/5 rounded-[2rem] border border-black/5 hover:border-brand-primary/20 transition-all flex flex-col justify-between space-y-6 shadow-sm group">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-pink-50 text-brand-primary rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <Palette size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-display">12-Seasonal Spectrum Analysis</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                Maps your skin's dominant undertone, eye value contrast, and color intensity boundaries to place you in deep categories (e.g. Deep Autumn, Bright Spring).
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
              <h3 className="text-lg font-bold text-gray-900 font-display">Face Geometry Mapping</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                Uses landmark boundary calculations to evaluate the curves and angles in your facial contour (Oval, Square, Round, Heart, Oblong, Diamond).
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
              <h3 className="text-lg font-bold text-gray-900 font-display">Counter-Balancing Frames</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                Recommends glasses structures using structural offset logic. Rounds out sharp squares, and adds crisp boundaries to soft oval profiles.
              </p>
            </div>
            <div className="flex bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-100 items-center justify-between">
              <span className="text-[9px] font-bold text-amber-600 font-mono uppercase">Optical Showcase</span>
              <span className="text-[10px] font-black text-gray-400 font-mono">AXIS FIT</span>
            </div>
          </div>

          {/* Feature 4: Cosmetics (2-columns wide for spectacular impact!) */}
          <div className="p-6 bg-white hover:bg-gradient-to-b hover:from-white hover:to-purple-500/5 rounded-[2rem] border border-black/5 hover:border-purple-500/20 transition-all flex flex-col justify-between space-y-6 shadow-sm group lg:col-span-2">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <Heart size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-display">Smart Cosmetics Blueprint</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                Formulates your custom makeup colors instantly: provides exactly 3 perfect lipsticks, 3 high-contrast eyeshadows, 3 blushers, and matching foundation bases configured for your season.
              </p>
            </div>
            {/* Visual Makeup Shade Swatches grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
              <div className="p-2 bg-red-500/5 border border-red-500/10 rounded-xl text-center">
                <div className="w-4 h-4 rounded-full bg-[#E54B64] mx-auto mb-1 shadow-sm" />
                <span className="text-[8px] font-bold text-red-700 block text-center uppercase">Lipsticks</span>
              </div>
              <div className="p-2 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center">
                <div className="w-4 h-4 rounded-full bg-[#DCA988] mx-auto mb-1 shadow-sm" />
                <span className="text-[8px] font-bold text-amber-700 block text-center uppercase">Eyeshadows</span>
              </div>
              <div className="p-2 bg-pink-500/5 border border-pink-500/10 rounded-xl text-center">
                <div className="w-4 h-4 rounded-full bg-[#FA9A9C] mx-auto mb-1 shadow-sm" />
                <span className="text-[8px] font-bold text-pink-700 block text-center uppercase">Blushers</span>
              </div>
              <div className="p-2 bg-[#FF7043]/5 border border-[#FF7043]/10 rounded-xl text-center">
                <div className="w-4 h-4 rounded-full bg-[#E1C2A5] mx-auto mb-1 shadow-sm" />
                <span className="text-[8px] font-bold text-[#E56A47] block text-center uppercase">Foundations</span>
              </div>
            </div>
          </div>

          {/* Feature 5: Smart Profile Clarifier */}
          <div className="p-6 bg-white hover:bg-gradient-to-b hover:from-white hover:to-sky-500/5 rounded-[2rem] border border-black/5 hover:border-sky-500/20 transition-all flex flex-col justify-between space-y-6 shadow-sm group">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <UserCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-display">Smart Background Cleanse</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                Minimizes background visual interference automatically keying your facial portrait, producing a clear passport color-neutral template.
              </p>
            </div>
            <div className="flex bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-100 items-center justify-between">
              <span className="text-[9px] font-bold text-sky-600 font-mono uppercase">AI Neutralization</span>
              <span className="text-[10px] font-bold text-emerald-600 font-mono">ACTIVE</span>
            </div>
          </div>

        </div>
      </div>

      {/* 5. Bottom Secondary Call to Action Card with colorful aura gradient */}
      <div className="relative text-center pt-8 max-w-2xl mx-auto space-y-6 px-4 z-10">
        <div className="absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-brand-primary via-pink-400 to-brand-secondary opacity-30 blur-2xl -z-10" />
        
        <div className="bg-white/90 backdrop-blur-xl border border-black/5 p-8 sm:p-10 rounded-[2.5rem] shadow-xl space-y-4">
          <h3 className="text-2xl sm:text-3xl font-display font-black text-gray-950">Ready to uncover your true aesthetic chemistry?</h3>
          <p className="text-sm text-gray-550 max-w-md mx-auto leading-relaxed">
            Take or upload a natural-light portrait selfie. It takes just seconds to isolate your unique Varna map coordinates.
          </p>
          <div className="pt-2">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="px-8 py-4 bg-brand-primary text-white hover:bg-brand-primary/95 rounded-2xl font-bold flex items-center gap-2 mx-auto justify-center cursor-pointer shadow-lg shadow-brand-primary/10 hover:scale-[1.01] transition-all text-sm"
            >
              <span>Begin Free Discovery Scan</span>
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>
      </div>

    </div>
  );
};
