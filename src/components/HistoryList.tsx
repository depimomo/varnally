import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { Analysis } from '../types';
import archetypes from '../data/archetypes.json';

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
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="space-y-6"
  >
    <div className="flex items-center gap-4 mb-8">
      <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
        <ChevronLeft size={24} />
      </button>
      <h1 className="text-3xl font-display font-bold">Saved Varna</h1>
    </div>

    {history.length === 0 ? (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <p className="text-gray-500">No saved analyses yet. Try analyzing your photo!</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {history.map((item) => (
          <motion.div 
            key={item.id}
            layoutId={item.id}
            className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all group relative"
          >
            <button 
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                if (item.id) onDelete(item.id); 
              }}
              className="absolute top-2 right-2 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all z-30 bg-white shadow-sm rounded-full border border-gray-100"
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
              <div className="min-w-0">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-0.5">Color Archetype</p>
                <h3 className="font-display font-bold text-lg truncate leading-tight">
                  {(archetypes.color_archetypes as any)[item.season]?.[`${item.subType} ${item.season}`]?.nickname || item.season}
                </h3>
              </div>
            </div>
            <div className="flex gap-2 mb-6">
              {(item.bestColors || []).slice(0, 5).map((color, idx) => (
                <div key={idx} className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: color.hex }} title={color.name} />
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <span className="text-xs text-gray-400 font-medium">
                {new Date(item.createdAt?.seconds * 1000 || item.createdAt).toLocaleDateString()}
              </span>
              <button 
                onClick={() => onView(item)}
                className="text-brand-secondary text-sm font-bold flex items-center gap-1 hover:underline"
              >
                View Full Result
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </motion.div>
);
