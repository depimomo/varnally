import React from 'react';
import { useLanguage } from '../lib/LanguageContext';

interface ObservationCardProps {
  skinUndertone: string;
  eyeColor: string;
  hairColor: string;
  className?: string;
}

const getLocalizedValue = (val: string, lang: string) => {
  if (lang !== 'id') return val;
  const clean = (val || '').toLowerCase();
  
  // Dynamic keyword translation mappings for common trait outputs
  if (clean.includes('cool') && clean.includes('undertone')) return 'Sejuk (Cool Undertone)';
  if (clean.includes('warm') && clean.includes('undertone')) return 'Hangat (Warm Undertone)';
  if (clean.includes('neutral') && clean.includes('undertone')) return 'Netral (Neutral Undertone)';

  if (clean === 'cool') return 'Dingin / Sejuk';
  if (clean === 'warm') return 'Hangat';
  if (clean === 'neutral') return 'Netral';

  return val;
};

export const ObservationCard: React.FC<ObservationCardProps> = ({ skinUndertone, eyeColor, hairColor, className }) => {
  const { language, t } = useLanguage();

  return (
    <div className={`p-0 sm:p-6 rounded-none sm:rounded-[2rem] relative overflow-hidden ${className || 'bg-transparent sm:bg-white border-0 sm:border border-black/5 shadow-none sm:shadow-sm'} space-y-6`}>
      <div className="pb-1 animate-fade-in">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">
          {t.traitsMetrics}
        </p>
        <h3 className="text-lg font-display font-black text-gray-900 mt-0.5">
          {t.observations}
        </h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-primary mt-2" />
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono">
              {t.skinUndertone}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-gray-700">{getLocalizedValue(skinUndertone, language)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-400 mt-2" />
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono">
              {t.eyeColor}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-gray-700">{getLocalizedValue(eyeColor, language)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-800 mt-2" />
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono">
              {t.hairColor}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-gray-700">{getLocalizedValue(hairColor, language)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
