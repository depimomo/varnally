import React from 'react';
import { motion } from 'motion/react';
import { ColorInfo } from '../types';

interface ColorDrapeProps {
  color: ColorInfo;
  imageUrl: string | null;
}

export const ColorDrape: React.FC<ColorDrapeProps> = ({ color, imageUrl }) => {
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
        className="flex flex-col items-center gap-2"
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
    </>
  );
};
