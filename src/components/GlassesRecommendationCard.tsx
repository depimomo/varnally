import React from 'react';
import { motion } from 'motion/react';
import { Glasses, Check, Trash2, HelpCircle } from 'lucide-react';
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
      id="glasses-recommendation-card"
      className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden"
    >
      {/* Decorative Background Icon */}
      <div className="absolute -top-6 -right-6 text-gray-100 pointer-events-none">
        <Glasses size={140} />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div id="glasses-card-header-icon" className="w-10 h-10 bg-brand-secondary rounded-2xl flex items-center justify-center text-white shadow-md shadow-brand-secondary/10">
            <Glasses size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-brand-secondary uppercase tracking-widest block font-mono">Frames Matcher</span>
            <h2 className="text-xl font-display font-black text-gray-900 leading-none">Glasses Showcase</h2>
          </div>
        </div>

        {/* Content Layout */}
        <div className="space-y-6">

          {/* Top Section: Style Goal */}
          <div id="glasses-style-goal-box" className="bg-neutral-50 border border-gray-100 p-5 rounded-2xl">
            <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-1 font-mono">Visual Styling Objective</p>
            <p className="text-sm font-medium text-gray-850 leading-relaxed">
              {recommendations.style_goal}
            </p>
          </div>

          {/* New Horizontal Section: Best Frame Illustration (Centered below Style Goal) */}
          <div className="flex justify-center w-full">
            {/* Seamless vertical image showcase with no border and no drop-shadow */}
            <div className="w-full flex-1 flex items-center justify-center p-0 relative my-2">
              <img
                id="recommended-glasses-img"
                src={`/glasses/glasses_${faceShape.toLowerCase()}.png`}
                alt={`${faceShape} Face Shape Recommended Glasses`}
                className="w-auto h-auto max-h-[520px] object-contain transition-transform duration-300"
                onError={(e) => {
                  console.warn(`Glasses asset at /glasses/glasses_${faceShape.toLowerCase()}.png could not be loaded`);
                }}
              />
            </div>
          </div>

          {/* Recommendations Lists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Best Frames */}
            <div id="glasses-best-frames" className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Check size={14} className="text-brand-secondary" />
                Best Frames
              </p>
              <div className="flex flex-col gap-2">
                {recommendations.best_frames.map((frame: string, idx: number) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-white border border-brand-secondary/10 hover:border-brand-secondary/25 shadow-sm rounded-xl text-xs font-bold text-gray-700 flex items-center gap-2 transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />
                    {frame}
                  </div>
                ))}
              </div>
            </div>

            {/* Frames to Avoid */}
            <div id="glasses-avoid-frames" className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Trash2 size={14} className="text-red-400" />
                Avoid
              </p>
              <div className="flex flex-col gap-2">
                {recommendations.frames_to_avoid.map((frame: string, idx: number) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-red-50/40 border border-red-100 hover:border-red-200 shadow-sm rounded-xl text-xs font-bold text-gray-600 flex items-center gap-2 transition-all"
                  >
                    <span className="w-1.5 h-[1.5px] bg-red-400" />
                    {frame}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div id="glasses-pro-tip-box" className="bg-brand-secondary/10 p-5 rounded-3xl border border-brand-secondary/15 flex gap-3.5 items-start">
            <div className="p-1.5 bg-white text-brand-secondary rounded-xl shadow-sm shrink-0">
              <HelpCircle size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-0.5 font-mono">Expert Frame Advice</p>
              <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                {recommendations.pro_tip}
              </p>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
