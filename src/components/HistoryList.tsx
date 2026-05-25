import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trash2, AlertTriangle, X } from 'lucide-react';
import { Analysis } from '../types';
import archetypes from '../data/archetypes.json';
import { useLanguage } from '../lib/LanguageContext';
import { getFormattedVarnaTitle } from '../lib/varnaUtils';

interface HistoryListProps {
  history: Analysis[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onView: (item: Analysis) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onBack,
  onDelete,
  onView
}) => {
  const { language, t } = useLanguage();
  const [deleteItemId, setDeleteItemId] = React.useState<string | null>(null);

  const confirmDelete = () => {
    if (deleteItemId) {
      onDelete(deleteItemId);
      setDeleteItemId(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 relative"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-all">
          <ChevronLeft size={24} className="text-brand-primary" />
        </button>
        <h1 className="text-3xl font-display font-black text-gray-950">
          {t.navHistory}
        </h1>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 p-6 animate-fade-in">
          <p className="text-gray-500 font-semibold text-sm">
            {t.noSavedAnalyses}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {history.map((item) => {
            // Localize archetypes name if user chosen indonesian language
            const rawArchetype = (archetypes.color_archetypes as any)[item.season]?.[`${item.subType} ${item.season}`];
            let displayName = rawArchetype?.nickname || `${item.subType} ${item.season}`;
            
            return (
              <motion.div 
                key={item.id}
                layoutId={item.id}
                className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all group relative"
              >
                <button 
                  type="button"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (item.id) setDeleteItemId(item.id); 
                  }}
                  className="absolute top-2 right-2 p-2.5 text-gray-400 hover:text-red-500 hover:bg-rose-50 transition-all z-35 bg-white shadow-sm rounded-full border border-gray-100 cursor-pointer"
                  aria-label="Delete analysis"
                  title="Delete analysis"
                >
                  <Trash2 size={14} />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  {item.imageUrl && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-black/5 shrink-0">
                      <img src={item.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 pr-6">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-0.5">
                      {getFormattedVarnaTitle(item.name, language)}
                    </p>
                    <h3 className="font-display font-black text-base truncate leading-tight text-gray-900">
                      {displayName}
                    </h3>
                  </div>
                </div>
                <div className="flex gap-2 mb-6">
                  {(item.bestColors || []).slice(0, 5).map((color, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-full shadow-sm border border-white" style={{ backgroundColor: color.hex }} title={color.name} />
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-[11px] text-gray-400 font-bold">
                    {new Date(item.createdAt?.seconds * 1000 || item.createdAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => onView(item)}
                    className="text-brand-secondary text-xs sm:text-sm font-black flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {t.viewFullResult}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modern Deletion Confirmation Overlay modal */}
      <AnimatePresence>
        {deleteItemId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl flex flex-col text-center"
            >
              {/* Top Warning Icon */}
              <div className="mx-auto mb-4 w-12 h-12 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>

              {/* Header Text */}
              <h3 className="text-lg font-display font-black text-gray-900 mb-1.5 uppercase tracking-wide">
                {t.confirmDeletion}
              </h3>
              <p className="text-xs text-gray-550 leading-relaxed mb-6 font-semibold">
                {t.confirmDeletionDesc}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={confirmDelete}
                  className="w-full py-3 bg-red-500 hover:bg-red-650 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-md shadow-red-500/10 cursor-pointer active:scale-98"
                >
                  {t.yesDeleteItem}
                </button>
                <button
                  onClick={() => setDeleteItemId(null)}
                  className="w-full py-3 bg-gray-50 hover:bg-gray-150 text-gray-700 rounded-2xl font-black text-xs tracking-widest uppercase transition-all border border-gray-150 cursor-pointer active:scale-98"
                >
                  {t.cancel}
                </button>
              </div>

              {/* Close Button in corner */}
              <button 
                onClick={() => setDeleteItemId(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-650 cursor-pointer p-1 rounded-full hover:bg-gray-50 transition-all"
              >
                <X size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
