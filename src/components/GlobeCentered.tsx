import { memo, useEffect, useMemo, useState } from 'react';
import earthDaymap from '@/assets/earth-daymap-2k.jpg';
import '@/styles/globe-centered.css';

type GlobeCenteredProps = {
  isAnalyzing: boolean;
};

/**
 * GlobeCentered
 * - FULL visible circle (no horizon / half-Earth)
 * - Perfectly centered (no drift)
 * - Axial rotation simulated by GPU transform on a duplicated texture track
 * - Static starfield outside the circle
 * - Analyze-only overlays (sweep, faint grid, 2–3 arcs)
 */
export const GlobeCentered = memo(({ isAnalyzing }: GlobeCenteredProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [analyzeActive, setAnalyzeActive] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (isAnalyzing) {
      const t = window.setTimeout(() => setAnalyzeActive(true), 140);
      return () => window.clearTimeout(t);
    }
    setAnalyzeActive(false);
  }, [isAnalyzing]);

  const shouldAnimate = !prefersReducedMotion && isVisible;

  // Idle: ~90–120s; Analyze: 3–4x faster
  const surfaceDuration = isAnalyzing ? '30s' : '110s';
  const cloudsDuration = isAnalyzing ? '24s' : '95s';

  const stars = useMemo(
    () =>
      Array.from({ length: 56 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 0.6 + Math.random() * 1.4,
        opacity: 0.12 + Math.random() * 0.35,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }}>
      {/* Static deep space (NOT pure black) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 140% 120% at 50% 45%, hsl(220 50% 8%) 0%, hsl(235 45% 6%) 35%, hsl(250 40% 4%) 65%, hsl(265 35% 3%) 100%)',
        }}
      />

      {/* Static starfield (subtle twinkle allowed, disabled in reduced-motion) */}
      <div className="absolute inset-0">
        {stars.map((s, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              background: 'hsl(0 0% 100% / 0.9)',
              opacity: s.opacity,
              animation: shouldAnimate ? `gc-twinkle ${s.duration}s ease-in-out infinite` : 'none',
              animationDelay: `${s.delay}s`,
              willChange: shouldAnimate ? 'transform, opacity' : 'auto',
            }}
          />
        ))}
      </div>

      {/* Globe layer (centered; circle only clips its own texture) */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '52%',
          transform: 'translate(-50%, -50%)',
          width: 'var(--gc-size)',
          height: 'var(--gc-size)',
          zIndex: 1,
        }}
      >
        <div
          className="relative h-full w-full rounded-full"
          style={{
            overflow: 'hidden',
            // Subtle 3D depth; avoids any horizon look
            boxShadow:
              'inset -22px -16px 52px hsl(220 60% 4% / 0.75), inset 18px 12px 44px hsl(200 35% 22% / 0.12)',
          }}
        >
          {/* Surface track: two copies for seamless 360° loop, animated by transform (GPU-friendly) */}
          <div
            className="absolute inset-0"
            style={{
              width: '200%',
              height: '100%',
              display: 'flex',
              animation: shouldAnimate ? `gc-surface-scroll ${surfaceDuration} linear infinite` : 'none',
              willChange: shouldAnimate ? 'transform' : 'auto',
              filter: 'contrast(1.05) saturate(1.02)',
            }}
          >
            <div
              style={{
                flex: '0 0 50%',
                backgroundImage: `url(${earthDaymap})`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
              }}
            />
            <div
              style={{
                flex: '0 0 50%',
                backgroundImage: `url(${earthDaymap})`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>

          {/* Optional clouds (very subtle, slightly faster) */}
          <div
            className="absolute inset-0"
            style={{
              width: '200%',
              height: '100%',
              display: 'flex',
              animation: shouldAnimate ? `gc-clouds-scroll ${cloudsDuration} linear infinite` : 'none',
              willChange: shouldAnimate ? 'transform' : 'auto',
              opacity: 0.35,
              mixBlendMode: 'screen',
            }}
          >
            <div
              style={{
                flex: '0 0 50%',
                backgroundImage:
                  'radial-gradient(ellipse 40% 28% at 18% 28%, hsl(0 0% 100% / 0.08) 0%, transparent 68%), radial-gradient(ellipse 32% 22% at 52% 38%, hsl(0 0% 100% / 0.06) 0%, transparent 62%), radial-gradient(ellipse 44% 26% at 78% 22%, hsl(0 0% 100% / 0.07) 0%, transparent 60%), radial-gradient(ellipse 28% 18% at 38% 62%, hsl(0 0% 100% / 0.05) 0%, transparent 55%)',
              }}
            />
            <div
              style={{
                flex: '0 0 50%',
                backgroundImage:
                  'radial-gradient(ellipse 40% 28% at 18% 28%, hsl(0 0% 100% / 0.08) 0%, transparent 68%), radial-gradient(ellipse 32% 22% at 52% 38%, hsl(0 0% 100% / 0.06) 0%, transparent 62%), radial-gradient(ellipse 44% 26% at 78% 22%, hsl(0 0% 100% / 0.07) 0%, transparent 60%), radial-gradient(ellipse 28% 18% at 38% 62%, hsl(0 0% 100% / 0.05) 0%, transparent 55%)',
              }}
            />
          </div>

          {/* Terminator (night side) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(105deg, transparent 0%, transparent 38%, hsl(220 60% 5% / 0.16) 52%, hsl(225 65% 4% / 0.42) 66%, hsl(230 70% 3% / 0.7) 82%, hsl(235 75% 2% / 0.86) 100%)',
            }}
          />

          {/* Subtle sun highlight */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 58% 70% at 22% 32%, hsl(50 40% 96% / 0.06) 0%, hsl(45 35% 92% / 0.03) 45%, transparent 75%)',
            }}
          />

          {/* Analyze-only: premium global scan overlays */}
          {analyzeActive && shouldAnimate && (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0%, transparent 76%, hsl(174 65% 52% / 0.12) 84%, hsl(174 75% 56% / 0.22) 92%, hsl(174 80% 60% / 0.08) 97%, transparent 100%)',
                  animation: 'gc-sweep-rotate 4.5s linear infinite',
                  willChange: 'transform',
                }}
              />

              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(0deg, hsl(174 45% 58% / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(174 45% 58% / 0.03) 1px, transparent 1px)',
                  backgroundSize: '12% 12%',
                  animation: 'gc-grid-breathe 2.6s ease-in-out infinite',
                }}
              />

              <svg
                className="absolute"
                style={{ inset: '8%' }}
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
              >
                <path
                  d="M 18 50 Q 50 15 82 50"
                  fill="none"
                  stroke="hsl(174 72% 56%)"
                  strokeWidth="0.55"
                  strokeLinecap="round"
                  strokeDasharray="2.5 3.5"
                  style={{ animation: 'gc-arc-fade 3.2s ease-in-out infinite' }}
                />
                <path
                  d="M 24 66 Q 50 38 76 62"
                  fill="none"
                  stroke="hsl(200 58% 56%)"
                  strokeWidth="0.45"
                  strokeLinecap="round"
                  strokeDasharray="2 3"
                  style={{ animation: 'gc-arc-fade 3.8s ease-in-out infinite', animationDelay: '1.1s' }}
                />
                <path
                  d="M 28 36 Q 46 22 64 38"
                  fill="none"
                  stroke="hsl(174 58% 54%)"
                  strokeWidth="0.38"
                  strokeLinecap="round"
                  strokeDasharray="1.5 2.5"
                  style={{ animation: 'gc-arc-fade 3s ease-in-out infinite', animationDelay: '2s' }}
                />
              </svg>
            </>
          )}
        </div>

        {/* Atmosphere rim (teal/cyan) - outside the globe, does NOT crop it */}
        <div
          className="absolute rounded-full"
          style={{
            inset: '-4%',
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at 50% 50%, transparent 43%, hsl(174 55% 52% / 0.06) 46%, hsl(174 65% 50% / 0.12) 49%, hsl(190 60% 48% / 0.08) 52%, hsl(200 55% 45% / 0.04) 55%, transparent 59%)',
            boxShadow: isAnalyzing
              ? '0 0 64px hsl(174 60% 52% / 0.25), 0 0 130px hsl(174 55% 48% / 0.14), 0 0 190px hsl(190 50% 45% / 0.07)'
              : '0 0 44px hsl(174 55% 50% / 0.15), 0 0 92px hsl(174 50% 46% / 0.08), 0 0 140px hsl(190 45% 42% / 0.04)',
            transition: 'box-shadow 400ms ease',
          }}
        />
      </div>
    </div>
  );
});

GlobeCentered.displayName = 'GlobeCentered';
