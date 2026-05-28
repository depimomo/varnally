import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Info, 
  RefreshCw,
  HelpCircle,
  Shirt,
  Plus
} from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { Analysis } from '../types';
import archetypesData from '../data/archetypes.json';
import { analyzeClothingColors } from '../services/gemini';

const ARCHETYPES = archetypesData.color_archetypes;

interface StylizeMeProps {
  pinnedProfile: Analysis | null;
  history?: Analysis[];
  onBack: () => void;
}

interface ClothingItemResult {
  filename: string;
  detectedColorName: string;
  hexColor: string;
  isCompatible: boolean;
  matchScore: number;
  reasoning: string;
}

interface StylizeResponse {
  explanation: string;
  bestItemFilename: string;
  items: ClothingItemResult[];
}

interface SelectedFileItem {
  id: string;
  file: File;
  preview: string;
  name: string;
}

export const StylizeMe: React.FC<StylizeMeProps> = ({ pinnedProfile, history, onBack }) => {
  const { t } = useLanguage();

  const [selectedProfile, setSelectedProfile] = useState<Analysis | null>(pinnedProfile || null);

  useEffect(() => {
    if (pinnedProfile) {
      setSelectedProfile(pinnedProfile);
    }
  }, [pinnedProfile]);

  // State Management
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StylizeResponse | null>(null);
  const [loaderSentenceIndex, setLoaderSentenceIndex] = useState(0);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSelectSample = async (url: string, name: string) => {
    if (selectedFiles.length >= 5) {
      setError(t.maxClothingLimit || "Maximum of 5 clothing photos.");
      return;
    }
    setLoadingSample(name);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], name, { type: blob.type || "image/webp" });
      addFiles([file]);
    } catch (err: any) {
      console.error("Failed to load sample image:", err);
      setError(t.failLoadSampleImage || "Failed to load sample image.");
    } finally {
      setLoadingSample(null);
    }
  };

  // Helper to map 12 master seasons to preset colors from archetypes
  const getPresetColors = (season: string, subType: string) => {
    const category = ARCHETYPES[season as any]?.[`${subType} ${season}` as any];
    if (!category) return { best: [], avoid: [] };
    const hexes = (category as any).border || [];
    const best = hexes.map((hex: string, index: number) => ({
      hex: `#${hex}`,
      name: `Recommended Color ${index + 1}`
    }));
    
    let avoidhexes: string[] = [];
    if (season === 'Winter') {
      avoidhexes = ["A38F1E", "B97A19", "DE7A0A", "652E19", "C53F19"]; 
    } else if (season === 'Spring') {
      avoidhexes = ["2D4281", "2F3359", "4B225C", "111111", "AA90BD"]; 
    } else if (season === 'Summer') {
      avoidhexes = ["DE7A0A", "C53F19", "C7135A", "F7E602", "DC0814"]; 
    } else {
      avoidhexes = ["BFDFEC", "C8A7C8", "9283BA", "B4DAE5", "C75086"]; 
    }
    const avoid = avoidhexes.map((hex: string, index: number) => ({
      hex: `#${hex}`,
      name: `Avoid Color ${index + 1}`
    }));
    
    return { best, avoid };
  };

  const getProfileSignatureColors = () => {
    if (!selectedProfile) return [];
    if (selectedProfile.bestColors && selectedProfile.bestColors.length > 0) {
      return selectedProfile.bestColors;
    }
    // Fallback to active subType/season presets from archetypes.json
    return getPresetColors(selectedProfile.season, selectedProfile.subType).best;
  };

  const loadingSentences = [
    t.fabricAnalysis || "Analyzing fabrics...",
    t.analysisPurity || "Analyzing purity...",
    t.curatingStyle || "Curating style...",
    t.calculatingScore || "Calculating score..."
  ];

  useEffect(() => {
    if (!analyzing) return;
    const interval = setInterval(() => {
      setLoaderSentenceIndex(prev => (prev + 1) % loadingSentences.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [analyzing]);

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

    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (filesList: File[]) => {
    const validFiles = filesList.filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setError(t.pleaseUploadImageClothing || "Please upload an image file.");
      return;
    }

    setSelectedFiles(prev => {
      const remainingSlots = 5 - prev.length;
      if (remainingSlots <= 0) {
        setError(t.maxClothingLimit || "Maximum of 5 clothing photos.");
        return prev;
      }

      const filesToAdd = validFiles.slice(0, remainingSlots);
      const newItems = filesToAdd.map(file => ({
        id: Math.random().toString(36).substring(2, 11),
        file,
        preview: URL.createObjectURL(file),
        name: file.name
      }));
      setError(null);
      setResult(null);
      return [...prev, ...newItems];
    });
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const target = prev.find(item => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter(item => item.id !== id);
    });
    setResult(null);
  };

  const handleReset = () => {
    selectedFiles.forEach(item => URL.revokeObjectURL(item.preview));
    setSelectedFiles([]);
    setResult(null);
    setError(null);
  };

  // Scale down & optimize files above 500kb
  const optimizeLargeFile = (file: File, maxDim: number = 1000, quality: number = 0.82): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round(height * maxDim / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round(width * maxDim / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', quality);
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) {
      setError(t.uploadMinOneClothing || "Please upload at least one clothing photo first.");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const processedInputs: { buffer: ArrayBuffer; mimeType: string; filename: string }[] = [];

      for (const item of selectedFiles) {
        let fileToUpload = item.file;
        if (item.file.size > 500 * 1024) {
          try {
            fileToUpload = await optimizeLargeFile(item.file);
          } catch (e) {
            console.warn("Client-side optimization failed for file:", item.name);
          }
        }

        const buffer = await fileToUpload.arrayBuffer();
        processedInputs.push({
          buffer,
          mimeType: fileToUpload.type,
          filename: `${item.id}_${item.name}`
        });
      }

      const { best, avoid } = getPresetColors(selectedProfile!.season, selectedProfile!.subType);

      const response = await analyzeClothingColors(
        processedInputs,
        selectedProfile!.season,
        selectedProfile!.subType,
        selectedProfile!.bestColors && selectedProfile!.bestColors.length > 0 ? selectedProfile!.bestColors : best,
        selectedProfile!.avoidColors && selectedProfile!.avoidColors.length > 0 ? selectedProfile!.avoidColors : avoid
      );

      setResult(response);

      if (window.innerWidth < 1024) {
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (t.outfitAnalysisFailed || "Outfits analysis failed. Please try again."));
    } finally {
      setAnalyzing(false);
    }
  };

  // Find the file preview corresponding to the filename in results
  const getPreviewByFilename = (filename: string): string => {
    const matched = selectedFiles.find(item => {
      const compKey = `${item.id}_${item.name}`;
      return compKey === filename || compKey.includes(filename) || filename.includes(item.id);
    });
    return matched ? matched.preview : (selectedFiles[0]?.preview || '');
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
            {t.backBtn || 'Back'}
          </button>
        </div>

        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex p-4 bg-indigo-50 rounded-3xl border border-indigo-100/50 shadow-sm text-indigo-600">
            <Shirt className="animate-pulse" size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-neutral-900 uppercase">
            {t.stylizeTitle || 'Stylize Me'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-semibold leading-relaxed max-w-xl mx-auto">
            {t.stylizeBeforeScanSub || 'Before choosing clothing colors, choose one of your saved scan history profiles or explore our 12 master seasonal palettes.'}
          </p>
        </div>

        {/* 1. Saved Profiles Section */}
        {history && history.length > 0 && (
          <div className="space-y-4 bg-indigo-50/20 border border-indigo-200/30 p-6 sm:p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
              <h2 className="text-xs font-black text-neutral-800 uppercase tracking-widest font-mono">
                {t.useScannedFaceResult || 'Use Your Scanned Profiles'}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {history.map((item, idx) => {
                const signatureColors = item.bestColors && item.bestColors.length > 0 
                  ? item.bestColors 
                  : getPresetColors(item.season, item.subType).best;
                return (
                  <button
                    key={item.id || idx}
                    onClick={() => setSelectedProfile(item)}
                    className="p-5 bg-white border border-neutral-200/50 rounded-2xl text-left hover:border-indigo-400 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between h-full cursor-pointer relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
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
                      <h3 className="font-display font-black text-gray-900 text-sm uppercase tracking-wide group-hover:text-indigo-600 transition-colors">
                        {item.subType} {item.season}
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-bold font-mono mt-1">
                        {t.baseJewelry || 'Base / Jewelry:'} {item.skinUndertone} • {item.jewelry}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 mt-5 pt-3 border-t border-neutral-100 w-full">
                      {signatureColors.slice(0, 3).map((col: any, sIdx: number) => (
                        <div 
                           key={sIdx} 
                           className="w-4 h-4 rounded-full border border-black/5 shrink-0"
                           style={{ backgroundColor: col.hex }}
                           title={col.name}
                        />
                      ))}
                      <span className="text-[9px] text-[#A0AEC0] font-black font-mono ml-auto tracking-wider uppercase group-hover:text-indigo-500 transition-colors font-mono">
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
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
            <h2 className="text-xs font-black text-neutral-800 uppercase tracking-widest font-mono">
              {t.explore12MasterSeasons || 'Explore the 12 Master Seasons'}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.keys(ARCHETYPES["Winter"]).concat(Object.keys(ARCHETYPES["Spring"]), Object.keys(ARCHETYPES["Summer"]), Object.keys(ARCHETYPES["Autumn"])).map((key) => {
              const seasonParts = key.split(' ');
              const chosenSubType = seasonParts[0];
              const chosenSeason = (seasonParts[1] || 'Winter') as any;
              const presetColors = getPresetColors(chosenSeason, chosenSubType);
              
              return (
                <button
                  key={key}
                  onClick={() => {
                    const mockAnalysis: Analysis = {
                      userId: "static",
                      season: chosenSeason,
                      subType: chosenSubType,
                      bestColors: presetColors.best,
                      avoidColors: presetColors.avoid,
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
                  className="p-5 bg-white border border-neutral-200/50 rounded-2xl text-left hover:border-indigo-400 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between h-full cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {chosenSeason}
                    </span>
                    <h3 className="font-display font-black text-gray-900 text-xs sm:text-sm uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-tight">
                      {key}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 mt-5 pt-3 border-t border-neutral-100 w-full">
                    {presetColors.best.slice(0, 3).map((col: any, sIdx: number) => (
                      <div 
                        key={sIdx} 
                        className="w-4 h-4 rounded-full border border-black/5 shrink-0"
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      />
                    ))}
                    <span className="text-[10px] text-neutral-400 font-bold ml-auto group-hover:text-indigo-500 transition-colors font-mono">
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

  const profileCoreColors = getProfileSignatureColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 py-6 space-y-8"
    >
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-mono select-none"
        >
          <ArrowLeft size={14} />
          {t.backBtn || 'Back to Hub'}
        </button>
      </div>

      {/* Title block */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-neutral-900 uppercase">
          {t.stylizeTitle || 'Stylize Me'}
        </h1>
        <p className="text-sm text-neutral-500 font-semibold leading-relaxed max-w-2xl">
          {t.stylizeSubtitle || 'Upload up to 5 clothing photos to find your absolute matches. Our AI acts as your personal stylist, analyzing each clothing piece and picking the absolute best color for your season.'}
        </p>
      </div>

      {/* Profile summary header */}
      <div className="bg-gradient-to-br from-neutral-50 to-neutral-50/50 p-6 sm:p-8 rounded-[2rem] border border-neutral-200/40 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest font-mono block">
              {t.personalProfile || 'My Active Color Profile'}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-display font-black text-neutral-900 uppercase tracking-tight">
                {selectedProfile.subType} {selectedProfile.season}
              </h2>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-[10px] font-mono font-bold bg-neutral-200 rounded-full text-neutral-700 hover:bg-neutral-300 px-3 py-1 cursor-pointer select-none transition-colors uppercase tracking-wider shrink-0"
              >
                {t.glowChange || 'Change ✎'}
              </button>
            </div>
            <p className="text-xs text-neutral-550 font-semibold max-w-md">
              {t.matchedWithUndertoneText 
                ? t.matchedWithUndertoneText.replace('{{undertone}}', selectedProfile.skinUndertone.toLowerCase()).replace('{{jewelry}}', selectedProfile.jewelry.toLowerCase())
                : `Matched with ${selectedProfile.skinUndertone.toLowerCase()} undertones and recommended ${selectedProfile.jewelry.toLowerCase()} accents.`}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-neutral-200/30 rounded-2xl p-4 px-6 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-6 shadow-sm shrink-0 w-full sm:w-auto">
            <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
              <span className="text-[9px] text-neutral-400 uppercase font-black tracking-wider font-mono block">
                {t.seasonCore || 'Season Core'}
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                {profileCoreColors.slice(0, 5).map((col: any, i: number) => (
                  <div 
                    key={i} 
                    className="w-5 h-5 rounded-full shadow-inner border border-white"
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main feature interaction area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Clothing images setup */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-neutral-200/50 shadow-sm space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-neutral-800 uppercase tracking-wider font-mono">
                  {t.uploadTitleClothing || 'Upload Clothing Photos (Up to 5)'}
                </h3>
                <span className="text-[10px] text-neutral-400 normal-case font-bold font-mono">
                  {selectedFiles.length}/5
                </span>
              </div>
              {selectedFiles.length > 0 && (
                <div className="flex justify-start">
                  <button
                    onClick={handleReset}
                    disabled={analyzing}
                    className="text-[10px] text-red-500 hover:text-red-600 hover:underline cursor-pointer select-none border-none bg-transparent font-sans lowercase font-black tracking-normal"
                  >
                    {t.resetAll || 'reset all'}
                  </button>
                </div>
              )}
            </div>

            {/* Droppable grid selector area */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className="space-y-4"
            >
              {selectedFiles.length === 0 ? (
                <div
                  onClick={triggerFileSelect}
                  className={`aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 relative select-none ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-50/10 scale-98'
                      : 'border-neutral-200 hover:border-indigo-500 hover:bg-neutral-50/50'
                  }`}
                >
                  <div className="w-12 h-12 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-center text-indigo-500 mb-4 animate-bounce">
                    <UploadCloud size={20} />
                  </div>
                  <div className="space-y-1.5 max-w-xs">
                    <p className="text-xs font-bold text-neutral-700">
                      {dragActive ? (t.dragActiveTextClothing || 'Drop your clothes photos here...') : (t.dragInactiveTextClothing || 'Drag & drop clothing pictures here, or click to choose files')}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-medium font-mono">
                      Accepts JPEG, PNG, WEBP files
                    </p>
                  </div>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Thumbnail grid list of clothes */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {selectedFiles.map((sf, idx) => (
                      <div 
                        key={sf.id}
                        className="aspect-square rounded-2xl border border-neutral-200/50 overflow-hidden relative group shadow-sm bg-neutral-50"
                      >
                        <img 
                          src={sf.preview} 
                          alt={sf.name} 
                          className="w-full h-full object-cover" 
                        />
                        
                        {/* Always visible prominent delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(sf.id);
                          }}
                          className="absolute top-2.5 right-2.5 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md z-20 cursor-pointer transition-all active:scale-90"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>

                        <div className="absolute inset-x-0 bottom-0 bg-neutral-900/60 py-1 text-center">
                          <span className="text-[8.5px] font-mono font-bold text-white tracking-tight">
                            {t.outfitNum ? t.outfitNum.replace('{{num}}', String(idx + 1)) : `Outfit ${idx + 1}`}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Dotted Plus grid button to add more images if < 5 */}
                    {selectedFiles.length < 5 && (
                      <button
                        onClick={triggerFileSelect}
                        disabled={analyzing}
                        className="aspect-square rounded-2xl border-2 border-dashed border-neutral-200 hover:border-indigo-400 flex flex-col items-center justify-center p-4 hover:bg-indigo-50/10 cursor-pointer active:scale-95 transition-all text-neutral-400 hover:text-indigo-600 bg-neutral-50/30"
                      >
                        <Plus size={20} className="mb-1" />
                        <span className="text-[9px] font-mono font-black uppercase tracking-wider">
                          {t.addPhoto || 'Add Photo'}
                        </span>
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          multiple
                          className="hidden"
                        />
                      </button>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="w-full py-3.5 bg-neutral-900 border border-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg active:scale-98 transition-all disabled:opacity-75 flex items-center justify-center gap-3 cursor-pointer h-12 select-none"
                    >
                      {analyzing ? (
                        <>
                          <RefreshCw size={14} className="animate-spin text-indigo-400" />
                          <span className="font-mono truncate">{loadingSentences[loaderSentenceIndex]}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="text-amber-400 animate-pulse" />
                          <span>{t.btnAnalyzeOutfits || 'Analyze Outfits'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sample Clothes Grid */}
            <div className="space-y-2.5 pt-2 border-t border-neutral-100">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono block">
                {t.tryWithSampleClothes || 'Try with Sample Clothes'}
              </span>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((num) => {
                  const url = `/sample/style_${num}.webp`;
                  const name = `style_${num}.webp`;
                  const isAlreadySelected = selectedFiles.some(f => f.name === name);
                  const isCurrentLoading = loadingSample === name;

                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={isAlreadySelected || selectedFiles.length >= 5 || analyzing || !!loadingSample}
                      onClick={() => handleSelectSample(url, name)}
                      className={`aspect-square rounded-xl overflow-hidden relative border transition-all duration-205 cursor-pointer ${
                        isAlreadySelected
                          ? 'border-indigo-400 ring-2 ring-indigo-400/20 opacity-60'
                          : 'border-neutral-200 hover:border-indigo-500 hover:shadow-md active:scale-95'
                      }`}
                      title={t.sampleOutfitNum ? t.sampleOutfitNum.replace('{{num}}', String(num)) : `Sample Outfit ${num}`}
                    >
                      <img src={url} alt={`Style ${num}`} className="w-full h-full object-cover" />
                      
                      {isCurrentLoading && (
                        <div className="absolute inset-0 bg-neutral-900/40 flex items-center justify-center">
                          <RefreshCw size={12} className="animate-spin text-white" />
                        </div>
                      )}
                      
                      {isAlreadySelected && (
                        <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
                          <CheckCircle2 size={14} className="text-indigo-600 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

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

            {/* General guidance instructions */}
            <div className="flex gap-3 bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl">
              <Info size={16} className="text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[11px] text-indigo-950/80 font-semibold leading-relaxed">
                {t.instructionsClothing || 'Upload clear photos of clothes or fabric swatches. Our AI personal stylist will check their compatibility score and find the absolute best match for you.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Styling report details / analysis */}
        <div ref={resultsRef} className="lg:col-span-6 space-y-6">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-[2rem] border border-neutral-200/50 p-8 sm:p-12 text-center space-y-6"
              >
                <div className="w-16 h-16 bg-neutral-50 rounded-3xl border border-neutral-100 flex items-center justify-center text-neutral-300 mx-auto">
                  <Shirt size={28} />
                </div>
                <div className="space-y-2.5 max-w-sm mx-auto">
                  <h3 className="font-display font-black text-neutral-800 text-sm uppercase tracking-wider">
                    {t.stylistDashboardReady || 'Stylist Dashboard Ready'}
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                    {t.stylistDashboardReadyDesc || 'Upload up to 5 items of clothes. Our AI Stylist will compute chromatic metrics against your exact color season and highlight the best combinations.'}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result-state"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                {/* 1. BEST MATCH CORNERSTONE CARD */}
                {(() => {
                  const bestItem = result.items.find(item => item.filename === result.bestItemFilename) || result.items[0];
                  const bestItemUrl = getPreviewByFilename(bestItem.filename);
                  
                  return (
                    <div 
                      className="bg-white text-neutral-900 border border-neutral-200/50 rounded-[2.5rem] p-6 sm:p-8 overflow-hidden relative transition-all"
                      style={{
                        boxShadow: `0 12px 42px -10px ${bestItem.hexColor}25, 0 0 35px 3px ${bestItem.hexColor}15`
                      }}
                    >
                      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-500/5 via-amber-500/5 to-transparent rounded-bl-full pointer-events-none" />
                      
                      <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="shrink-0 animate-pulse" style={{ color: bestItem.hexColor }} size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest font-mono" style={{ color: bestItem.hexColor }}>
                          {t.bestOutfitMatch || 'Best Color Match for You'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Top outfit image inside the result card */}
                        <div className="md:col-span-5 h-56 md:h-48 rounded-2xl overflow-hidden border border-neutral-200/40 shadow-sm relative bg-neutral-50">
                          <img 
                            src={bestItemUrl} 
                            alt="The Best Color Outfit Matches" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute top-2.5 left-2.5 px-3 py-1 bg-amber-400 text-neutral-950 font-mono text-[9px] font-black rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <Sparkles size={9} />
                            <span>BEST CHOICE</span>
                          </div>
                        </div>

                        <div className="md:col-span-7 space-y-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-6 h-6 rounded-full border border-neutral-200 shadow-sm shrink-0"
                              style={{ backgroundColor: bestItem.hexColor }}
                            />
                            <div>
                              <h4 className="font-display font-black uppercase text-base tracking-wide text-neutral-900">
                                {bestItem.detectedColorName}
                              </h4>
                              <p className="text-[10px] text-neutral-400 font-semibold font-mono">
                                Hex Code: {bestItem.hexColor}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-mono font-bold">
                              <span className="text-neutral-400 uppercase tracking-widest text-[9px]">{t.matchScore || 'Compatibility'}</span>
                              <span className="font-black text-sm" style={{ color: bestItem.hexColor }}>{bestItem.matchScore}%</span>
                            </div>
                            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full transition-all duration-1000" 
                                style={{ 
                                  width: `${bestItem.matchScore}%`,
                                  backgroundColor: bestItem.hexColor
                                }}
                              />
                            </div>
                          </div>

                          <p className="text-[11px] sm:text-xs text-neutral-600 leading-relaxed font-semibold">
                            {bestItem.reasoning}
                          </p>
                        </div>
                      </div>

                      {/* General overview feedback block */}
                      {result.explanation && (
                        <div className="mt-6 pt-5 border-t border-neutral-150/50 text-[11px] sm:text-xs text-neutral-500 font-medium leading-relaxed italic">
                          "{result.explanation}"
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 2. RECONCILED LIST OF ALL ANALYZED ITEMS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 px-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                    <h3 className="text-[10px] font-black text-neutral-800 uppercase tracking-widest font-mono">
                      {t.allOutfits || 'All Outfits Analyzed'}
                    </h3>
                  </div>

                  <div className="space-y-3.5">
                    {result.items.map((item, idx) => {
                      const itemUrl = getPreviewByFilename(item.filename);
                      const isBestMatch = item.filename === result.bestItemFilename;

                      return (
                        <div 
                          key={idx}
                          className={`p-4 bg-white border rounded-3xl transition-all flex flex-col sm:flex-row items-center gap-4.5 ${
                            isBestMatch 
                              ? 'border-indigo-400 shadow-md ring-1 ring-indigo-400/25 bg-indigo-50/5' 
                              : 'border-neutral-200/60 hover:border-neutral-350 shadow-sm'
                          }`}
                        >
                          {/* Image preview of searched clothing image */}
                          <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-neutral-100 shadow-inner bg-neutral-50 relative">
                            <img src={itemUrl} alt="Outfit check" className="w-full h-full object-cover" />
                          </div>

                          <div className="flex-1 space-y-3 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border border-black/5 shrink-0"
                                  style={{ backgroundColor: item.hexColor }}
                                />
                                <h4 className="font-display font-black text-neutral-900 text-xs sm:text-sm uppercase tracking-wide">
                                  {item.detectedColorName}
                                </h4>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-mono ${
                                  item.isCompatible 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                    : 'bg-red-50 border-red-200 text-red-800'
                                }`}>
                                  {item.isCompatible ? (t.compatible || 'Recommended') : (t.notCompatible || 'Not Ideal')}
                                </span>
                                <span className="text-[11px] font-mono font-black text-neutral-700">
                                  {item.matchScore}%
                                </span>
                              </div>
                            </div>

                            <p className="text-[10.5px] sm:text-xs text-neutral-400 font-semibold leading-normal">
                              {item.reasoning}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
};
