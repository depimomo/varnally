import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Share2 } from 'lucide-react';
import { Analysis } from '../types';
import archetypes from '../data/archetypes.json';
import { ColorDrape } from './ColorDrape';
import { ObservationCard } from './ObservationCard';
import { FaceArchitectureCard } from './FaceArchitectureCard';
import { GlassesRecommendationCard } from './GlassesRecommendationCard';
import { MakeupRecommendationCard } from './MakeupRecommendationCard';
import { ResultHeader } from './ResultHeader';
import { ShareablePoster } from './ShareablePoster';
import { useLanguage } from '../lib/LanguageContext';

interface AnalysisResultProps {
  result: Analysis;
  user: any;
  loading: boolean;
  previewUrl: string | null;
  onBack: () => void;
  onSave: () => void;
  getFaceShapeImage: (shape: string) => string;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  user,
  loading,
  previewUrl,
  onBack,
  onSave,
  getFaceShapeImage
}) => {
  const { language, t } = useLanguage();
  const [isPosterOpen, setIsPosterOpen] = React.useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [result]);

  const borderColors = (archetypes.color_archetypes as any)[result.season]?.[`${result.subType} ${result.season}`]?.border || [];
  const defaultBorderColors = ["A8BD37","EFB45C","F3BF39","E88957","E06625","D53A21","B14720","8A78A8","5AA78F","4E9743"];
  const activeColors = borderColors.length > 0 ? borderColors : defaultBorderColors;

  // Repeat the colors so that the rays are exactly 20 in total
  let twentyColors: string[] = [];
  if (activeColors.length > 0) {
    while (twentyColors.length < 20) {
      twentyColors = twentyColors.concat(activeColors);
    }
    twentyColors = twentyColors.slice(0, 20);
  } else {
    twentyColors = Array(20).fill("A8BD37");
  }

  const conicGradientParts = twentyColors.map((color: string, index: number) => {
    const startPercent = (index / twentyColors.length) * 100;
    const endPercent = ((index + 1) / twentyColors.length) * 100;
    const hex = color.startsWith('#') ? color : `#${color}`;
    return `${hex} ${startPercent}% ${endPercent}%`;
  });
  const conicGradientStyle = `conic-gradient(from 0deg at 50% 50%, ${conicGradientParts.join(', ')})`;

  // Curve color formula based on season input
  const getSeasonTheme = (seasonInput: string) => {
    const s = (seasonInput || '').toLowerCase();
    if (s.includes('spring') || s.includes('vasanta')) {
      return {
        name: 'Spring',
        displayGradient: 'from-amber-400 via-[#FF7043] to-rose-400',
        shadowColor: 'shadow-orange-400/20',
        cardBg: 'bg-white/80 backdrop-blur-xl bg-gradient-to-tr from-white via-white/95 to-[#FFF8E1]/30',
        cardBorder: 'sm:border-[#FFE0B2]/60',
        badgeStyle: 'bg-amber-150 text-amber-800 border-amber-200/50',
        textAccent: 'text-amber-600',
        titleTagColor: 'text-amber-600 bg-amber-50 border-amber-200',
        glowOrbs: [
          'bg-[#FF8A65]/10 top-20 left-[10%]',
          'bg-[#FFD54F]/12 top-[40%] right-[5%]',
          'bg-[#81C784]/8 bottom-10 left-[20%]',
          'bg-rose-400/8 bottom-[35%] right-[15%]'
        ],
        localizedSeason: 'Spring (Musim Semi)'
      };
    } else if (s.includes('summer') || s.includes('grishma')) {
      return {
        name: 'Summer',
        displayGradient: 'from-sky-450 via-[#9C8EB9] to-pink-400',
        shadowColor: 'shadow-sky-500/20',
        cardBg: 'bg-white/80 backdrop-blur-xl bg-gradient-to-tr from-white via-white/95 to-[#E1F5FE]/35',
        cardBorder: 'sm:border-[#B3E5FC]/60',
        badgeStyle: 'bg-sky-105 text-sky-800 border-sky-200/50',
        textAccent: 'text-sky-600',
        titleTagColor: 'text-sky-600 bg-sky-50 border-sky-100',
        glowOrbs: [
          'bg-[#B3E5FC]/12 top-20 left-[10%]',
          'bg-[#E1BEE7]/10 top-[40%] right-[5%]',
          'bg-[#F8BBD0]/8 bottom-10 left-[20%]',
          'bg-blue-400/8 bottom-[35%] right-[15%]'
        ],
        localizedSeason: 'Summer (Musim Panas)'
      };
    } else if (s.includes('autumn') || s.includes('sharad')) {
      return {
        name: 'Autumn',
        displayGradient: 'from-[#8D5A2B] via-[#D84315] to-[#F57C00]',
        shadowColor: 'shadow-orange-700/20',
        cardBg: 'bg-white/80 backdrop-blur-xl bg-gradient-to-tr from-white via-white/95 to-[#EFEBE9]/45',
        cardBorder: 'sm:border-[#D7CCC8]/60',
        badgeStyle: 'bg-orange-105 text-orange-800 border-orange-200/50',
        textAccent: 'text-orange-600',
        titleTagColor: 'text-orange-700 bg-orange-50 border-orange-200',
        glowOrbs: [
          'bg-[#FFCC80]/12 top-20 left-[10%]',
          'bg-[#D7CCC8]/10 top-[40%] right-[5%]',
          'bg-[#C5E1A5]/8 bottom-10 left-[20%]',
          'bg-amber-400/6 bottom-[35%] right-[15%]'
        ],
        localizedSeason: 'Autumn (Musim Gugur)'
      };
    } else {
      // Winter
      return {
        name: 'Winter',
        displayGradient: 'from-[#1A237E] via-[#283593] to-[#880E4F]',
        shadowColor: 'shadow-indigo-950/20',
        cardBg: 'bg-white/80 backdrop-blur-xl bg-gradient-to-tr from-white via-white/95 to-[#E8EAF6]/35',
        cardBorder: 'sm:border-[#C5CAE9]/60',
        badgeStyle: 'bg-indigo-105 text-indigo-800 border-indigo-200/50',
        textAccent: 'text-indigo-600',
        titleTagColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        glowOrbs: [
          'bg-[#C5CAE9]/12 top-20 left-[10%]',
          'bg-[#F8BBD0]/8 top-[40%] right-[5%]',
          'bg-[#B2DFDB]/8 bottom-10 left-[20%]',
          'bg-indigo-400/8 bottom-[35%] right-[15%]'
        ],
        localizedSeason: 'Winter (Musim Dingin)'
      };
    }
  };

  const theme = getSeasonTheme(result.season);
  const localizedJewerly = (result.jewelry || '').toLowerCase() === 'gold' 
    ? (language === 'id' ? 'Emas' : 'Gold') 
    : (language === 'id' ? 'Perak' : 'Silver');

  const getLocalizedSubType = (subType: string, lang: string) => {
    if (lang !== 'id') return subType;
    const map: Record<string, string> = {
      'Bright': 'Cerah',
      'True': 'Asli',
      'Dark': 'Gelap',
      'Light': 'Terang',
      'Soft': 'Lembut'
    };
    return map[subType] || subType;
  };
  const localizedSubType = getLocalizedSubType(result.subType, language);

  // Localize archetype descriptions and titles if Indonesian
  const rawArchetype = (archetypes.color_archetypes as any)[result.season]?.[`${result.subType} ${result.season}`];
  let displayName = rawArchetype?.nickname || `${result.subType} ${result.season}`;
  let displayDesc = rawArchetype?.description || "";

  if (language === 'id') {
    // Elegant, highly customized translated maps for Indonesian
    const nameMapId: Record<string, string> = {
      // JSON keys (Nicknames)
      "The Aurora": "Sang Aurora",
      "The Glacier": "Gletser Berkilau",
      "The Eclipse": "Gerhana Misterius",
      "The Dawn": "Fajar Merekah",
      "The Meadow": "Padang Rumput Berbunga",
      "The Sunrise": "Matahari Terbit",
      "The Seafoam": "Buih Samudra",
      "The Twilight": "Senja Teduh",
      "The Haze": "Kabut Lembut",
      "The Dune": "Bukit Pasir",
      "The Harvest": "Panen Raya",
      "The Sunset": "Mentari Tenggelam",
      
      // Fallbacks / Older versions
      "Sun-Kissed Buttercup": "Kuncup Mentega Keemasan",
      "Gilded Honeycomb": "Sarang Madu Melimpah",
      "Dynamic Coral Blossom": "Bunga Koral Berkilau",
      "Ocean Misted Lavender": "Lavender Kabut Samudra",
      "Fresh Powdery Clover": "Semanggi Bubuk Segar",
      "Ethereal Cool Slate": "Batu Kabut Anggun",
      "Muted Clay Terracotta": "Tanah Liat Panggang Redup",
      "Cinnamon Sand Dune": "Pasir Kayu Manis",
      "Pecan Wood Moss": "Lumut Kayu Kemiri",
      "High-Contrast Royal Sapphire": "Safir Kerajaan Pekat",
      "Frosted Jewel Platinum": "Platinum Es Kristal",
      "Incandescent Midnight Velvet": "Beludru Hitam Kobalt"
    };

    if (nameMapId[displayName]) {
      displayName = nameMapId[displayName];
    }

    const descMapId: Record<string, string> = {
      // JSON keys (Descriptions)
      "Striking and unforgettable. You thrive in high-contrast, vivid jewel tones that mirror a neon sky. Your presence is magnetic and clear.": "Sangat menonjol dan tak terlupakan. Anda bersinar dalam warna permata berjalin kontras tinggi yang menyerupai langit neon. Aura Anda magnetis dan bercahaya murni.",
      "Absolute and striking. You possess an icy, crisp elegance. Stark, cool tones illuminate your sharp and sophisticated natural contrast.": "Sangat menonjol dan memukau. Anda memiliki keanggunan kristal es yang murni. Paduan warna dingin bersorot tajam memperjelas kontras visual alami Anda yang canggih.",
      "Mysterious and deeply captivating. You look your best wrapped in rich, cool shadows and intense, luxurious depths.": "Misterius dan sangat memikat. Keindahan terbaik Anda terpancar saat dibalut warna bayangan dingin yang pekat serta kedalaman warna mewah yang intens.",
      "Delicate, fresh, and full of promise. You glow in airy, pastel-warm colors that capture the first soft light of day.": "Lembut, segar, dan penuh harapan. Rona Anda murni bersinar dalam warna pastel hangat bernapas lapang yang menangkap kelembutan cahaya pertama di pagi hari.",
      "Vibrant, golden, and blooming. Your natural warmth shines in saturated, sunny hues that radiate life and energy.": "Gemerlap, keemasan, dan bermekaran. Kehangatan alami Anda memancar indah dalam rona warna cerah bersaturasi tinggi yang menyiratkan kehidupan dan energi positif.",
      "Clear, intense, and awakening. You effortlessly carry the most vivid, warm colors, bringing a bold and joyful energy wherever you go.": "Bening, intens, dan membangkitkan pesona. Anda dengan anggun membawa keindahan warna paling cerah dan hangat, menyebarkan energi yang berani dan riang-gembira.",
      "Gentle, airy, and refreshing. Your cool, delicate coloring is perfectly complemented by soft, powdery tones that feel like a gentle ocean breeze.": "Menenangkan, sejuk, dan menyegarkan. Warna kulit sejuk Anda yang lembut sangat selaras didampingi rona warna lembut sehalus bedak layaknya embusan angin sepoi pantai.",
      "Serene, cool, and elegant. You possess a calm beauty that is beautifully enhanced by dusty, muted cool tones like lavender and slate.": "Tenang, sejuk, dan elegan. Anda memiliki kecantikan yang damai, yang kian terpancar indah berkat paduan warna teduh bersahaja seperti lavender lembut dan abu-abu batu sabak.",
      "Enigmatic and softly blended. Your muted coloring is effortlessly chic, finding its perfect harmony in gentle, gray-tinted cool colors.": "Penuh misteri dan berpadu lembut. Sentuhan warna redup Anda menghadirkan keanggunan alami yang modis, melebur sempurna dalam kedamaian warna sejuk keabu-abuan.",
      "Earthy, muted, and incredibly stylish. You radiate a calm, grounded warmth that looks stunning in gentle, toasted neutrals.": "Alami, teduh, dan sangat modis. Anda memancarkan kehangatan bersahaja yang tenang, memikat dalam rona warna netral hangat yang lembut bagai pasir gurun.",
      "Rich, golden, and abundant. You carry the warmth of changing seasons perfectly, glowing in toasted, vibrant earth tones.": "Kaya warna, keemasan, dan melimpah. Anda membingkai kehangatan pergantian musim dengan sempurna, memancar indah dalam rona warna tanah yang pekat dan hangat.",
      "Deep, warm, and intense. You have a smoldering natural contrast that carries the heaviest, richest autumn colors with absolute grace.": "Pekat, hangat, dan intens. Anda memiliki kontras alami nan memikat yang mampu menyangga deretan rona warna musim gugur paling berat dan mewah dengan keanggunan mutlak.",

      // Fallbacks / Older versions
      "Bright, warm, and highly radiant. You harmonize with crisp buttercup yellow, live apricot, and sparkling peach tints.": "Cerah, hangat, dan sangat berseri. Anda cocok dengan warna kuning mentega yang renyah, aprikot hidup, dan rona persik yang berkilau.",
      "Muted, warm, and earth-anchored. Your pigments align with rich spiced terracotta, golden honey, and warm olive leaves.": "Redup, hangat, dan mengakar pada bumi. Rona pigmen Anda menyatu dengan bumbu terracotta yang kaya, madu emas, dan daun zaitun yang hangat.",
      "Clear, bright, and sparkling with dynamic contrast. Harmonize with vivid poppy coral, live turquoise, and sunny daffodils.": "Bening, cerah, dan berkilau dengan kontras dinamis. Selaras dengan koral popi yang hidup, pirus aktif, dan bunga narsis kuning cerah.",
      "Cool, soft, and gentle. You shimmer elegantly in muted lavender, smoky mountain shadows, and oceanside powdery blues.": "Sejuk, lembut, dan teduh. Anda bersinar elegan dalam lavender lembut, bayangan pegunungan berasap, dan biru bedak tepi pantai air laut.",
      "Delicate, cool, and airy. Align your face with soft pastel moss, powdered wild clover, and gentle morning blues.": "Halus, sejuk, dan lapang. Selaraskan wajah Anda dengan lumut pastel lembut, semanggi liar berbubuk halus, dan warna biru pagi yang tenang.",
      "Smooth, deep, and slate-cooled. Complemented perfectly by mountain stone grays, deep twilight lilac, and soft spruce forests.": "Halus, pekat, dan sejuk bagai batu sabak. Dilengkapi dengan sempurna oleh abu-abu batu pegunungan, ungu senja yang sunyi, dan hutan cemara lembut.",
      "Deep, rich, and spice-warmed. Anchor your style with baked terracotta clay, roasted pecans, and rich walnut grains.": "Pekat, kaya, dan hangat penuh rempah. Kokohkan gaya Anda dengan tanah liat terracotta panggang, kacang pecan panggang, dan serat kayu kenari yang kaya warna.",
      "Muted, highly warm, and golden. Accentuate with toasted cinnamon, warm mustard sand, and rich turmeric dust.": "Redup, sangat hangat, dan keemasan. Sempurnakan dengan kayu manis panggang, pasir mustar hangat, dan bubuk kunyit yang kaya rona hangat.",
      "Earthy, complex, and mossy. Best framed by deep forest olive, dark khaki bark, and warm spiced forest pines.": "Alami, kompleks, dan berlumut. Paling tepat dibingkai oleh hijau zaitun hutan pekat, kulit kayu khaki gelap, dan pinus hutan berempah hangat.",
      "Pure, high-contrast, and deeply saturated. Sparkle in deep royal cobalt blue, majestic magenta, and pure velvet black.": "Murni, berkontras tinggi, dan sangat jenuh. Berkilau dalam biru kobalt kerajaan yang pekat, magenta agung, dan hitam beludru murni.",
      "Icy, cool, and crystalline. Reflect pure elegance with frosted mountain silver, icy platinum, and crystalline glacier teal.": "Lebih dingin, sejuk, dan mengkristal bagai es. Cerminkan keanggunan sejati dengan perak pegunungan berselimut es, platinum sejuk, dan pirus gletser murni.",
      "High-value, dark, and royal. Your presence is captured by deep midnight indigo, rich royal purple, and ink forest tones.": "Sangat pekat, gelap, dan agung. Kehadiran Anda terpancar melalui biru indigo tengah malam yang pekat, ungu kerajaan yang mewah, dan rona tinta hutan gelap."
    };

    if (descMapId[displayDesc]) {
      displayDesc = descMapId[displayDesc];
    }
  }

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-8 relative"
    >
      {/* Absolute Season Backdrop Glow Orbs */}
      <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none -z-20">
        {theme.glowOrbs.map((orbClass, idx) => (
          <div 
            key={idx} 
            className={`absolute w-80 h-80 rounded-full blur-[110px] ${orbClass}`} 
          />
        ))}
      </div>

      <ResultHeader
        isLoading={loading}
        canSave={!result.id}
        onBack={onBack}
        onSave={onSave}
        onShareStory={() => setIsPosterOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Photo & Details */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          <div 
            className="aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl relative p-10 flex items-center justify-center bg-white"
            style={{ backgroundImage: conicGradientStyle }}
          >
            {/* White base behind oval to prevent transparent spots */}
            <div className="absolute inset-10 bg-white rounded-full scale-[1.01] shadow-lg" style={{ borderRadius: '50% / 50%' }} />

            {/* Ellipse masked picture */}
            <div 
              className="absolute inset-10 overflow-hidden"
              style={{ 
                borderRadius: '50% / 50%',
              }}
            >
              <img
                src={result.cleanedImageUrl || previewUrl || result.imageUrl || ''}
                alt="Analyzed face"
                className="w-full h-full object-cover select-none scale-105"
              />
            </div>

            {/* Inner groove contour shadow */}
            <div 
              className="absolute inset-10 pointer-events-none border border-black/5 shadow-[inset_0_4px_16px_rgba(0,0,0,0.15)] animate-fade-in"
              style={{
                borderRadius: '50% / 50%',
              }}
            />
          </div>

          {/* Your Varna Section with stunning dynamic gradient */}
          {rawArchetype && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${theme.displayGradient} p-8 rounded-[2rem] shadow-xl ${theme.shadowColor} text-white relative overflow-hidden`}
            >
              <div className="absolute -right-4 -top-4 opacity-20">
                <Sparkles size={100} />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-white/90 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Sparkles size={14} className="animate-spin" />
                  <span>{t.vefifiedVarnaMap}</span>
                </div>

                <div>
                  <h3 className="text-3xl font-display font-black leading-tight drop-shadow-sm">
                    {displayName}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-white/95 leading-relaxed italic">
                  "{displayDesc}"
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {language === 'id' ? theme.localizedSeason : result.season}
                  </span>
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {localizedSubType}
                  </span>
                  <span className={`px-2.5 py-1 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider ${result.jewelry === 'Gold' ? 'bg-amber-450/40 text-amber-50' : 'bg-slate-300/40 text-slate-50'}`}>
                    {localizedJewerly}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <ObservationCard
            skinUndertone={result.skinUndertone}
            eyeColor={result.eyeColor}
            hairColor={result.hairColor}
            className={`bg-transparent sm:${theme.cardBg} sm:border ${theme.cardBorder}`}
          />
        </div>

        {/* Right Column: Palette & Best/Worst */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8 animate-fade-in">
          <div className={`bg-transparent sm:${theme.cardBg} p-0 sm:p-6 md:p-8 rounded-none sm:rounded-[2.5rem] border-0 sm:border ${theme.cardBorder} shadow-none sm:shadow-sm space-y-6 overflow-hidden`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest font-mono">
                  {t.approvedPalette}
                </p>
                <h2 className="text-xl sm:text-2xl font-display font-black text-gray-900 flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-extrabold shadow-sm">✓</span>
                  {t.bestColorsWear}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-2">
              {(result.bestColors || []).map((color, idx) => (
                <ColorDrape key={idx} color={color} imageUrl={result.cleanedImageUrl || previewUrl || result.imageUrl || null} />
              ))}
            </div>
          </div>

          <div className={`bg-transparent sm:${theme.cardBg} p-0 sm:p-6 md:p-8 rounded-none sm:rounded-[2.5rem] border-0 sm:border ${theme.cardBorder} shadow-none sm:shadow-sm space-y-6 overflow-hidden`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest font-mono">
                  {t.clashingShades}
                </p>
                <h2 className="text-xl sm:text-2xl font-display font-black text-gray-900 flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-rose-50 text-rose-600 rounded-lg text-sm font-extrabold shadow-sm">✕</span>
                  {t.colorsAvoid}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-2">
              {(result.avoidColors || []).map((color, idx) => (
                <ColorDrape key={idx} color={color} imageUrl={result.cleanedImageUrl || previewUrl || result.imageUrl || null} />
              ))}
            </div>
          </div>

          <MakeupRecommendationCard 
            season={result.season as any} 
            subType={result.subType} 
            className={`bg-transparent sm:${theme.cardBg} sm:border ${theme.cardBorder}`}
          />

          <FaceArchitectureCard
            faceShape={result.faceShape}
            faceShapeDescription={result.faceShapeDescription}
            imageUrl={getFaceShapeImage(result.faceShape)}
            className={`bg-transparent sm:${theme.cardBg} sm:border ${theme.cardBorder}`}
          />

          <GlassesRecommendationCard 
            faceShape={result.faceShape} 
            className={`bg-transparent sm:${theme.cardBg} sm:border ${theme.cardBorder}`}
          />
        </div>
      </div>

      <ShareablePoster
        isOpen={isPosterOpen}
        onClose={() => setIsPosterOpen(false)}
        result={result}
        previewUrl={previewUrl}
        getFaceShapeImage={getFaceShapeImage}
      />

      {/* Floating Share Button on mobile - hidden when poster modal is open */}
      {!isPosterOpen && (
        <button
          onClick={() => setIsPosterOpen(true)}
          className="fixed bottom-6 right-6 md:hidden z-40 p-4 bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white rounded-full shadow-xl shadow-rose-500/30 active:scale-95 hover:scale-105 transition-all duration-150 flex items-center justify-center cursor-pointer border border-white/25 shadow-black/10"
          id="floating-mobile-share"
          aria-label="Create shareable story poster"
        >
          <Share2 size={24} className="text-white drop-shadow-sm" />
        </button>
      )}
    </motion.div>
  );
};
