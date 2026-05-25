import React from 'react';

interface ObservationCardProps {
  skinUndertone: string;
  eyeColor: string;
  hairColor: string;
  className?: string;
}

export const ObservationCard: React.FC<ObservationCardProps> = ({ skinUndertone, eyeColor, hairColor, className }) => (
  <div className={`p-0 sm:p-6 rounded-none sm:rounded-[2rem] relative overflow-hidden ${className || 'bg-transparent sm:bg-white border-0 sm:border border-black/5 shadow-none sm:shadow-sm'} space-y-6`}>
    <div className="pb-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">
        Traits Metrics
      </p>
      <h3 className="text-lg font-display font-medium text-gray-900 mt-0.5">Observations</h3>
    </div>
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-brand-primary mt-2" />
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Skin Undertone</p>
          <p className="text-sm font-medium text-gray-700">{skinUndertone}</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2" />
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Eye Color</p>
          <p className="text-sm font-medium text-gray-700">{eyeColor}</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-amber-800 mt-2" />
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hair Color</p>
          <p className="text-sm font-medium text-gray-700">{hairColor}</p>
        </div>
      </div>
    </div>
  </div>
);
