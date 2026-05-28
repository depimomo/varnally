import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowLeft, Shirt, Eye, ChevronRight, Palette } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface VarnallyHubProps {
  onBack: () => void;
  onSelectFeature?: (featureId: string) => void;
}

export const VarnallyHub: React.FC<VarnallyHubProps> = ({ onBack, onSelectFeature }) => {
  const { t } = useLanguage();

  const menuItems = [
    {
      id: 'glow_me_up',
      title: 'Glow Me Up',
      description: t.glowMeUpDesc || 'Upload the swatch, we\'ll pick the match! Paralyzed by the shade options? Our AI will tell you exactly which one fits your personal color season.',
      badge: t.newTag || 'New',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <Sparkles className="text-amber-500 animate-pulse" size={24} />,
      colorClass: 'from-amber-500/10 via-orange-500/5 to-rose-500/10',
      borderHover: 'hover:border-amber-300',
    },
    {
      id: 'stylize_me',
      title: 'Stylize Me',
      description: t.stylizeMeDesc || 'Unlock your perfect OOTD. Drop a photo of the clothing color variants, and let our AI act as your personal stylist, analyzing the exact soulmate color for you.',
      badge: t.newTag || 'New',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: <Shirt className="text-indigo-500" size={24} />,
      colorClass: 'from-indigo-500/10 via-purple-500/5 to-pink-500/10',
      borderHover: 'hover:border-indigo-300',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      {/* Back button */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-mono"
        >
          <ArrowLeft size={14} />
          {t.backToScanner || 'Back to Scanner'}
        </button>
      </div>

      {/* Header section with brand taglines */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-neutral-900 uppercase">
          Varnally Hub
        </h1>
        <p className="text-sm text-neutral-500 font-semibold leading-relaxed">
          {t.varnallyHubSub || 'Explore advanced styling playgrounds powered by your exact color season. Find matches for makeup tones or clothing styles aligned with your unique Varna template.'}
        </p>
      </div>

      {/* Interactive Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -5, scale: 1.01 }}
            className={`p-8 rounded-[2.5rem] bg-gradient-to-b ${item.colorClass} border border-neutral-200/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden`}
            onClick={() => onSelectFeature?.(item.id)}
          >
            {/* Subtle background glow circle */}
            <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              {/* Icon & Badge row */}
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-white rounded-3xl shadow-sm border border-neutral-100">
                  {item.icon}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 border rounded-full font-mono ${item.badgeBg}`}>
                  {item.badge}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-display font-black text-neutral-900 mb-2 uppercase tracking-wide group-hover:text-brand-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-500 font-medium leading-relaxed mb-8">
                {item.description}
              </p>
            </div>

            {/* Bottom arrow CTA to convey action state */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200/30 text-[10px] font-black uppercase tracking-wider font-mono text-neutral-400 group-hover:text-brand-primary transition-colors mt-auto">
              <span>{t.learnMore || 'Learn More'}</span>
              <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
