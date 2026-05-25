import React from 'react';
import { ChevronLeft, RefreshCw, Save, Check } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface ResultHeaderProps {
  isLoading: boolean;
  canSave: boolean;
  onBack: () => void;
  onSave: () => void;
  onShareStory?: () => void;
}

export const ResultHeader: React.FC<ResultHeaderProps> = ({ 
  isLoading, 
  canSave, 
  onBack, 
  onSave,
  onShareStory
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-4 justify-between animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 transition-colors cursor-pointer">
        <ChevronLeft size={20} className="text-brand-primary" />
        {t.analyzeAnother}
      </button>
      <div className="flex items-center gap-3">
        {onShareStory && (
          <button 
            onClick={onShareStory}
            className="hidden md:flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white rounded-full font-black shadow-md hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer shadow-rose-500/10 border border-white/10"
          >
            <span className="text-white">✨ {t.sharePoster}</span>
          </button>
        )}
        
        {canSave ? (
          <button 
            onClick={onSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-secondary text-white rounded-full font-black shadow-lg shadow-brand-secondary/20 hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {t.saveResults}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-black text-xs select-none">
            <Check size={14} className="text-emerald-600 shrink-0" />
            {t.savedToHistory}
          </div>
        )}
      </div>
    </div>
  );
};
