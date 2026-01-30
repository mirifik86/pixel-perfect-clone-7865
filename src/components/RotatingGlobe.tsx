import { memo, useMemo } from 'react';

// Import optimized regional globe images
import globeAmericas from '@/assets/globe-americas.png';
import globeEurope from '@/assets/globe-europe.png';
import globeAsia from '@/assets/globe-asia.png';
import globeOceania from '@/assets/globe-oceania.png';

interface RotatingGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

type Region = 'americas' | 'europe' | 'asia' | 'oceania';

/**
 * Detect user's region from browser language/locale
 * Maps language codes to 4 geographic regions for globe personalization
 */
const detectUserRegion = (): Region => {
  // Get browser language (e.g., "en-US", "fr-FR", "ja", "zh-CN")
  const lang = navigator.language || (navigator as any).userLanguage || 'en';
  const langCode = lang.toLowerCase();
  
  // Extract country code if present (e.g., "en-US" -> "us")
  const parts = langCode.split('-');
  const country = parts[1] || '';
  const language = parts[0];
  
  // Europe + Africa (Mediterranean centered)
  const europeCountries = ['gb', 'uk', 'fr', 'de', 'it', 'es', 'pt', 'nl', 'be', 'ch', 'at', 'pl', 'cz', 'se', 'no', 'dk', 'fi', 'ie', 'gr', 'ro', 'hu', 'bg', 'hr', 'sk', 'si', 'lt', 'lv', 'ee', 'ua', 'ru', 'za', 'eg', 'ng', 'ke', 'gh', 'tz', 'ug', 'et', 'ma', 'dz', 'tn', 'ly', 'sd', 'ao', 'mz', 'zm', 'zw', 'bw', 'na', 'sn', 'ci', 'cm', 'cd', 'sa', 'ae', 'il', 'tr', 'ir', 'iq', 'jo', 'lb', 'sy', 'ye', 'om', 'kw', 'qa', 'bh'];
  const europeLanguages = ['fr', 'de', 'it', 'nl', 'pl', 'cs', 'sv', 'no', 'da', 'fi', 'el', 'ro', 'hu', 'bg', 'hr', 'sk', 'sl', 'lt', 'lv', 'et', 'uk', 'ru', 'ar', 'he', 'fa', 'tr', 'sw', 'am', 'ha', 'yo', 'ig', 'zu', 'xh', 'af'];
  
  if (europeCountries.includes(country) || europeLanguages.includes(language)) {
    return 'europe';
  }
  
  // Asia (Russia, China, Japan, India centered)
  const asiaCountries = ['cn', 'jp', 'kr', 'tw', 'hk', 'mn', 'kz', 'uz', 'in', 'pk', 'bd', 'lk', 'np'];
  const asiaLanguages = ['zh', 'ja', 'ko', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'ne', 'si'];
  
  if (asiaCountries.includes(country) || asiaLanguages.includes(language)) {
    return 'asia';
  }
  
  // Oceania + Southeast Asia (Australia / Indonesia centered)
  const oceaniaCountries = ['au', 'nz', 'fj', 'pg', 'ws', 'to', 'vu', 'sb', 'nc', 'pf', 'sg', 'my', 'th', 'vn', 'ph', 'id', 'kh', 'la', 'mm'];
  const oceaniaLanguages = ['th', 'vi', 'ms', 'id', 'tl', 'my', 'km', 'lo'];
  
  if (oceaniaCountries.includes(country) || oceaniaLanguages.includes(language)) {
    return 'oceania';
  }
  
  // Americas (default - North & South America centered)
  // Includes: US, Canada, Mexico, Central & South America
  return 'americas';
};

/**
 * Get the appropriate globe image based on detected region
 */
const getRegionGlobe = (region: Region): string => {
  switch (region) {
    case 'americas':
      return globeAmericas;
    case 'europe':
      return globeEurope;
    case 'asia':
      return globeAsia;
    case 'oceania':
      return globeOceania;
    default:
      return globeAmericas;
  }
};

/**
 * Region-Personalized Earth Globe - Premium Static Display
 * 
 * Detects user's region and displays the matching globe view:
 * - Americas: North & South America centered
 * - Europe: Europe + Africa (Mediterranean) centered
 * - Asia: Russia, China, Japan, India centered
 * - Oceania: Australia, Indonesia, Southeast Asia centered
 * 
 * Uses optimized static images for performance
 */
export const RotatingGlobe = memo(({ size, isAnalyzing = false }: RotatingGlobeProps) => {
  // Globe size with clean gap from gauge ring
  const globeSize = size * 0.82;
  
  // Detect user region once and memoize
  const userRegion = useMemo(() => detectUserRegion(), []);
  const globeImage = useMemo(() => getRegionGlobe(userRegion), [userRegion]);
  
  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        width: globeSize,
        height: globeSize,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
      }}
    >
      {/* ========== EARTH GLOBE - STATIC & REGION-PERSONALIZED ========== */}
      <div 
        className="absolute rounded-full overflow-hidden"
        style={{
          width: '100%',
          height: '100%',
          boxShadow: `
            0 0 25px hsl(200 45% 18% / 0.35),
            0 0 50px hsl(200 35% 12% / 0.2),
            0 0 80px hsl(174 50% 35% / 0.12)
          `,
        }}
      >
        {/* STATIC EARTH IMAGE - Region-specific */}
        <img 
          src={globeImage}
          alt="Earth"
          className="absolute inset-0 w-full h-full object-cover rounded-full"
          style={{
            // Refined: slightly adjusted for tech look
            filter: 'saturate(0.95) brightness(1.02) contrast(1.05)',
          }}
          loading="eager"
          draggable={false}
        />
        
        {/* SUNRISE RIM LIGHT - Right side glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(ellipse 40% 80% at 95% 50%, 
                hsl(45 80% 70% / 0.12) 0%,
                hsl(35 70% 60% / 0.06) 30%,
                transparent 60%
              )
            `,
          }}
        />
        
        {/* SOFT TERMINATOR SHADOW - Left side */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(100deg, 
              hsl(230 30% 8% / 0.3) 0%,
              hsl(230 25% 10% / 0.15) 20%,
              transparent 45%
            )`,
          }}
        />
        
        {/* Subtle atmospheric glow + outer cyan tech glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `
              inset 0 0 20px hsl(200 50% 45% / 0.06),
              0 0 35px hsl(174 55% 45% / 0.12),
              0 0 60px hsl(174 45% 40% / 0.06)
            `,
          }}
        />
      </div>
      
      {/* ========== SCAN RING (analysis mode only) ========== */}
      {isAnalyzing && (
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '104%',
            height: '104%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid hsl(174 50% 50% / 0.3)',
            animation: 'scan-pulse 3s ease-out infinite',
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
});

RotatingGlobe.displayName = 'RotatingGlobe';