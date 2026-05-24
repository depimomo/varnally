import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const bgStyles = {
    success: 'bg-emerald-900 border-emerald-800 text-white shadow-emerald-950/20',
    error: 'bg-red-900 border-red-800 text-white shadow-red-950/20',
    info: 'bg-gray-900 border-gray-800 text-white shadow-gray-950/20'
  };

  const iconColor = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    info: 'text-brand-primary'
  };

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconColor[type]} shrink-0`} size={20} />;
      case 'error':
        return <AlertCircle className={`${iconColor[type]} shrink-0`} size={20} />;
      case 'info':
      default:
        return <Info className={`${iconColor[type]} shrink-0`} size={20} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      role="alert"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3.5 max-w-sm p-4 rounded-2xl border backdrop-blur-md shadow-xl ${bgStyles[type]}`}
    >
      {renderIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold leading-relaxed break-words">
          {message}
        </p>
      </div>
      <button 
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <X size={15} />
      </button>
    </motion.div>
  );
};
