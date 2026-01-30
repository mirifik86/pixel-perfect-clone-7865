import { memo, useMemo, useRef, useState, useCallback, useEffect } from 'react';

interface InteractiveGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

type Region = 'americas' | 'europe' | 'asia' | 'oceania' | 'africa';

// 36 frames = 10° per frame for smooth rotation
const TOTAL_FRAMES = 36;
const DEGREES_PER_FRAME = 360 / TOTAL_FRAMES;

/**
 * Detect user's region from browser language/locale
 */
const detectUserRegion = (): Region => {
  const lang = navigator.language || (navigator as any).userLanguage || 'en';
  const langCode = lang.toLowerCase();
  const parts = langCode.split('-');
  const country = parts[1] || '';
  const language = parts[0];
  
  // Americas
  if (['us', 'ca', 'mx', 'br', 'ar', 'cl', 'co', 'pe', 've', 'ec', 'bo', 'py', 'uy'].includes(country)) {
    return 'americas';
  }
  if (['en', 'es', 'pt'].includes(language) && !country) {
    return 'americas';
  }
  
  // Europe
  if (['gb', 'uk', 'fr', 'de', 'it', 'es', 'pt', 'nl', 'be', 'ch', 'at', 'pl', 'cz', 'se', 'no', 'dk', 'fi', 'ie', 'gr', 'ro', 'hu', 'bg', 'hr', 'sk', 'si', 'lt', 'lv', 'ee', 'ua', 'ru'].includes(country)) {
    return 'europe';
  }
  if (['fr', 'de', 'it', 'nl', 'pl', 'cs', 'sv', 'no', 'da', 'fi', 'el', 'ro', 'hu', 'bg', 'hr', 'sk', 'sl', 'lt', 'lv', 'et', 'uk', 'ru'].includes(language)) {
    return 'europe';
  }
  
  // Asia
  if (['cn', 'jp', 'kr', 'tw', 'hk', 'sg', 'my', 'th', 'vn', 'ph', 'id', 'in', 'pk', 'bd', 'lk', 'np', 'kz', 'uz', 'mn', 'kh', 'la', 'mm'].includes(country)) {
    return 'asia';
  }
  if (['zh', 'ja', 'ko', 'th', 'vi', 'ms', 'id', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'ne', 'si', 'my', 'km', 'lo'].includes(language)) {
    return 'asia';
  }
  
  // Oceania
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
  
  return 'americas';
};

/**
 * Get initial frame index based on region (0-35)
 */
const getRegionFrame = (region: Region): number => {
  switch (region) {
    case 'americas':  return 5;   // ~50° - Americas centered
    case 'europe':    return 20;  // ~200° - Europe/Africa centered
    case 'africa':    return 22;  // ~220° - Africa centered
    case 'asia':      return 29;  // ~290° - Asia centered
    case 'oceania':   return 33;  // ~330° - Oceania centered
    default:          return 5;
  }
};

/**
 * Detect if device has low performance
 */
const isLowPerformanceDevice = (): boolean => {
  // Check device memory (if available)
  if ('deviceMemory' in navigator) {
    if ((navigator as any).deviceMemory < 4) return true;
  }
  
  // Check hardware concurrency
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }
  
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }
  
  return false;
};

/**
 * Interactive Globe Component
 * Frame-based rotation with drag interaction
 */
export const InteractiveGlobe = memo(({ size, isAnalyzing = false }: InteractiveGlobeProps) => {
  const globeSize = size * 0.82;
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Detect region and performance once
  const userRegion = useMemo(() => detectUserRegion(), []);
  const initialFrame = useMemo(() => getRegionFrame(userRegion), [userRegion]);
  const isLowPerf = useMemo(() => isLowPerformanceDevice(), []);
  
  // Rotation state
  const [currentFrame, setCurrentFrame] = useState(initialFrame);
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs for drag handling
  const dragStartX = useRef(0);
  const frameAtDragStart = useRef(initialFrame);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  
  // Calculate background position from frame (0-35 maps to 0%-100%)
  const backgroundPosition = useMemo(() => {
    const percentage = (currentFrame / TOTAL_FRAMES) * 100;
    return `${percentage}% 50%`;
  }, [currentFrame]);
  
  // High-quality Blue Marble texture (equirectangular)
  const earthTexture = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/1280px-Blue_Marble_2002.png';
  
  // Easing animation after drag release
  const animateEasing = useCallback(() => {
    if (Math.abs(velocityRef.current) < 0.1) {
      animationRef.current = null;
      return;
    }
    
    // Apply friction
    velocityRef.current *= 0.92;
    
    // Update frame based on velocity
    setCurrentFrame(prev => {
      let newFrame = prev + velocityRef.current;
      // Wrap around
      while (newFrame < 0) newFrame += TOTAL_FRAMES;
      while (newFrame >= TOTAL_FRAMES) newFrame -= TOTAL_FRAMES;
      return Math.round(newFrame) % TOTAL_FRAMES;
    });
    
    animationRef.current = requestAnimationFrame(animateEasing);
  }, []);
  
  // Handle drag start
  const handleDragStart = useCallback((clientX: number) => {
    if (isLowPerf) return;
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setIsDragging(true);
    dragStartX.current = clientX;
    frameAtDragStart.current = currentFrame;
    lastXRef.current = clientX;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
  }, [currentFrame, isLowPerf]);
  
  // Handle drag move
  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging || isLowPerf) return;
    
    const deltaX = clientX - dragStartX.current;
    // Sensitivity: pixels to move one frame
    const sensitivity = globeSize / TOTAL_FRAMES;
    const frameDelta = Math.round(deltaX / sensitivity);
    
    // Calculate velocity for easing
    const now = Date.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      const dx = clientX - lastXRef.current;
      velocityRef.current = (dx / sensitivity) * (16 / dt); // Normalize to ~60fps
    }
    lastXRef.current = clientX;
    lastTimeRef.current = now;
    
    let newFrame = frameAtDragStart.current - frameDelta;
    // Wrap around
    while (newFrame < 0) newFrame += TOTAL_FRAMES;
    while (newFrame >= TOTAL_FRAMES) newFrame -= TOTAL_FRAMES;
    
    setCurrentFrame(newFrame % TOTAL_FRAMES);
  }, [isDragging, globeSize, isLowPerf]);
  
  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Start easing animation if there's velocity
    if (Math.abs(velocityRef.current) > 0.3) {
      animationRef.current = requestAnimationFrame(animateEasing);
    }
  }, [isDragging, animateEasing]);
  
  // Mouse events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  }, [handleDragStart]);
  
  // Touch events
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX);
    }
  }, [handleDragStart]);
  
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX);
    }
  }, [handleDragMove]);
  
  // Global mouse/touch move and end handlers
  useEffect(() => {
    if (!isDragging) return;
    
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX);
    const onMouseUp = () => handleDragEnd();
    const onTouchEnd = () => handleDragEnd();
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onTouchEnd);
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);
  
  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="absolute"
      style={{
        width: globeSize,
        height: globeSize,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
        cursor: isLowPerf ? 'default' : isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      {/* Earth Globe */}
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
          pointerEvents: 'none',
        }}
      >
        {/* Deep ocean base - solid dark blue for clean look */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'hsl(220 40% 12%)',
          }}
        />
        
        {/* Earth texture - pans based on frame */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `url(${earthTexture})`,
            backgroundSize: '200% 100%',
            backgroundPosition: backgroundPosition,
            backgroundRepeat: 'repeat-x',
            filter: 'saturate(0.9) brightness(1.0) contrast(1.08)',
            transition: isDragging ? 'none' : 'background-position 0.05s linear',
          }}
        />
        
        {/* Sunrise rim light - right side */}
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
        
        {/* Terminator shadow - left side */}
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
        
        {/* Atmospheric glow */}
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
      
      {/* Scan ring during analysis */}
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
      
      {/* Subtle drag hint indicator (only when interactive) */}
      {!isLowPerf && !isDragging && (
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none opacity-40"
          style={{
            width: 20,
            height: 3,
            background: 'hsl(174 40% 50% / 0.5)',
            borderRadius: 2,
            marginBottom: -8,
          }}
        />
      )}
    </div>
  );
});

InteractiveGlobe.displayName = 'InteractiveGlobe';
