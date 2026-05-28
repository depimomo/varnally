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
import { useLanguage } from '../lib/LanguageContext';

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
  onCaptured: (file: File) => void;
  inputName: string;
  setInputName: (name: string) => void;
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
  onBackToLanding,
  onCaptured,
  inputName,
  setInputName
}) => {
  const { language, t } = useLanguage();
  const [loadingText, setLoadingText] = React.useState(t.analyzingShades);
  const [cameraMode, setCameraMode] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [lightingStatus, setLightingStatus] = React.useState<string>(t.calibrating);
  const [focusStatus, setFocusStatus] = React.useState<string>(t.calibrating);
  const [sampleSrc, setSampleSrc] = React.useState("/sample/potrait.jpeg");

  React.useEffect(() => {
    if (!stream) {
      setLightingStatus(t.calibrating);
      setFocusStatus(t.calibrating);
      return;
    }

    let active = true;
    const interval = setInterval(() => {
      if (!active || !videoRef.current) return;
      const video = videoRef.current;
      if (video.paused || video.ended || video.readyState < 2) return;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, 80, 80);
        const imgData = ctx.getImageData(0, 0, 80, 80);
        const data = imgData.data;

        let totalLuma = 0;
        const count = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuma += luma;
        }

        const avgBrightness = totalLuma / count;

        let sumSqDiff = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          sumSqDiff += (luma - avgBrightness) ** 2;
        }
        const stdDev = Math.sqrt(sumSqDiff / count);

        // Analyze lighting characteristics
        if (avgBrightness < 60) {
          setLightingStatus(t.tooDark);
        } else if (avgBrightness > 215) {
          setLightingStatus(t.tooBright);
        } else {
          setLightingStatus("Optimal");
        }

        // Analyze standard deviation for contrast details
        if (stdDev < 15) {
          setFocusStatus(t.lowContrast);
        } else {
          setFocusStatus("Optimal");
        }
      } catch (err) {
        // Safe cross-origin handling
      }
    }, 400);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [stream, language]);

  React.useEffect(() => {
    if (!analyzing) {
      setLoadingText(t.analyzingShades);
      return;
    }

    const sentences = [
      t.loadingSentence1,
      t.loadingSentence2,
      t.loadingSentence3,
      t.loadingSentence4,
      t.loadingSentence5,
      t.loadingSentence6,
      t.loadingSentence7,
      t.loadingSentence8
    ];

    // Pick a starting sentence randomly
    const initialIndex = Math.floor(Math.random() * sentences.length);
    setLoadingText(sentences[initialIndex]);

    let count = initialIndex;
    const interval = setInterval(() => {
      count++;
      setLoadingText(sentences[count % sentences.length]);
    }, 1800);

    return () => clearInterval(interval);
  }, [analyzing, language, t]);

  const startCamera = async () => {
    setCameraMode(true);
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      setStream(mediaStream);
      // Let React schedule rendering the video ref before setting srcObject
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 50);
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError(t.cameraAccessDenied);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraMode(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 640;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the canvas capture context to match the mirrored live preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera_${Date.now()}.jpeg`, { type: 'image/jpeg' });
            onCaptured(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.90);
      }
    }
  };

  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-805 transition-colors cursor-pointer group font-semibold"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-brand-primary" />
          {t.backToLanding}
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-display font-medium text-gray-950">
          {t.uploaderTitle}
        </h2>
        <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed font-semibold">
          {t.uploaderSub}
        </p>
      </div>

      {/* Dynamic Grid: Photo Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Upload Zone */}
        <div className="md:col-span-12 lg:col-span-6 space-y-6">
          {/* Name Input Box */}
          <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-sm space-y-2">
            <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono block">
              {t.nameInputLabel}
            </label>
            <input 
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder={t.nameInputPlaceholder}
              className="w-full px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 rounded-xl text-sm font-semibold text-gray-800 transition-all placeholder:text-gray-350 outline-none"
            />
          </div>

          {!previewUrl ? (
            <div className="space-y-4">
              {!cameraMode ? (
                <div className="space-y-4">
                  {/* Select File Option Card */}
                  <div 
                    onClick={onFileClick}
                    className="aspect-square bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all group shadow-sm p-4 animate-fade-in"
                  >
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-brand-primary transition-all shadow-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-base font-bold text-gray-700">
                        {t.selectFacePhoto}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">{t.dragInactiveText}</p>
                    </div>
                  </div>

                  {/* Or Trigger Camera Option Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); startCamera(); }}
                    className="w-full py-4 bg-white hover:bg-brand-primary/5 text-gray-800 border-2 border-dashed border-gray-200 rounded-[1.5rem] font-bold text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm active:scale-98"
                  >
                    <Camera size={18} className="text-brand-primary animate-pulse" />
                    <span>{t.capturePhoto}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="fixed inset-0 w-full h-full z-50 md:relative md:inset-auto md:w-auto md:h-auto md:aspect-square md:rounded-[2.5rem] bg-gray-950 overflow-hidden shadow-inner md:border md:border-neutral-800 flex flex-col justify-between animate-fade-in">
                    {/* Live Video Preview inside box */}
                    <video 
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover rounded-none md:rounded-[2.5rem] scale-x-[-1]"
                    />

                    {cameraError && (
                      <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-50 rounded-none md:rounded-[2.5rem] space-y-4">
                        <p className="text-xs text-red-200 font-semibold leading-relaxed">{cameraError}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); stopCamera(); }}
                          className="px-5 py-2.5 bg-neutral-100 text-gray-900 font-bold rounded-xl text-xs transition-all cursor-pointer active:scale-95 hover:bg-neutral-100 shadow-sm"
                        >
                          {t.cancelGoBack}
                        </button>
                      </div>
                    )}

                    {/* Top Bar overlays inside Video */}
                    <div className="relative z-15 pt-12 md:pt-5 pb-5 px-6 md:px-5 w-full flex justify-between items-center bg-gradient-to-b from-black/75 to-transparent">
                      <button 
                        onClick={(e) => { e.stopPropagation(); stopCamera(); }}
                        className="px-4 py-2 bg-black/50 hover:bg-black/80 text-white font-bold text-xs md:text-[11px] rounded-full backdrop-blur-md border border-white/20 cursor-pointer transition-all active:scale-95"
                      >
                        {t.cancelCamera}
                      </button>
                      
                      <span className="px-3.5 py-1.5 bg-brand-primary text-white font-bold text-[10px] rounded-full uppercase tracking-wider font-mono">
                        {t.liveStream}
                      </span>
                    </div>

                    {/* Oval blueprint outline guides */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 z-10">
                      <div className="w-52 h-72 md:w-48 md:h-64 rounded-[50%] border-2 border-dashed border-white" />
                    </div>

                    <div className="w-full flex flex-col z-15">
                      {/* Real-time Environment Assist Indicator FLOATING for mobile inside the black viewport HUD */}
                      {!cameraError && stream && (
                        <div className="mx-6 md:mx-5 mb-2 bg-black/45 backdrop-blur-md rounded-2xl p-2 px-4 border border-white/10 flex md:hidden items-center justify-around text-white text-xs shadow-md">
                          <div className="flex flex-col items-center text-center">
                            <span className="text-[8px] text-white/60 uppercase font-mono tracking-wider">
                              {t.lightingMatch}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${lightingStatus === "Optimal" ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                              <span className="font-bold font-mono text-[10px] text-white/95">{lightingStatus}</span>
                            </div>
                          </div>

                          <div className="w-[1px] h-4 bg-white/20" />

                          <div className="flex flex-col items-center text-center">
                            <span className="text-[8px] text-white/60 uppercase font-mono tracking-wider">
                              {t.focusClarity}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${focusStatus === "Optimal" ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                              <span className="font-bold font-mono text-[10px] text-white/95">{focusStatus}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Shutter controls bar */}
                      <div className="pb-12 pt-4 md:p-5 bg-gradient-to-t from-black/85 to-transparent flex justify-center w-full">
                        <button 
                          onClick={(e) => { e.stopPropagation(); capturePhoto(); }}
                          className="w-18 h-18 rounded-full bg-white border-4 border-neutral-300 hover:border-brand-primary flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 group"
                          title="Capture Photo"
                        >
                          <div className="w-11 h-11 rounded-full bg-brand-primary group-hover:scale-105 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Environment Assist Indicator outside for desktop only */}
                  {!cameraError && stream && (
                    <div className="hidden md:flex bg-neutral-50 rounded-2xl p-3 px-4 border border-gray-150 items-center justify-around text-gray-700 text-xs shadow-sm select-none animate-fade-in">
                      <div className="flex flex-col items-center text-center">
                        <span className="text-[9px] text-gray-400 uppercase font-mono tracking-wider">
                          {t.lightingMatch}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`w-2 h-2 rounded-full ${lightingStatus === "Optimal" ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                          <span className="font-bold font-mono text-xs text-gray-800">{lightingStatus}</span>
                        </div>
                      </div>

                      <div className="w-[1px] h-6 bg-gray-200" />

                      <div className="flex flex-col items-center text-center">
                        <span className="text-[9px] text-gray-400 uppercase font-mono tracking-wider">
                          {t.focusClarity}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`w-2 h-2 rounded-full ${focusStatus === "Optimal" ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                          <span className="font-bold font-mono text-xs text-gray-800">{focusStatus}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                    className="absolute top-4 right-4 p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg z-20 cursor-pointer transition-all active:scale-95"
                    title={t.resetBtn}
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
                    <span>{analysisError ? t.reTryScanning : t.analyzeBtn}</span>
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
          <p className="text-[11px] text-gray-400 text-center italic font-semibold leading-relaxed">
            {t.uploaderAlert}
          </p>
        </div>

        {/* Guide Lines Card Column */}
        <div id="selfie-guide-card" className="md:col-span-12 lg:col-span-6 bg-white p-6 sm:p-8 rounded-[2rem] border border-black/5 shadow-sm space-y-6">
          <div>
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono">
              {t.expertGuidelines}
            </p>
            <h3 className="text-lg font-bold text-gray-900 font-display">
              {t.howToGrab}
            </h3>
            <p className="text-xs text-gray-550 mt-1 font-semibold">
              {t.photoGuidelineIntro}
            </p>
          </div>

          {/* Real-time visual sample placeholder */}
          <div className="relative group/sample rounded-2xl overflow-hidden border border-emerald-100 bg-emerald-50/25 p-2.5">
            <div className="aspect-[4/3] rounded-xl overflow-hidden relative shadow-sm bg-neutral-100">
              <img 
                src={sampleSrc}
                onError={() => {
                  setSampleSrc("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&h=450");
                }}
                alt="Perfect Analysis Sample Portrait"
                className="w-full h-full object-cover transition-transform duration-500 group-hover/sample:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 bg-emerald-500/95 text-white text-[9px] font-bold py-1 px-2.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>{t.idealSamplePhoto}</span>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 pt-6 text-white font-semibold text-[10.5px]">
                <p>{t.samplePhotoDesc}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            
            {/* Rule 1 */}
            <div className="flex gap-3.5 items-start animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center shrink-0 mt-0.5">
                <XCircle size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  {t.cleanSkin}
                </h4>
                <p className="text-xs text-gray-550 leading-relaxed font-semibold mt-0.5">
                  {t.cleanSkinDescription}
                </p>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-brand-secondary flex items-center justify-center shrink-0 mt-0.5">
                <Eye size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  {t.clearFacialMargins}
                </h4>
                <p className="text-xs text-gray-550 leading-relaxed font-semibold mt-0.5">
                  {t.clearFacialMarginsDescription}
                </p>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <Sun size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  {t.naturalDaylight}
                </h4>
                <p className="text-xs text-gray-550 leading-relaxed font-semibold mt-0.5">
                  {t.naturalDaylightDescription}
                </p>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  {t.straightAngle}
                </h4>
                <p className="text-xs text-gray-550 leading-relaxed font-semibold mt-0.5">
                  {t.straightAngleDescription}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </motion.div>
  );
};
