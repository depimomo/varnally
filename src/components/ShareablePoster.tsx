import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Sparkles, AlertCircle, Camera, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Analysis } from '../types';
import archetypes from '../data/archetypes.json';
import makeupPresetsData from '../data/makeup_presets.json';
import { useLanguage } from '../lib/LanguageContext';
import { getFormattedVarnaTitle } from '../lib/varnaUtils';

interface ShareablePosterProps {
  isOpen: boolean;
  onClose: () => void;
  result: Analysis;
  previewUrl: string | null;
  getFaceShapeImage: (shape: string) => string;
}

export const ShareablePoster: React.FC<ShareablePosterProps> = ({
  isOpen,
  onClose,
  result,
  previewUrl,
  getFaceShapeImage
}) => {
  const { language, t } = useLanguage();
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [captureError, setCaptureError] = React.useState<string | null>(null);
  const posterRef = React.useRef<HTMLDivElement>(null);

  // Parse color rays for conic gradient frame
  const borderColors = (archetypes.color_archetypes as any)[result.season]?.[`${result.subType} ${result.season}`]?.border || [];
  const defaultBorderColors = ["A8BD37","EFB45C","F3BF39","E88957","E06625","D53A21","B14720","8A78A8","5AA78F","4E9743"];
  const activeColors = borderColors.length > 0 ? borderColors : defaultBorderColors;

  let twentyColors: string[] = [];
  while (twentyColors.length < 20) {
    twentyColors = twentyColors.concat(activeColors);
  }
  twentyColors = twentyColors.slice(0, 20);

  const conicGradientParts = twentyColors.map((color: string, index: number) => {
    const startPercent = (index / twentyColors.length) * 100;
    const endPercent = ((index + 1) / twentyColors.length) * 100;
    const hex = color.startsWith('#') ? color : `#${color}`;
    return `${hex} ${startPercent}% ${endPercent}%`;
  });
  const conicGradientStyle = `conic-gradient(from 0deg at 50% 50%, ${conicGradientParts.join(', ')})`;

  // Determine season gradient background for the poster
  const getSeasonBackdrop = (seasonInput: string) => {
    const s = (seasonInput || '').toLowerCase();
    if (s.includes('spring') || s.includes('vasanta')) {
      return {
        bg: 'from-amber-500 via-rose-500 to-amber-600',
        badge: 'bg-amber-400/90 text-white',
        textTheme: 'text-amber-300'
      };
    } else if (s.includes('summer') || s.includes('grishma')) {
      return {
        bg: 'from-sky-700 via-indigo-900 to-pink-700',
        badge: 'bg-sky-400/90 text-white',
        textTheme: 'text-sky-300'
      };
    } else if (s.includes('autumn') || s.includes('sharad')) {
      return {
        bg: 'from-[#6E3C1A] via-[#A83D1B] to-[#42220F]',
        badge: 'bg-orange-500/90 text-white',
        textTheme: 'text-orange-400'
      };
    } else {
      return {
        bg: 'from-slate-900 via-indigo-950 to-purple-950',
        badge: 'bg-indigo-500/90 text-white',
        textTheme: 'text-indigo-400'
      };
    }
  };

  const backdrop = getSeasonBackdrop(result.season);
  
  // Localize archetype nickname
  const rawArchetype = (archetypes.color_archetypes as any)[result.season]?.[`${result.subType} ${result.season}`];
  let displayName = rawArchetype?.nickname || `${result.subType} ${result.season}`;
  let displayDesc = rawArchetype?.description || "";

  // Resolve makeup colors
  const fullType = `${result.subType} ${result.season}`;
  const makeupDetails = (makeupPresetsData as any)[fullType] || (makeupPresetsData as any)["True Winter"];

  // Slice swatches to look clean on Instagram Story
  const bestColorsList = (result.bestColors || []).slice(0, 4);
  const avoidColorsList = (result.avoidColors || []).slice(0, 4);

  const handleCapture = async () => {
    if (!posterRef.current) return;
    
    // Backup and temporarily remove style rules containing unsupported oklab / oklch functions
    const restoredRules: { sheet: CSSStyleSheet; index: number; cssText: string }[] = [];
    try {
      const sheets = Array.from(document.styleSheets);
      for (const sheet of sheets) {
        try {
          if (!sheet.cssRules) continue;
          const rules = Array.from(sheet.cssRules);
          for (let i = rules.length - 1; i >= 0; i--) {
            const rule = rules[i];
            if (rule.cssText.includes('oklch') || rule.cssText.includes('oklab')) {
              restoredRules.push({ sheet, index: i, cssText: rule.cssText });
              sheet.deleteRule(i);
            }
          }
        } catch (e) {
          // Cross-origin sheets can throw errors, ignore them safely
        }
      }
    } catch (e) {
      console.warn("Could not sanitize stylesheets:", e);
    }

    try {
      setIsCapturing(true);
      setCaptureError(null);

      // Force high resolution capture of the story poster
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        scale: 3, // 3x multiplier is crystal clear
        logging: false,
        backgroundColor: '#111827',
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Varna_Spectra_${result.season}_${result.subType}.png`;
      link.click();
      setIsCapturing(false);
    } catch (err) {
      console.error("Poster capture failed:", err);
      setCaptureError(t.screenshotBlocked);
      setIsCapturing(false);
    } finally {
      // Re-insert rules back in reverse order
      for (const item of restoredRules.reverse()) {
        try {
          item.sheet.insertRule(item.cssText, item.index);
        } catch (e) {
          console.warn("Failed to restore rule:", e);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 overflow-y-auto flex flex-col bg-gradient-to-br ${backdrop.bg} md:bg-none md:bg-neutral-950`}>
        {/* Modal Outer Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="relative max-w-5xl w-full mx-auto md:bg-neutral-900 md:border md:border-neutral-800 md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row md:my-8 h-full md:h-auto md:max-h-[850px]"
        >
          {/* Desktop Close Button in top right */}
          <div className="hidden md:block absolute top-4 right-4 z-40">
            <button 
              onClick={onClose} 
              className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-full transition-all cursor-pointer border border-neutral-700/60"
            >
              <X size={18} />
            </button>
          </div>

          {/* Left Panel: Preview & Info (Interactive Controls) */}
          <div className="hidden md:flex flex-1 p-6 md:p-8 flex-col justify-between overflow-y-auto border-r border-neutral-800 text-white">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono">
                  ✨ STORY MAKER
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {t.readyToExport}
                </span>
              </div>

              <h2 className="text-2xl font-display font-black text-white tracking-tight">
                {t.instagramStoryPoster}
              </h2>

              <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                {t.savePosterDesc}
              </p>

              {captureError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex gap-2 items-start">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{captureError}</span>
                </div>
              )}
            </div>

            <div className="pt-6">
              <div className="text-center bg-neutral-950/45 p-4 rounded-2xl border border-neutral-800/60 shadow-inner">
                <span className="text-[10.5px] text-neutral-400 font-mono uppercase tracking-wider block leading-relaxed font-semibold">
                  {t.screenshotTip}
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Portrait Poster view (Locks onto exact 9:16 ratio) */}
          <div className="flex-1 bg-transparent md:bg-black p-4 flex flex-col items-center overflow-y-auto relative min-h-screen md:min-h-0 justify-start md:justify-center">
            
            {/* Aspect lock box (The Shareable Poster) */}
            <div 
              style={{ contentVisibility: 'auto' }}
              className="w-[340px] h-[604px] min-w-[340px] aspect-[9/16] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-neutral-800 scale-[0.9] sm:scale-100 origin-top md:origin-center mt-4 md:my-auto shrink-0"
            >
              {/* Instagram Story Target Frame */}
              <div 
                ref={posterRef}
                style={{ width: '340px', height: '604px' }}
                className={`bg-gradient-to-br ${backdrop.bg} p-5 relative flex flex-col justify-between text-white select-none overflow-hidden`}
              >
                {/* Atmospheric Glow */}
                <div className="absolute inset-0 bg-neutral-950/20 mix-blend-multiply" />
                <div className="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-brand-primary/25 rounded-full blur-3xl" />

                {/* Poster Content Grid */}
                <div className="relative z-10 w-full flex-1 flex flex-col justify-between">
                  
                  {/* Top Bar Label */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/90 font-mono">
                      ✨ {getFormattedVarnaTitle(result.name, language).toUpperCase()}
                    </span>
                    <span className="text-[8px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full uppercase font-mono text-white">
                      {"Seasonal Profile"}
                    </span>
                  </div>

                  {/* Portrait & Mascot Side by Side */}
                  <div className="flex justify-center items-center gap-6 my-2">
                    {/* Circle Portrait wrapped in conic color drape */}
                    <div 
                      className="w-28 h-28 rounded-full overflow-hidden relative flex items-center justify-center p-2.5 shadow-xl bg-white/10 shrink-0"
                      style={{ backgroundImage: conicGradientStyle }}
                    >
                      {/* Base shadow ellipse */}
                      <div className="absolute inset-1.5 bg-white rounded-full scale-[1.01]" />
                      <div className="absolute inset-1.5 overflow-hidden rounded-full">
                        <img
                          src={result.cleanedImageUrl || previewUrl || result.imageUrl || ''}
                          alt="Face sample profile"
                          className="w-full h-full object-cover select-none scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute inset-1.5 pointer-events-none rounded-full border border-black/5 shadow-[inset_0_3px_8px_rgba(0,0,0,0.15)]" />
                    </div>

                    {/* Mascot Character Image */}
                    {rawArchetype?.nickname && (
                      <div className="w-24 h-28 flex items-center justify-center relative shrink-0 overflow-hidden">
                        <img 
                          src={`/mascot/${rawArchetype.nickname.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_')}.png`}
                          alt={rawArchetype.nickname}
                          className="w-36 h-36 object-contain relative z-10 select-none pointer-events-none scale-[1.35]"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                   {/* Archetype Title & Tagline */}
                  <div className="text-center space-y-1 py-1">
                    <div className="flex justify-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-extrabold bg-neutral-900/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full uppercase text-white tracking-widest border border-white/10">
                        {fullType}
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-black leading-tight drop-shadow-md text-white mt-1">
                      {displayName}
                    </h3>
                    <p className="text-[9.5px] text-white/90 leading-relaxed font-semibold max-w-[280px] mx-auto line-clamp-2 px-2 italic">
                      "{displayDesc || 'Your custom pigmentation mapped under raw sunlight colors.'}"
                    </p>
                  </div>

                  {/* Core Swatches Row */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {/* Best Colors */}
                    <div className="bg-white/95 border border-white/20 p-2 px-2.5 rounded-2xl flex flex-col justify-between text-gray-900 shadow-sm">
                      <span className="text-[8px] font-black tracking-wider text-emerald-700 font-mono uppercase block mb-1">
                        {t.balancingPalette}
                      </span>
                      <div className="flex gap-1.5 justify-around py-0.5">
                        {bestColorsList.map((color, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div 
                               className="w-7 h-7 rounded-full border border-black/10 shadow-sm relative"
                               style={{ backgroundColor: color.hex }}
                            >
                              <div className="absolute top-0.5 left-0.5 w-1.5 h-0.5 bg-white/25 rounded-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Avoid Colors */}
                    <div className="bg-white/95 border border-white/20 p-2 px-2.5 rounded-2xl flex flex-col justify-between text-gray-900 shadow-sm">
                      <span className="text-[8px] font-black tracking-wider text-rose-700 font-mono uppercase block mb-1">
                        {t.avoidClashesColors}
                      </span>
                      <div className="flex gap-1.5 justify-around py-0.5">
                        {avoidColorsList.map((color, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div 
                               className="w-7 h-7 rounded-full border border-black/10 shadow-sm relative"
                               style={{ backgroundColor: color.hex }}
                            >
                              <div className="absolute top-0.5 left-0.5 w-1.5 h-0.5 bg-white/25 rounded-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Makeup Swatches & Face Shape */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    
                    {/* Mini Makeup Palette */}
                    <div className="bg-white/95 border border-white/20 p-2 rounded-2xl flex flex-col gap-1.5 justify-between text-gray-900 shadow-sm animate-fade-in">
                      <span className="text-[8px] font-black tracking-wider text-pink-700 font-mono uppercase block">
                        💄 {t.makeupColors}
                      </span>

                      <div className="grid grid-cols-3 gap-y-1.5 gap-x-1.5">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: makeupDetails?.lipColors?.[0]?.hex || '#FFEBE0' }} />
                          <span className="text-[6.5px] text-gray-500 font-mono font-bold scale-90">{t.lip}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: makeupDetails?.blushes?.[0]?.hex || '#FFEBE0' }} />
                          <span className="text-[6.5px] text-gray-500 font-mono font-bold scale-90">{t.blush}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: makeupDetails?.eyeshadows?.[0]?.hex || '#FFEBE0' }} />
                          <span className="text-[6.5px] text-gray-500 font-mono font-bold scale-90">{t.eye}</span>
                        </div>

                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: makeupDetails?.lipColors?.[1]?.hex || '#E9C0A9' }} />
                          <span className="text-[6.5px] text-gray-500 font-mono font-bold scale-90">{t.lip}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: makeupDetails?.blushes?.[1]?.hex || '#FF8CA3' }} />
                          <span className="text-[6.5px] text-gray-500 font-mono font-bold scale-90">{t.blush}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: makeupDetails?.eyeshadows?.[1]?.hex || '#3A3B3C' }} />
                          <span className="text-[6.5px] text-gray-500 font-mono font-bold scale-90">{t.eye}</span>
                        </div>
                      </div>
                    </div>

                    {/* Face Shape / Glasses Recommended Image Only */}
                    <div className="bg-white/95 border border-white/20 rounded-2xl relative flex flex-col justify-between p-2 text-gray-900 shadow-sm">
                      <div className="flex items-center justify-between z-10">
                        <span className="text-[7.5px] font-black tracking-wider text-neutral-500 font-mono uppercase">
                          👓 {t.frame} {result.faceShape}
                        </span>
                      </div>

                      {/* Best Glasses image */}
                      <div className="w-full h-14 flex items-center justify-center py-1.5 shrink-0">
                        <img 
                          src={`/glasses/glasses_${result.faceShape.toLowerCase()}.png`}
                          alt="Best Glass Style"
                          className="w-auto max-w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Brand watermark footer */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/10 mt-2">
                    <div className="flex items-center gap-1">
                      <Sparkles size={10} className="text-white/60" />
                      <span className="text-[8px] text-white/60 font-bold">{t.tryNow}</span>
                    </div>
                    <span className="text-[7.5px] font-mono text-white/40 tracking-wider">
                      tinyurl.com/varnally
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* Mobile Actions and screenshot tip */}
            <div className="md:hidden w-full max-w-[340px] mt-8 mb-16 px-4 shrink-0 flex flex-col gap-4 z-20">
              <div className="text-center bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800/80 shadow-md">
                <span className="text-[10.5px] text-neutral-300 font-mono uppercase leading-relaxed tracking-wider block font-semibold">
                  {t.screenshotTip}
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 rounded-2xl font-black text-xs tracking-widest uppercase transition-all active:scale-98 cursor-pointer border border-neutral-700/50"
              >
                {t.backToResults}
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
