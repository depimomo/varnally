import React from 'react';
import { motion } from 'motion/react';
import { Camera, RefreshCw, Sparkles, Trash2, History } from 'lucide-react';

interface ImageUploaderProps {
  previewUrl: string | null;
  analyzing: boolean;
  analysisError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  onReset: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  previewUrl,
  analyzing,
  analysisError,
  fileInputRef,
  onFileClick,
  onFileChange,
  onAnalyze,
  onReset
}) => (
  <motion.div 
    key="uploader"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="space-y-12"
  >
    <div className="text-center max-w-2xl mx-auto space-y-4">
      <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-none text-gray-900">
        Your true colors, <span className="text-brand-primary">your best ally.</span>
      </h1>
      <p className="text-lg text-gray-500 font-medium">
        Trends fade, but your natural harmony is timeless. Simply upload a bare-face selfie, and let our magic map out a style that love you back.
      </p>
    </div>

    <div className="max-w-xl mx-auto">
      {!previewUrl ? (
        <div 
          onClick={onFileClick}
          className="aspect-square bg-white rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all group"
        >
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-brand-primary transition-all shadow-sm">
            <Camera size={32} />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-700">Click to upload photo</p>
            <p className="text-sm text-gray-400">JPG, PNG (max 5MB)</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white relative group">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            
            {analyzing && (
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-12 left-12 w-12 h-12 border-t-4 border-l-4 border-white/60 rounded-tl-2xl" />
                <div className="absolute top-12 right-12 w-12 h-12 border-t-4 border-r-4 border-white/60 rounded-tr-2xl" />
                <div className="absolute bottom-12 left-12 w-12 h-12 border-b-4 border-l-4 border-white/60 rounded-bl-2xl" />
                <div className="absolute bottom-12 right-12 w-12 h-12 border-b-4 border-r-4 border-white/60 rounded-br-2xl" />

                <svg className="absolute inset-0 w-full h-full text-white/30" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <circle cx="50" cy="30" r="0.8" fill="currentColor" />
                    <circle cx="35" cy="45" r="0.8" fill="currentColor" />
                    <circle cx="65" cy="45" r="0.8" fill="currentColor" />
                    <circle cx="50" cy="55" r="0.8" fill="currentColor" />
                    <circle cx="40" cy="75" r="0.8" fill="currentColor" />
                    <circle cx="60" cy="75" r="0.8" fill="currentColor" />
                    <circle cx="50" cy="85" r="0.8" fill="currentColor" />
                    
                    <path d="M50 30 L35 45 L50 55 L65 45 Z" fill="none" stroke="currentColor" strokeWidth="0.2" />
                    <path d="M35 45 L40 75 L50 85 L60 75 L65 45" fill="none" stroke="currentColor" strokeWidth="0.2" />
                    <path d="M50 55 L40 75 M50 55 L60 75" fill="none" stroke="currentColor" strokeWidth="0.2" />
                    <path d="M50 30 L50 55" fill="none" stroke="currentColor" strokeWidth="0.2" />
                  </motion.g>
                </svg>

                <motion.div 
                  initial={{ top: '-10%' }}
                  animate={{ top: '110%' }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-1/2 bg-gradient-to-b from-transparent via-transparent to-brand-primary/30"
                >
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary shadow-[0_0_25px_rgba(255,138,101,0.9)]" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-secondary/40 blur-md translate-y-1" />
                </motion.div>
              </div>
            )}

            <button 
              onClick={onReset}
              className="absolute top-6 right-6 p-3 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
              title="Remove photo"
            >
              <Trash2 size={20} />
            </button>
          </div>
          
          <button 
            onClick={onAnalyze}
            disabled={analyzing}
            className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-gray-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {analyzing ? (
              <>
                <RefreshCw size={24} className="animate-spin" />
                Analyzing your unique tones...
              </>
            ) : (
              <>
                <Sparkles size={24} className="text-brand-primary" />
                {analysisError ? "Try Again" : "Start AI Analysis"}
              </>
            )}
          </button>

          {analysisError && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-100 rounded-2xl text-center"
            >
              <p className="text-sm text-red-600 font-medium">{analysisError}</p>
            </motion.div>
          )}
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
      <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
          <Camera size={24} />
        </div>
        <div>
          <h4 className="font-bold text-sm">Face Only</h4>
          <p className="text-xs text-gray-500">Bare face, no makeup</p>
        </div>
      </div>
      <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
          <Sparkles size={24} />
        </div>
        <div>
          <h4 className="font-bold text-sm">Natural Light</h4>
          <p className="text-xs text-gray-500">Daylight is best for accuracy</p>
        </div>
      </div>
      <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shrink-0">
          <History size={24} />
        </div>
        <div>
          <h4 className="font-bold text-sm">Save & Track</h4>
          <p className="text-xs text-gray-500">Keep and compare results</p>
        </div>
      </div>
    </div>
  </motion.div>
);
