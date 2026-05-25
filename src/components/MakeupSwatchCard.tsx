import React from 'react';

export type SwatchType = 'foundation' | 'lip' | 'eyeshadow' | 'blush';

interface MakeupSwatchCardProps {
  id?: string;
  name: string;
  hex: string;
  type: SwatchType;
}

export const MakeupSwatchCard: React.FC<MakeupSwatchCardProps> = ({ id, name, hex, type }) => {
  const renderVisualSwatch = () => {
    return (
      <div 
        id={id ? `${id}-visual` : undefined}
        className="w-10 h-10 rounded-full relative overflow-hidden shrink-0 flex items-center justify-center"
      >
        <div 
          className="w-8 h-8 rounded-full blur-[2px] opacity-90"
          style={{ 
            background: `radial-gradient(circle, ${hex} 0%, ${hex}dd 70%, transparent 100%)`
          }}
        />
      </div>
    );
  };

  return (
    <div 
      id={id}
      className="flex items-center gap-4 p-3 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:border-black/10 hover:shadow transition-all duration-200"
    >
      {renderVisualSwatch()}
      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-sm font-semibold text-gray-800 break-words leading-snug">{name}</p>
        <p className="text-[10px] font-mono text-gray-400 font-bold uppercase mt-1 tracking-wider leading-none">{hex}</p>
      </div>
    </div>
  );
};
