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

  let finishVal = makeupDetails.finish;
  let foundationDesc = makeupDetails.foundationDescription;
  let lipsDesc = "Accentuate yours with distinct intensity levels. Recommended finishes include hydrating cream lipsticks, light glossy stains, or vibrant liquid velvets.";
  let eyeDesc = "Create exquisite dimensions using customized gradients that make your natural base color pop instantly.";
  let blushDesc = "Soft dustings of warm apricot, cool berry, or silky rose blushers to shape and contour your natural bone structures.";

  if (language === 'id') {
    const finishes: Record<string, string> = {
      'Matte': 'Matte (Tanpa Kilap)',
      'Satin': 'Satin (Sutra Halus)',
      'Dewy': 'Dewy (Segar Basah)',
      'Semi-Matte': 'Semi-Matte (Seimbang)'
    };
    finishVal = finishes[finishVal] || finishVal;

    // Translate standard preset foundation structures dynamically
    const fStr = foundationDesc.toLowerCase();
    if (fStr.includes('velvety') || fStr.includes('cool undertone') || fStr.includes('pink-toned')) {
      foundationDesc = "Gunakan alas bedak berserat sejuk-dingin dengan hasil akhir beludru kental (matte) atau satin semi-matte. Sempurna dipadukan dengan bedak berpigmen merah muda dingin.";
    } else if (fStr.includes('warm golden') || fStr.includes('peach') || fStr.includes('yellow-gold')) {
      foundationDesc = "Pilih alas bedak bernuansa hangat keemasan, kuning madu, atau persik jingga dengan hasil akhir dewy segar. Hindari alas bedak dengan pigmen merah muda dingin.";
    } else if (fStr.includes('soft satin') || fStr.includes('fresh dewy') || fStr.includes('sheer rose')) {
      foundationDesc = "Pilih alas bedak ringan berserat halus dengan akhiran sutra satin atau segar berseri (dewy). Padukan dengan warna mawar lembut transparan yang sejuk.";
    } else {
      foundationDesc = "Gunakan foundation hangat keemasan atau tembaga hangat dengan hasil akhir matte murni. Formula ini menghadirkan kilau anggun pada rona kulit alami Anda.";
    }

    lipsDesc = "Pertajam senyum Anda dengan warna pilihan berintensitas teratur. Direkomendasikan jenis lipstik krim hidrasi, glossy ringan sehat, atau beludru cair yang hidup.";
    eyeDesc = "Ciptakan dimensi kelopak mata bergaya menggunakan kustomisasi gradasi yang memancarkan kejernihan warna mata Anda seketika.";
    blushDesc = "Sapuan lembut dari perona pipi aprikot hangat, beri segar yang sejuk, atau mawar sutra halus untuk memahat struktur dahi dan tulang pipi Anda.";
  }

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
