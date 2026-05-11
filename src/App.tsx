import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  Save, 
  History, 
  ChevronLeft, 
  Sparkles, 
  User as UserIcon,
  LogOut,
  Trash2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { analyzeColor } from './services/gemini';

// --- Types ---
interface ColorInfo {
  hex: string;
  name: string;
}

interface Analysis {
  id?: string;
  userId: string;
  season: 'Winter' | 'Spring' | 'Summer' | 'Autumn';
  subType: string;
  bestColors: ColorInfo[];
  avoidColors: ColorInfo[];
  jewelry: 'Gold' | 'Silver';
  skinUndertone: string;
  eyeColor: string;
  hairColor: string;
  imageUrl?: string;
  createdAt: any;
}

// --- Components ---

const ColorSwatch: React.FC<{ color: ColorInfo }> = ({ color }) => (
  <div className="flex flex-col items-center gap-1">
    <div 
      className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-black/5 shadow-sm" 
      style={{ backgroundColor: color.hex }}
    />
    <span className="text-[9px] text-gray-500 font-medium truncate w-14 md:w-16 text-center">{color.name}</span>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'analyses'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Analysis));
      setHistory(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'analyses');
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setAnalysisError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const analysisResult = await analyzeColor(buffer, selectedFile.type);
      
      if (analysisResult.isValid === false) {
        setAnalysisError(analysisResult.errorMessage || "This photo doesn't seem suitable for color analysis. Please ensure your face is clear and the lighting is natural.");
        return;
      }

      const newAnalysis: Analysis = {
        ...analysisResult,
        userId: user?.uid || 'anonymous',
        createdAt: new Date().toISOString(),
      };
      
      setResult(newAnalysis);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed unexpectedly. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const saveToHistory = async () => {
    if (!user || !result) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'analyses'), {
        ...result,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      alert("Analysis saved to your history!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'analyses');
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    if (!confirm("Are you sure you want to delete this analysis?")) return;
    try {
      await deleteDoc(doc(db, 'analyses', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `analyses/${id}`);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans selection:bg-brand-primary/20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-black/5 z-50 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setResult(null); setShowHistory(false); }}>
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white shadow-lg">
            <Sparkles size={18} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Varnally</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <History size={20} />
                {history.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full" />
                )}
              </button>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                <img src={user.photoURL || ''} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
              </div>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2"
            >
              <UserIcon size={16} />
              Sign In
            </button>
          )}
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 md:px-8 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {showHistory ? (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronLeft size={24} />
                </button>
                <h1 className="text-3xl font-display font-bold">Saved Palettes</h1>
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
                        onClick={() => deleteAnalysis(item.id!)}
                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-display font-bold text-xl">{item.season}</h3>
                          <p className="text-gray-500 text-sm font-medium">{item.subType}</p>
                        </div>
                        <div className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-full uppercase tracking-wider">
                          AI Analyzed
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
                          onClick={() => { setResult(item); setShowHistory(false); }}
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
          ) : result ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              {/* Result View */}
              <div className="flex items-center gap-4 justify-between">
                <button onClick={() => setResult(null)} className="flex items-center gap-2 text-gray-500 font-medium hover:text-gray-900 transition-colors">
                  <ChevronLeft size={20} />
                  Analyze Another
                </button>
                {user && !result.id && (
                  <button 
                    onClick={saveToHistory}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-secondary text-white rounded-full font-bold shadow-lg shadow-brand-secondary/20 hover:scale-105 active:scale-95 transition-all text-sm disabled:opacity-50"
                  >
                    {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Results
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Photo & Details */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                    <img 
                      src={previewUrl || ''} 
                      alt="Analyzed face" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-4">
                    <h3 className="font-display font-bold text-gray-900 border-b border-gray-100 pb-3">Observations</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-primary mt-2" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Skin Undertone</p>
                          <p className="text-sm font-medium text-gray-700">{result.skinUndertone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Eye Color</p>
                          <p className="text-sm font-medium text-gray-700">{result.eyeColor}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-800 mt-2" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hair Color</p>
                          <p className="text-sm font-medium text-gray-700">{result.hairColor}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Palette & Best/Worst */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                      <Sparkles className="text-brand-primary opacity-20" size={60} />
                    </div>
                    <p className="text-sm font-bold text-brand-primary uppercase tracking-widest mb-2">Analysis Result</p>
                    <h1 className="text-5xl md:text-6xl font-display font-black text-gray-900 leading-tight">
                      {result.season}
                      <span className="block text-2xl md:text-3xl text-gray-400 font-medium">{result.subType}</span>
                    </h1>
                    
                    <div className="mt-8 flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-sm ${result.jewelry === 'Gold' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                        <div className={`w-3 h-3 rounded-full ${result.jewelry === 'Gold' ? 'bg-amber-400' : 'bg-slate-400'}`} />
                        Suits {result.jewelry}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-8">
                      <Check className="text-green-500" />
                      Best Colors to Wear
                    </h2>
                    <div className="grid grid-cols-5 gap-4">
                      {(result.bestColors || []).map((color, idx) => (
                        <ColorSwatch key={idx} color={color} />
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-8">
                      <Trash2 className="text-red-500" size={20} />
                      Colors to Avoid
                    </h2>
                    <div className="grid grid-cols-5 gap-4">
                      {(result.avoidColors || []).map((color, idx) => (
                        <ColorSwatch key={idx} color={color} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
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
                    onClick={() => fileInputRef.current?.click()}
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
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white relative group">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      
                      {/* Scanning Animation */}
                      {analyzing && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                          {/* Corner Brackets */}
                          <div className="absolute top-12 left-12 w-12 h-12 border-t-4 border-l-4 border-white/60 rounded-tl-2xl" />
                          <div className="absolute top-12 right-12 w-12 h-12 border-t-4 border-r-4 border-white/60 rounded-tr-2xl" />
                          <div className="absolute bottom-12 left-12 w-12 h-12 border-b-4 border-l-4 border-white/60 rounded-bl-2xl" />
                          <div className="absolute bottom-12 right-12 w-12 h-12 border-b-4 border-r-4 border-white/60 rounded-br-2xl" />

                          {/* Geometric Mesh Overlay */}
                          <svg className="absolute inset-0 w-full h-full text-white/30" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <motion.g
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0.2, 0.5, 0.2] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              {/* Central Face Mesh Nodes */}
                              <circle cx="50" cy="30" r="0.8" fill="currentColor" /> {/* Forehead */}
                              <circle cx="35" cy="45" r="0.8" fill="currentColor" /> {/* L Eye */}
                              <circle cx="65" cy="45" r="0.8" fill="currentColor" /> {/* R Eye */}
                              <circle cx="50" cy="55" r="0.8" fill="currentColor" /> {/* Nose Tip */}
                              <circle cx="40" cy="75" r="0.8" fill="currentColor" /> {/* L Jaw */}
                              <circle cx="60" cy="75" r="0.8" fill="currentColor" /> {/* R Jaw */}
                              <circle cx="50" cy="85" r="0.8" fill="currentColor" /> {/* Chin */}
                              
                              {/* Mesh Lines */}
                              <path d="M50 30 L35 45 L50 55 L65 45 Z" fill="none" stroke="currentColor" strokeWidth="0.2" />
                              <path d="M35 45 L40 75 L50 85 L60 75 L65 45" fill="none" stroke="currentColor" strokeWidth="0.2" />
                              <path d="M50 55 L40 75 M50 55 L60 75" fill="none" stroke="currentColor" strokeWidth="0.2" />
                              <path d="M50 30 L50 55" fill="none" stroke="currentColor" strokeWidth="0.2" />
                            </motion.g>
                          </svg>

                          {/* Scan Line & Trailing Gradient */}
                          <motion.div 
                            initial={{ top: '-10%' }}
                            animate={{ top: '110%' }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                            className="absolute left-0 right-0 h-1/2 bg-gradient-to-b from-transparent via-transparent to-brand-primary/30"
                          >
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary shadow-[0_0_25px_rgba(255,138,101,0.9)]" />
                            {/* Blue secondary glow like in the image */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-secondary/40 blur-md translate-y-1" />
                          </motion.div>
                        </div>
                      )}

                      <button 
                        onClick={reset}
                        className="absolute top-6 right-6 p-3 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        title="Remove photo"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={handleAnalyze}
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
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="py-12 border-t border-gray-100 mt-auto">
        <div className="max-w-4xl mx-auto px-8 text-center space-y-4">
          <p className="text-sm font-medium text-gray-400">Powered by Gemini Vision 2.0 Flash</p>
          <div className="flex justify-center gap-8">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Winter</span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Spring</span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Summer</span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Autumn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
