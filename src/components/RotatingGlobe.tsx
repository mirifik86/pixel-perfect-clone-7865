import { memo, useMemo } from 'react';

interface RotatingGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

type Region = 'americas' | 'europe' | 'asia' | 'oceania' | 'africa';

/**
 * Detect user's region from browser language/locale
 * Maps language codes to geographic regions for globe centering
 */
const detectUserRegion = (): Region => {
  // Get browser language (e.g., "en-US", "fr-FR", "ja", "zh-CN")
  const lang = navigator.language || (navigator as any).userLanguage || 'en';
  const langCode = lang.toLowerCase();
  
  // Extract country code if present (e.g., "en-US" -> "us")
  const parts = langCode.split('-');
  const country = parts[1] || '';
  const language = parts[0];
  
  // Americas (North & South America)
  if (['us', 'ca', 'mx', 'br', 'ar', 'cl', 'co', 'pe', 've', 'ec', 'bo', 'py', 'uy'].includes(country)) {
    return 'americas';
  }
  if (['en', 'es', 'pt'].includes(language) && !country) {
    // Default English/Spanish/Portuguese without country to Americas (common case)
    return 'americas';
  }
  
  // Europe
  if (['gb', 'uk', 'fr', 'de', 'it', 'es', 'pt', 'nl', 'be', 'ch', 'at', 'pl', 'cz', 'se', 'no', 'dk', 'fi', 'ie', 'gr', 'ro', 'hu', 'bg', 'hr', 'sk', 'si', 'lt', 'lv', 'ee', 'ua', 'ru'].includes(country)) {
    return 'europe';
  }
  if (['fr', 'de', 'it', 'nl', 'pl', 'cs', 'sv', 'no', 'da', 'fi', 'el', 'ro', 'hu', 'bg', 'hr', 'sk', 'sl', 'lt', 'lv', 'et', 'uk', 'ru'].includes(language)) {
    return 'europe';
  }
  
  // Asia (East, South, Southeast, Central)
  if (['cn', 'jp', 'kr', 'tw', 'hk', 'sg', 'my', 'th', 'vn', 'ph', 'id', 'in', 'pk', 'bd', 'lk', 'np', 'kz', 'uz', 'mn', 'kh', 'la', 'mm'].includes(country)) {
    return 'asia';
  }
  if (['zh', 'ja', 'ko', 'th', 'vi', 'ms', 'id', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'ne', 'si', 'my', 'km', 'lo'].includes(language)) {
    return 'asia';
  }
  
  // Oceania (Australia, NZ, Pacific)
  if (['au', 'nz', 'fj', 'pg', 'ws', 'to', 'vu', 'sb', 'nc', 'pf'].includes(country)) {
    return 'oceania';
  }
  
  // Africa & Middle East
  if (['za', 'eg', 'ng', 'ke', 'gh', 'tz', 'ug', 'et', 'ma', 'dz', 'tn', 'ly', 'sd', 'ao', 'mz', 'zm', 'zw', 'bw', 'na', 'sn', 'ci', 'cm', 'cd', 'sa', 'ae', 'il', 'tr', 'ir', 'iq', 'jo', 'lb', 'sy', 'ye', 'om', 'kw', 'qa', 'bh'].includes(country)) {
    return 'africa';
  }
  if (['ar', 'he', 'fa', 'tr', 'sw', 'am', 'ha', 'yo', 'ig', 'zu', 'xh', 'af'].includes(language)) {
    return 'africa';
  }
  
  // Default to Americas (common for English without specific country)
  return 'americas';
};

/**
 * Get background position for Blue Marble texture based on region
 * The texture is 200% width, so position values center different continents
 */
const getRegionPosition = (region: Region): string => {
  switch (region) {
    case 'americas':
      // Americas centered (North & South America visible)
      return '15% 50%';
    case 'europe':
      // Europe & Africa centered
      return '55% 50%';
    case 'africa':
      // Africa & Middle East centered
      return '60% 50%';
    case 'asia':
      // Asia centered (East Asia, India visible)
      return '80% 50%';
    case 'oceania':
      // Oceania centered (Australia, Pacific)
      return '92% 50%';
    default:
      return '25% 50%';
  }
};

/**
 * Region-Personalized Earth Globe - Premium Static Display
 * 
 * Detects user's region and centers the globe on their part of the world:
 * - Americas: North & South America view
 * - Europe: European & African view  
 * - Asia: Asian continent view
 * - Oceania: Australia & Pacific view
 * - Africa: Africa & Middle East view
 * 
 * High-quality Blue Marble texture with soft lighting
 */
export const RotatingGlobe = memo(({ size, isAnalyzing = false }: RotatingGlobeProps) => {
  // Globe size with clean gap from gauge ring
  const globeSize = size * 0.82;
  
  // Detect user region once and memoize
  const userRegion = useMemo(() => detectUserRegion(), []);
  const backgroundPosition = useMemo(() => getRegionPosition(userRegion), [userRegion]);
  
  // High-quality Blue Marble Earth texture
  const earthTexture = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/1280px-Blue_Marble_2002.png';
  
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
        {/* Ocean base gradient - slightly darker */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, 
              hsl(200 48% 35%) 0%, 
              hsl(210 45% 25%) 40%, 
              hsl(220 40% 14%) 100%
            )`,
          }}
        />
        
        {/* STATIC EARTH TEXTURE - Centered on user's region */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `url(${earthTexture})`,
            backgroundSize: '200% 100%',
            backgroundPosition: backgroundPosition,
            backgroundRepeat: 'no-repeat',
            // Refined: less saturation, slightly darker for tech look
            filter: 'saturate(0.9) brightness(1.0) contrast(1.08)',
          }}
        />
        
        {/* SUNRISE RIM LIGHT - Right side glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(ellipse 40% 80% at 95% 50%, 
                hsl(45 80% 70% / 0.15) 0%,
                hsl(35 70% 60% / 0.08) 30%,
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
              hsl(230 30% 8% / 0.4) 0%,
              hsl(230 25% 10% / 0.2) 25%,
              transparent 50%
            )`,
          }}
        />
        
        {/* Subtle atmospheric glow + outer cyan tech glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `
              inset 0 0 20px hsl(200 50% 45% / 0.08),
              0 0 35px hsl(174 55% 45% / 0.15),
              0 0 60px hsl(174 45% 40% / 0.08)
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