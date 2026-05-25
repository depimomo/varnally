import React from 'react';
import { motion } from 'motion/react';
import { Glasses, Check, Trash2, HelpCircle } from 'lucide-react';
import glassesData from '../data/glasses.json';
import { useLanguage } from '../lib/LanguageContext';

interface GlassesRecommendationCardProps {
  faceShape: string;
  className?: string;
}

const getLocalizedGlasses = (faceShape: string, data: any, lang: string) => {
  const recs = data[faceShape];
  if (!recs || lang !== 'id') return recs;

  const translations: Record<string, { style_goal: string; best_frames: string[]; frames_to_avoid: string[]; pro_tip: string }> = {
    'Oval': {
      style_goal: 'Keseimbangan Alami: Menjaga proporsi wajah oval yang sudah seimbang dengan bingkai yang sama lebarnya dengan bagian terluas wajah Anda.',
      best_frames: ['Persegi Panjang (Rectangular)', 'Tepi Bulat', 'Mata Kucing (Cat-Eye)', 'Bingkai Tebal Atas (Clubmaster)'],
      frames_to_avoid: ['Terlalu Kebesaran (Oversized)', 'Bingkai Sangat Sempit'],
      pro_tip: 'Simetri wajah oval Anda sangat serasi untuk hampir semua jenis kacamata! Pastikan ukuran lebar bingkai kacamata tidak melebihi pelipis kepala Anda agar proporsinya tetap ideal.'
    },
    'Square': {
      style_goal: 'Melembutkan Sudut: Menyeimbangkan rahang persegi yang tegas dengan menambahkan kurva siluet lembut dari bentuk lensa bulat atau oval.',
      best_frames: ['Bulat Sempurna (Round)', 'Oval Elegan', 'Kacamata Penerbang (Aviator)', 'Mata Kucing Tipis'],
      frames_to_avoid: ['Kotak Bersudut Tajam', 'Persegi Sempit'],
      pro_tip: 'Bingkai kacamata dengan tepi bulat yang melengkung akan menyeimbangkan sudut rahang tegas Anda dengan indah. Cari letak dudukan hidung yang tinggi untuk memperpanjang dimensi hidung.'
    },
    'Round': {
      style_goal: 'Struktur & Sudut: Memberikan definisi dan garis sudut tegas pada pipi bulat dengan memilih lensa bersudut tajam atau persegi panjang.',
      best_frames: ['Persegi Panjang Tegas', 'Kotak (Square)', 'Mata Kucing Bersudut', 'Bingkai Tebal Geometris'],
      frames_to_avoid: ['Bulat Sempurna', 'Bingkai Tanpa Bingkai (Frameless) Kecil'],
      pro_tip: 'Hindari kacamata berbentuk bulat yang dapat mempertegas kebulatan pipi. Pilih kacamata dengan sudut tinggi atau persegi panjang bersudut tajam untuk memberikan dimensi visual wajah tirus.'
    },
    'Heart': {
      style_goal: 'Keseimbangan Lebar Dahi: Menyeimbangkan bagian dahi atas yang lebar dengan dagu lancip bawah dengan memilih kacamata melebar di bagian bawah.',
      best_frames: ['Kacamata Penerbang (Aviator)', 'Gaya Bulat Ramah', 'Bawah Tanpa Bingkai', 'Tepi Teper (Tapered Edges)'],
      frames_to_avoid: ['Mata Kucing Tebal Atas', 'Bingkai Oversized Sangat Berat Di Atas'],
      pro_tip: 'Pilih kacamata yang mengalihkan perhatian ke bagian bawah mata atau yang memiliki sudut kemiringan ke bawah seperti Aviator guna melembutkan dahi lancip Anda.'
    },
    'Diamond': {
      style_goal: 'Menonjolkan Tulang Pipi: Menyeimbangkan dahi sempit dan garis rahang dengan melembutkan ekspresi tulang pipi yang tinggi dan bersudut.',
      best_frames: ['Mata Kucing (Cat-Eye)', 'Oval Melengkung', 'Tepi Bulat Sempurna', 'Bingkai Semi-Rimless'],
      frames_to_avoid: ['Persegi Sempit Tajam', 'Bingkai Amat Tipis Datar'],
      pro_tip: 'Kacamata bermodel semi-rimless atau mata kucing (cat-eye) sangat cantik melengkapi lekukan alami tulang pipi berlian Anda yang indah.'
    },
    'Oblong': {
      style_goal: 'Memperpendek Panjang Wajah: Memberikan ilusi visual wajah bulat/lebar untuk menyeimbangkan wajah panjang dengan memilih bingkai tebal yang tinggi.',
      best_frames: ['Bingkai Bulat Besar', 'Kotak Oversized', 'Mata Kucing Lebar', 'Bingkai Tebal Atas'],
      frames_to_avoid: ['Persegi Panjang Sangat Sempit', 'Bingkai Datar Kecil'],
      pro_tip: 'Kacamata dengan model lensa yang tinggi (seperti kotak siluet tebal) membantu memperpendek visual panjang wajah Anda. Hindari bingkai horizontal yang terlampau ramping.'
    }
  };

  const localized = translations[faceShape];
  return localized ? { ...recs, ...localized } : recs;
};

export const GlassesRecommendationCard: React.FC<GlassesRecommendationCardProps> = ({ faceShape, className }) => {
  const { language, t } = useLanguage();
  const rawRecommendations = (glassesData.glasses_recommendations as any)[faceShape];
  const recommendations = getLocalizedGlasses(faceShape, glassesData.glasses_recommendations, language);

  if (!rawRecommendations || !recommendations) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      id="glasses-recommendation-card"
      className={`p-0 sm:p-6 md:p-8 rounded-none sm:rounded-[2.5rem] relative overflow-hidden ${className || 'bg-transparent sm:bg-white border-0 sm:border border-black/5 shadow-none sm:shadow-sm'}`}
    >
      {/* Decorative Background Icon */}
      <div className="absolute -top-6 -right-6 text-gray-100 pointer-events-none">
        <Glasses size={140} />
      </div>

      <div className="relative z-10 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="space-y-1 w-full">
            <span className="text-[10px] font-black text-brand-secondary uppercase tracking-widest block font-mono">
              {t.framesMatcher}
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black text-gray-900 flex items-center gap-2">
              <Glasses className="text-brand-secondary shrink-0" size={22} />
              {t.glassesShowcase}
            </h2>
          </div>
        </div>

        {/* Content Layout */}
        <div className="space-y-6">

          {/* Top Section: Style Goal */}
          <div id="glasses-style-goal-box" className="bg-white border border-gray-100 p-5 rounded-2xl">
            <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-1 font-mono">
              {t.stylingObjective}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-gray-700 leading-relaxed">
              {recommendations.style_goal}
            </p>
          </div>

          {/* Frame Illustration */}
          <div className="flex justify-center w-full">
            <div className="w-full flex-1 flex items-center justify-center p-0 relative my-2">
              <img
                id="recommended-glasses-img"
                src={`/glasses/glasses_${faceShape.toLowerCase()}.png`}
                alt={`${faceShape} Face Shape Recommended Glasses`}
                className="w-auto h-auto max-h-[520px] object-contain transition-transform duration-300"
                onError={(e) => {
                  console.warn(`Glasses asset at /glasses/glasses_${faceShape.toLowerCase()}.png could not be loaded`);
                }}
              />
            </div>
          </div>

          {/* Recommendations Lists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Best Frames */}
            <div id="glasses-best-frames" className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <Check size={14} className="text-brand-secondary" />
                {t.bestFrames}
              </p>
              <div className="flex flex-col gap-2">
                {recommendations.best_frames.map((frame: string, idx: number) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-white border border-brand-secondary/10 hover:border-brand-secondary/25 shadow-sm rounded-xl text-xs font-bold text-gray-750 flex items-center gap-2 transition-all font-semibold"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
                    {frame}
                  </div>
                ))}
              </div>
            </div>

            {/* Frames to Avoid */}
            <div id="glasses-avoid-frames" className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <Trash2 size={14} className="text-red-400" />
                {t.avoid}
              </p>
              <div className="flex flex-col gap-2">
                {recommendations.frames_to_avoid.map((frame: string, idx: number) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-red-50/40 border border-red-105 hover:border-red-200 shadow-sm rounded-xl text-xs font-bold text-gray-650 flex items-center gap-2 transition-all font-semibold"
                  >
                    <span className="w-1.5 h-[1.5px] bg-red-400" />
                    {frame}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div id="glasses-pro-tip-box" className="bg-brand-secondary/10 p-5 rounded-3xl border border-brand-secondary/15 flex gap-3.5 items-start">
            <div className="p-1.5 bg-white text-brand-secondary rounded-xl shadow-sm shrink-0">
              <HelpCircle size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-0.5 font-mono">
                {t.expertFrameAdvice}
              </p>
              <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                {recommendations.pro_tip}
              </p>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
