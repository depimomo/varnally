import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Palette, 
  Smile, 
  HelpCircle, 
  Glasses, 
  Heart, 
  UserCheck, 
  ArrowRight,
  Compass,
  Zap,
  Layers
} from 'lucide-react';

interface LandingHeroProps {
  onStart: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStart }) => {
  return (
    <motion.div
      key="landing-hero"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5 }}
      className="space-y-16 py-4 md:py-8"
    >
      {/* 1. Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6 px-4">
        <motion.div 
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-brand-primary text-xs font-bold uppercase tracking-wider font-mono text-center mx-auto"
        >
          <Sparkles size={14} className="animate-spin-slow" />
          Meet Your True Aesthetic Companion
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-none text-gray-900">
          Varnally. Your true colors, <span className="text-brand-primary relative inline-block">
            your best ally.
            <span className="absolute left-0 bottom-1 w-full h-2 bg-brand-primary/15 rounded-lg -z-10" />
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-550 max-w-2xl mx-auto font-medium leading-relaxed">
          Discover the color science & geometric balance uniquely designed for your face. Wear the shades and frames created to love you back.
        </p>

        {/* Philosophy Intro Code-Widget style */}
        <div className="max-w-xl mx-auto p-5 bg-white/70 backdrop-blur border border-black/5 rounded-3xl shadow-sm text-left flex items-start gap-4 mt-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center shrink-0 text-brand-secondary">
            <Compass size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest font-mono">Our Philosophy</h4>
            <p className="text-sm text-gray-650 mt-1 leading-relaxed">
              Our name honors our origin: <span className="font-extrabold text-brand-primary">Varna</span> (Sanskrit for color / <span className="italic font-normal text-gray-500">warna</span>) combined with <span className="font-bold text-gray-800">Ally</span> (your companion). Varnally is your friend on a journey to find natural, authentic style resonance. We don't change who you are—we highlight your existing chemistry.
            </p>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="pt-6">
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="inline-flex items-center gap-3 px-8 py-5 bg-gray-900 text-white rounded-3xl font-bold text-lg shadow-xl shadow-gray-900/20 hover:bg-gray-800 transition-all cursor-pointer group"
          >
            Find your Varna
            <ArrowRight size={20} className="text-brand-primary group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>

      {/* 2. Educational Section: Benefit Pitch */}
      <div className="bg-white/60 border border-black/5 rounded-[2.5rem] p-8 md:p-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 shadow-sm">
        <div className="space-y-3">
          <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center font-bold">
            01
          </div>
          <h3 className="text-lg font-bold text-gray-900 font-display">Styling Confidence</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-semibold">
            Stop buying wardrobe items, lipsticks, or glasses frames that clash with your natural tones. Identifying your visual rules saves money and ends morning styling doubt instantly.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="w-10 h-10 bg-brand-secondary/10 text-brand-secondary rounded-xl flex items-center justify-center font-bold">
            02
          </div>
          <h3 className="text-lg font-bold text-gray-900 font-display">Celebrate Your Geometry</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-semibold">
            Your jawline, cheekbones, and forehead form a beautiful natural architecture. Understanding your shapes empowers you to pick glasses styles that create gorgeous facial balance.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center font-bold">
            03
          </div>
          <h3 className="text-lg font-bold text-gray-900 font-display">Deep Self-Knowledge</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-semibold">
            Style is a dialogue of self-discovery. Recognizing your seasonal archetype helps you respect your natural canvas instead of masking it under fleeting, mismatched trends.
          </p>
        </div>
      </div>

      {/* 3. Bento Grid of Features */}
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono">Complete Tooling Suite</p>
          <h2 className="text-3xl font-display font-medium text-gray-900">What Varnally Maps for You</h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Our multi-dimensional vision analyzing model maps your traits across color, structure, and cosmetics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Seasonal Color */}
          <div className="p-6 bg-white rounded-3xl border border-black/5 hover:border-black/10 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-pink-50 text-brand-primary rounded-2xl flex items-center justify-center">
                <Palette size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-850 font-display">Seasonal Color Analysis</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Maps you to one of twelve specific subtypes (e.g. Bright Winter, Soft Autumn). Understands skin undertones, eye contrasts, and matching palettes.
              </p>
            </div>
            <div className="flex gap-1.5 pt-2">
              <span className="w-4 h-4 rounded-full bg-[#E65C97]" />
              <span className="w-4 h-4 rounded-full bg-[#00A09E]" />
              <span className="w-4 h-4 rounded-full bg-[#F4BD60]" />
              <span className="w-4 h-4 rounded-full bg-[#714990]" />
            </div>
          </div>

          {/* Card 2: Face Architecture */}
          <div className="p-6 bg-white rounded-3xl border border-black/5 hover:border-black/10 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-brand-secondary rounded-2xl flex items-center justify-center">
                <Smile size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-850 font-display">Face Architecture Mapping</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Accurately identifies your structural face shape (Oval, Square, Heart, etc.). Explains jaw density, cheek widths, and forehead heights.
              </p>
            </div>
            <span className="text-[10px] uppercase font-mono font-bold text-brand-secondary">Geometric Analytics</span>
          </div>

          {/* Card 3: Glasses Recommendation */}
          <div className="p-6 bg-white rounded-3xl border border-black/5 hover:border-black/10 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                <Glasses size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-850 font-display">Optical Frame Matching</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Provides tailored optical frame suggestions based on inverse facial mechanics. Highlights shapes that introduce visual equilibrium.
              </p>
            </div>
            <span className="text-[10px] uppercase font-mono font-bold text-amber-500">Optics Precision</span>
          </div>

          {/* Card 4: Makeup Recommendations */}
          <div className="p-6 bg-white rounded-3xl border border-black/5 hover:border-black/10 transition-all flex flex-col justify-between space-y-6 lg:col-span-2">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                <Heart size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-850 font-display">Personalized Cosmetics Guide</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Provides an expert, custom cosmetics map. Includes 3 ideal lipsticks, 3 eyeshadow shades, 3 complimentary blushers, and skin-foundation swatches matching your specific sub-archetype!
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-gray-500">Foundation Base</span>
              <span className="px-2 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-gray-500">Lip Colors</span>
              <span className="px-2 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-gray-500">Eyeshadows</span>
              <span className="px-2 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-gray-500">Blushers</span>
            </div>
          </div>

          {/* Card 5: Smart Profile Clarifier */}
          <div className="p-6 bg-white rounded-3xl border border-black/5 hover:border-black/10 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center">
                <UserCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-850 font-display">Smart Profile Cleanse</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Normalizes distracting background patterns in your photo to output a crisp, natural, neutral passport-style analysis card showing your true facial harmony.
              </p>
            </div>
            <span className="text-[10px] uppercase font-mono font-bold text-sky-500">AI Clarifier</span>
          </div>

        </div>
      </div>

      {/* 4. Secondary Bottom CTA */}
      <div className="text-center pt-8 max-w-xl mx-auto space-y-4">
        <h3 className="text-2xl font-display font-bold text-gray-950">Ready to meet your true aesthetic?</h3>
        <p className="text-sm text-gray-500">Take a high-quality selfie now under natural lighting to reveal your visual map.</p>
        <button 
          onClick={onStart}
          className="px-8 py-4 bg-brand-primary text-white hover:bg-brand-primary/95 rounded-2xl font-bold flex items-center gap-2 mx-auto justify-center cursor-pointer shadow-lg shadow-brand-primary/10 hover:scale-[1.01] active:scale-95 transition-all text-sm"
        >
          Begin Discovery
          <ArrowRight size={16} />
        </button>
      </div>

    </motion.div>
  );
};
