import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Sparkles, AlertCircle, Camera, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Analysis } from '../types';
import archetypes from '../data/archetypes.json';
import makeupPresetsData from '../data/makeup_presets.json';
import { useLanguage } from '../lib/LanguageContext';

interface ShareablePosterProps {
  isOpen: boolean;
  onClose: () => void;
  result: Analysis;
  previewUrl: string | null;
  getFaceShapeImage: (shape: string) => string;
}

export const ShareablePoster: React.FC<ShareablePosterProps> = ({
  isOpen,
  onClose,
  result,
  previewUrl,
  getFaceShapeImage
}) => {
  const { language } = useLanguage();
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [captureError, setCaptureError] = React.useState<string | null>(null);
  const posterRef = React.useRef<HTMLDivElement>(null);

  // Parse color rays for conic gradient frame
  const borderColors = (archetypes.color_archetypes as any)[result.season]?.[`${result.subType} ${result.season}`]?.border || [];
  const defaultBorderColors = ["A8BD37","EFB45C","F3BF39","E88957","E06625","D53A21","B14720","8A78A8","5AA78F","4E9743"];
  const activeColors = borderColors.length > 0 ? borderColors : defaultBorderColors;

  let twentyColors: string[] = [];
  while (twentyColors.length < 20) {
    twentyColors = twentyColors.concat(activeColors);
  }
  twentyColors = twentyColors.slice(0, 20);

  const conicGradientParts = twentyColors.map((color: string, index: number) => {
    const startPercent = (index / twentyColors.length) * 100;
    const endPercent = ((index + 1) / twentyColors.length) * 100;
    const hex = color.startsWith('#') ? color : `#${color}`;
    return `${hex} ${startPercent}% ${endPercent}%`;
  });
  const conicGradientStyle = `conic-gradient(from 0deg at 50% 50%, ${conicGradientParts.join(', ')})`;

  // Determine season gradient background for the poster
  const getSeasonBackdrop = (seasonInput: string) => {
    const s = (seasonInput || '').toLowerCase();
    if (s.includes('spring') || s.includes('vasanta')) {
      return {
        bg: 'from-amber-500 via-rose-500 to-amber-600',
        badge: 'bg-amber-400/90 text-white',
        textTheme: 'text-amber-300'
      };
    } else if (s.includes('summer') || s.includes('grishma')) {
      return {
        bg: 'from-sky-700 via-indigo-900 to-pink-700',
        badge: 'bg-sky-400/90 text-white',
        textTheme: 'text-sky-300'
      };
    } else if (s.includes('autumn') || s.includes('sharad')) {
      return {
        bg: 'from-[#6E3C1A] via-[#A83D1B] to-[#42220F]',
        badge: 'bg-orange-500/90 text-white',
        textTheme: 'text-orange-400'
      };
    } else {
      return {
        bg: 'from-slate-900 via-indigo-950 to-purple-950',
        badge: 'bg-indigo-500/90 text-white',
        textTheme: 'text-indigo-400'
      };
    }
  };

  const backdrop = getSeasonBackdrop(result.season);
  
  // Localize archetype nickname
  const rawArchetype = (archetypes.color_archetypes as any)[result.season]?.[`${result.subType} ${result.season}`];
  let displayName = rawArchetype?.nickname || `${result.subType} ${result.season}`;
  let displayDesc = rawArchetype?.description || "";

  const getLocalizedSeasonSubtype = (subType: string, season: string, lang: string) => {
    if (lang !== 'id') return `${subType} ${season}`;
    const subTypeMap: Record<string, string> = {
      'Bright': 'Cerah',
      'True': 'Asli',
      'Dark': 'Gelap',
      'Light': 'Terang',
      'Soft': 'Lembut'
    };
    const seasonMap: Record<string, string> = {
      'Spring': 'Musim Semi',
      'Summer': 'Musim Panas',
      'Autumn': 'Musim Gugur',
      'Winter': 'Musim Dingin'
    };
    const mappedSub = subTypeMap[subType] || subType;
    const mappedSeason = seasonMap[season] || season;
    return `${mappedSub} ${mappedSeason}`;
  };
  const localizedFullType = getLocalizedSeasonSubtype(result.subType, result.season, language);

  if (language === 'id') {
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
      "Cool, soft, and gentle. You shimmer elegantly in muted lavender, smoky mountain shadows, and oceanside powdery blues.": "Sejuk, lembut, dan teduh. Anda bersinar elegan dalam lavender lembut, bayangan pegunungan kemulut asap, dan biru bedak tepi pantai air laut.",
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

  // Resolve makeup colors
  const fullType = `${result.subType} ${result.season}`;
  const makeupDetails = (makeupPresetsData as any)[fullType] || (makeupPresetsData as any)["True Winter"];

  // Slice swatches to look clean on Instagram Story
  const bestColorsList = (result.bestColors || []).slice(0, 4);
  const avoidColorsList = (result.avoidColors || []).slice(0, 4);

  const handleCapture = async () => {
    if (!posterRef.current) return;
    
    // Backup and temporarily remove style rules containing unsupported oklab / oklch functions
    const restoredRules: { sheet: CSSStyleSheet; index: number; cssText: string }[] = [];
    try {
      const sheets = Array.from(document.styleSheets);
      for (const sheet of sheets) {
        try {
          if (!sheet.cssRules) continue;
          const rules = Array.from(sheet.cssRules);
          for (let i = rules.length - 1; i >= 0; i--) {
            const rule = rules[i];
            if (rule.cssText.includes('oklch') || rule.cssText.includes('oklab')) {
              restoredRules.push({ sheet, index: i, cssText: rule.cssText });
              sheet.deleteRule(i);
            }
          }
        } catch (e) {
          // Cross-origin sheets can throw errors, ignore them safely
        }
      }
    } catch (e) {
      console.warn("Could not sanitize stylesheets:", e);
    }

    try {
      setIsCapturing(true);
      setCaptureError(null);

      // Force high resolution capture of the story poster
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        scale: 3, // 3x multiplier is crystal clear
        logging: false,
        backgroundColor: '#111827',
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Varna_Spectra_${result.season}_${result.subType}.png`;
      link.click();
      setIsCapturing(false);
    } catch (err) {
      console.error("Poster capture failed:", err);
      setCaptureError(language === 'id' ? "Screenshot otomatis terhalang browser. Silakan ambil tangkapan layar (Screenshot) mandiri di perangkat Anda." : "Screenshot permission blocked. For local saving, please take a screen capture.");
      setIsCapturing(false);
    } finally {
      // Re-insert rules back in reverse order
      for (const item of restoredRules.reverse()) {
        try {
          item.sheet.insertRule(item.cssText, item.index);
        } catch (e) {
          console.warn("Failed to restore rule:", e);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 overflow-y-auto flex flex-col bg-gradient-to-br ${backdrop.bg} md:bg-none md:bg-neutral-950`}>
        {/* Modal Outer Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="relative max-w-5xl w-full mx-auto md:bg-neutral-900 md:border md:border-neutral-800 md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row md:my-8 h-full md:h-auto md:max-h-[850px]"
        >
          {/* Desktop Close Button in top right */}
          <div className="hidden md:block absolute top-4 right-4 z-40">
            <button 
              onClick={onClose} 
              className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-full transition-all cursor-pointer border border-neutral-700/60"
            >
              <X size={18} />
            </button>
          </div>

          {/* Left Panel: Preview & Info (Interactive Controls) */}
          <div className="hidden md:flex flex-1 p-6 md:p-8 flex-col justify-between overflow-y-auto border-r border-neutral-800 text-white">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono">
                  ✨ STORY MAKER
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {language === 'id' ? "Status: Siap Unduh" : "Status: Ready to Export"}
                </span>
              </div>

              <h2 className="text-2xl font-display font-black text-white tracking-tight">
                {language === 'id' ? "Poster Cerita Instagram" : "Instagram Story Poster"}
              </h2>

              <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                {language === 'id' 
                  ? "Kami merancang tata letak khusus 9:16 yang sangat pas dengan dimensi Story Instagram dsb. Anda dapat mengeklik tombol simpan gambar atau mengambil screenshot (tangkapan layar) pada ponsel Anda."
                  : "We've designed a specialized minimal 9:16 layout perfectly matching Instagram and Snapchat Story dimensions. Easily download the poster or take a screen capture."
                }
              </p>

              {captureError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex gap-2 items-start">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{captureError}</span>
                </div>
              )}
            </div>

            <div className="pt-6">
              <div className="text-center bg-neutral-950/45 p-4 rounded-2xl border border-neutral-800/60 shadow-inner">
                <span className="text-[10.5px] text-neutral-400 font-mono uppercase tracking-wider block leading-relaxed font-semibold">
                  {language === 'id' 
                    ? "💡 Tips: Tekan tombol kombinasi (Power + Volume Turun) untuk menyimpan hasil story ini ke galeri ponsel secara instan!"
                    : "💡 Tip: Capture your personalized card using hold (Power + Vol Down) on your mobile device!"
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Portrait Poster view (Locks onto exact 9:16 ratio) */}
          <div className="flex-1 bg-transparent md:bg-black p-4 flex flex-col items-center overflow-y-auto relative min-h-screen md:min-h-0 justify-start md:justify-center">
            
            {/* Aspect lock box (The Shareable Poster) */}
            <div 
              style={{ contentVisibility: 'auto' }}
              className="w-[340px] h-[604px] min-w-[340px] aspect-[9/16] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-neutral-800 scale-[0.9] sm:scale-100 origin-top md:origin-center mt-4 md:my-auto shrink-0"
            >
              {/* Instagram Story Target Frame */}
              <div 
                ref={posterRef}
                style={{ width: '340px', height: '604px' }}
                className={`bg-gradient-to-br ${backdrop.bg} p-5 relative flex flex-col justify-between text-white select-none overflow-hidden`}
              >
                {/* Atmospheric Glow */}
                <div className="absolute inset-0 bg-neutral-950/20 mix-blend-multiply" />
                <div className="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-brand-primary/25 rounded-full blur-3xl" />

                {/* Poster Content Grid */}
                <div className="relative z-10 w-full flex-1 flex flex-col justify-between">
                  
                  {/* Top Bar Label */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/90 font-mono">
                      {language === 'id' ? "✨ REKOMENDASI VARNA" : "✨ VARNA SPOTLIGHT"}
                    </span>
                    <span className="text-[8px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full uppercase font-mono text-white">
                      {language === 'id' ? "Profil Personal" : "Seasonal Profile"}
                    </span>
                  </div>

                  {/* Circle Portrait Wrapped in conic color drape */}
                  <div className="flex justify-center my-2">
                    <div 
                      className="w-36 h-36 rounded-full overflow-hidden relative flex items-center justify-center p-3 shadow-xl bg-white/10"
                      style={{ backgroundImage: conicGradientStyle }}
                    >
                      {/* Base shadow ellipse */}
                      <div className="absolute inset-2 bg-white rounded-full scale-[1.01]" />
                      <div className="absolute inset-2 overflow-hidden rounded-full">
                        <img
                          src={result.cleanedImageUrl || previewUrl || result.imageUrl || ''}
                          alt="Face sample profile"
                          className="w-full h-full object-cover select-none scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute inset-2 pointer-events-none rounded-full border border-black/5 shadow-[inset_0_3px_8px_rgba(0,0,0,0.15)]" />
                    </div>
                  </div>

                   {/* Archetype Title & Tagline */}
                  <div className="text-center space-y-1 py-1">
                    <div className="flex justify-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-extrabold bg-neutral-900/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full uppercase text-white tracking-widest border border-white/10">
                        {localizedFullType}
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-black leading-tight drop-shadow-md text-white mt-1">
                      {displayName}
                    </h3>
                    <p className="text-[9.5px] text-white/90 leading-relaxed font-semibold max-w-[280px] mx-auto line-clamp-2 px-2 italic">
                      "{displayDesc || 'Your custom pigmentation mapped under raw sunlight colors.'}"
                    </p>
                  </div>

                  {/* Core Swatches Row */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {/* Best Colors */}
                    <div className="bg-white/95 border border-white/20 p-2 px-2.5 rounded-2xl flex flex-col justify-between text-gray-900 shadow-sm">
                      <span className="text-[8px] font-black tracking-wider text-emerald-700 font-mono uppercase block mb-1">
                        {language === 'id' ? "✓ PALET PENYEIMBANG" : "✓ BEST HARMONY"}
                      </span>
                      <div className="flex gap-1.5 justify-around py-0.5">
                        {bestColorsList.map((color, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div 
                               className="w-7 h-7 rounded-full border border-black/10 shadow-sm relative"
                               style={{ backgroundColor: color.hex }}
                            >
                              <div className="absolute top-0.5 left-0.5 w-1.5 h-0.5 bg-white/25 rounded-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Avoid Colors */}
                    <div className="bg-white/95 border border-white/20 p-2 px-2.5 rounded-2xl flex flex-col justify-between text-gray-900 shadow-sm">
                      <span className="text-[8px] font-black tracking-wider text-rose-700 font-mono uppercase block mb-1">
                        {language === 'id' ? "✕ HINDARI WARNA INI" : "✕ AVOID CLASHES"}
                      </span>
                      <div className="flex gap-1.5 justify-around py-0.5">
                        {avoidColorsList.map((color, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div 
                               className="w-7 h-7 rounded-full border border-black/10 shadow-sm relative"
                               style={{ backgroundColor: color.hex }}
                            >
                              <div className="absolute top-0.5 left-0.5 w-1.5 h-0.5 bg-white/25 rounded-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Makeup Swatches & Face Shape */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    
                    {/* Mini Makeup Palette */}
                    <div className="bg-white/95 border border-white/20 p-2 rounded-2xl flex flex-col gap-1.5 justify-between text-gray-900 shadow-sm animate-fade-in">
                      <span className="text-[8px] font-black tracking-wider text-pink-700 font-mono uppercase block">
                        💄 {language === 'id' ? "KOSMETIK IDEAL" : "MAKEUP COLORS"}
                      </span>

                      <div className="grid grid-cols-3 gap-y-1.5 gap-x-1.5">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: makeupDetails?.lipColors?.[0]?.hex || '#FFEBE0' }} />
                          <span className="text-[6.5px] text-gray-500 font-mono font-bold scale-90">{language === 'id' ? 'Bibir' : 'Lip'}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: makeupDetails?.blushes?.[0]?.hex || '#FFEBE0' }} />
                          <span className="text-[6.5px] text-gray-500 font-mono font-bold scale-90">{language === 'id' ? 'Pipi' : 'Blush'}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: makeupDetails?.eyeshadows?.[0]?.hex || '#FFEBE0' }} />
                          <span className="text-[6.5px] text-gray-500 font-mono font-bold scale-90">{language === 'id' ? 'Mata' : 'Eye'}</span>
                        </div>

                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: makeupDetails?.lipColors?.[1]?.hex || '#E9C0A9' }} />
                          <span className="text-[6.5px] text-gray-500 font-mono font-bold scale-90">{language === 'id' ? 'Bibir' : 'Lip'}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: makeupDetails?.blushes?.[1]?.hex || '#FF8CA3' }} />
                          <span className="text-[6.5px] text-gray-500 font-mono font-bold scale-90">{language === 'id' ? 'Pipi' : 'Blush'}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: makeupDetails?.eyeshadows?.[1]?.hex || '#3A3B3C' }} />
                          <span className="text-[6.5px] text-gray-500 font-mono font-bold scale-90">{language === 'id' ? 'Mata' : 'Eye'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Face Shape / Glasses Recommended Image Only */}
                    <div className="bg-white/95 border border-white/20 rounded-2xl relative flex flex-col justify-between p-2 text-gray-900 shadow-sm">
                      <div className="flex items-center justify-between z-10">
                        <span className="text-[7.5px] font-black tracking-wider text-neutral-500 font-mono uppercase">
                          👓 {language === 'id' ? "KACAMATA" : "FRAME"} {result.faceShape}
                        </span>
                      </div>

                      {/* Best Glasses image */}
                      <div className="w-full h-14 flex items-center justify-center py-1.5 shrink-0">
                        <img 
                          src={`/glasses/glasses_${result.faceShape.toLowerCase()}.png`}
                          alt="Best Glass Style"
                          className="w-auto max-w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Brand watermark footer */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/10 mt-2">
                    <div className="flex items-center gap-1">
                      <Sparkles size={10} className="text-white/60" />
                      <span className="text-[8px] text-white/60 font-bold">{language === 'id' ? "Coba sekarang:" : "Try now:"}</span>
                    </div>
                    <span className="text-[7.5px] font-mono text-white/40 tracking-wider">
                      varnally.com
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* Mobile Actions and screenshot tip */}
            <div className="md:hidden w-full max-w-[340px] mt-8 mb-16 px-4 shrink-0 flex flex-col gap-4 z-20">
              <div className="text-center bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800/80 shadow-md">
                <span className="text-[10.5px] text-neutral-300 font-mono uppercase leading-relaxed tracking-wider block font-semibold">
                  {language === 'id'
                    ? "📸 Tips Screenshot: Seleraskan posisi kartu di layar, lalu tahan tombol (Power + Volume Turun) untuk menyimpan langsung ke album foto!"
                    : "📸 Screenshot Tip: Center the card on your phone, then hold Power + Volume Down for instant saving to your device!"
                  }
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 rounded-2xl font-black text-xs tracking-widest uppercase transition-all active:scale-98 cursor-pointer border border-neutral-700/50"
              >
                {language === 'id' ? "← Kembali ke Hasil" : "← Back to Results"}
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
