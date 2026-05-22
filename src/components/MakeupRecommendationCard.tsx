import React from 'react';
import { motion } from 'motion/react';
import { Eye, Heart, Sparkles } from 'lucide-react';

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

const MAKEUP_PRESETS: Record<string, MakeupData> = {
  // WINTER
  "Bright Winter": {
    finish: "Crisp Satin / Semi-Matte",
    foundationDescription: "Neutral or slightly cool undertone base. Clean finish with high luminosity, avoiding heavy golden or warm yellow tones.",
    foundationSwatches: [
      { name: "Fair Alabaster", hex: "#FFEBE0" },
      { name: "Medium Rosy Beige", hex: "#E9C0A9" },
      { name: "Deep Rich Cocoa", hex: "#6D4432" }
    ],
    lipColors: [
      { hex: "#BD1B24", name: "Aurora Crimson" },
      { hex: "#E6195E", name: "Vivid Fuchsia" },
      { hex: "#8A1C47", name: "Electric Plum" }
    ],
    eyeshadows: [
      { hex: "#D3D3D3", name: "Icy Silver Shimmer" },
      { hex: "#3A3B3C", name: "Charcoal Smoke" },
      { hex: "#7851A9", name: "Electric Violet" }
    ],
    blushes: [
      { hex: "#F34A81", name: "Hot Orchid Pink" },
      { hex: "#FF8CA3", name: "Vibrant Rosé" },
      { hex: "#DF73FF", name: "Delicate Lavender" }
    ]
  },
  "True Winter": {
    finish: "Classic Velvet Matte",
    foundationDescription: "Distinctly cool-undertone bases with soft rose, pink, or neutral porcelain undertones. Steer clear of peach or copper filters.",
    foundationSwatches: [
      { name: "Cool Porcelain", hex: "#FFF0EB" },
      { name: "Soft Cool Tan", hex: "#D8A388" },
      { name: "Dark Cool Espresso", hex: "#523326" }
    ],
    lipColors: [
      { hex: "#D2143A", name: "True Ruby" },
      { hex: "#3B101E", name: "Midnight Black Cherry" },
      { hex: "#A94A70", name: "Crimson Berry" }
    ],
    eyeshadows: [
      { hex: "#FFFFFF", name: "Crisp Snow White" },
      { hex: "#4B4E53", name: "Gunmetal Slate" },
      { hex: "#562C5B", name: "Deep Royal Plum" }
    ],
    blushes: [
      { hex: "#FC80A5", name: "Icy Bubblegum" },
      { hex: "#C71585", name: "Amethyst Berry" },
      { hex: "#E05A7D", name: "Cold Rose" }
    ]
  },
  "Dark Winter": {
    finish: "Rich Satin-Matte",
    foundationDescription: "Neutral-cool bases, deep and rich. High pigment density that anchors the dynamic contrast of winter eyes and hair.",
    foundationSwatches: [
      { name: "Rosy Alabaster", hex: "#FCE5DB" },
      { name: "Rich Tan-Neutral", hex: "#C68E6B" },
      { name: "Dark Roasted Espresso", hex: "#43251D" }
    ],
    lipColors: [
      { hex: "#7E0D21", name: "Deep Garnet" },
      { hex: "#4E0C1B", name: "Bordeaux Merlot" },
      { hex: "#9E3C5B", name: "Mulberry Rose" }
    ],
    eyeshadows: [
      { hex: "#8A7F8D", name: "Plum Taupe" },
      { hex: "#1C2E3C", name: "Deep Navy Velvet" },
      { hex: "#1A1110", name: "Obsidian Black" }
    ],
    blushes: [
      { hex: "#B85A75", name: "Smoky Plum" },
      { hex: "#913840", name: "Deep Cabernet" },
      { hex: "#D56D8D", name: "Cranberry Dust" }
    ]
  },
  // SPRING
  "Light Spring": {
    finish: "Dewy & Sun-Kissed Gloss",
    foundationDescription: "Lightweight, sheer, warm ivory and peachy golden undertones. Satin finish with continuous natural hydration.",
    foundationSwatches: [
      { name: "Light Peach Ivory", hex: "#FFF5ED" },
      { name: "Warm Honey Medium", hex: "#E8B291" },
      { name: "Toasted Warm Caramel", hex: "#AA7A5B" }
    ],
    lipColors: [
      { hex: "#F39A86", name: "Sheer Coral Peach" },
      { hex: "#E07A5F", name: "Warm Apricot Nude" },
      { hex: "#FF8F94", name: "Sweet Melon Pink" }
    ],
    eyeshadows: [
      { hex: "#F9EBCE", name: "Soft Vanilla Gold" },
      { hex: "#DFB394", name: "Peach Blossom Pearlescent" },
      { hex: "#B78A62", name: "Warm Honeywood" }
    ],
    blushes: [
      { hex: "#FFB09C", name: "Peach Apricot Pulp" },
      { hex: "#FFA3B1", name: "Sweet Hibiscus" },
      { hex: "#FFD4AE", name: "Creamy Cantaloupe" }
    ]
  },
  "True Spring": {
    finish: "Fresh Radiant Glow",
    foundationDescription: "Highly golden, yellow, or warm peach undertone foundations. Best accompanied by a high-shine highlighting finish.",
    foundationSwatches: [
      { name: "Warm Buttercream", hex: "#FFF2E2" },
      { name: "Golden Honey Medium", hex: "#DEA173" },
      { name: "Warm Golden Walnut", hex: "#885C42" }
    ],
    lipColors: [
      { hex: "#FF471A", name: "Bright Tomato Red" },
      { hex: "#F08080", name: "Fresh Coral Punch" },
      { hex: "#FF8C00", name: "Warm Orange Nectar" }
    ],
    eyeshadows: [
      { hex: "#ECCB99", name: "Shimmering Apricot Champagne" },
      { hex: "#C78E36", name: "Antique Warm Amber" },
      { hex: "#825026", name: "Spicy Nutmeg" }
    ],
    blushes: [
      { hex: "#FF7F50", name: "Vivid Coral Glaze" },
      { hex: "#F4A460", name: "Warm Sandy Sandalwood" },
      { hex: "#E9967A", name: "Fresh Papaya Blush" }
    ]
  },
  "Bright Spring": {
    finish: "Glossy & High Contrast Satin",
    foundationDescription: "Clear, vibrant, and warm golden finishes. Avoid matte, chalky, or heavy cool foundations.",
    foundationSwatches: [
      { name: "Golden Alabaster", hex: "#FFEEDD" },
      { name: "Amber Tan Medium", hex: "#DFA070" },
      { name: "Deep Warm Chestnut", hex: "#794E34" }
    ],
    lipColors: [
      { hex: "#FF1493", name: "Neon Coral Fuchsia" },
      { hex: "#FF3300", name: "Vibrant Poppy Red" },
      { hex: "#FF6666", name: "Electric Watermelon" }
    ],
    eyeshadows: [
      { hex: "#FFD700", name: "Bright Lemon Gold Sparkle" },
      { hex: "#40E0D0", name: "Teal Lagoon Accents" },
      { hex: "#C19A6B", name: "Sparkling Bronze" }
    ],
    blushes: [
      { hex: "#FF3E96", name: "Wild Carnation" },
      { hex: "#FF8243", name: "Zesty Tangerine Sheer" },
      { hex: "#EE9A49", name: "Sweet Orange Blossom" }
    ]
  },
  // SUMMER
  "Light Summer": {
    finish: "Dewy / Luminous Sheer",
    foundationDescription: "Lightest cool-pink base tones. Ensure base is light, breathable, and matching delicate light indicators.",
    foundationSwatches: [
      { name: "Light Rosy Pearl", hex: "#FFF3FE" },
      { name: "Rosy Beige Medium", hex: "#E9CFC5" },
      { name: "Light Cool Ebony", hex: "#7E5D50" }
    ],
    lipColors: [
      { hex: "#EA96A3", name: "Rosewater Pink" },
      { hex: "#E5A0B7", name: "Light Pastel Mauve" },
      { hex: "#DC8093", name: "Strawberry Mist" }
    ],
    eyeshadows: [
      { hex: "#EADAED", name: "Frosted Orchid" },
      { hex: "#96A9C5", name: "Powder Blue Haze" },
      { hex: "#A89A9C", name: "Pearl Slate Grey" }
    ],
    blushes: [
      { hex: "#FFAEB9", name: "Pastel Sweet Pea" },
      { hex: "#EEA2AD", name: "Soft Wild Orchid" },
      { hex: "#D6B4CD", name: "Light Lavender Frost" }
    ]
  },
  "True Summer": {
    finish: "Satin Silk Finish",
    foundationDescription: "Distinctly cool-undertone bases with soft cool-olive or rosy-beige undertones. Keep the focus light and powdery.",
    foundationSwatches: [
      { name: "Cool Alabaster", hex: "#FFEDE8" },
      { name: "Cool Pecan-Beige", hex: "#CD9D82" },
      { name: "Deep Cool Cocoa", hex: "#624135" }
    ],
    lipColors: [
      { hex: "#CD5C5C", name: "English Classic Rose" },
      { hex: "#AA4A44", name: "Raspberry Splash" },
      { hex: "#AF6E79", name: "Satin Vintage Mauve" }
    ],
    eyeshadows: [
      { hex: "#CBC6CF", name: "Silver Heather Lavender" },
      { hex: "#778899", name: "Soft Charcoal Slate" },
      { hex: "#5C525F", name: "Amethyst Smoke" }
    ],
    blushes: [
      { hex: "#DDA0DD", name: "Petal Plum Orchid" },
      { hex: "#FA8072", name: "Muted Cool Salmon Pink" },
      { hex: "#DB8C9B", name: "Cottage Peony" }
    ]
  },
  "Soft Summer": {
    finish: "Muted Velvet / Soft Satin",
    foundationDescription: "Neutral-cool bases with soft hazel, pink-grey, or beige undertones. Satin-matte avoids shiny highlights.",
    foundationSwatches: [
      { name: "Muted Ivory Neutral", hex: "#FFF0EB" },
      { name: "Blended Neutral Beige", hex: "#CDA48C" },
      { name: "Dark Neutral Walnut", hex: "#584236" }
    ],
    lipColors: [
      { hex: "#C08081", name: "Smoky Rosewood" },
      { hex: "#8A6872", name: "Cranberry Fog" },
      { hex: "#9F7A8E", name: "Muted Lilac Taupe" }
    ],
    eyeshadows: [
      { hex: "#B8AD9E", name: "Stone Grey Taupe" },
      { hex: "#7A6B63", name: "Blended Cocoa Haze" },
      { hex: "#808A91", name: "Soft Spruce Pine" }
    ],
    blushes: [
      { hex: "#C78C9E", name: "Smoked Rose Dust" },
      { hex: "#B284BE", name: "Warm Lavender Mist" },
      { hex: "#E9967A", name: "Soft Sand Pink" }
    ]
  },
  // AUTUMN
  "Soft Autumn": {
    finish: "Velvet Soft Matte / Earthy Aura",
    foundationDescription: "Muted warm-neutral tones, highly blended warm olive or toasted amber. Needs ultra-blendable silk finishes.",
    foundationSwatches: [
      { name: "Toasted Neutral Fair", hex: "#FFEFE4" },
      { name: "Muted Butterscotch Medium", hex: "#CFA085" },
      { name: "Earthy Warm Mahogany", hex: "#613D2D" }
    ],
    lipColors: [
      { hex: "#D68D6E", name: "Toasted Apricot Nude" },
      { hex: "#C57B69", name: "Warm Maple Milk" },
      { hex: "#AD6D5E", name: "Smoked Terra Cotta" }
    ],
    eyeshadows: [
      { hex: "#D2B48C", name: "Soft Antique Gold" },
      { hex: "#8FBC8F", name: "Earthy Sage Green" },
      { hex: "#A0522D", name: "Dry Pecan Shell" }
    ],
    blushes: [
      { hex: "#E9967A", name: "Nude Apricot Bark" },
      { hex: "#D2691E", name: "Toasted Hazelnut" },
      { hex: "#CD5C5C", name: "Soft Auburn Spice" }
    ]
  },
  "True Autumn": {
    finish: "Earthy Satin",
    foundationDescription: "Golden bronze, rich yellow sand, and golden olive bases. Fully embraces full warmth; avoid light cool pink foundations.",
    foundationSwatches: [
      { name: "Full Golden Honey", hex: "#FFE7CC" },
      { name: "Bronze Tan Medium", hex: "#C68C60" },
      { name: "Dark Roasted Tan-Gold", hex: "#563A21" }
    ],
    lipColors: [
      { hex: "#A0522D", name: "Terracotta Clay" },
      { hex: "#8B4513", name: "Rich Cinnamon Spice" },
      { hex: "#CD853F", name: "Copper Apricot Glaze" }
    ],
    eyeshadows: [
      { hex: "#E5C158", name: "Rich Forest Olive/Gold" },
      { hex: "#556B2F", name: "Deep Autumn Moss Green" },
      { hex: "#8E5132", name: "Roasted Pumpkin Shell" }
    ],
    blushes: [
      { hex: "#E2725B", name: "Vivid Paprika Dust" },
      { hex: "#BC4F30", name: "Burnt Ochre Red" },
      { hex: "#D1A056", name: "Antique Bronze" }
    ]
  },
  "Dark Autumn": {
    finish: "Deep Satin / Velvet Glam",
    foundationDescription: "Deep rich warm, strong amber & golden olive undertones. Matte finishes balanced by highly pigmented contours.",
    foundationSwatches: [
      { name: "Earthy Honey Fair", hex: "#FFEAD4" },
      { name: "Warm Coffee Medium", hex: "#BE865E" },
      { name: "Dark Warm Cocoa", hex: "#462817" }
    ],
    lipColors: [
      { hex: "#800000", name: "Eclipse Maroon" },
      { hex: "#802213", name: "Spicy Maple Chestnut" },
      { hex: "#8B0000", name: "Burnt Dark Brick Red" }
    ],
    eyeshadows: [
      { hex: "#8B5A2B", name: "Gilded Caramel Bronze" },
      { hex: "#2E5043", name: "Midnight Forest Teal" },
      { hex: "#3D2B1F", name: "Toasted Espresso Beans" }
    ],
    blushes: [
      { hex: "#B35B47", name: "Spiced Wine Blush" },
      { hex: "#A05128", name: "Deep Mahogany Gold" },
      { hex: "#8B2500", name: "Burnt Sienna" }
    ]
  }
};

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
      className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-black/5 shadow-sm space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono">Expert Cosmetics Map</p>
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
        
        {/* 1. Foundation & Base Frame */}
        <div id="makeup-base-section" className="bg-neutral-50/50 p-6 rounded-3xl border border-neutral-100 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">STEP 1: BASE FOUNDATION</p>
            <h3 className="text-base font-bold text-gray-850">Skin Shade & Finish Blueprint</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              {makeupDetails.foundationDescription}
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-450 uppercase tracking-widest">Recommended Skin Reference Swatches</p>
            <div className="grid grid-cols-3 gap-3">
              {makeupDetails.foundationSwatches.map((swatch, idx) => (
                <div key={idx} className="flex flex-col items-center p-2.5 bg-white border border-neutral-100 rounded-2xl shadow-sm space-y-2">
                  <div 
                    className="w-10 h-10 rounded-full border border-black/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-800 line-clamp-1">{swatch.name}</p>
                    <p className="text-[8px] font-mono text-gray-400 font-bold uppercase">{swatch.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Lipstick Frame */}
        <div id="makeup-lipstick-section" className="bg-neutral-50/50 p-6 rounded-3xl border border-neutral-100 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">STEP 2: LIP ARTISTRY</p>
            <h3 className="text-base font-bold text-gray-850">3 Handpicked Suitable Lipsticks</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Accentuate yours with distinct intensity levels. Recommended finishes include hydrating cream lipsticks, light glossy stains, or vibrant liquid velvets.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {makeupDetails.lipColors.map((lip, idx) => (
              <div key={idx} className="flex flex-col items-center p-2.5 bg-white border border-neutral-100 rounded-2xl shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-full relative overflow-hidden border border-black/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                  {/* Styled like a real lip swipe color block with dual gradient */}
                  <div 
                    className="absolute inset-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${lip.hex} 0%, ${lip.hex}dd 100%)`
                    }}
                  />
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10" />
                </div>
                <div className="text-center w-full">
                  <p className="text-[10px] font-bold text-gray-800 line-clamp-1 h-3.5 leading-none">{lip.name}</p>
                  <p className="text-[8px] font-mono text-gray-400 font-bold uppercase mt-1">{lip.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Eyeshadow Frame */}
        <div id="makeup-eyeshadow-section" className="bg-neutral-50/50 p-6 rounded-3xl border border-neutral-100 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Eye size={12} className="text-brand-primary" />
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">STEP 3: EYE DEFINE</p>
            </div>
            <h3 className="text-base font-bold text-gray-850">3 Harmonious Eyeshadow Pans</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Create exquisite dimensions using customized gradients that make your natural base color pop instantly.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {makeupDetails.eyeshadows.map((eye, idx) => (
              <div key={idx} className="flex flex-col items-center p-2.5 bg-white border border-neutral-100 rounded-2xl shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-full relative overflow-hidden border border-black/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.15)] flex items-center justify-center p-0.5" style={{ background: '#222' }}>
                  {/* Realistic eyeshadow pan look */}
                  <div 
                    className="w-full h-full rounded-full transition-transform"
                    style={{ 
                      background: `radial-gradient(circle at 35% 35%, ${eye.hex}eb 0%, ${eye.hex} 80%, #000 120%)`,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                    }}
                  />
                </div>
                <div className="text-center w-full">
                  <p className="text-[10px] font-bold text-gray-800 line-clamp-1 h-3.5 leading-none">{eye.name}</p>
                  <p className="text-[8px] font-mono text-gray-400 font-bold uppercase mt-1">{eye.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Blush On Frame */}
        <div id="makeup-blush-section" className="bg-neutral-50/50 p-6 rounded-3xl border border-neutral-100 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Heart size={12} className="text-brand-primary" />
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">STEP 4: BLUSH & FLUSH</p>
            </div>
            <h3 className="text-base font-bold text-gray-850">3 Radiating Cheek Blushers</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Soft dustings of warm apricot, cool berry, or silky rose blushers to shape and contour your natural bone structures.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {makeupDetails.blushes.map((blush, idx) => (
              <div key={idx} className="flex flex-col items-center p-2.5 bg-white border border-neutral-100 rounded-2xl shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-full relative overflow-hidden flex items-center justify-center">
                  {/* Soft powder-buff appearance with radial blur styling */}
                  <div 
                    className="w-8 h-8 rounded-full blur-[2px] opacity-90"
                    style={{ 
                      background: `radial-gradient(circle, ${blush.hex} 0%, ${blush.hex}dd 70%, transparent 100%)`
                    }}
                  />
                </div>
                <div className="text-center w-full">
                  <p className="text-[10px] font-bold text-gray-800 line-clamp-1 h-3.5 leading-none">{blush.name}</p>
                  <p className="text-[8px] font-mono text-gray-400 font-bold uppercase mt-1">{blush.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
};
