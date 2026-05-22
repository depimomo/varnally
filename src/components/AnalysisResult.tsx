import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trash2, Check } from 'lucide-react';
import { Analysis } from '../types';
import archetypes from '../data/archetypes.json';
import { ColorDrape } from './ColorDrape';
import { ObservationCard } from './ObservationCard';
import { FaceArchitectureCard } from './FaceArchitectureCard';
import { GlassesRecommendationCard } from './GlassesRecommendationCard';
import { ResultHeader } from './ResultHeader';

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

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-8"
    >
      <ResultHeader
        isLoading={loading}
        canSave={!result.id}
        onBack={onBack}
        onSave={onSave}
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

          {/* Your Varna Section */}
          {(archetypes.color_archetypes as any)[result.season]?.[`${result.subType} ${result.season}`] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-brand-primary to-brand-primary/80 p-8 rounded-[2rem] shadow-xl shadow-brand-primary/20 text-white relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 opacity-20">
                <Sparkles size={100} />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-white/90">
                  <Sparkles size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Your Varna</span>
                </div>

                <div>
                  <h3 className="text-3xl font-display font-black leading-tight">
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
          />
        </div>

        {/* Right Column: Palette & Best/Worst */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden">
            <h2 className="text-xl font-display font-medium flex items-center gap-2 mb-6 text-gray-900">
              <Check className="text-green-500" />
              Best Colors to Wear
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {(result.bestColors || []).map((color, idx) => (
                <ColorDrape key={idx} color={color} imageUrl={result.cleanedImageUrl || previewUrl || result.imageUrl || null} />
              ))}
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden">
            <h2 className="text-xl font-display font-medium flex items-center gap-2 mb-6 text-gray-900">
              <Trash2 className="text-red-500" size={20} />
              Colors to Avoid
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {(result.avoidColors || []).map((color, idx) => (
                <ColorDrape key={idx} color={color} imageUrl={result.cleanedImageUrl || previewUrl || result.imageUrl || null} />
              ))}
            </div>
          </div>
          <FaceArchitectureCard
            faceShape={result.faceShape}
            faceShapeDescription={result.faceShapeDescription}
            imageUrl={getFaceShapeImage(result.faceShape)}
          />

          <GlassesRecommendationCard faceShape={result.faceShape} />
        </div>
      </div>
    </motion.div>
  );
};
