import React from 'react';
import { motion } from 'motion/react';

interface FaceArchitectureCardProps {
  faceShape: string;
  faceShapeDescription: string;
  imageUrl: string;
}

export const FaceArchitectureCard: React.FC<FaceArchitectureCardProps> = ({ 
  faceShape, 
  faceShapeDescription, 
  imageUrl 
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-transparent sm:bg-white p-0 sm:p-6 md:p-8 rounded-none sm:rounded-[2.5rem] border-0 sm:border border-black/5 shadow-none sm:shadow-sm space-y-6 overflow-hidden"
  >
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest font-mono">
          Geometric Structure
        </p>
        <h2 className="text-xl sm:text-2xl font-display font-medium text-gray-900 flex items-center gap-2">
          Face Architecture
        </h2>
      </div>
    </div>

    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left pt-2">
      <div className="w-44 h-44 rounded-2xl overflow-hidden shrink-0 bg-neutral-50 border border-neutral-150 p-2 flex items-center justify-center">
        <img 
          src={imageUrl} 
          alt={`${faceShape} face shape illustration`}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex-1 space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-brand-secondary bg-brand-secondary/5 border border-brand-secondary/10 px-2.5 py-0.5 rounded-full inline-block">
            Your Facemapping
          </span>
          <h3 className="text-2xl font-display font-bold text-gray-900 mt-2">{faceShape}</h3>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Structural Analysis</p>
          <p className="text-sm text-gray-650 leading-relaxed italic bg-neutral-50/50 p-4 rounded-xl border border-neutral-100">
            "{faceShapeDescription}"
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);
