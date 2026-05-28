import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Heart, 
  Palette, 
  Trash2, 
  Info, 
  RefreshCw,
  Gauge,
  HelpCircle,
  X,
  ChevronRight,
  EyeOff
} from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { Analysis } from '../types';
import makeupPresetsData from '../data/makeup_presets.json';
import { analyzeMakeupSwatches, visualizeMakeup } from '../services/gemini';

const MAKEUP_PRESETS = makeupPresetsData as Record<string, any>;

interface GlowMeUpProps {
  pinnedProfile: Analysis;
  onBack: () => void;
}

type CategoryType = 'Foundation' | 'Lip' | 'Eye' | 'Blush';

interface MatchResult {
  shadeName: string;
  reasoning: string;
  matchScore: number;
  hexColor?: string;
}

interface SwatchAnalysisResponse {
  detectedCategory: CategoryType;
  matchFound: boolean;
  explanation: string;
  matches: MatchResult[];
}

export const GlowMeUp: React.FC<GlowMeUpProps> = ({ pinnedProfile, onBack }) => {
  const { language } = useLanguage();
  const isIndo = language === 'id';

  // State Management
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SwatchAnalysisResponse | null>(null);
  const [loaderSentenceIndex, setLoaderSentenceIndex] = useState(0);

  // Try-on Modal State Management
  const [visualizingMatch, setVisualizingMatch] = useState<MatchResult | null>(null);
  const [visualizedImageUrl, setVisualizedImageUrl] = useState<string | null>(null);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [visualizationError, setVisualizationError] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullType = `${pinnedProfile.subType} ${pinnedProfile.season}`;
  const preset = MAKEUP_PRESETS[fullType] || MAKEUP_PRESETS["True Winter"];

  // Dictionaries
  const dict = {
    title: { en: 'Glow Me Up', id: 'Glow Me Up' },
    backBtn: { en: 'Back to Hub', id: 'Kembali ke Hub' },
    subtitle: { 
      en: 'Find the absolute perfect cosmetics. Upload any product swatches (lip, foundation, eye, or blush), and our AI will auto-detect the product and match it against your seasonal palette.', 
      id: 'Temukan kosmetik yang benar-benar sempurna. Unggah foto swatch kosmetik apa pun (lipstik, foundation, eyeshadow, atau blush), dan AI kami akan mendeteksi jenis produk serta mencocokkannya dengan musim personal Anda secara instan.' 
    },
    personalProfile: { en: 'My Active Color Profile', id: 'Profil Warna Aktif Saya' },
    idealFinish: { en: 'Ideal Finish', id: 'Hasil Akhir Ideal' },
    uploadTitle: { en: 'Upload Swatch Photos', id: 'Unggah Foto Swatch' },
    dragActiveText: { en: 'Drop your image here...', id: 'Lepaskan gambar Anda di sini...' },
    dragInactiveText: { 
      en: 'Drag & drop a swatch photo here, or click to browse', 
      id: 'Seret & letakkan foto swatch Anda di sini, atau klik untuk memilih file' 
    },
    instructions: { 
      en: 'You can upload photos of lipsticks, foundations, eyeshadows, or blush swatches. Ensure shade names or colors are clearly visible.', 
      id: 'Anda dapat mengunggah foto swatch lipstik, foundation, eyeshadow, atau blush. Pastikan warna swatch dan teks shade terlihat jelas.' 
    },
    analyzeBtn: { en: 'Analyze Swatches', id: 'Analisis Swatch' },
    analyzingText: { en: 'Processing...', id: 'Memproses...' },
    noMatchTitle: { en: 'No Match Found', id: 'Tidak Ada Cocok' },
    noMatchDesc: { 
      en: 'None of these shades are recommended for your color season. Sticking to your recommended palette will prevent feeling washed out.', 
      id: 'Tidak ada dari shade tersebut yang direkomendasikan untuk musim warna Anda. Memilih warna di palet ideal mencegah penampilan terlihat kusam.' 
    },
    matchSuccessTitle: { en: 'Found Match for You!', id: 'Ditemukan Shade yang Cocok!' },
    matchSuccessDesc: { 
      en: 'We found these shades that harmonize beautifully with your undertones:', 
      id: 'Kami menemukan shade berikut yang menyatu secara harmonis dengan warna dasar kulit Anda:' 
    },
    resetBtn: { en: 'Scan Another Photo', id: 'Pindai Foto Lain' },
    scores: { en: 'Match Score', id: 'Skor Kecocokan' },
    errorImage: { en: 'Please select or capture a valid image first.', id: 'Silakan pilih atau unggah foto yang valid terlebih dahulu.' },
    errorMatch: { en: 'Analysis failed. Please ensure the image is clear and try again.', id: 'Analisis gagal. Pastikan gambar cukup jelas dan coba lagi.' },
    tryOnBtn: { en: 'See it in action', id: 'Simulasi Try-On' },
    tryOnTitle: { en: 'AI Makeup Try-On', id: 'Simulasi Riasan AI' },
    tryOnSubtitle: { 
      en: 'See this matching shade applied naturally onto your profile face photo.', 
      id: 'Lihat bagaimana warna cantik ini diaplikasikan secara alami pada foto profil wajah Anda.' 
    },
    tryOnNoPhoto: { 
      en: 'An active face photo is required. Please make sure you have scanned your color season with a face photo first!', 
      id: 'Dibutuhkan foto wajah aktif. Pastikan Anda telah melakukan analisis musim warna dengan foto wajah terlebih dahulu!' 
    },
    tryOnGenerating: { en: 'Simulating makeup shade with AI...', id: 'Mensimulasikan warna riasan dengan AI...' },
    beforeLabel: { en: 'Original Face', id: 'Wajah Asli' },
    afterLabel: { en: 'Virtual Try-On', id: 'Simulasi Riasan' },
    closeBtn: { en: 'Close View', id: 'Tutup Tampilan' },
    tryOnError: { en: 'Failed to generate virtual try-on. Please try again.', id: 'Gagal mensimulasikan riasan. Silakan coba lagi.' }
  };

  const tLocal = (key: keyof typeof dict) => {
    return dict[key][isIndo ? 'id' : 'en'];
  };

  // Random loading phrases to keep users engaged
  const loadingSentences = isIndo ? [
    "Menganalisis kemurnian swatch...",
    "Mencocokkan undertone kulit...",
    "Memeriksa keselarasan palet warna...",
    "Menghitung skor kecocokan..."
  ] : [
    "Analyzing swatches...",
    "Matching skin undertones...",
    "Checking season alignment...",
    "Calculating compatibility scores..."
  ];

  useEffect(() => {
    if (!analyzing) return;
    const interval = setInterval(() => {
      setLoaderSentenceIndex(prev => (prev + 1) % loadingSentences.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [analyzing, loadingSentences.length]);

  // Drag and Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
        setResult(null);
      } else {
        setError(isIndo ? "Mohon unggah file gambar." : "Please upload an image file.");
      }
    }
  };

  // Click file pick handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setVisualizingMatch(null);
    setVisualizedImageUrl(null);
    setIsVisualizing(false);
    setVisualizationError(null);
  };

  const handleTryOn = async (match: MatchResult) => {
    const testImageUrl = pinnedProfile?.cleanedImageUrl || pinnedProfile?.imageUrl;
    if (!testImageUrl) {
      setVisualizationError(tLocal('tryOnNoPhoto'));
      setVisualizingMatch(match);
      setVisualizedImageUrl(null);
      return;
    }

    setVisualizingMatch(match);
    setIsVisualizing(true);
    setVisualizedImageUrl(null);
    setVisualizationError(null);
    setSliderPosition(50);

    try {
      const generatedUrl = await visualizeMakeup(
        testImageUrl,
        result?.detectedCategory || 'Lip',
        match.shadeName,
        match.hexColor || '#ff0000'
      );
      setVisualizedImageUrl(generatedUrl);
    } catch (err: any) {
      console.error(err);
      setVisualizationError(tLocal('tryOnError'));
    } finally {
      setIsVisualizing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError(tLocal('errorImage'));
      return;
    }

    setAnalyzing(true);
    setError(null);
    setLoaderSentenceIndex(0);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const mimeType = selectedFile.type;

      const response = await analyzeMakeupSwatches(
        arrayBuffer,
        mimeType,
        pinnedProfile.season,
        pinnedProfile.subType,
        preset
      );

      setResult(response);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || tLocal('errorMatch'));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 py-6 space-y-8"
    >
      {/* Back to Hub Header Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-mono select-none"
        >
          <ArrowLeft size={14} />
          {tLocal('backBtn')}
        </button>
      </div>

      {/* Hero Intro */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-neutral-900 uppercase">
          {tLocal('title')}
        </h1>
        <p className="text-sm text-neutral-510 font-semibold leading-relaxed max-w-2xl">
          {tLocal('subtitle')}
        </p>
      </div>

      {/* STEP 0: Seasonal Palette Summary Visualizer */}
      <div className="bg-gradient-to-br from-neutral-50 to-neutral-50/50 p-6 sm:p-8 rounded-[2rem] border border-neutral-200/40 relative overflow-hidden shadow-sm">
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-primary/10 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono block">
              {tLocal('personalProfile')}
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black text-neutral-900 uppercase tracking-tight">
              {pinnedProfile.subType} {pinnedProfile.season}
            </h2>
            <p className="text-xs text-neutral-500 font-medium max-w-md">
              {isIndo 
                ? `Ditampilkan dengan warna dasar ${pinnedProfile.skinUndertone.toLowerCase()} dengan kacamata perhiasan ${pinnedProfile.jewelry.toLowerCase()}.` 
                : `Matched with ${pinnedProfile.skinUndertone.toLowerCase()} undertones and recommended ${pinnedProfile.jewelry.toLowerCase()} accents.`}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-neutral-200/30 rounded-2xl p-4 px-6 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-6 shadow-sm shrink-0 w-full sm:w-auto">
            <div className="text-center font-mono w-full sm:w-auto">
              <span className="text-[9px] text-neutral-400 uppercase font-black tracking-wider block mb-1">
                {tLocal('idealFinish')}
              </span>
              <span className="text-xs font-bold text-neutral-800 bg-neutral-100 py-1 px-3 rounded-full block sm:inline-block">
                {preset.finish || 'Satin'}
              </span>
            </div>

            <div className="w-full h-[1px] sm:w-[1px] sm:h-8 bg-neutral-200" />

            {/* Micro swatch row from main presets */}
            <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
              <span className="text-[9px] text-neutral-400 uppercase font-black tracking-wider font-mono block">
                {isIndo ? 'Palet Utama' : 'Season Core'}
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                {(preset.lipColors || []).slice(0, 3).map((sw: any, i: number) => (
                  <div 
                    key={i} 
                    className="w-5 h-5 rounded-full shadow-inner border border-white"
                    style={{ backgroundColor: sw.hex }}
                    title={sw.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Compact Color Summary Horizontal List */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-200/60 font-mono">
          {[
            { label: isIndo ? 'Alas Bedak (Base)' : 'Base Complexion', colors: preset.foundationSwatches || [], type: 'Foundation' },
            { label: isIndo ? 'Riasan Lips' : 'Lips Makeup', colors: preset.lipColors || [], type: 'Lip' },
            { label: isIndo ? 'Palet Mata' : 'Eyeshadow', colors: preset.eyeshadows || [], type: 'Eye' },
            { label: isIndo ? 'Pipi (Blush)' : 'Blush Highlight', colors: preset.blushes || [], type: 'Blush' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-3.5 rounded-2xl border border-neutral-100 flex flex-col justify-between space-y-2">
              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block leading-tight">
                {item.label}
              </span>
              <div className="flex items-center gap-1">
                {item.colors.slice(0, 3).map((col: any, sIdx: number) => (
                  <div 
                    key={sIdx} 
                    className="w-4.5 h-4.5 rounded-full border border-black/5 flex-shrink-0"
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Feature Interactivity Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Configuration Controls */}
        <div className="md:col-span-12 lg:col-span-6 space-y-6">
          
          {/* STEP 1: Drag and Drop Upload Area */}
          <div className="bg-white p-6 rounded-[2rem] border border-neutral-200/50 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider font-mono flex items-center gap-2">
              {tLocal('uploadTitle')}
            </h3>

            {!previewUrl ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 relative select-none ${
                  dragActive
                    ? 'border-brand-primary bg-brand-primary/5 scale-98'
                    : 'border-neutral-200 hover:border-brand-primary hover:bg-neutral-50/50'
                }`}
              >
                <div className="w-12 h-12 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-white mb-4 animate-bounce">
                  <UploadCloud size={20} className="text-brand-primary" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <p className="text-xs font-bold text-neutral-700">
                    {dragActive ? tLocal('dragActiveText') : tLocal('dragInactiveText')}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    JPEG, PNG, WEBP files
                  </p>
                </div>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="aspect-[4/3] rounded-3xl border border-neutral-200/50 overflow-hidden relative group">
                  <img src={previewUrl} alt="swatch preview" className="w-full h-full object-cover" />
                  
                  {analyzing && (
                    <motion.div 
                      initial={{ top: '-10%' }}
                      animate={{ top: '110%' }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                      className="absolute left-0 right-0 h-1 bg-brand-primary shadow-[0_0_10px_rgba(255,138,101,0.9)] z-10"
                    />
                  )}

                  {!analyzing && (
                    <button
                      onClick={handleReset}
                      className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full shadow-md z-20 cursor-pointer active:scale-95 transition-transform"
                      title="Reset image"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Primary Button to Call Swatch Match API */}
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full py-3.5 bg-neutral-900 border border-neutral-900 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg active:scale-98 transition-all disabled:opacity-75 flex items-center justify-center gap-3 cursor-pointer h-12 select-none"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-brand-primary" />
                      <span className="font-mono truncate">{loadingSentences[loaderSentenceIndex]}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="text-amber-400 animate-pulse animate-spin-slow" />
                      <span>{tLocal('analyzeBtn')}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl text-center"
              >
                <p className="text-xs text-red-600 font-bold leading-relaxed">{error}</p>
              </motion.div>
            )}

            {/* Guidance Callout */}
            <div className="flex gap-3 bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl">
              <Info size={16} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[11px] text-amber-900/80 font-semibold leading-relaxed">
                {tLocal('instructions')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Analysis Results & Matched Recommendations */}
        <div className="md:col-span-12 lg:col-span-6 space-y-6">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-neutral-50/50 p-8 rounded-[2rem] border border-neutral-200/40 border-dashed text-center space-y-4 flex flex-col items-center justify-center min-h-[350px]"
              >
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 mb-2">
                  <Palette size={22} className="text-neutral-350" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h4 className="text-sm font-bold text-neutral-700">
                    {isIndo ? 'Menunggu Analisis' : 'Waiting for Analysis'}
                  </h4>
                  <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                    {isIndo 
                      ? 'Pilih kategori kosmetik pilihan Anda dan unggah foto swatches untuk memulai perbandingan cerdas Varna.' 
                      : 'Choose your preferred cosmetic tab and drop swatches of makeup products to run smart personal color matching.'}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result-state"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Result header banner */}
                <div className={`p-6 sm:p-8 rounded-[2.2rem] border flex flex-col gap-4 shadow-sm relative overflow-hidden ${
                  result.matchFound 
                    ? 'bg-emerald-500/5 border-emerald-500/10' 
                    : 'bg-rose-500/5 border-rose-500/10'
                }`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/10 to-transparent pointer-events-none" />

                  <div className="flex items-center gap-3">
                    {result.matchFound ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle2 size={24} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                        <XCircle size={24} />
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-display font-black uppercase tracking-wide text-neutral-950">
                          {result.matchFound ? tLocal('matchSuccessTitle') : tLocal('noMatchTitle')}
                        </h3>
                        {result.detectedCategory && (
                          <span className="text-[9px] bg-neutral-900 text-white font-mono uppercase font-black px-2.5 py-0.5 rounded-full select-none">
                            {result.detectedCategory}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 font-semibold mt-0.5">
                        {result.matchFound ? tLocal('matchSuccessDesc') : tLocal('noMatchDesc')}
                      </p>
                    </div>
                  </div>

                  {/* Summary paragraph explanation from AI */}
                  {result.explanation && (
                    <div className="bg-white/80 border border-neutral-100 p-4 rounded-2xl text-[11px] text-neutral-600 font-semibold leading-relaxed">
                      {result.explanation}
                    </div>
                  )}
                </div>

                {/* Match List Rows */}
                {result.matchFound && result.matches && result.matches.length > 0 && (
                  <div className="space-y-4">
                    {result.matches.map((match, mIdx) => (
                      <motion.div
                        key={mIdx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: mIdx * 0.1 }}
                        className="p-4 sm:p-6 bg-white border border-neutral-200/50 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                      >
                        {/* Match Score Indicator Gauge */}
                        <div className="absolute top-4 right-4 flex items-center gap-1 sm:gap-2 bg-emerald-500/5 border border-emerald-500/10 py-1 px-2 sm:py-1.5 sm:px-3 rounded-full font-mono">
                          <Gauge size={12} className="text-emerald-500 hidden sm:inline" />
                          <span className="text-[9px] text-neutral-400 font-black uppercase tracking-wider shrink-0 hidden sm:inline">
                            {tLocal('scores')}
                          </span>
                          <span className="text-xs font-black text-emerald-600">
                            {match.matchScore}%
                          </span>
                        </div>

                        {/* Shade header with visual color swatch */}
                        <div className="flex items-center gap-3.5 mb-3 max-w-[65%] sm:max-w-[73%]">
                          {match.hexColor && (
                            <div 
                              className="w-7 h-7 rounded-full border border-neutral-200/80 shadow-md flex-shrink-0 relative"
                              style={{ backgroundColor: match.hexColor }}
                              title={match.hexColor}
                            >
                              <div className="absolute inset-0 rounded-full border border-white/40" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-sm font-display font-black uppercase text-neutral-900 leading-snug truncate">
                              {match.shadeName}
                            </h4>
                            {match.hexColor && (
                              <span className="text-[9px] text-neutral-400 font-mono font-bold tracking-wider block">
                                {match.hexColor.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Detailed AI reasoning */}
                        <p className="text-xs text-neutral-550 leading-relaxed font-semibold">
                          {match.reasoning}
                        </p>

                        {/* Try-on Action Trigger */}
                        <div className="mt-4 pt-3.5 border-t border-neutral-150/40 flex justify-end">
                          <button
                            onClick={() => handleTryOn(match)}
                            className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider font-mono transition-all duration-200 hover:scale-[1.01] shadow-sm cursor-pointer select-none"
                          >
                            <Sparkles size={11} className="text-amber-400 animate-pulse" />
                            <span>{tLocal('tryOnBtn')}</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Reset button to clear result */}
                <button
                  onClick={handleReset}
                  className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer font-mono select-none"
                >
                  {tLocal('resetBtn')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* AI VIRTUAL MAKEUP TRY-ON REVOLUTIONARY DIALOG MODAL */}
      <AnimatePresence>
        {visualizingMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[2.5rem] border border-neutral-200/50 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500 animate-pulse" />
                    <h3 className="text-base font-display font-black uppercase text-neutral-900 tracking-tight">
                      {tLocal('tryOnTitle')}
                    </h3>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">
                    {tLocal('tryOnSubtitle')}
                  </p>
                </div>
                <button
                  onClick={() => setVisualizingMatch(null)}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body Scroll Container */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {isVisualizing ? (
                  /* Loading State */
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-20 h-20">
                      {/* Concentric spinning loaders */}
                      <div className="absolute inset-0 rounded-full border-4 border-neutral-100" />
                      <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                      <div className="absolute inset-2 rounded-full border-4 border-neutral-100" />
                      <div className="absolute inset-2 rounded-full border-4 border-neutral-900 border-b-transparent animate-spin [animation-duration:1.5s]" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-neutral-800 animate-pulse">
                        {tLocal('tryOnGenerating')}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-mono font-medium">
                        {visualizingMatch.shadeName} • {result?.detectedCategory}
                      </p>
                    </div>
                  </div>
                ) : visualizationError ? (
                  /* Error State */
                  <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl text-center space-y-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mx-auto">
                      <EyeOff size={20} />
                    </div>
                    <div className="space-y-1.5 max-w-md mx-auto">
                      <h4 className="text-xs font-black uppercase tracking-wider text-rose-800 font-mono">
                        Simulation Error
                      </h4>
                      <p className="text-xs text-rose-600 font-semibold leading-relaxed">
                        {visualizationError}
                      </p>
                    </div>
                    <button
                      onClick={() => setVisualizingMatch(null)}
                      className="px-5 py-2 bg-rose-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider font-mono hover:bg-rose-900 cursor-pointer select-none"
                    >
                      {tLocal('closeBtn')}
                    </button>
                  </div>
                ) : visualizedImageUrl ? (
                  /* Double image comparison with Interactive Slider overlay */
                  <div className="space-y-5 flex flex-col items-center">
                    <div className="w-full max-w-sm space-y-2 mx-auto">
                      <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest font-mono text-neutral-400 select-none px-1">
                        <span className="flex items-center gap-1.5 text-neutral-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                          {tLocal('beforeLabel')}
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-500 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {tLocal('afterLabel')}
                        </span>
                      </div>

                      {/* Interactive Dragging Slider Container */}
                      <div className="aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden border border-neutral-200/60 bg-neutral-50 shadow-md relative group select-none touch-none">
                        {/* Before Image (Background Layer) */}
                        <img
                          src={pinnedProfile.cleanedImageUrl || pinnedProfile.imageUrl}
                          alt="Before"
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                          referrerPolicy="no-referrer"
                        />

                        {/* After Image (Clipped overlay layer on top) */}
                        <div 
                          className="absolute inset-0 overflow-hidden pointer-events-none"
                          style={{ 
                            clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` 
                          }}
                        >
                          <img
                            src={visualizedImageUrl}
                            alt="Virtual Try-On"
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Slide handle and split divider line */}
                        <div 
                          className="absolute top-0 bottom-0 w-1 bg-white/90 shadow-xl cursor-ew-resize z-25 pointer-events-none"
                          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                        >
                          {/* Pulsing visual handle indicator */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-xl flex items-center justify-center text-neutral-800 transition-transform duration-150 group-hover:scale-110">
                            <span className="flex items-center gap-[2.5px]">
                              <span className="w-[2.5px] h-3 bg-neutral-400 rounded-full" />
                              <span className="w-[2.5px] h-3 bg-neutral-400 rounded-full" />
                            </span>
                          </div>
                        </div>

                        {/* Interactive Drag Overlay (Native Invisible input taking up full card aspect) */}
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={sliderPosition}
                          onChange={(e) => setSliderPosition(Number(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 touch-none"
                          aria-label="Before/After overlay slider"
                        />

                        {/* Micro-hint banner overlay disappearing on first move */}
                        {sliderPosition === 50 && (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[9px] font-mono uppercase tracking-widest text-white/90 font-black pointer-events-none z-20 animate-bounce">
                            {isIndo ? '← SERET UNTUK BANDINGKAN →' : '← SLIDE TO COMPARE →'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta info block */}
                    <div className="bg-neutral-50 p-4 rounded-3xl border border-neutral-100 flex flex-col sm:flex-row items-center gap-4">
                      {visualizingMatch.hexColor && (
                        <div 
                          className="w-10 h-10 rounded-full border border-neutral-200 shadow-md flex-shrink-0 relative"
                          style={{ backgroundColor: visualizingMatch.hexColor }}
                        >
                          <div className="absolute inset-0 rounded-full border border-white/30" />
                        </div>
                      )}
                      <div className="min-w-0 text-center sm:text-left flex-1 space-y-0.5 animate-fade-in">
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                          <h4 className="text-xs font-display font-black uppercase text-neutral-900">
                            {visualizingMatch.shadeName}
                          </h4>
                          {result?.detectedCategory && (
                            <span className="text-[8px] bg-neutral-900 text-white font-mono uppercase font-black px-1.5 py-0.5 rounded-md">
                              {result.detectedCategory}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
                          {visualizingMatch.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4.5 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-2.5">
                <button
                  onClick={() => setVisualizingMatch(null)}
                  className="px-6 py-3 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 rounded-2xl text-xs uppercase font-black tracking-wider transition-colors font-mono cursor-pointer select-none"
                >
                  {tLocal('closeBtn')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
