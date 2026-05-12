import React from 'react';
import { Sparkles, History, LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';

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
}) => (
  <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-black/5 z-50 px-4 md:px-8 flex items-center justify-between">
    <div className="flex items-center gap-2 cursor-pointer" onClick={onLogoClick}>
      <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white shadow-lg">
        <Sparkles size={18} />
      </div>
      <span className="font-display font-bold text-xl tracking-tight">Varnally</span>
    </div>

    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-3">
          <button 
            onClick={onHistoryToggle}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <History size={20} />
            {historyLength > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full" />
            )}
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
            <img src={user.photoURL || ''} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
          </div>
          <button onClick={onLogout} className="text-gray-500 hover:text-red-500 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        <button 
          onClick={onLogin}
          className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2"
        >
          <UserIcon size={16} />
          Sign In
        </button>
      )}
    </div>
  </header>
);
