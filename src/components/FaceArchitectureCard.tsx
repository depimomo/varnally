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
    className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden"
  >
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
      <div className="w-48 h-48 rounded-[2rem] overflow-hidden shrink-0">
        <img 
          src={imageUrl} 
          alt={`${faceShape} face shape illustration`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em]">Face Architecture</p>
          <h2 className="text-3xl font-display font-black text-gray-900">{faceShape}</h2>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Analysis</p>
          <p className="text-gray-600 leading-relaxed italic">
            "{faceShapeDescription}"
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);
