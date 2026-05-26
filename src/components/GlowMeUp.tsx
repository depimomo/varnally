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
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { Analysis } from '../types';
import makeupPresetsData from '../data/makeup_presets.json';
import { analyzeMakeupSwatches } from '../services/gemini';

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
}

interface SwatchAnalysisResponse {
  matchFound: boolean;
  explanation: string;
  matches: MatchResult[];
}

export const GlowMeUp: React.FC<GlowMeUpProps> = ({ pinnedProfile, onBack }) => {
  const { language } = useLanguage();
  const isIndo = language === 'id';

  // State Management
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Lip');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SwatchAnalysisResponse | null>(null);
  const [loaderSentenceIndex, setLoaderSentenceIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullType = `${pinnedProfile.subType} ${pinnedProfile.season}`;
  const preset = MAKEUP_PRESETS[fullType] || MAKEUP_PRESETS["True Winter"];

  // Dictionaries
  const dict = {
    title: { en: 'Glow Me Up', id: 'Glow Me Up' },
    backBtn: { en: 'Back to Hub', id: 'Kembali ke Hub' },
    subtitle: { 
      en: 'Find the absolute perfect cosmetics. Upload any product swatches, and our AI will pair them accurately with your personal season.', 
      id: 'Temukan kosmetik yang benar-benar sempurna. Unggah swatch produk apa pun, dan AI kami akan mencocokkannya dengan presisi sesuai musim personal Anda.' 
    },
    personalProfile: { en: 'My Active Color Profile', id: 'Profil Warna Aktif Saya' },
    idealFinish: { en: 'Ideal Finish', id: 'Hasil Akhir Ideal' },
    selectCategory: { en: '1. Select Makeup Category', id: '1. Pilih Kategori Riasan' },
    categoryDesc: { 
      en: 'Choose what type of product you are matching today to provide context for our AI stylist.', 
      id: 'Pilih jenis produk yang ingin dicocokkan hari ini untuk memberikan konteks bagi penata gaya AI kami.' 
    },
    uploadTitle: { en: '2. Upload Swatch Photos', id: '2. Unggah Foto Swatch' },
    dragActiveText: { en: 'Drop your image here...', id: 'Lepaskan gambar Anda di sini...' },
    dragInactiveText: { 
      en: 'Drag & drop your swatch photo here, or click to browse', 
      id: 'Seret & letakkan foto swatch Anda di sini, atau klik untuk memilih file' 
    },
    instructions: { 
      en: 'Please ensure the photo clearly shows the available swatch colors and their names/codes.', 
      id: 'Pastikan foto menampilkan warna swatch dan nama/kode shade dengan jelas.' 
    },
    analyzeBtn: { en: 'Analyze Swatches', id: 'Analisis Swatch' },
    analyzingText: { en: 'Matching shades against your season...', id: 'Mencocokkan shade dengan musim Anda...' },
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
    errorMatch: { en: 'Analysis failed. Please ensure the image is clear and try again.', id: 'Analisis gagal. Pastikan gambar cukup jelas dan coba lagi.' }
  };

  const tLocal = (key: keyof typeof dict) => {
    return dict[key][isIndo ? 'id' : 'en'];
  };

  const categories: { id: CategoryType; label: string; icon: React.ReactNode }[] = [
    { id: 'Foundation', label: isIndo ? 'Base / Foundation' : 'Foundation', icon: <Sparkles size={16} /> },
    { id: 'Lip', label: 'Lip', icon: <Heart size={16} /> },
    { id: 'Eye', label: isIndo ? 'Eye / Mata' : 'Eyeshadow', icon: <Eye size={16} /> },
    { id: 'Blush', label: isIndo ? 'Blush / Cheek' : 'Blush', icon: <Palette size={16} /> },
  ];

  // Random loading phrases to keep users engaged
  const loadingSentences = isIndo ? [
    "Menganalisis...",
    "Mencocokkan...",
    "Memeriksa kulit...",
    "Menghitung skor..."
  ] : [
    "Analyzing...",
    "Matching...",
    "Checking profile...",
    "Calculating..."
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

      // Extract specific recommendation guidelines to anchor the AI
      let guideText = "";
      if (selectedCategory === 'Foundation') {
        guideText = `Ideal foundation finish is: ${preset.finish}. Foundation recommendations: ${preset.foundationDescription}. Typical flattering swatches: ${preset.foundationSwatches.map((s: any) => `${s.name} (${s.hex})`).join(', ')}`;
      } else if (selectedCategory === 'Lip') {
        guideText = `Flattering lip colors usually include: ${preset.lipColors.map((s: any) => `${s.name} (${s.hex})`).join(', ')}`;
      } else if (selectedCategory === 'Eye') {
        guideText = `Flattering eyeshadow palettes usually include: ${preset.eyeshadows.map((s: any) => `${s.name} (${s.hex})`).join(', ')}`;
      } else if (selectedCategory === 'Blush') {
        guideText = `Flattering blushes usually include: ${preset.blushes.map((s: any) => `${s.name} (${s.hex})`).join(', ')}`;
      }

      const response = await analyzeMakeupSwatches(
        arrayBuffer,
        mimeType,
        pinnedProfile.season,
        pinnedProfile.subType,
        selectedCategory,
        guideText
      );

      setResult(response);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || tLocal('errorMatch'));
    } finally {
      setAnalyzing(false);
    }
  };

  // Helper arrays for simple recommended colors display
  const getSubSwatches = () => {
    if (selectedCategory === 'Foundation') return preset.foundationSwatches || [];
    if (selectedCategory === 'Lip') return preset.lipColors || [];
    if (selectedCategory === 'Eye') return preset.eyeshadows || [];
    if (selectedCategory === 'Blush') return preset.blushes || [];
    return [];
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

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 text-[10px] font-black uppercase tracking-widest text-amber-600 font-mono">
          <Sparkles size={12} className="animate-pulse" />
          {isIndo ? 'PENCARI MAKEUP AI' : 'AI MAKEUP SHADE SELECTOR'}
        </div>
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
          
          {/* STEP 1: Interactive Category Selection */}
          <div className="bg-white p-6 rounded-[2rem] border border-neutral-200/50 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-5 h-5 bg-neutral-900 text-white rounded-full flex items-center justify-center text-[10px]">
                  1
                </span>
                {tLocal('selectCategory')}
              </h3>
              <p className="text-xs text-neutral-400 font-medium">
                {tLocal('categoryDesc')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setResult(null); }}
                  className={`flex items-center gap-2.5 p-3 px-4 border rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-neutral-900 border-neutral-900 text-white shadow-md shadow-neutral-900/10 scale-[1.01]'
                      : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-600'
                  }`}
                >
                  <span className={selectedCategory === cat.id ? 'text-amber-400 animate-pulse' : 'text-neutral-400'}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Drag and Drop Upload Area */}
          <div className="bg-white p-6 rounded-[2rem] border border-neutral-200/50 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="w-5 h-5 bg-neutral-900 text-white rounded-full flex items-center justify-center text-[10px]">
                2
              </span>
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
                      <h3 className="text-base font-display font-black uppercase tracking-wide text-neutral-950">
                        {result.matchFound ? tLocal('matchSuccessTitle') : tLocal('noMatchTitle')}
                      </h3>
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

    </motion.div>
  );
};
