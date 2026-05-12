import React from 'react';
import { motion } from 'motion/react';
import { Glasses, Check, Trash2 } from 'lucide-react';
import glassesData from '../data/glasses.json';

interface GlassesRecommendationCardProps {
  faceShape: string;
}

export const GlassesRecommendationCard: React.FC<GlassesRecommendationCardProps> = ({ faceShape }) => {
  const recommendations = (glassesData.glasses_recommendations as any)[faceShape];
  
  if (!recommendations) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-secondary/5 p-8 rounded-[2.5rem] border border-brand-secondary/20 shadow-sm overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 p-8 text-brand-secondary/10">
        <Glasses size={80} />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-secondary rounded-2xl flex items-center justify-center text-white">
            <Glasses size={20} />
          </div>
          <h2 className="text-xl font-display font-bold text-gray-900">Style & Frames</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Style Goal</p>
              <p className="text-sm font-medium text-gray-900 leading-relaxed">
                {recommendations.style_goal}
              </p>
            </div>
            
            <div className="pt-2">
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                <Check size={12} />
                Best Frames
              </p>
              <div className="flex flex-wrap gap-2">
                {recommendations.best_frames.map((frame: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-white border border-brand-secondary/10 rounded-xl text-xs font-bold text-gray-700 shadow-sm">
                    {frame}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Trash2 size={12} className="text-red-400" />
                Frames to Avoid
              </p>
              <ul className="space-y-2">
                {recommendations.frames_to_avoid.map((frame: string, idx: number) => (
                  <li key={idx} className="text-xs text-gray-500 flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-red-300 mt-1.5 shrink-0" />
                    {frame}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/50 p-4 rounded-2xl border border-brand-secondary/5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Pro Tip</p>
              <p className="text-[11px] text-gray-600 leading-snug">
                {recommendations.pro_tip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
