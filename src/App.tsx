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
  serverTimestamp,
  updateDoc,
  getDocs
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
import { Github, Linkedin } from 'lucide-react';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import { VarnallyHub } from './components/VarnallyHub';
import { GlowMeUp } from './components/GlowMeUp';
import { StylizeMe } from './components/StylizeMe';

export default function App() {
  const { language, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inputName, setInputName] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showHub, setShowHub] = useState(false);
  const [hubSubPage, setHubSubPage] = useState<'menu' | 'glow_me_up'>('menu');
  const [glowMeUpOverrideProfile, setGlowMeUpOverrideProfile] = useState<Analysis | null>(null);
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

  // Reset viewport scroll to top upon page navigation state shifts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [showHub, hubSubPage, showHistory, result, showUploader]);

  const syncLocalStorageToFirestore = async (userInstance: User) => {
    const localData = localStorage.getItem('varnally_history');
    if (!localData) return;

    try {
      const parsed = JSON.parse(localData);
      if (!Array.isArray(parsed) || parsed.length === 0) return;

      // Check if a pinned profile already exists in the cloud database for this user
      const q = query(
        collection(db, 'analyses'),
        where('userId', '==', userInstance.uid),
        where('isPinnedProfile', '==', true)
      );
      const querySnapshot = await getDocs(q);
      let cloudHasPinned = !querySnapshot.empty;

      for (const item of parsed) {
        const trimmedBestColors = (item.bestColors || []).slice(0, 5);
        while (trimmedBestColors.length < 5) {
          trimmedBestColors.push({ hex: "#FFFFFF", name: "Off White" });
        }
        const trimmedAvoidColors = (item.avoidColors || []).slice(0, 5);
        while (trimmedAvoidColors.length < 5) {
          trimmedAvoidColors.push({ hex: "#000000", name: "Black" });
        }

        // Prioritize original cloud profile.
        // If cloud already has a pinned profile, sync this item with isPinnedProfile = false.
        // If cloud doesn't have a pinned profile yet, allow one synced local profile to be pinned,
        // and set cloudHasPinned to true so any subsequent local profiles in the same batch won't be pinned.
        let shouldBePinned = false;
        if (item.isPinnedProfile === true) {
          if (!cloudHasPinned) {
            shouldBePinned = true;
            cloudHasPinned = true;
          }
        }

        const validResult = {
          userId: userInstance.uid,
          season: item.season,
          subType: item.subType || "General",
          bestColors: trimmedBestColors,
          avoidColors: trimmedAvoidColors,
          jewelry: item.jewelry || "Gold & Silver",
          faceShape: item.faceShape || "Oval",
          faceShapeDescription: item.faceShapeDescription || "",
          skinUndertone: item.skinUndertone || "Neutral",
          eyeColor: item.eyeColor || "Brown",
          hairColor: item.hairColor || "Black",
          name: item.name || null,
          imageUrl: item.imageUrl || null,
          cleanedImageUrl: item.cleanedImageUrl || null,
          createdAt: serverTimestamp(),
          isPinnedProfile: shouldBePinned,
        };

        try {
          await addDoc(collection(db, 'analyses'), validResult);
        } catch (error) {
          console.error("Failed to sync local item to Firebase:", error);
        }
      }

      localStorage.removeItem('varnally_history');
      setToast({ 
        message: language === 'id' 
          ? "Histori lokal berhasil disimpan ke akun Google Anda!" 
          : "Successfully synced local history to your Google account!", 
        type: "success" 
      });
    } catch (e) {
      console.error("Error parsing local storage history during sync:", e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        syncLocalStorageToFirestore(u);
      }
    });
    return () => unsubscribe();
  }, [language]);

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

  // Sync details view result if its pin status changes in the background history change
  useEffect(() => {
    if (result && result.id) {
      const latestItem = history.find(item => item.id === result.id);
      if (latestItem && latestItem.isPinnedProfile !== result.isPinnedProfile) {
        setResult(latestItem);
      }
    }
  }, [history, result]);

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
      // Automatically compress and resize large inputs (such as photos taken on iPhone)
      // to 1000px max dimensions to prevent high bandwidth lag and memory issues.
      let fileToAnalyze = selectedFile;
      if (selectedFile.size > 500 * 1024) { // larger than 500KB
        try {
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

          fileToAnalyze = await optimizeLargeFile(selectedFile);
        } catch (err) {
          console.warn("Client-side optimization failed, falling back to original image:", err);
        }
      }

      const buffer = await fileToAnalyze.arrayBuffer();
      
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

      const thumbnailUrl = await generateThumbnail(fileToAnalyze);
      
      const analysisResult = await analyzeColor(buffer, fileToAnalyze.type);
      
      if (analysisResult.isValid === false) {
        setAnalysisError(analysisResult.errorMessage || t.suitableError);
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
        name: inputName.trim() || undefined,
        imageUrl: thumbnailUrl,
        cleanedImageUrl: finalCleanedUrl || undefined,
        createdAt: new Date().toISOString(),
      };
      
      setResult(newAnalysis);
      setShowWelcomeModal(true);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : t.analysisUnexpectedError);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveToHistory = async (shouldPinArg: boolean | any = false) => {
    const shouldPin = shouldPinArg === true;
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

        // If pinning this, set all previous to false first
        if (shouldPin) {
          const resetPromises = history.map(async (item) => {
            if (item.id && item.isPinnedProfile) {
              await updateDoc(doc(db, 'analyses', item.id), { isPinnedProfile: false });
            }
          });
          await Promise.all(resetPromises);
        }

        const validResult = {
          userId: user.uid,
          season: result.season,
          subType: result.subType,
          bestColors: trimmedBestColors,
          avoidColors: trimmedAvoidColors,
          jewelry: result.jewelry,
          faceShape: result.faceShape,
          faceShapeDescription: result.faceShapeDescription,
          skinUndertone: result.skinUndertone,
          eyeColor: result.eyeColor,
          hairColor: result.hairColor,
          name: result.name || null,
          imageUrl: result.imageUrl || null,
          cleanedImageUrl: result.cleanedImageUrl || null,
          createdAt: serverTimestamp(),
          isPinnedProfile: shouldPin,
        };

        let docRef;
        try {
          docRef = await addDoc(collection(db, 'analyses'), validResult);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'analyses');
        }
        
        if (docRef) {
          const savedResult = { ...result, id: docRef.id, isPinnedProfile: shouldPin };
          setResult(savedResult);
          setToast({ message: t.varnaSavedCloud, type: "success" });
        }
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
        
        let processedHistory = currentLocalHistory;
        if (shouldPin) {
          processedHistory = currentLocalHistory.map((item) => ({
            ...item,
            isPinnedProfile: false
          }));
        }

        const newLocalItem: Analysis = {
          ...result,
          id: localId,
          userId: 'anonymous',
          createdAt: new Date().toISOString(),
          isPinnedProfile: shouldPin,
        };

        const updatedHistory = [newLocalItem, ...processedHistory];
        localStorage.setItem('varnally_history', JSON.stringify(updatedHistory));
        setHistory(updatedHistory);
        setResult(newLocalItem);
        setToast({ message: t.savedLocalHistory, type: "success" });
      }
    } catch (error) {
      console.error(error);
      setToast({ message: t.failedToSaveCloud, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const pinProfile = async (id: string) => {
    try {
      const targetItem = history.find(item => item.id === id);
      const isCurrentlyPinned = targetItem?.isPinnedProfile === true;

      if (user) {
        // Clear all other pinned instances
        const updatePromises = history.map(async (item) => {
          if (item.id && item.id !== id && item.isPinnedProfile) {
            await updateDoc(doc(db, 'analyses', item.id), { isPinnedProfile: false });
          }
        });
        await Promise.all(updatePromises);
        
        // Toggle pin state
        const nextPinnedState = !isCurrentlyPinned;
        await updateDoc(doc(db, 'analyses', id), { isPinnedProfile: nextPinnedState });
        
        if (result && result.id === id) {
          setResult(prev => prev ? { ...prev, isPinnedProfile: nextPinnedState } : null);
        }

        if (nextPinnedState) {
          setToast({ message: t.profileSavedAsDefault, type: "success" });
        } else {
          setToast({ message: language === 'id' ? "Profil dikosongkan!" : "Profile cleared!", type: "success" });
        }
      } else {
        const nextPinnedState = !isCurrentlyPinned;
        const updatedHistory = history.map((item) => ({
          ...item,
          isPinnedProfile: item.id === id ? nextPinnedState : false
        }));
        localStorage.setItem('varnally_history', JSON.stringify(updatedHistory));
        setHistory(updatedHistory);
        
        if (result && result.id === id) {
          setResult(prev => prev ? { ...prev, isPinnedProfile: nextPinnedState } : null);
        }

        if (nextPinnedState) {
          setToast({ message: t.profileSavedAsDefault, type: "success" });
        } else {
          setToast({ message: language === 'id' ? "Profil dikosongkan!" : "Profile cleared!", type: "success" });
        }
      }
    } catch (error) {
      console.error("Pin profile failed", error);
      setToast({ message: "Failed to update profile pin.", type: "error" });
    }
  };

  const getFaceShapeImage = (shape: string) => {
    const normalized = shape.toLowerCase().split(' ')[0];
    return `/face-shape/face_${normalized}.png`;
  };

  const deleteAnalysis = async (id: string) => {
    try {
      if (user && !id.startsWith('local_')) {
        try {
          await deleteDoc(doc(db, 'analyses', id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `analyses/${id}`);
        }
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
    setInputName("");
    setShowWelcomeModal(false);
  };

  const sortedHistory = [...history].sort((a, b) => {
    const aPin = a.isPinnedProfile ? 1 : 0;
    const bPin = b.isPinnedProfile ? 1 : 0;
    return bPin - aPin;
  });

  const pinnedProfile = history.find(item => item.isPinnedProfile);

  return (
    <div className="min-h-screen bg-white sm:bg-neutral-50 font-sans selection:bg-brand-primary/20 flex flex-col">
      <Header 
        user={user}
        historyLength={history.length}
        showHistory={showHistory}
        onLogoClick={() => { setResult(null); setShowHistory(false); setShowUploader(false); setShowHub(false); setHubSubPage('menu'); }}
        onHistoryToggle={() => { setShowHistory(!showHistory); setShowHub(false); }}
        onLogin={handleLogin}
        onLogout={handleLogout}
        pinnedProfile={pinnedProfile}
        onPinnedProfileClick={(profile) => {
          setResult(profile);
          setShowHistory(false);
          setShowUploader(false);
          setShowWelcomeModal(false);
          setShowHub(false);
          setHubSubPage('menu');
        }}
        showHub={showHub}
        onHubClick={() => {
          setShowHub(true);
          setHubSubPage('menu');
          setShowHistory(false);
          setResult(null);
          setShowUploader(false);
        }}
      />

      <main className={`pt-24 pb-12 w-full flex-1 ${
        showHistory || result || showUploader || showHub
          ? "px-3 sm:px-6 md:px-8 max-w-full md:max-w-[85%] lg:max-w-7xl mx-auto" 
          : ""
      }`}>
        <AnimatePresence mode="wait">
          {showHub ? (
            hubSubPage === 'glow_me_up' ? (
              <GlowMeUp 
                pinnedProfile={pinnedProfile || glowMeUpOverrideProfile || null}
                history={history}
                onBack={() => {
                  if (glowMeUpOverrideProfile) {
                    setShowHub(false);
                    // Do NOT reset the main result, just clear the override state so we return to result render mode
                    setGlowMeUpOverrideProfile(null);
                  } else {
                    setHubSubPage('menu');
                  }
                }}
              />
            ) : hubSubPage === 'stylize_me' ? (
              <StylizeMe 
                pinnedProfile={pinnedProfile || glowMeUpOverrideProfile || null}
                history={history}
                onBack={() => {
                  if (glowMeUpOverrideProfile) {
                    setShowHub(false);
                    setGlowMeUpOverrideProfile(null);
                  } else {
                    setHubSubPage('menu');
                  }
                }}
              />
            ) : (
              <VarnallyHub 
                onBack={() => setShowHub(false)}
                onSelectFeature={(featureId) => {
                  if (featureId === 'glow_me_up') {
                    setHubSubPage('glow_me_up');
                  } else if (featureId === 'stylize_me') {
                    setHubSubPage('stylize_me');
                  }
                }}
              />
            )
          ) : showHistory ? (
            <HistoryList 
              history={sortedHistory}
              onBack={() => setShowHistory(false)}
              onDelete={deleteAnalysis}
              onView={(item) => { setResult(item); setShowHistory(false); }}
              onPin={pinProfile}
            />
          ) : result ? (
            <AnalysisResult 
              result={result}
              user={user}
              loading={loading}
              previewUrl={previewUrl}
              onBack={() => setResult(null)}
              onSave={saveToHistory}
              onPin={pinProfile}
              getFaceShapeImage={getFaceShapeImage}
              onGlowMeUp={() => {
                setGlowMeUpOverrideProfile(result);
                setShowHub(true);
                setHubSubPage('glow_me_up');
              }}
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
              inputName={inputName}
              setInputName={setInputName}
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
          <p className="text-sm font-semibold text-gray-550 border-gray-100">
            Crafted with <span className="text-rose-500 animate-pulse">{"♡"}</span> for <a href="https://rsvp.withgoogle.com/events/juaravibecoding/home" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity inline-block"><span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">#JuaraVibeCoding</span></a>
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 pt-1">
            <a 
              href="https://www.linkedin.com/in/monicadevikristiadi/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-brand-primary transition-all font-mono uppercase tracking-widest active:scale-95"
            >
              <Linkedin size={14} className="shrink-0" />
              LinkedIn
            </a>
            <span className="hidden sm:inline text-gray-200">|</span>
            <a 
              href="https://github.com/depimomo/varnally" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-brand-secondary transition-all font-mono uppercase tracking-widest active:scale-95"
            >
              <Github size={14} className="shrink-0" />
              Github
            </a>
          </div>
        </div>
      </footer>

      {/* Dynamic Animated Welcome Overlay Transition */}
      <AnimatePresence>
        {showWelcomeModal && result && (
          <WelcomeOverlay 
            result={result}
            previewUrl={previewUrl}
            onClose={() => setShowWelcomeModal(false)}
          />
        )}
      </AnimatePresence>

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
