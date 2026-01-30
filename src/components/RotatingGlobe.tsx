import { memo, useMemo } from 'react';

interface RotatingGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

type Region = 'americas' | 'europe_africa' | 'asia_oceania';

/**
 * Detect user's region using browser locale/language and timezone
 * Maps to 3 globe variants for personalized display
 */
const detectUserRegion = (): Region => {
  // Get browser language (e.g., "en-US", "fr-FR", "ja")
  const lang = navigator.language || (navigator as any).userLanguage || 'en';
  const langCode = lang.toLowerCase();
  const parts = langCode.split('-');
  const country = parts[1] || '';
  const language = parts[0];
  
  // Get timezone for additional context
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const tz = timezone.toLowerCase();
  
  // ========== AMERICAS ==========
  // Countries: US, Canada, Mexico, Brazil, Argentina, etc.
  const americasCountries = ['us', 'ca', 'mx', 'br', 'ar', 'cl', 'co', 'pe', 've', 'ec', 'bo', 'py', 'uy', 'cr', 'pa', 'gt', 'hn', 'sv', 'ni', 'cu', 'do', 'pr', 'jm', 'tt'];
  if (americasCountries.includes(country)) {
    return 'americas';
  }
  // Timezone detection for Americas
  if (tz.includes('america/') || tz.includes('us/') || tz.includes('canada/') || tz.includes('brazil/')) {
    return 'americas';
  }
  
  // ========== ASIA / OCEANIA ==========
  // Countries: Japan, Korea, China, India, Australia, etc.
  const asiaOceaniaCountries = ['jp', 'kr', 'cn', 'tw', 'hk', 'sg', 'my', 'th', 'vn', 'ph', 'id', 'in', 'pk', 'bd', 'lk', 'np', 'au', 'nz', 'fj', 'pg', 'kz', 'uz', 'mn', 'kh', 'la', 'mm'];
  if (asiaOceaniaCountries.includes(country)) {
    return 'asia_oceania';
  }
  // Languages strongly associated with Asia/Oceania
  const asiaLanguages = ['ja', 'ko', 'zh', 'th', 'vi', 'ms', 'id', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'ne', 'si', 'my', 'km', 'lo'];
  if (asiaLanguages.includes(language)) {
    return 'asia_oceania';
  }
  // Timezone detection for Asia/Oceania
  if (tz.includes('asia/') || tz.includes('australia/') || tz.includes('pacific/') || tz.includes('indian/')) {
    return 'asia_oceania';
  }
  
  // ========== EUROPE / AFRICA ==========
  // Countries: UK, France, Germany, Italy, Spain, etc.
  const europeAfricaCountries = ['gb', 'uk', 'fr', 'de', 'it', 'es', 'pt', 'nl', 'be', 'ch', 'at', 'pl', 'cz', 'se', 'no', 'dk', 'fi', 'ie', 'gr', 'ro', 'hu', 'bg', 'hr', 'sk', 'si', 'lt', 'lv', 'ee', 'ua', 'ru', 'za', 'eg', 'ng', 'ke', 'gh', 'tz', 'ma', 'dz', 'tn', 'sa', 'ae', 'il', 'tr', 'ir'];
  if (europeAfricaCountries.includes(country)) {
    return 'europe_africa';
  }
  // Languages strongly associated with Europe/Africa
  const europeLanguages = ['fr', 'de', 'it', 'nl', 'pl', 'cs', 'sv', 'no', 'da', 'fi', 'el', 'ro', 'hu', 'bg', 'hr', 'sk', 'sl', 'lt', 'lv', 'et', 'uk', 'ru', 'ar', 'he', 'fa', 'tr', 'sw'];
  if (europeLanguages.includes(language)) {
    return 'europe_africa';
  }
  // Timezone detection for Europe/Africa
  if (tz.includes('europe/') || tz.includes('africa/') || tz.includes('atlantic/')) {
    return 'europe_africa';
  }
  
  // ========== FALLBACK ==========
  // Default to Americas (common for English without specific country)
  return 'americas';
};

/**
 * Get background position for Blue Marble texture based on 3 regions
 * The texture is 200% width, so position values center different continents
 */
const getRegionPosition = (region: Region): string => {
  switch (region) {
    case 'americas':
      // North & South America centered
      return '15% 50%';
    case 'europe_africa':
      // Mediterranean centered (Europe + Africa visible)
      return '55% 50%';
    case 'asia_oceania':
      // Asia + Australia visible
      return '85% 50%';
    default:
      return '15% 50%';
  }
};

/**
 * Region-Personalized Earth Globe - 3 Static Variants
 * 
 * Detects user's region via locale + timezone and shows matching view:
 * - AMERICAS: North & South America centered
 * - EUROPE/AFRICA: Mediterranean centered (Europe + Africa visible)
 * - ASIA/OCEANIA: Asia + Australia visible
 * 
 * High-quality Blue Marble texture, static display
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
            // Clean, vibrant look with balanced colors
            filter: 'saturate(1.05) brightness(1.08) contrast(1.05)',
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