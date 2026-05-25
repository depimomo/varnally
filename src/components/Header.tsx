import React from 'react';
import { Sparkles, History, LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { useLanguage } from '../lib/LanguageContext';

interface HeaderProps {
  user: User | null;
  historyLength: number;
  showHistory: boolean;
  onLogoClick: () => void;
  onHistoryToggle: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  historyLength,
  showHistory,
  onLogoClick,
  onHistoryToggle,
  onLogin,
  onLogout
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-black/5 z-50 px-4 md:px-8 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onLogoClick}>
        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white shadow-lg">
          <Sparkles size={18} />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">{t.logoName}</span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Aesthetic Language Selector Pill */}
        <div className="flex bg-neutral-100 p-0.5 rounded-full border border-neutral-200/40 text-[10px] sm:text-xs font-bold leading-none select-none shrink-0" id="language-toggle">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-full transition-all duration-150 cursor-pointer ${language === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('id')}
            className={`px-2 py-1 rounded-full transition-all duration-150 cursor-pointer ${language === 'id' ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ID
          </button>
        </div>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
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
    </header>
  );
};
