import React from 'react';
import { motion } from 'motion/react';
import { 
  Camera, 
  RefreshCw, 
  Sparkles, 
  Trash2, 
  ArrowLeft,
  XCircle,
  Eye,
  Sun,
  UserCheck
} from 'lucide-react';

interface ImageUploaderProps {
  previewUrl: string | null;
  analyzing: boolean;
  analysisError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  onReset: () => void;
  onBackToLanding: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  previewUrl,
  analyzing,
  analysisError,
  fileInputRef,
  onFileClick,
  onFileChange,
  onAnalyze,
  onReset,
  onBackToLanding
}) => {
  const [loadingText, setLoadingText] = React.useState("Analyzing natural shades...");

  React.useEffect(() => {
    if (!analyzing) {
      setLoadingText("Analyzing natural shades...");
      return;
    }

    const sentences = [
      "Scanning skin undertones...",
      "Mapping facial geometry...",
      "Analyzing hair contrast...",
      "Detecting pigment depth...",
      "Calibrating season chart...",
      "Formulating cosmetic path...",
      "Balancing bone structures...",
      "Finalizing your Varna map..."
    ];

    // Pick a starting sentence randomly or start from index 0 safely
    const initialIndex = Math.floor(Math.random() * sentences.length);
    setLoadingText(sentences[initialIndex]);

    let count = initialIndex;
    const interval = setInterval(() => {
      count++;
      setLoadingText(sentences[count % sentences.length]);
    }, 1800);

    return () => clearInterval(interval);
  }, [analyzing]);

  return (
    <motion.div 
      key="uploader"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="space-y-12 max-w-4xl mx-auto"
    >
      {/* Navigation row */}
      <div>
        <button 
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Varnally Hub
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-display font-medium text-gray-900">
          Upload Your Bare Face Portrait
        </h2>
        <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
          We analyze live pixel characteristics to formulate your seasonal color coordinates and facial architecture. Please review our visual guides below to ensure a pristine scan.
        </p>
      </div>

      {/* Dynamic Grid: Photo Area (Left/Right depending on desktop, or stacked) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Upload Zone (7 columns or 12 stack) */}
        <div className="md:col-span-6 space-y-6">
          {!previewUrl ? (
            <div 
              onClick={onFileClick}
              className="aspect-square bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all group shadow-sm p-4"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-brand-primary transition-all shadow-sm">
                <Camera size={26} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-base font-bold text-gray-700">Select face photo</p>
                <p className="text-xs text-gray-400">Tap to browse files (JPG, PNG)</p>
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
            <div className="space-y-4">
              <div className="aspect-square rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white relative group">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                
                {analyzing && (
                  <div className="absolute inset-0 pointer-events-none z-10 bg-black/10">
                    <div className="absolute top-8 left-8 w-10 h-10 border-t-4 border-l-4 border-white/85 rounded-tl-xl" />
                    <div className="absolute top-8 right-8 w-10 h-10 border-t-4 border-r-4 border-white/85 rounded-tr-xl" />
                    <div className="absolute bottom-8 left-8 w-10 h-10 border-b-4 border-l-4 border-white/85 rounded-bl-xl" />
                    <div className="absolute bottom-8 right-8 w-10 h-10 border-b-4 border-r-4 border-white/85 rounded-br-xl" />

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
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      className="absolute left-0 right-0 h-1/2 bg-gradient-to-b from-transparent via-transparent to-brand-primary/20"
                    >
                      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary shadow-[0_0_20px_rgba(255,138,101,0.9)]" />
                    </motion.div>
                  </div>
                )}

                {!analyzing && (
                  <button 
                    onClick={onReset}
                    className="absolute top-4 right-4 p-2.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                    title="Remove photo"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <button 
                onClick={onAnalyze}
                disabled={analyzing}
                className="w-full py-4 bg-gray-900 text-white rounded-[1.5rem] font-bold text-base shadow-xl shadow-gray-900/10 hover:bg-gray-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70 cursor-pointer text-center px-4"
              >
                {analyzing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin text-brand-primary shrink-0" />
                    <span className="truncate">{loadingText}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="text-brand-primary shrink-0" />
                    <span>{analysisError ? "Re-Try Scanning" : "Analyze My Varna"}</span>
                  </>
                )}
              </button>

              {analysisError && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl text-center"
                >
                  <p className="text-xs text-red-600 font-bold leading-relaxed">{analysisError}</p>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Guide Lines Card Column (5 columns or stacked) */}
        <div id="selfie-guide-card" className="md:col-span-6 bg-white p-6 sm:p-8 rounded-[2rem] border border-black/5 shadow-sm space-y-6">
          <div>
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono">Expert Guidelines</p>
            <h3 className="text-lg font-bold text-gray-900 font-display">How to Grab the Best Picture</h3>
            <p className="text-xs text-gray-500 mt-1">To ensure maximum color palette accuracy and shape precision, please satisfy these check rules:</p>
          </div>

          <div className="space-y-4 pt-2">
            
            {/* Rule 1 */}
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center shrink-0 mt-0.5">
                <XCircle size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">Clean Skin (No Makeup)</h4>
                <p className="text-xs text-gray-550 leading-relaxed font-medium mt-0.5">
                  Ensure zero foundation, colored blush, or tinted sunscreen. Real skin color is verified through natural blood flow and raw cell color distribution.
                </p>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-brand-secondary flex items-center justify-center shrink-0 mt-0.5">
                <Eye size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">Clear Facial Margins</h4>
                <p className="text-xs text-gray-550 leading-relaxed font-medium mt-0.5">
                  Sweep any hair, bangs, or styling locks away from your face. Our system checks your jaw line, chin depth, and temples to map out your structural bones.
                </p>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <Sun size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">Diffused Natural Daylight</h4>
                <p className="text-xs text-gray-550 leading-relaxed font-semibold mt-0.5">
                  Stand directly in front of a window or outdoors. Artificial yellow lamps or indoor downlights cast unnatural color interference that corrupts accurate season mapping.
                </p>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">Straight Angle, Open Expression</h4>
                <p className="text-xs text-gray-550 leading-relaxed font-semibold mt-0.5">
                  Look forward with neutral eyes. Keep the camera at eye level to prevent distorted structural dimensions of your chin and cheekbones.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </motion.div>
  );
};
