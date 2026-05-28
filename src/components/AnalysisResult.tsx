import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Share2, Star } from 'lucide-react';
import { Analysis } from '../types';
import archetypes from '../data/archetypes.json';
import { ColorDrape } from './ColorDrape';
import { ObservationCard } from './ObservationCard';
import { FaceArchitectureCard } from './FaceArchitectureCard';
import { GlassesRecommendationCard } from './GlassesRecommendationCard';
import { MakeupRecommendationCard } from './MakeupRecommendationCard';
import { ResultHeader } from './ResultHeader';
import { ShareablePoster } from './ShareablePoster';
import { useLanguage } from '../lib/LanguageContext';
import { getFormattedVarnaTitle } from '../lib/varnaUtils';

interface AnalysisResultProps {
  result: Analysis;
  user: any;
  loading: boolean;
  previewUrl: string | null;
  onBack: () => void;
  onSave: (shouldPin?: boolean) => void;
  onPin: (id: string) => void;
  getFaceShapeImage: (shape: string) => string;
  onGlowMeUp?: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  user,
  loading,
  previewUrl,
  onBack,
  onSave,
  onPin,
  getFaceShapeImage,
  onGlowMeUp
}) => {
  const { language, t } = useLanguage();
  const [isPosterOpen, setIsPosterOpen] = React.useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [result]);

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
        badgeStyle: 'bg-amber-100 text-amber-800 border-amber-200/50',
        textAccent: 'text-amber-600',
        titleTagColor: 'text-amber-600 bg-amber-50 border-amber-200',
        glowOrbs: [
          'bg-[#FF8A65]/10 top-20 left-[10%]',
          'bg-[#FFD54F]/12 top-[40%] right-[5%]',
          'bg-[#81C784]/8 bottom-10 left-[20%]',
          'bg-rose-400/8 bottom-[35%] right-[15%]'
        ],
        localizedSeason: t.seasonSpringName
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
        ],
        localizedSeason: t.seasonSummerName
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
        ],
        localizedSeason: t.seasonAutumnName
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
        ],
        localizedSeason: t.seasonWinterName
      };
    }
  };

  const theme = getSeasonTheme(result.season);
  const localizedJewerly = (result.jewelry || '').toLowerCase() === 'gold' 
    ? t.metalGold 
    : t.metalSilver;

  const getLocalizedSubType = (subType: string) => {
    const map: Record<string, string> = {
      'Bright': t.subTypeBright,
      'True': t.subTypeTrue,
      'Dark': t.subTypeDark,
      'Light': t.subTypeLight,
      'Soft': t.subTypeSoft
    };
    return map[subType] || subType;
  };
  const localizedSubType = getLocalizedSubType(result.subType);

  // Localize archetype descriptions and titles if Indonesian
  const rawArchetype = (archetypes.color_archetypes as any)[result.season]?.[`${result.subType} ${result.season}`];
  let displayName = rawArchetype?.nickname || `${result.subType} ${result.season}`;
  let displayDesc = rawArchetype?.description || "";

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

      {/* Main Analysis Title Heading */}
      <div className="text-center md:text-left space-y-1 pb-1 pt-2">
        <h1 className="text-4xl font-display font-black tracking-tight text-gray-950">
          {getFormattedVarnaTitle(result.name, language)}
        </h1>
        <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono">
          {t.personalDiagnosticsTitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Photo & Details */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
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

            {/* Inner groove contour shadow */}
            <div 
              className="absolute inset-10 pointer-events-none border border-black/5 shadow-[inset_0_4px_16px_rgba(0,0,0,0.15)] animate-fade-in"
              style={{
                borderRadius: '50% / 50%',
              }}
            />
          </div>

          {/* Your Varna Section with stunning dynamic gradient */}
          {rawArchetype && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${theme.displayGradient} p-8 rounded-[2rem] shadow-xl ${theme.shadowColor} text-white relative overflow-hidden`}
            >
              <div className="absolute -right-4 -top-4 opacity-15">
                <Sparkles size={100} />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-white/90 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
                      <Sparkles size={14} className="animate-pulse" />
                      <span>{getFormattedVarnaTitle(result.name, language).toUpperCase()}</span>
                    </div>

                    <div>
                      <h3 className="text-3xl font-display font-black leading-tight drop-shadow-sm">
                        {displayName}
                      </h3>
                    </div>
                  </div>

                  {rawArchetype.nickname && (
                    <div className="shrink-0 relative group">
                      <div className="absolute inset-0 bg-white/10 rounded-2xl blur-md group-hover:scale-110 transition-transform duration-300" />
                      <img 
                        src={`/mascot/${rawArchetype.nickname.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_')}.png`} 
                        alt={rawArchetype.nickname} 
                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain relative z-10 drop-shadow-lg transform group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-semibold text-white/95 leading-relaxed italic">
                  "{displayDesc}"
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {theme.localizedSeason}
                  </span>
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {localizedSubType}
                  </span>
                  <span className={`px-2.5 py-1 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider ${result.jewelry === 'Gold' ? 'bg-amber-500/40 text-amber-50' : 'bg-slate-300/40 text-slate-50'}`}>
                    {localizedJewerly}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Active Profile Pinning Action Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-[2rem] border ${
              result.isPinnedProfile
                ? 'bg-amber-50/50 border-amber-300 shadow-md shadow-amber-100'
                : `bg-transparent sm:${theme.cardBg} sm:border ${theme.cardBorder} hover:border-amber-200 transition-colors`
            } flex items-center justify-between gap-4`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl shrink-0 ${
                result.isPinnedProfile 
                  ? 'bg-amber-100 text-amber-600 font-bold' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <Star size={18} className={result.isPinnedProfile ? "fill-amber-400 text-amber-500 animate-pulse" : ""} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-display font-black text-gray-900 uppercase tracking-wide">
                  {result.isPinnedProfile ? t.pinnedBadge : t.setAsMyProfile}
                </h4>
                <p className="text-[10px] text-gray-500 font-semibold leading-normal">
                  {result.isPinnedProfile 
                    ? (t.mainActiveTemplateProfile || "Main active template profile") 
                    : (t.setAsMainActiveProfile || "Set as your main active profile")}
                </p>
              </div>
            </div>

            {result.id ? (
              <button
                type="button"
                onClick={() => onPin(result.id!)}
                className={`px-3 py-1.5 rounded-full font-black text-[10px] tracking-wider uppercase transition-all shrink-0 cursor-pointer ${
                  result.isPinnedProfile
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 hover:border-rose-200 active:scale-95'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10 active:scale-95'
                }`}
              >
                {result.isPinnedProfile ? (t.unpin || "Unpin") : (t.select || "Select")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSave(true)}
                disabled={loading}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full font-black text-[10px] tracking-wider uppercase shadow-md shadow-orange-500/10 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                {(t.setProfile || "Set Profile")}
              </button>
            )}
          </motion.div>

          <ObservationCard
            skinUndertone={result.skinUndertone}
            eyeColor={result.eyeColor}
            hairColor={result.hairColor}
            className={`bg-transparent sm:${theme.cardBg} sm:border ${theme.cardBorder}`}
          />
        </div>

        {/* Right Column: Palette & Best/Worst */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8 animate-fade-in">
          <div className={`bg-transparent sm:${theme.cardBg} p-0 sm:p-6 md:p-8 rounded-none sm:rounded-[2.5rem] border-0 sm:border ${theme.cardBorder} shadow-none sm:shadow-sm space-y-6 overflow-hidden`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest font-mono">
                  {t.approvedPalette}
                </p>
                <h2 className="text-xl sm:text-2xl font-display font-black text-gray-900 flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-extrabold shadow-sm">✓</span>
                  {t.bestColorsWear}
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
                  {t.clashingShades}
                </p>
                <h2 className="text-xl sm:text-2xl font-display font-black text-gray-900 flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-rose-50 text-rose-600 rounded-lg text-sm font-extrabold shadow-sm">✕</span>
                  {t.colorsAvoid}
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
            onGlowMeUp={onGlowMeUp}
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

      {/* Floating Share Button on mobile - hidden when poster modal is open */}
      {!isPosterOpen && (
        <button
          onClick={() => setIsPosterOpen(true)}
          className="fixed bottom-6 right-6 md:hidden z-40 p-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-full shadow-xl shadow-brand-primary/30 active:scale-95 hover:scale-105 transition-all duration-150 flex items-center justify-center cursor-pointer border border-white/20 shadow-black/10"
          id="floating-mobile-share"
          aria-label="Create shareable story poster"
        >
          <Share2 size={24} className="text-white drop-shadow-sm" />
        </button>
      )}
    </motion.div>
  );
};
