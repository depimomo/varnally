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

      const thumbnailUrl = await generateThumbnail(selectedFile);
      const analysisResult = await analyzeColor(buffer, selectedFile.type);
      
      if (analysisResult.isValid === false) {
        setAnalysisError(analysisResult.errorMessage || "This photo doesn't seem suitable for color analysis. Please ensure your face is clear and the lighting is natural.");
        return;
      }

      const newAnalysis: Analysis = {
        ...analysisResult,
        userId: user?.uid || 'anonymous',
        imageUrl: thumbnailUrl,
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

  const getFaceShapeImage = (shape: string) => {
    const normalized = shape.toLowerCase().split(' ')[0];
    return `/face-shape/face_${normalized}.png`;
  };

  const deleteAnalysis = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'analyses', id));
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
    <div className="min-h-screen bg-neutral-50 font-sans selection:bg-brand-primary/20 flex flex-col">
      <Header 
        user={user}
        historyLength={history.length}
        showHistory={showHistory}
        onLogoClick={() => { setResult(null); setShowHistory(false); }}
        onHistoryToggle={() => setShowHistory(!showHistory)}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <main className="pt-24 pb-12 px-4 md:px-8 max-w-4xl mx-auto flex-1 w-full">
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
          ) : (
            <ImageUploader 
              previewUrl={previewUrl}
              analyzing={analyzing}
              analysisError={analysisError}
              fileInputRef={fileInputRef}
              onFileClick={() => fileInputRef.current?.click()}
              onFileChange={handleFileChange}
              onAnalyze={handleAnalyze}
              onReset={reset}
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
    </div>
  );
}
