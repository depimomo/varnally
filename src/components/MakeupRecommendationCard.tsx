import React from 'react';
import { motion } from 'motion/react';
import { Eye, Heart, Sparkles } from 'lucide-react';
import makeupPresetsData from '../data/makeup_presets.json';
import { MakeupSection } from './MakeupSection';
import { useLanguage } from '../lib/LanguageContext';

interface ColorSpec {
  hex: string;
  name: string;
}

interface MakeupData {
  finish: string;
  foundationDescription: string;
  foundationSwatches: { name: string; hex: string }[];
  lipColors: ColorSpec[];
  eyeshadows: ColorSpec[];
  blushes: ColorSpec[];
}

const MAKEUP_PRESETS = makeupPresetsData as Record<string, MakeupData>;

interface MakeupRecommendationCardProps {
  season: 'Winter' | 'Spring' | 'Summer' | 'Autumn';
  subType: string;
  className?: string;
}

export const MakeupRecommendationCard: React.FC<MakeupRecommendationCardProps> = ({ season, subType, className }) => {
  const { language, t } = useLanguage();
  const fullType = `${subType} ${season}`;
  const makeupDetails = MAKEUP_PRESETS[fullType] || MAKEUP_PRESETS["True Winter"]; // safe fallback

  // Translate finish using translation keys
  const finishes: Record<string, string> = {
    'Matte': t.finishMatte,
    'Satin': t.finishSatin,
    'Dewy': t.finishDewy,
    'Semi-Matte': t.finishSemiMatte
  };
  const finishVal = finishes[makeupDetails.finish] || makeupDetails.finish;

  // Dynamically resolve localized description for foundation
  const getFoundationDesc = () => {
    const fStr = makeupDetails.foundationDescription.toLowerCase();
    if (fStr.includes('velvety') || fStr.includes('cool undertone') || fStr.includes('pink-toned') || fStr.includes('sejuk-dingin') || fStr.includes('beludru')) {
      return t.makeupFoundCool;
    } else if (fStr.includes('warm golden') || fStr.includes('peach') || fStr.includes('yellow-gold') || fStr.includes('hangat keemasan') || fStr.includes('madu')) {
      return t.makeupFoundWarm;
    } else if (fStr.includes('soft satin') || fStr.includes('fresh dewy') || fStr.includes('sheer rose') || fStr.includes('sutra satin') || fStr.includes('mawar lembut')) {
      return t.makeupFoundSoft;
    } else {
      return t.makeupFoundBronze;
    }
  };
  const foundationDesc = getFoundationDesc();

  const lipsDesc = t.makeupLipsDesc;
  const eyeDesc = t.makeupEyeDesc;
  const blushDesc = t.makeupBlushDesc;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      id="makeup-recommendation-card"
      className={`p-0 sm:p-6 md:p-8 rounded-none sm:rounded-[2.5rem] relative overflow-hidden ${className || 'bg-transparent sm:bg-white border-0 sm:border border-black/5 shadow-none sm:shadow-sm'} space-y-8`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono">
            {t.expertCosmeticsMap}
          </p>
          <h2 className="text-2xl font-display font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="text-brand-primary animate-pulse" size={22} />
            {t.makeupArtistry}
          </h2>
        </div>
        <div className="inline-flex self-start sm:self-auto items-center px-4 py-1.5 bg-brand-primary/5 border border-brand-primary/10 rounded-full text-xs font-black text-brand-primary font-mono">
          {t.idealFinish} {finishVal}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
        
        {/* Step 1: Base Foundation Section */}
        <MakeupSection
          id="makeup-base-section"
          stepLabel={t.step1Base}
          title={t.step1Title}
          description={foundationDesc}
          swatches={makeupDetails.foundationSwatches}
          type="foundation"
        />

        {/* Step 2: Lips Selection Section */}
        <MakeupSection
          id="makeup-lipstick-section"
          stepLabel={t.step2Lip}
          title={t.step2Title}
          description={lipsDesc}
          swatches={makeupDetails.lipColors}
          type="lip"
        />

        {/* Step 3: Eyeshadow Pans Section */}
        <MakeupSection
          id="makeup-eyeshadow-section"
          stepLabel={t.step3Eye}
          title={t.step3Title}
          description={eyeDesc}
          swatches={makeupDetails.eyeshadows}
          type="eyeshadow"
          icon={<Eye size={12} />}
        />

        {/* Step 4: Cheek Blush Section */}
        <MakeupSection
          id="makeup-blush-section"
          stepLabel={t.step4Blush}
          title={t.step4Title}
          description={blushDesc}
          swatches={makeupDetails.blushes}
          type="blush"
          icon={<Heart size={12} />}
        />

      </div>
    </motion.div>
  );
};
