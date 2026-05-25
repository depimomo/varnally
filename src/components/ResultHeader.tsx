import React from 'react';
import { ChevronLeft, RefreshCw, Save, Check } from 'lucide-react';

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
}) => (
  <div className="flex items-center gap-4 justify-between">
    <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-medium hover:text-gray-900 transition-colors">
      <ChevronLeft size={20} />
      Analyze Another
    </button>
    <div className="flex items-center gap-3">
      {onShareStory && (
        <button 
          onClick={onShareStory}
          className="hidden md:flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white rounded-full font-bold shadow-md hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer shadow-rose-500/10"
        >
          <span className="text-white">✨ Share Poster</span>
        </button>
      )}
      
      {canSave ? (
        <button 
          onClick={onSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-secondary text-white rounded-full font-bold shadow-lg shadow-brand-secondary/20 hover:scale-105 active:scale-95 transition-all text-sm disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          Saved Results
        </button>
      ) : (
        <div className="flex items-center gap-1.5 px-5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-bold text-xs select-none">
          <Check size={14} />
          Saved to History
        </div>
      )}
    </div>
  </div>
);

