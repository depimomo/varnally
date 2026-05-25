import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
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
import { Analysis } from './types';
import { Header } from './components/Header';
import { HistoryList } from './components/HistoryList';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResult } from './components/AnalysisResult';
import { LandingHero } from './components/LandingHero';
import { Toast, ToastType } from './components/Toast';
import { useLanguage } from './lib/LanguageContext';

export default function App() {
  const { language } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      // Load local history for guest users
      const localData = localStorage.getItem('varnally_history');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) {
            setHistory(parsed);
          } else {
            setHistory([]);
          }
        } catch (e) {
          console.error(e);
          setHistory([]);
        }
      } else {
        setHistory([]);
      }
      return;
    }

    const q = query(
      collection(db, 'analyses'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Analysis));
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
      
      const generateThumbnail = (file: File): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 150;
              const MAX_HEIGHT = 150;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        });
      };

      const compressImageUrl = (url: string, maxDim: number = 350, quality: number = 0.70): Promise<string> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height *= maxDim / width;
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width *= maxDim / height;
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          };
          img.onerror = () => {
            resolve(url);
          };
          img.src = url;
        });
      };

      const thumbnailUrl = await generateThumbnail(selectedFile);
      
      const analysisResult = await analyzeColor(buffer, selectedFile.type);
      
      if (analysisResult.isValid === false) {
        setAnalysisError(analysisResult.errorMessage || (language === 'id' ? "Foto ini tampaknya tidak cocok untuk analisis warna. Harap pastikan wajah Anda terlihat jelas dengan pencahayaan alami." : "This photo doesn't seem suitable for color analysis. Please ensure your face is clear and the lighting is natural."));
        return;
      }

      // Dynamic lightweight photo persistence (under 30KB) using canvas compression
      let finalCleanedUrl: string | undefined = undefined;
      if (previewUrl) {
        finalCleanedUrl = await compressImageUrl(previewUrl, 350, 0.70);
      }

      const newAnalysis: Analysis = {
        ...analysisResult,
        userId: user?.uid || 'anonymous',
        imageUrl: thumbnailUrl,
        cleanedImageUrl: finalCleanedUrl || undefined,
        createdAt: new Date().toISOString(),
      };
      
      setResult(newAnalysis);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : (language === 'id' ? "Analisis gagal. Silakan coba lagi." : "Analysis failed unexpectedly. Please try again."));
    } finally {
      setAnalyzing(false);
    }
  };

  const saveToHistory = async () => {
    if (!result) return;
    
    setLoading(true);
    try {
      if (user) {
        // Enforce exactly 5 values for bestColors and avoidColors to fully satisfy Firestore rules configuration
        const trimmedBestColors = (result.bestColors || []).slice(0, 5);
        while (trimmedBestColors.length < 5) {
          trimmedBestColors.push({ hex: "#FFFFFF", name: "Off White" });
        }
        const trimmedAvoidColors = (result.avoidColors || []).slice(0, 5);
        while (trimmedAvoidColors.length < 5) {
          trimmedAvoidColors.push({ hex: "#000000", name: "Black" });
        }

        const validResult = {
          ...result,
          bestColors: trimmedBestColors,
          avoidColors: trimmedAvoidColors,
          userId: user.uid,
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'analyses'), validResult);
        setResult({ ...result, id: docRef.id });
        setToast({ message: language === 'id' ? "Analisis Varna berhasil disimpan ke profil cloud Anda!" : "Varna analysis successfully saved to your cloud profile!", type: "success" });
      } else {
        // Save to localStorage for robust offline/guest usage
        const localData = localStorage.getItem('varnally_history');
        let currentLocalHistory: Analysis[] = [];
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed)) {
              currentLocalHistory = parsed;
            }
          } catch (e) {
            console.error(e);
          }
        }

        const localId = result.id || `local_${Date.now()}`;
        const newLocalItem: Analysis = {
          ...result,
          id: localId,
          userId: 'anonymous',
          createdAt: new Date().toISOString(),
        };

        const updatedHistory = [newLocalItem, ...currentLocalHistory];
        localStorage.setItem('varnally_history', JSON.stringify(updatedHistory));
        setHistory(updatedHistory);
        setResult(newLocalItem);
        setToast({ message: language === 'id' ? "Disimpan ke riwayat lokal! Masuk dengan Google untuk pencadangan cloud global." : "Saved to local history! Sign in with Google to backup cloud-wide.", type: "success" });
      }
    } catch (error) {
      console.error(error);
      setToast({ message: language === 'id' ? "Gagal menyimpan. Silakan masuk menggunakan Google untuk mencoba lagi." : "Failed to save. Please sign in with Google to try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getFaceShapeImage = (shape: string) => {
    const normalized = shape.toLowerCase().split(' ')[0];
    return `/face-shape/face_${normalized}.png`;
  };

  const deleteAnalysis = async (id: string) => {
    try {
      if (user && !id.startsWith('local_')) {
        await deleteDoc(doc(db, 'analyses', id));
      } else {
        const localData = localStorage.getItem('varnally_history');
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed)) {
              const updated = parsed.filter((item: any) => item.id !== id);
              localStorage.setItem('varnally_history', JSON.stringify(updated));
              setHistory(updated);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    } catch (error) {
      console.error("Delete failed for ID:", id, error);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-white sm:bg-neutral-50 font-sans selection:bg-brand-primary/20 flex flex-col">
      <Header 
        user={user}
        historyLength={history.length}
        showHistory={showHistory}
        onLogoClick={() => { setResult(null); setShowHistory(false); setShowUploader(false); }}
        onHistoryToggle={() => setShowHistory(!showHistory)}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <main className="pt-24 pb-12 px-3 sm:px-6 md:px-8 w-full max-w-full md:max-w-[85%] lg:max-w-7xl mx-auto flex-1">
        <AnimatePresence mode="wait">
          {showHistory ? (
            <HistoryList 
              history={history}
              onBack={() => setShowHistory(false)}
              onDelete={deleteAnalysis}
              onView={(item) => { setResult(item); setShowHistory(false); }}
            />
          ) : result ? (
            <AnalysisResult 
              result={result}
              user={user}
              loading={loading}
              previewUrl={previewUrl}
              onBack={() => setResult(null)}
              onSave={saveToHistory}
              getFaceShapeImage={getFaceShapeImage}
            />
          ) : showUploader ? (
            <ImageUploader 
              previewUrl={previewUrl}
              analyzing={analyzing}
              analysisError={analysisError}
              fileInputRef={fileInputRef}
              onFileClick={() => fileInputRef.current?.click()}
              onFileChange={handleFileChange}
              onAnalyze={handleAnalyze}
              onReset={reset}
              onBackToLanding={() => setShowUploader(false)}
              onCaptured={(file) => {
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                setResult(null);
                setAnalysisError(null);
              }}
            />
          ) : (
            <LandingHero 
              onStart={() => setShowUploader(true)}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-8 text-center space-y-4">
          <p className="text-sm font-medium text-gray-400">Powered by Gemini Vision 2.0 Flash</p>
          <div className="flex justify-center gap-8">
            {['Winter', 'Spring', 'Summer', 'Autumn'].map(season => (
              <span key={season} className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{season}</span>
            ))}
          </div>
        </div>
      </footer>

      {/* Elegant Toast Feedback */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
