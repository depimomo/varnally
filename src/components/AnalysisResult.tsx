import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trash2, Check } from 'lucide-react';
import { Analysis } from '../types';
import archetypes from '../data/archetypes.json';
import { ColorDrape } from './ColorDrape';
import { ObservationCard } from './ObservationCard';
import { FaceArchitectureCard } from './FaceArchitectureCard';
import { GlassesRecommendationCard } from './GlassesRecommendationCard';
import { MakeupRecommendationCard } from './MakeupRecommendationCard';
import { ResultHeader } from './ResultHeader';
import { ShareablePoster } from './ShareablePoster';

interface AnalysisResultProps {
  result: Analysis;
  user: any;
  loading: boolean;
  previewUrl: string | null;
  onBack: () => void;
  onSave: () => void;
  getFaceShapeImage: (shape: string) => string;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  user,
  loading,
  previewUrl,
  onBack,
  onSave,
  getFaceShapeImage
}) => {
  const [isPosterOpen, setIsPosterOpen] = React.useState(false);
  const borderColors = (archetypes.color_archetypes as any)[result.season]?.[`${result.subType} ${result.season}`]?.border || [];
  const defaultBorderColors = ["A8BD37","EFB45C","F3BF39","E88957","E06625","D53A21","B14720","8A78A8","5AA78F","4E9743"];
  const activeColors = borderColors.length > 0 ? borderColors : defaultBorderColors;

  // Repeat the colors so that the rays are exactly 20 in total
  let twentyColors: string[] = [];
  if (activeColors.length > 0) {
    while (twentyColors.length < 20) {
      twentyColors = twentyColors.concat(activeColors);
    }
    twentyColors = twentyColors.slice(0, 20);
  } else {
    twentyColors = Array(20).fill("A8BD37");
  }

  const conicGradientParts = twentyColors.map((color: string, index: number) => {
    const startPercent = (index / twentyColors.length) * 100;
    const endPercent = ((index + 1) / twentyColors.length) * 100;
    const hex = color.startsWith('#') ? color : `#${color}`;
    return `${hex} ${startPercent}% ${endPercent}%`;
  });
  const conicGradientStyle = `conic-gradient(from 0deg at 50% 50%, ${conicGradientParts.join(', ')})`;

  // Curve color formula based on season input
  const getSeasonTheme = (seasonInput: string) => {
    const s = (seasonInput || '').toLowerCase();
    if (s.includes('spring') || s.includes('vasanta')) {
      return {
        name: 'Spring',
        displayGradient: 'from-amber-400 via-[#FF7043] to-rose-400',
        shadowColor: 'shadow-orange-400/20',
        cardBg: 'bg-white/80 backdrop-blur-xl bg-gradient-to-tr from-white via-white/95 to-[#FFF8E1]/30',
        cardBorder: 'sm:border-[#FFE0B2]/60',
        badgeStyle: 'bg-amber-150 text-amber-800 border-amber-200/50',
        textAccent: 'text-amber-600',
        titleTagColor: 'text-amber-600 bg-amber-50 border-amber-200',
        glowOrbs: [
          'bg-[#FF8A65]/10 top-20 left-[10%]',
          'bg-[#FFD54F]/12 top-[40%] right-[5%]',
          'bg-[#81C784]/8 bottom-10 left-[20%]',
          'bg-rose-400/8 bottom-[35%] right-[15%]'
        ]
      };
    } else if (s.includes('summer') || s.includes('grishma')) {
      return {
        name: 'Summer',
        displayGradient: 'from-sky-450 via-[#9C8EB9] to-pink-400',
        shadowColor: 'shadow-sky-500/20',
        cardBg: 'bg-white/80 backdrop-blur-xl bg-gradient-to-tr from-white via-white/95 to-[#E1F5FE]/35',
        cardBorder: 'sm:border-[#B3E5FC]/60',
        badgeStyle: 'bg-sky-100 text-sky-800 border-sky-200/50',
        textAccent: 'text-sky-600',
        titleTagColor: 'text-sky-600 bg-sky-50 border-sky-100',
        glowOrbs: [
          'bg-[#B3E5FC]/12 top-20 left-[10%]',
          'bg-[#E1BEE7]/10 top-[40%] right-[5%]',
          'bg-[#F8BBD0]/8 bottom-10 left-[20%]',
          'bg-blue-400/8 bottom-[35%] right-[15%]'
        ]
      };
    } else if (s.includes('autumn') || s.includes('sharad')) {
      return {
        name: 'Autumn',
        displayGradient: 'from-[#8D5A2B] via-[#D84315] to-[#F57C00]',
        shadowColor: 'shadow-orange-700/20',
        cardBg: 'bg-white/80 backdrop-blur-xl bg-gradient-to-tr from-white via-white/95 to-[#EFEBE9]/45',
        cardBorder: 'sm:border-[#D7CCC8]/60',
        badgeStyle: 'bg-orange-100 text-orange-800 border-orange-200/50',
        textAccent: 'text-orange-600',
        titleTagColor: 'text-orange-700 bg-orange-50 border-orange-200',
        glowOrbs: [
          'bg-[#FFCC80]/12 top-20 left-[10%]',
          'bg-[#D7CCC8]/10 top-[40%] right-[5%]',
          'bg-[#C5E1A5]/8 bottom-10 left-[20%]',
          'bg-amber-400/6 bottom-[35%] right-[15%]'
        ]
      };
    } else {
      // Winter
      return {
        name: 'Winter',
        displayGradient: 'from-[#1A237E] via-[#283593] to-[#880E4F]',
        shadowColor: 'shadow-indigo-950/20',
        cardBg: 'bg-white/80 backdrop-blur-xl bg-gradient-to-tr from-white via-white/95 to-[#E8EAF6]/35',
        cardBorder: 'sm:border-[#C5CAE9]/60',
        badgeStyle: 'bg-indigo-100 text-indigo-800 border-indigo-200/50',
        textAccent: 'text-indigo-600',
        titleTagColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        glowOrbs: [
          'bg-[#C5CAE9]/12 top-20 left-[10%]',
          'bg-[#F8BBD0]/8 top-[40%] right-[5%]',
          'bg-[#B2DFDB]/8 bottom-10 left-[20%]',
          'bg-indigo-400/8 bottom-[35%] right-[15%]'
        ]
      };
    }
  };

  const theme = getSeasonTheme(result.season);

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-8 relative"
    >
      {/* Absolute Season Backdrop Glow Orbs */}
      <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none -z-20">
        {theme.glowOrbs.map((orbClass, idx) => (
          <div 
            key={idx} 
            className={`absolute w-80 h-80 rounded-full blur-[110px] ${orbClass}`} 
          />
        ))}
      </div>

      <ResultHeader
        isLoading={loading}
        canSave={!result.id}
        onBack={onBack}
        onSave={onSave}
        onShareStory={() => setIsPosterOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Photo & Details */}
        <div className="lg:col-span-4 space-y-6">
          <div 
            className="aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl relative p-10 flex items-center justify-center bg-white"
            style={{ backgroundImage: conicGradientStyle }}
          >
            {/* White base behind oval to prevent transparent spots */}
            <div className="absolute inset-10 bg-white rounded-full scale-[1.01] shadow-lg" style={{ borderRadius: '50% / 50%' }} />

            {/* Ellipse masked picture */}
            <div 
              className="absolute inset-10 overflow-hidden"
              style={{ 
                borderRadius: '50% / 50%',
              }}
            >
              <img
                src={result.cleanedImageUrl || previewUrl || result.imageUrl || ''}
                alt="Analyzed face"
                className="w-full h-full object-cover select-none scale-105"
              />
            </div>

            {/* Inner groove contour shadow representing frame glass/inset */}
            <div 
              className="absolute inset-10 pointer-events-none border border-black/5 shadow-[inset_0_4px_16px_rgba(0,0,0,0.15)] animate-fade-in"
              style={{
                borderRadius: '50% / 50%',
              }}
            />
          </div>

          {/* Your Varna Section with stunning dynamic gradient */}
          {(archetypes.color_archetypes as any)[result.season]?.[`${result.subType} ${result.season}`] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${theme.displayGradient} p-8 rounded-[2rem] shadow-xl ${theme.shadowColor} text-white relative overflow-hidden`}
            >
              <div className="absolute -right-4 -top-4 opacity-20">
                <Sparkles size={100} />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-white/90 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Sparkles size={14} className="animate-spin" />
                  <span>Your Verified Varna Map</span>
                </div>

                <div>
                  <h3 className="text-3xl font-display font-black leading-tight drop-shadow-sm">
                    {(archetypes.color_archetypes as any)[result.season][`${result.subType} ${result.season}`].nickname}
                  </h3>
                </div>

                <p className="text-sm font-medium text-white/90 leading-relaxed italic">
                  "{(archetypes.color_archetypes as any)[result.season][`${result.subType} ${result.season}`].description}"
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider">{result.season}</span>
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider">{result.subType}</span>
                  <span className={`px-2.5 py-1 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider ${result.jewelry === 'Gold' ? 'bg-amber-400/40 text-amber-50' : 'bg-slate-300/40 text-slate-50'}`}>
                    {result.jewelry}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <ObservationCard
            skinUndertone={result.skinUndertone}
            eyeColor={result.eyeColor}
            hairColor={result.hairColor}
            className={`bg-transparent sm:${theme.cardBg} sm:border ${theme.cardBorder}`}
          />
        </div>

        {/* Right Column: Palette & Best/Worst */}
        <div className="lg:col-span-8 space-y-8">
          <div className={`bg-transparent sm:${theme.cardBg} p-0 sm:p-6 md:p-8 rounded-none sm:rounded-[2.5rem] border-0 sm:border ${theme.cardBorder} shadow-none sm:shadow-sm space-y-6 overflow-hidden`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest font-mono">
                  Approved Palette
                </p>
                <h2 className="text-xl sm:text-2xl font-display font-medium text-gray-900 flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-extrabold shadow-sm">✓</span>
                  Best Colors to Wear
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-2">
              {(result.bestColors || []).map((color, idx) => (
                <ColorDrape key={idx} color={color} imageUrl={result.cleanedImageUrl || previewUrl || result.imageUrl || null} />
              ))}
            </div>
          </div>

          <div className={`bg-transparent sm:${theme.cardBg} p-0 sm:p-6 md:p-8 rounded-none sm:rounded-[2.5rem] border-0 sm:border ${theme.cardBorder} shadow-none sm:shadow-sm space-y-6 overflow-hidden`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest font-mono">
                  Clashing Shades
                </p>
                <h2 className="text-xl sm:text-2xl font-display font-medium text-gray-900 flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-rose-50 text-rose-600 rounded-lg text-sm font-extrabold shadow-sm">✕</span>
                  Colors to Avoid
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-2">
              {(result.avoidColors || []).map((color, idx) => (
                <ColorDrape key={idx} color={color} imageUrl={result.cleanedImageUrl || previewUrl || result.imageUrl || null} />
              ))}
            </div>
          </div>

          <MakeupRecommendationCard 
            season={result.season as any} 
            subType={result.subType} 
            className={`bg-transparent sm:${theme.cardBg} sm:border ${theme.cardBorder}`}
          />

          <FaceArchitectureCard
            faceShape={result.faceShape}
            faceShapeDescription={result.faceShapeDescription}
            imageUrl={getFaceShapeImage(result.faceShape)}
            className={`bg-transparent sm:${theme.cardBg} sm:border ${theme.cardBorder}`}
          />

          <GlassesRecommendationCard 
            faceShape={result.faceShape} 
            className={`bg-transparent sm:${theme.cardBg} sm:border ${theme.cardBorder}`}
          />
        </div>
      </div>

      <ShareablePoster
        isOpen={isPosterOpen}
        onClose={() => setIsPosterOpen(false)}
        result={result}
        previewUrl={previewUrl}
        getFaceShapeImage={getFaceShapeImage}
      />
    </motion.div>
  );
};
