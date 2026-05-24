import React from 'react';
import { MakeupSwatchCard, SwatchType } from './MakeupSwatchCard';

interface SwatchItem {
  name: string;
  hex: string;
}

interface MakeupSectionProps {
  id: string;
  stepLabel: string;
  title: string;
  description: string;
  swatches: SwatchItem[];
  type: SwatchType;
  icon?: React.ReactNode;
}

export const MakeupSection: React.FC<MakeupSectionProps> = ({
  id,
  stepLabel,
  title,
  description,
  swatches,
  type,
  icon
}) => {
  return (
    <div 
      id={id} 
      className="bg-neutral-50/50 p-6 rounded-3xl border border-neutral-100 flex flex-col justify-between space-y-4"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          {icon && <span id={`${id}-icon`} className="text-brand-primary">{icon}</span>}
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">
            {stepLabel}
          </p>
        </div>
        <h3 className="text-base font-bold text-gray-850">{title}</h3>
        <p className="text-xs text-gray-600 leading-relaxed font-medium">
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {swatches.map((swatch, idx) => (
          <MakeupSwatchCard
            key={idx}
            id={`${id}-swatch-${idx}`}
            name={swatch.name}
            hex={swatch.hex}
            type={type}
          />
        ))}
      </div>
    </div>
  );
};
