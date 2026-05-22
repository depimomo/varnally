import React from 'react';
import { motion } from 'motion/react';
import { Eye, Heart, Sparkles } from 'lucide-react';
import makeupPresetsData from '../data/makeup_presets.json';

interface ColorSpec {
  hex: string;
  name: string;
}

interface MakeupData {
  finish: string;
  foundationDescription: string;
  foundationSwatches: { name: string; hex: string }[];
  lipColors: ColorSpec[];
  eyeshadows: ColorSpec[];
  blushes: ColorSpec[];
}

const MAKEUP_PRESETS = makeupPresetsData as Record<string, MakeupData>;

interface MakeupRecommendationCardProps {
  season: 'Winter' | 'Spring' | 'Summer' | 'Autumn';
  subType: string;
}

export const MakeupRecommendationCard: React.FC<MakeupRecommendationCardProps> = ({ season, subType }) => {
  const fullType = `${subType} ${season}`;
  const makeupDetails = MAKEUP_PRESETS[fullType] || MAKEUP_PRESETS["True Winter"]; // safe fallback

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      id="makeup-recommendation-card"
      className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-black/5 shadow-sm space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono">Expert Cosmetics Map</p>
          <h2 className="text-2xl font-display font-medium text-gray-900 flex items-center gap-2">
            <Sparkles className="text-brand-primary animate-pulse" size={22} />
            Your Suitable Makeup Artistry
          </h2>
        </div>
        <div className="inline-flex self-start sm:self-auto items-center px-4 py-1.5 bg-brand-primary/5 border border-brand-primary/10 rounded-full text-xs font-bold text-brand-primary">
          Ideal Finish: {makeupDetails.finish}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 1. Foundation & Base Frame */}
        <div id="makeup-base-section" className="bg-neutral-50/50 p-6 rounded-3xl border border-neutral-100 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">STEP 1: BASE FOUNDATION</p>
            <h3 className="text-base font-bold text-gray-850">Skin Shade & Finish Blueprint</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              {makeupDetails.foundationDescription}
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-450 uppercase tracking-widest">Recommended Skin Reference Swatches</p>
            <div className="grid grid-cols-3 gap-3">
              {makeupDetails.foundationSwatches.map((swatch, idx) => (
                <div key={idx} className="flex flex-col items-center p-2.5 bg-white border border-neutral-100 rounded-2xl shadow-sm space-y-2">
                  <div 
                    className="w-10 h-10 rounded-full border border-black/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-800 line-clamp-1">{swatch.name}</p>
                    <p className="text-[8px] font-mono text-gray-400 font-bold uppercase">{swatch.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Lipstick Frame */}
        <div id="makeup-lipstick-section" className="bg-neutral-50/50 p-6 rounded-3xl border border-neutral-100 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">STEP 2: LIP ARTISTRY</p>
            <h3 className="text-base font-bold text-gray-850">3 Handpicked Suitable Lipsticks</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Accentuate yours with distinct intensity levels. Recommended finishes include hydrating cream lipsticks, light glossy stains, or vibrant liquid velvets.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {makeupDetails.lipColors.map((lip, idx) => (
              <div key={idx} className="flex flex-col items-center p-2.5 bg-white border border-neutral-100 rounded-2xl shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-full relative overflow-hidden border border-black/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                  {/* Styled like a real lip swipe color block with dual gradient */}
                  <div 
                    className="absolute inset-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${lip.hex} 0%, ${lip.hex}dd 100%)`
                    }}
                  />
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10" />
                </div>
                <div className="text-center w-full">
                  <p className="text-[10px] font-bold text-gray-800 line-clamp-1 h-3.5 leading-none">{lip.name}</p>
                  <p className="text-[8px] font-mono text-gray-400 font-bold uppercase mt-1">{lip.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Eyeshadow Frame */}
        <div id="makeup-eyeshadow-section" className="bg-neutral-50/50 p-6 rounded-3xl border border-neutral-100 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Eye size={12} className="text-brand-primary" />
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">STEP 3: EYE DEFINE</p>
            </div>
            <h3 className="text-base font-bold text-gray-850">3 Harmonious Eyeshadow Pans</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Create exquisite dimensions using customized gradients that make your natural base color pop instantly.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {makeupDetails.eyeshadows.map((eye, idx) => (
              <div key={idx} className="flex flex-col items-center p-2.5 bg-white border border-neutral-100 rounded-2xl shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-full relative overflow-hidden border border-black/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.15)] flex items-center justify-center p-0.5" style={{ background: '#222' }}>
                  {/* Realistic eyeshadow pan look */}
                  <div 
                    className="w-full h-full rounded-full transition-transform"
                    style={{ 
                      background: `radial-gradient(circle at 35% 35%, ${eye.hex}eb 0%, ${eye.hex} 80%, #000 120%)`,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                    }}
                  />
                </div>
                <div className="text-center w-full">
                  <p className="text-[10px] font-bold text-gray-800 line-clamp-1 h-3.5 leading-none">{eye.name}</p>
                  <p className="text-[8px] font-mono text-gray-400 font-bold uppercase mt-1">{eye.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Blush On Frame */}
        <div id="makeup-blush-section" className="bg-neutral-50/50 p-6 rounded-3xl border border-neutral-100 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Heart size={12} className="text-brand-primary" />
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">STEP 4: BLUSH & FLUSH</p>
            </div>
            <h3 className="text-base font-bold text-gray-850">3 Radiating Cheek Blushers</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Soft dustings of warm apricot, cool berry, or silky rose blushers to shape and contour your natural bone structures.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {makeupDetails.blushes.map((blush, idx) => (
              <div key={idx} className="flex flex-col items-center p-2.5 bg-white border border-neutral-100 rounded-2xl shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-full relative overflow-hidden flex items-center justify-center">
                  {/* Soft powder-buff appearance with radial blur styling */}
                  <div 
                    className="w-8 h-8 rounded-full blur-[2px] opacity-90"
                    style={{ 
                      background: `radial-gradient(circle, ${blush.hex} 0%, ${blush.hex}dd 70%, transparent 100%)`
                    }}
                  />
                </div>
                <div className="text-center w-full">
                  <p className="text-[10px] font-bold text-gray-800 line-clamp-1 h-3.5 leading-none">{blush.name}</p>
                  <p className="text-[8px] font-mono text-gray-400 font-bold uppercase mt-1">{blush.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
};
