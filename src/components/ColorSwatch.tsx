import React from 'react';
import { ColorInfo } from '../types';

interface ColorSwatchProps {
  color: ColorInfo;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({ color }) => (
  <div className="flex flex-col items-center gap-1">
    <div 
      className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-black/5 shadow-sm" 
      style={{ backgroundColor: color.hex }}
    />
    <span className="text-[9px] text-gray-500 font-medium truncate w-14 md:w-16 text-center">{color.name}</span>
  </div>
);
