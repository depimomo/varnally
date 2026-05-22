import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ColorInfo } from '../types';

interface ColorDrapeProps {
  color: ColorInfo;
  imageUrl: string | null;
}

export const ColorDrape: React.FC<ColorDrapeProps> = ({ color, imageUrl }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  // Fallback SVG silhouette of an elegant mannequin/portrait if no user photo is available
  const fallbackSvg = (
    <svg className="w-full h-full text-neutral-400 p-4" viewBox="0 0 100 120" fill="currentColor">
      <circle cx="50" cy="38" r="20" />
      <path d="M44 56 C44 56, 44 68, 50 72 C56 68, 56 56, 56 56 Z" />
      <path d="M15 95 C25 80, 75 80, 85 95 C85 95, 80 120, 50 120 C20 120, 15 95, 15 95 Z" />
    </svg>
  );

  return (
    <>
      {/* Interactive Drape Card */}
      <motion.div 
        layoutId={`card-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
        onClick={() => setIsZoomed(true)}
        className="flex flex-col items-center gap-2 cursor-zoom-in"
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div 
          id={`drape-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
          className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-neutral-200 bg-white transition-shadow duration-300 group"
        >
          {/* Base Layer: Portrait Image */}
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={`Draped in ${color.name}`} 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
              {fallbackSvg}
            </div>
          )}

          {/* V-Neck Fabric Drape Overlay (Dynamically Colored) */}
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {/* V-neck clothing shape matching the photo coordinates perfectly */}
            <path 
              d="M 0,55 L 50,65 L 100,55 L 100,100 L 0,100 Z" 
              fill={color.hex} 
              className="transition-colors duration-500 ease-in-out"
            />
            {/* Subtle soft shadow on the border of the shirt for realism */}
            <path 
              d="M 0,55 L 50,65 L 100,55" 
              fill="none" 
              stroke="black" 
              strokeWidth="0.6" 
              opacity="0.08" 
              className="transition-colors duration-500 ease-in-out"
            />
          </svg>

          {/* Dark vignetting overlay at the bottom for typography readability */}
          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

          {/* Swatch Label Details Overlay */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] md:text-xs font-black text-white truncate drop-shadow-md tracking-tight leading-none mb-0.5">
                {color.name}
              </span>
              <span className="text-[8px] md:text-[9px] font-mono text-white/90 tracking-wide drop-shadow-md leading-none">
                {color.hex.toUpperCase()}
              </span>
            </div>
            {/* Round Helper circle showing pure color */}
            <div 
              className="w-3 md:w-4 h-3 md:h-4 rounded-full border border-white/65 shadow-sm shrink-0 transition-colors duration-500" 
              style={{ backgroundColor: color.hex }}
            />
          </div>
        </div>
      </motion.div>

      {/* Expanded Modal View on Click */}
      {isZoomed && (
        <div 
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <motion.div 
            layoutId={`card-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-100 flex flex-col p-4 gap-4"
          >
            {/* Big Canvas View */}
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50 shadow-inner">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={color.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {fallbackSvg}
                </div>
              )}

              {/* V-Neck Drape */}
              <svg 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none" 
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <path 
                  d="M 0,55 L 50,65 L 100,55 L 100,100 L 0,100 Z" 
                  fill={color.hex} 
                />
                <path 
                  d="M 0,55 L 50,65 L 100,55" 
                  fill="none" 
                  stroke="black" 
                  strokeWidth="0.6" 
                  opacity="0.08" 
                />
              </svg>
            </div>

            {/* Swatch Information Footer */}
            <div className="flex items-center justify-between px-2 pt-1 pb-2">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-neutral-400 uppercase tracking-widest block leading-none">
                  Color Swatch
                </span>
                <h3 className="text-xl font-display font-black text-neutral-900 leading-none">
                  {color.name}
                </h3>
                <span className="text-sm font-mono text-neutral-500 font-bold tracking-wider block">
                  {color.hex.toUpperCase()}
                </span>
              </div>
              <div 
                className="w-12 h-12 rounded-2xl border-2 border-white shadow-md" 
                style={{ backgroundColor: color.hex }}
              />
            </div>

            <button 
              onClick={() => setIsZoomed(false)}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-98"
            >
              Close Drape
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};
