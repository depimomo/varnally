import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';

interface FaceArchitectureCardProps {
  faceShape: string;
  faceShapeDescription: string;
  imageUrl: string;
  className?: string;
}

const getLocalizedFaceShape = (faceShape: string, originalDesc: string, lang: string) => {
  if (lang !== 'id') {
    return {
      shapeName: faceShape,
      description: originalDesc
    };
  }

  const shapeMap: Record<string, string> = {
    'Oval': 'Oval (Bulat Telur)',
    'Square': 'Square (Kotak)',
    'Round': 'Round (Bulat)',
    'Heart': 'Heart (Hati)',
    'Diamond': 'Diamond (Berlian)',
    'Oblong': 'Oblong (Lonjong)'
  };

  const descMap: Record<string, string> = {
    'Oval': 'Wajah Anda memiliki proporsi yang sangat seimbang dengan transisi garis melengkung lembut. Dahi Anda sedikit lebih lebar daripada rahang, dan tulang pipi adalah bagian terlebar. Sangat simetris dan anggun.',
    'Square': 'Dahi, tulang pipi, dan garis rahang Anda memiliki lebar yang hampir sama. Garis rahang Anda terlihat tegas, kokoh, dan bersudut tajam dengan lekukan yang minimal.',
    'Round': 'Wajah Anda memiliki transisi garis melengkung yang lembut dengan ukuran panjang dan lebar wajah yang hampir sama. Bagian pipi terlihat penuh, didukung garis rahang membulat yang lembut.',
    'Heart': 'Bagian dahi Anda lebar dan penuh, lalu menyempit secara lembut dan mengalir turun menuju dagu bawah yang lancip nan indah.',
    'Diamond': 'Tulang pipi Anda tinggi, menonjol, dan merupakan bagian terlebar wajah, sementara bagian dahi serta garis rahang bawah Anda menyempit secara elegan.',
    'Oblong': 'Panjang wajah Anda terlihat lebih dominan dibandingkan lebarnya. Garis sisi wajah tampak lurus dengan lebar dahi, tulang pipi, dan rahang yang hampir sejajar simetris.'
  };

  // Safe fallback if description doesn't match keys exactly (use a smart keyword scanner or the map/original)
  const cleanShape = faceShape.trim();
  const shapeName = shapeMap[cleanShape] || cleanShape;
  let description = descMap[cleanShape];

  if (!description) {
    // Attempt relaxed match
    const matchingKey = Object.keys(descMap).find(k => originalDesc.toLowerCase().includes(k.toLowerCase()));
    description = matchingKey ? descMap[matchingKey] : originalDesc;
  }

  return {
    shapeName,
    description
  };
};

export const FaceArchitectureCard: React.FC<FaceArchitectureCardProps> = ({ 
  faceShape, 
  faceShapeDescription, 
  imageUrl,
  className
}) => {
  const { language, t } = useLanguage();
  const { shapeName, description } = getLocalizedFaceShape(faceShape, faceShapeDescription, language);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-0 sm:p-6 md:p-8 rounded-none sm:rounded-[2.5rem] relative overflow-hidden ${className || 'bg-transparent sm:bg-white border-0 sm:border border-black/5 shadow-none sm:shadow-sm'} space-y-6`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest font-mono">
            {t.geometricStructure}
          </p>
          <h2 className="text-xl sm:text-2xl font-display font-black text-gray-900 flex items-center gap-2">
            {t.faceArchitecture}
          </h2>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left pt-2 animate-fade-in">
        <div className="w-44 h-44 overflow-hidden shrink-0 flex items-center justify-center p-0">
          <img 
            src={imageUrl} 
            alt={`${faceShape} face shape illustration`}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-brand-secondary bg-brand-secondary/5 border border-brand-secondary/10 px-2.5 py-0.5 rounded-full inline-block">
              {t.yourFacemapping}
            </span>
            <h3 className="text-2xl font-display font-black text-gray-900 mt-2">{shapeName}</h3>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">{t.structuralAnalysis}</p>
            <p className="text-xs sm:text-sm text-gray-650 leading-relaxed font-semibold italic bg-white p-4 rounded-xl border border-neutral-100">
              "{description}"
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
