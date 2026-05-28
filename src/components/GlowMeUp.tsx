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

const DEFAULT_MODEL_IMAGE = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=650";

interface GlowMeUpProps {
  pinnedProfile: Analysis | null;
  history?: Analysis[];
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

export const GlowMeUp: React.FC<GlowMeUpProps> = ({ pinnedProfile, history, onBack }) => {
  const { t } = useLanguage();

  const [selectedProfile, setSelectedProfile] = useState<Analysis | null>(pinnedProfile || null);

  useEffect(() => {
    if (pinnedProfile) {
      setSelectedProfile(pinnedProfile);
    }
  }, [pinnedProfile]);

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

  // Try-on Cache State (maps unique cache key to generated try-on image URL)
  const [tryOnCache, setTryOnCache] = useState<Record<string, string>>({});

  // Reset try-on cache when the selected profile changes
  useEffect(() => {
    setTryOnCache({});
  }, [selectedProfile]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const fullType = selectedProfile ? `${selectedProfile.subType} ${selectedProfile.season}` : '';
  const preset = selectedProfile ? (MAKEUP_PRESETS[fullType] || MAKEUP_PRESETS["True Winter"]) : null;

  // Random loading phrases to keep users engaged
  const loadingSentences = [
    t.analysisPurity || "Analyzing swatches...",
    t.matchingUndertone || "Matching skin undertones...",
    t.checkingSeasonAlignment || "Checking season alignment...",
    t.calculatingCompatibility || "Calculating compatibility scores..."
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
        setError(t.pleaseUploadImageClothing || "Please upload an image file.");
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

  const selectSampleImage = async (url: string, filename: string) => {
    setAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type || 'image/webp' });
      setSelectedFile(file);
      setPreviewUrl(url);
    } catch (err: any) {
      console.error("Failed to load sample image:", err);
      setError(t.failLoadSampleImage || "Failed to load sample image.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setVisualizingMatch(null);
    setVisualizedImageUrl(null);
    setIsVisualizing(false);
    setVisualizationError(null);
    setTryOnCache({}); // Clear try-on cache when resetting/scanning another photo
  };

  const handleTryOn = async (match: MatchResult) => {
    const testImageUrl = selectedProfile?.cleanedImageUrl || selectedProfile?.imageUrl || DEFAULT_MODEL_IMAGE;
    if (!testImageUrl) {
      setVisualizationError(t.tryOnNoPhoto || "An active face photo is required...");
      setVisualizingMatch(match);
      setVisualizedImageUrl(null);
      return;
    }

    // Generate a unique cache key based on the image, category, and shade details
    const cacheKey = `${testImageUrl}-${result?.detectedCategory || 'Lip'}-${match.shadeName}-${match.hexColor || '#ff0000'}`;

    // If already generated and cached, use it immediately avoiding costly regeneration
    if (tryOnCache[cacheKey]) {
      setVisualizingMatch(match);
      setVisualizedImageUrl(tryOnCache[cacheKey]);
      setIsVisualizing(false);
      setVisualizationError(null);
      setSliderPosition(50);
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
      
      // Cache the successfully generated try-on image
      setTryOnCache(prev => ({
        ...prev,
        [cacheKey]: generatedUrl
      }));
    } catch (err: any) {
      console.error(err);
      setVisualizationError(t.tryOnError || "Failed to generate virtual try-on. Please try again.");
    } finally {
      setIsVisualizing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError(t.errorImage || "Please select or capture a valid image first.");
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
        selectedProfile!.season,
        selectedProfile!.subType,
        preset
      );

      setResult(response);

      // Auto-scroll on completion for mobile viewport sizes so users see the results instantly
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (t.errorMatch || "Analysis failed. Please ensure the image is clear and try again."));
    } finally {
      setAnalyzing(false);
    }
  };

  if (!selectedProfile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto px-4 py-8 space-y-10"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-mono select-none"
          >
            <ArrowLeft size={14} />
            {t.back || 'Back'}
          </button>
        </div>

        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex p-4 bg-amber-50 rounded-3xl border border-amber-100/50 shadow-sm text-brand-primary">
            <Sparkles className="animate-pulse" size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-neutral-900 uppercase">
            Glow Me Up Try-On
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-semibold leading-relaxed max-w-xl mx-auto">
            {t.glowMeUpBeforeScanSub || 'Before testing your cosmetics virtually, choose one of your saved scan history profiles or explore our 12 master seasonal palettes.'}
          </p>
        </div>

        {/* 1. Saved Profiles Section */}
        {history && history.length > 0 && (
          <div className="space-y-4 bg-amber-50/20 border border-amber-200/30 p-6 sm:p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <h2 className="text-xs font-black text-neutral-800 uppercase tracking-widest font-mono">
                {t.useScannedFaceResult || 'Use Your Scanned Profiles'}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {history.map((item, idx) => {
                const itemType = `${item.subType} ${item.season}`;
                const itemPreset = MAKEUP_PRESETS[itemType] || MAKEUP_PRESETS["True Winter"];
                return (
                  <button
                    key={item.id || idx}
                    onClick={() => setSelectedProfile(item)}
                    className="p-5 bg-white border border-neutral-200/50 rounded-2xl text-left hover:border-amber-400 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between h-full cursor-pointer relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-mono font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Varna #{idx + 1}
                        </span>
                        {(item.cleanedImageUrl || item.imageUrl) && (
                          <img 
                            src={item.cleanedImageUrl || item.imageUrl} 
                            alt="" 
                            className="w-8 h-8 rounded-full object-cover border border-neutral-100 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <h3 className="font-display font-black text-gray-900 text-sm uppercase tracking-wide group-hover:text-brand-primary transition-colors">
                        {item.subType} {item.season}
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-bold font-mono mt-1">
                        {t.baseJewelry || 'Base / Jewelry:'} {item.skinUndertone} • {item.jewelry}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 mt-5 pt-3 border-t border-neutral-100 w-full">
                      {(itemPreset?.lipColors || []).slice(0, 3).map((col: any, sIdx: number) => (
                        <div 
                          key={sIdx} 
                          className="w-4 h-4 rounded-full border border-black/5 shrink-0"
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        />
                      ))}
                      <span className="text-[9px] text-[#A0AEC0] font-black font-mono ml-auto tracking-wider uppercase group-hover:text-amber-500 transition-colors">
                        {t.glowSelect || 'Select →'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. 12 Seasonal Presets Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shrink-0" />
            <h2 className="text-xs font-black text-neutral-800 uppercase tracking-widest font-mono">
              {t.explore12MasterSeasons || 'Explore the 12 Master Seasons'}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.keys(MAKEUP_PRESETS).map((key) => {
              const itemPreset = MAKEUP_PRESETS[key];
              const seasonParts = key.split(' ');
              const chosenSubType = seasonParts[0];
              const chosenSeason = (seasonParts[1] || 'Winter') as any;
              
              return (
                <button
                  key={key}
                  onClick={() => {
                    const mockAnalysis: Analysis = {
                      userId: "static",
                      season: chosenSeason,
                      subType: chosenSubType,
                      bestColors: [],
                      avoidColors: [],
                      jewelry: (chosenSeason === 'Spring' || chosenSeason === 'Autumn') ? 'Gold' : 'Silver',
                      faceShape: "Oval",
                      faceShapeDescription: "Standard Oval Face Shape",
                      skinUndertone: (chosenSeason === 'Spring' || chosenSeason === 'Autumn') ? 'Warm' : 'Cool',
                      eyeColor: "Brown",
                      hairColor: "Black",
                      createdAt: new Date().toISOString(),
                    };
                    setSelectedProfile(mockAnalysis);
                  }}
                  className="p-5 bg-white border border-neutral-200/50 rounded-2xl text-left hover:border-brand-primary hover:shadow-lg transition-all duration-300 group flex flex-col justify-between h-full cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono font-black text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {chosenSeason}
                    </span>
                    <h3 className="font-display font-black text-gray-900 text-xs sm:text-sm uppercase tracking-tight group-hover:text-brand-primary transition-colors leading-tight">
                      {key}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 mt-5 pt-3 border-t border-neutral-100 w-full">
                    {(itemPreset?.lipColors || []).slice(0, 3).map((col: any, sIdx: number) => (
                      <div 
                        key={sIdx} 
                        className="w-4 h-4 rounded-full border border-black/5 shrink-0"
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      />
                    ))}
                    <span className="text-[10px] text-neutral-400 font-bold ml-auto group-hover:text-brand-primary transition-colors font-mono">
                      →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

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
          {t.backBtn || 'Back to Hub'}
        </button>
      </div>

      {/* Hero Intro */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-neutral-900 uppercase">
          Glow Me Up
        </h1>
        <p className="text-sm text-neutral-510 font-semibold leading-relaxed max-w-2xl">
          {t.glowMeUpDesc || "Upload cosmetics swatch photo or live capture, and we'll instantly check if it fits your season."}
        </p>
      </div>

      {/* STEP 0: Seasonal Palette Summary Visualizer */}
      <div className="bg-gradient-to-br from-neutral-50 to-neutral-50/50 p-6 sm:p-8 rounded-[2rem] border border-neutral-200/40 relative overflow-hidden shadow-sm">
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-primary/10 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono block">
              {t.personalProfile || "My Active Color Profile"}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-display font-black text-neutral-900 uppercase tracking-tight">
                {selectedProfile!.subType} {selectedProfile!.season}
              </h2>
              <button 
                onClick={() => setSelectedProfile(null)}
                className="text-[10px] font-mono font-bold bg-neutral-200 rounded-full text-neutral-700 hover:bg-neutral-300 px-3 py-1 cursor-pointer select-none transition-colors uppercase tracking-wider shrink-0"
              >
                {t.glowChange || 'Change ✎'}
              </button>
            </div>
            <p className="text-xs text-neutral-500 font-medium max-w-md">
              {t.matchedWithUndertoneText
                ? t.matchedWithUndertoneText
                    .replace('{{undertone}}', selectedProfile!.skinUndertone.toLowerCase())
                    .replace('{{jewelry}}', selectedProfile!.jewelry.toLowerCase())
                : `Matched with ${selectedProfile!.skinUndertone.toLowerCase()} undertones and recommended ${selectedProfile!.jewelry.toLowerCase()} accents.`}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-neutral-200/30 rounded-2xl p-4 px-6 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-6 shadow-sm shrink-0 w-full sm:w-auto">
            <div className="text-center font-mono w-full sm:w-auto">
              <span className="text-[9px] text-neutral-400 uppercase font-black tracking-wider block mb-1">
                {t.idealFinish || "Ideal Finish"}
              </span>
              <span className="text-xs font-bold text-neutral-800 bg-neutral-100 py-1 px-3 rounded-full block sm:inline-block">
                {preset.finish || 'Satin'}
              </span>
            </div>

            <div className="w-full h-[1px] sm:w-[1px] sm:h-8 bg-neutral-200" />

            {/* Micro swatch row from main presets */}
            <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
              <span className="text-[9px] text-neutral-400 uppercase font-black tracking-wider font-mono block">
                {t.seasonCore || 'Season Core'}
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
            { label: t.baseComplexionLabel || 'Base Complexion', colors: preset.foundationSwatches || [], type: 'Foundation' },
            { label: t.lipsMakeupLabel || 'Lips Makeup', colors: preset.lipColors || [], type: 'Lip' },
            { label: t.eyeshadowLabel || 'Eyeshadow', colors: preset.eyeshadows || [], type: 'Eye' },
            { label: t.blushHighlightLabel || 'Blush Highlight', colors: preset.blushes || [], type: 'Blush' },
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
              {t.uploadTitle || "Upload Swatch Photos"}
            </h3>

            {!previewUrl ? (
              <div className="space-y-4">
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
                      {dragActive ? (t.dragActiveText || 'Drop your image here...') : (t.dragInactiveText || 'Drag & drop a swatch photo here, or click to browse')}
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

                {/* Sample Swatches Picker */}
                <div className="space-y-2.5 pt-2 border-t border-neutral-100/50">
                  <div className="flex items-center gap-1.5 px-0.5">
                    <Sparkles size={11} className="text-brand-primary animate-pulse" />
                    <span className="text-[10px] font-mono font-black text-brand-primary uppercase tracking-widest block">
                      {t.orChooseSample || "Or choose a sample swatch:"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { url: '/sample/shade_1.webp', name: 'shade_1.webp', label: 'Sample 1' },
                      { url: '/sample/shade_2.webp', name: 'shade_2.webp', label: 'Sample 2' },
                      { url: '/sample/shade_3.webp', name: 'shade_3.webp', label: 'Sample 3' },
                      { url: '/sample/shade_4.webp', name: 'shade_4.webp', label: 'Sample 4' },
                    ].map((samp, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectSampleImage(samp.url, samp.name);
                        }}
                        disabled={analyzing}
                        className="group aspect-square rounded-2xl overflow-hidden border-2 border-neutral-200/50 hover:border-brand-primary active:scale-95 transition-all relative cursor-pointer bg-neutral-50 flex items-center justify-center shadow-sm"
                        title={samp.label}
                      >
                        <img 
                          src={samp.url} 
                          alt={samp.label} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-neutral-900/60 py-0.5 text-center">
                          <span className="text-[8.5px] font-mono font-bold text-white tracking-tight">
                            {t.sampleNum ? t.sampleNum.replace('{{num}}', String(sIdx + 1)) : `Sample ${sIdx + 1}`}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
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
                      <span>{t.glowAnalyzeBtn || 'Analyze Swatches'}</span>
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
                {t.instructions || "You can upload photos of lipsticks..."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Analysis Results & Matched Recommendations */}
        <div ref={resultsRef} className="md:col-span-12 lg:col-span-6 space-y-6">
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
                    {t.waitingForAnalysis || 'Waiting for Analysis'}
                  </h4>
                  <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                    {t.waitingForAnalysisDesc || 'Choose your preferred cosmetic tab and drop swatches of makeup products to run smart personal color matching.'}
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
                          {result.matchFound ? (t.matchSuccessTitle || 'Found Match for You!') : (t.noMatchTitle || 'No Match Found')}
                        </h3>
                        {result.detectedCategory && (
                          <span className="text-[9px] bg-neutral-900 text-white font-mono uppercase font-black px-2.5 py-0.5 rounded-full select-none">
                            {result.detectedCategory}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 font-semibold mt-0.5">
                        {result.matchFound ? (t.matchSuccessDesc || 'We found these shades...') : (t.noMatchDesc || 'None of these shades...')}
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
                            {t.scores || 'Match Score'}
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
                        {(selectedProfile?.cleanedImageUrl || selectedProfile?.imageUrl) && (
                          <div className="mt-4 pt-3.5 border-t border-neutral-150/40 flex justify-end">
                            <button
                              onClick={() => handleTryOn(match)}
                              className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider font-mono transition-all duration-200 hover:scale-[1.01] shadow-sm cursor-pointer select-none"
                            >
                              <Sparkles size={11} className="text-amber-400 animate-pulse" />
                              <span>{t.tryOnBtn || 'See it in action'}</span>
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Reset button to clear result */}
                <button
                  onClick={handleReset}
                  className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer font-mono select-none"
                >
                  {t.glowResetBtn || 'Scan Another Photo'}
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
                      {t.tryOnTitle || 'AI Makeup Try-On'}
                    </h3>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">
                    {t.tryOnSubtitle || 'See this matching shade applied naturally onto your profile face photo.'}
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
                        {t.tryOnGenerating || 'Simulating makeup shade with AI...'}
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
                      {t.closeBtn || 'Close View'}
                    </button>
                  </div>
                ) : visualizedImageUrl ? (
                  /* Double image comparison with Interactive Slider overlay */
                  <div className="space-y-5 flex flex-col items-center">
                    <div className="w-full max-w-sm space-y-2 mx-auto">
                      <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest font-mono text-neutral-400 select-none px-1">
                        <span className="flex items-center gap-1.5 text-neutral-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                          {t.beforeLabel || 'Original Face'}
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-500 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {t.afterLabel || 'Virtual Try-On'}
                        </span>
                      </div>

                      {/* Interactive Dragging Slider Container */}
                      <div className="aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden border border-neutral-200/60 bg-neutral-50 shadow-md relative group select-none touch-none">
                        {/* Before Image (Background Layer) */}
                        <img
                          src={selectedProfile?.cleanedImageUrl || selectedProfile?.imageUrl || DEFAULT_MODEL_IMAGE}
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
                            {t.slideHintTry || '← SLIDE →'}
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
                  {t.closeBtn || 'Close View'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
