import React from 'react';
import { ChevronLeft, RefreshCw, Save } from 'lucide-react';

interface ResultHeaderProps {
  isLoading: boolean;
  canSave: boolean;
  onBack: () => void;
  onSave: () => void;
}

export const ResultHeader: React.FC<ResultHeaderProps> = ({ 
  isLoading, 
  canSave, 
  onBack, 
  onSave 
}) => (
  <div className="flex items-center gap-4 justify-between">
    <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-medium hover:text-gray-900 transition-colors">
      <ChevronLeft size={20} />
      Analyze Another
    </button>
    {canSave && (
      <button 
        onClick={onSave}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-2.5 bg-brand-secondary text-white rounded-full font-bold shadow-lg shadow-brand-secondary/20 hover:scale-105 active:scale-95 transition-all text-sm disabled:opacity-50"
      >
        {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
        Save Results
      </button>
    )}
  </div>
);
