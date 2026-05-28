import React, { useState, useEffect } from 'react';
import { Sparkles, History, LogOut, User as UserIcon, Star, Menu, X, Lock } from 'lucide-react';
import { User } from 'firebase/auth';
import { useLanguage } from '../lib/LanguageContext';
import { Analysis } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  user: User | null;
  historyLength: number;
  showHistory: boolean;
  onLogoClick: () => void;
  onHistoryToggle: () => void;
  onLogin: () => void;
  onLogout: () => void;
  pinnedProfile?: Analysis;
  onPinnedProfileClick?: (profile: Analysis) => void;
  onHubClick?: () => void;
  showHub?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  historyLength,
  showHistory,
  onLogoClick,
  onHistoryToggle,
  onLogin,
  onLogout,
  pinnedProfile,
  onPinnedProfileClick,
  onHubClick,
  showHub
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on resize to desktop, or when user clicks something
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync scroll lock when menu is active
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleMobileProfileClick = () => {
    if (pinnedProfile && onPinnedProfileClick) {
      onPinnedProfileClick(pinnedProfile);
      setIsMenuOpen(false);
    }
  };

  const handleMobileHistoryToggle = () => {
    onHistoryToggle();
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-black/5 z-40 px-4 md:px-8 flex items-center justify-between animate-fade-in select-none">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { onLogoClick(); setIsMenuOpen(false); }}>
            <img 
              src="/icon.png" 
              alt="Varnally Logo" 
              className="w-8 h-8 object-cover rounded-lg shadow-md"
              referrerPolicy="no-referrer"
            />
            <span className="font-display font-bold text-xl tracking-tight">{t.logoName}</span>
          </div>

          <button
            onClick={() => { onHubClick?.(); setIsMenuOpen(false); }}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer select-none ${
              showHub 
                ? 'bg-neutral-950 text-white shadow-md' 
                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200/40'
            }`}
          >
            <span>Varnally Hub</span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-primary"></span>
            </span>
          </button>
        </div>

        {/* Desktop Navigation Row (md and larger) */}
        <div className="hidden md:flex items-center gap-3 md:gap-4">
          {pinnedProfile && (
            <button
              onClick={() => onPinnedProfileClick?.(pinnedProfile)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer max-w-[120px] xs:max-w-[160px] sm:max-w-none select-none"
              title={t.pinnedBadge || "My Profile"}
            >
              <span className="shrink-0 flex items-center text-amber-500">
                <Star size={12} className="fill-amber-400" />
              </span>
              <span className="truncate font-mono font-black">{pinnedProfile.subType} {pinnedProfile.season}</span>
            </button>
          )}

          {/* Aesthetic Language Selector Pill */}
          <div className="flex bg-neutral-100 p-0.5 rounded-full border border-neutral-200/40 text-[10px] sm:text-xs font-bold leading-none select-none shrink-0" id="language-toggle">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer ${language === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('id')}
              className={`px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer ${language === 'id' ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              ID
            </button>
          </div>

          <button 
            onClick={onHistoryToggle}
            className={`p-2 rounded-full transition-colors relative cursor-pointer ${showHistory ? 'bg-gray-100 text-brand-primary' : 'text-gray-600 hover:bg-gray-100'}`}
            title={t.historyTitle}
          >
            <History size={18} />
            {historyLength > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
                <img src={user.photoURL || ''} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
              </div>
              <button onClick={onLogout} className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer p-1" title={t.signOut}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gray-900 text-white rounded-full text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <UserIcon size={14} className="sm:size-[16px]" />
              {t.signIn}
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex md:hidden items-center justify-center p-2 rounded-xl text-gray-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Right Drawer Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-45 md:hidden"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] sm:w-[320px] bg-white shadow-2xl z-50 md:hidden flex flex-col p-6 overflow-y-auto"
            >
              {/* Drawer Content */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
                <span className="font-display font-black text-lg text-neutral-900 uppercase tracking-wider">
                  Menu
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body Items */}
              <div className="flex-1 flex flex-col space-y-6">
                
                {/* 1. User Profile Picture / Account Status Card */}
                {user ? (
                  <div className="flex items-center gap-3 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                      <img src={user.photoURL || ''} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate leading-tight">
                        {user.displayName || 'Varnally User'}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate leading-none mt-1">
                        {user.email || ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { onLogin(); setIsMenuOpen(false); }}
                    className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-mono"
                  >
                    <UserIcon size={14} />
                    {t.signIn}
                  </button>
                )}

                {/* Varnally Hub Link on Mobile */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] block px-1">
                    Hub
                  </span>
                  <button
                    onClick={() => { onHubClick?.(); setIsMenuOpen(false); }}
                    className={`w-full flex items-center justify-between p-3.5 border rounded-2xl transition-all cursor-pointer text-left font-semibold text-xs ${
                      showHub
                        ? 'bg-neutral-950 border-neutral-950 text-white shadow-md'
                        : 'bg-white hover:bg-neutral-50 border-neutral-100 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={16} className={showHub ? "text-amber-400 animate-pulse" : "text-brand-primary"} />
                      <span>Varnally Hub</span>
                    </div>
                    <span className="bg-brand-secondary text-white text-[9px] font-black uppercase tracking-wider py-0.5 px-1.5 rounded-full animate-pulse shrink-0">
                      NEW
                    </span>
                  </button>
                </div>

                {/* 2. Pinned Color Profile (If selected, make highly visible) */}
                {pinnedProfile ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] block px-1">
                      {t.myActiveProfile || "Active Profile"}
                    </span>
                    <button
                      onClick={handleMobileProfileClick}
                      className="w-full flex items-center justify-between gap-3 p-3 bg-amber-50 hover:bg-amber-100/60 border border-amber-200 rounded-2xl text-amber-900 transition-all select-none cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Star size={14} className="fill-amber-400 text-amber-500 shrink-0" />
                        <span className="truncate font-mono font-black text-xs uppercase tracking-wide">
                          {pinnedProfile.subType} {pinnedProfile.season}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded-full shrink-0 font-mono">
                        VIEW
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-neutral-50 rounded-2xl text-center border border-dashed border-neutral-200">
                    <span className="text-[10px] text-neutral-400 font-semibold block leading-tight">
                      {language === 'id' ? "Belum ada profil Varna terpilih" : "No active Varna profile pinned"}
                    </span>
                  </div>
                )}

                {/* 3. History Navigation Link */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] block px-1">
                    {t.historyTitle || "History"}
                  </span>
                  <button
                    onClick={handleMobileHistoryToggle}
                    className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-neutral-50 border border-neutral-100 rounded-2xl text-neutral-700 transition-all cursor-pointer text-left font-semibold text-xs text-brand-primary"
                  >
                    <div className="flex items-center gap-2.5">
                      <History size={16} />
                      <span>{t.historyTitle || "Scan History"}</span>
                    </div>
                    {historyLength > 0 && (
                      <span className="bg-brand-primary text-white text-[10px] py-0.5 px-2 rounded-full font-mono font-black shrink-0">
                        {historyLength}
                      </span>
                    )}
                  </button>
                </div>

                {/* 4. Language Selector Section */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] block px-1">
                    Language / Bahasa
                  </span>
                  <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200/40 text-xs font-bold shadow-inner">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`flex-1 py-2 text-center rounded-xl transition-all duration-150 cursor-pointer ${language === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLanguage('id')}
                      className={`flex-1 py-2 text-center rounded-xl transition-all duration-150 cursor-pointer ${language === 'id' ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Bahasa Indonesia
                    </button>
                  </div>
                </div>

              </div>

              {/* Drawer Footer controls */}
              {user && (
                <div className="pt-6 border-t border-neutral-100 mt-auto">
                  <button
                    onClick={() => { onLogout(); setIsMenuOpen(false); }}
                    className="w-full py-3.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
                  >
                    <LogOut size={16} />
                    {t.signOut.toUpperCase()}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

