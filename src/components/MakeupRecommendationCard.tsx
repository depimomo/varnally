import React from 'react';
import { motion } from 'motion/react';
import { Eye, Heart, Sparkles } from 'lucide-react';
import makeupPresetsData from '../data/makeup_presets.json';
import { MakeupSection } from './MakeupSection';

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
}

export const MakeupRecommendationCard: React.FC<MakeupRecommendationCardProps> = ({ season, subType }) => {
  const fullType = `${subType} ${season}`;
  const makeupDetails = MAKEUP_PRESETS[fullType] || MAKEUP_PRESETS["True Winter"]; // safe fallback

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      id="makeup-recommendation-card"
      className="bg-transparent sm:bg-white p-0 sm:p-6 md:p-8 rounded-none sm:rounded-[2.5rem] border-0 sm:border border-black/5 shadow-none sm:shadow-sm space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono">
            Expert Cosmetics Map
          </p>
          <h2 className="text-2xl font-display font-medium text-gray-900 flex items-center gap-2">
            <Sparkles className="text-brand-primary animate-pulse" size={22} />
            Your Suitable Makeup Artistry
          </h2>
        </div>
        <div className="inline-flex self-start sm:self-auto items-center px-4 py-1.5 bg-brand-primary/5 border border-brand-primary/10 rounded-full text-xs font-bold text-brand-primary">
          Ideal Finish: {makeupDetails.finish}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Step 1: Base Foundation Section */}
        <MakeupSection
          id="makeup-base-section"
          stepLabel="STEP 1: BASE FOUNDATION"
          title="Skin Shade & Finish Blueprint"
          description={makeupDetails.foundationDescription}
          swatches={makeupDetails.foundationSwatches}
          type="foundation"
        />

        {/* Step 2: Lips Selection Section */}
        <MakeupSection
          id="makeup-lipstick-section"
          stepLabel="STEP 2: LIP ARTISTRY"
          title="3 Handpicked Suitable Lipsticks"
          description="Accentuate yours with distinct intensity levels. Recommended finishes include hydrating cream lipsticks, light glossy stains, or vibrant liquid velvets."
          swatches={makeupDetails.lipColors}
          type="lip"
        />

        {/* Step 3: Eyeshadow Pans Section */}
        <MakeupSection
          id="makeup-eyeshadow-section"
          stepLabel="STEP 3: EYE DEFINE"
          title="3 Harmonious Eyeshadow Pans"
          description="Create exquisite dimensions using customized gradients that make your natural base color pop instantly."
          swatches={makeupDetails.eyeshadows}
          type="eyeshadow"
          icon={<Eye size={12} />}
        />

        {/* Step 4: Cheek Blush Section */}
        <MakeupSection
          id="makeup-blush-section"
          stepLabel="STEP 4: BLUSH & FLUSH"
          title="3 Radiating Cheek Blushers"
          description="Soft dustings of warm apricot, cool berry, or silky rose blushers to shape and contour your natural bone structures."
          swatches={makeupDetails.blushes}
          type="blush"
          icon={<Heart size={12} />}
        />

      </div>
    </motion.div>
  );
};
