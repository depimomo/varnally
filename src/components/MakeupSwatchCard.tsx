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
    switch (type) {
      case 'foundation':
        return (
          <div 
            id={id ? `${id}-visual` : undefined}
            className="w-10 h-10 rounded-full border border-black/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
            style={{ backgroundColor: hex }}
          />
        );
      case 'lip':
        return (
          <div 
            id={id ? `${id}-visual` : undefined}
            className="w-10 h-10 rounded-full relative overflow-hidden border border-black/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
          >
            <div 
              className="absolute inset-0"
              style={{ 
                background: `linear-gradient(135deg, ${hex} 0%, ${hex}dd 100%)`
              }}
            />
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10" />
          </div>
        );
      case 'eyeshadow':
        return (
          <div 
            id={id ? `${id}-visual` : undefined}
            className="w-10 h-10 rounded-full relative overflow-hidden border border-black/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.15)] flex items-center justify-center p-0.5" 
            style={{ background: '#222' }}
          >
            <div 
              className="w-full h-full rounded-full transition-transform"
              style={{ 
                background: `radial-gradient(circle at 35% 35%, ${hex}eb 0%, ${hex} 80%, #000 120%)`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
              }}
            />
          </div>
        );
      case 'blush':
        default:
        return (
          <div 
            id={id ? `${id}-visual` : undefined}
            className="w-10 h-10 rounded-full relative overflow-hidden flex items-center justify-center"
          >
            <div 
              className="w-8 h-8 rounded-full blur-[2px] opacity-90"
              style={{ 
                background: `radial-gradient(circle, ${hex} 0%, ${hex}dd 70%, transparent 100%)`
              }}
            />
          </div>
        );
    }
  };

  return (
    <div 
      id={id}
      className="flex flex-col items-center p-2.5 bg-white border border-neutral-100 rounded-2xl shadow-sm space-y-2"
    >
      {renderVisualSwatch()}
      <div className="text-center w-full">
        <p className="text-[10px] font-bold text-gray-800 line-clamp-1 h-3.5 leading-none">{name}</p>
        <p className="text-[8px] font-mono text-gray-400 font-bold uppercase mt-1">{hex}</p>
      </div>
    </div>
  );
};
