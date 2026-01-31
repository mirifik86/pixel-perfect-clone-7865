import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { AlertTriangle } from 'lucide-react';

interface IA11ErrorMessageProps {
  visible: boolean;
  onFadeOut?: () => void;
}

/**
 * Premium IA11 error message with halo/beam effect
 * Displays when IA11 connection fails (401/429/400/500)
 * Auto-fades when a new valid analysis succeeds
 * 
 * LAYOUT STABILITY: Uses visibility + opacity instead of conditional rendering
 * to prevent layout jitter. Container has fixed height.
 */
export const IA11ErrorMessage = ({ visible, onFadeOut }: IA11ErrorMessageProps) => {
  const { t } = useLanguage();
  const [isExiting, setIsExiting] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setHasBeenVisible(true);
      setIsExiting(false);
    } else if (hasBeenVisible && !isExiting) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsExiting(false);
        setHasBeenVisible(false);
        onFadeOut?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [visible, hasBeenVisible, isExiting, onFadeOut]);

  // Don't render anything if never shown
  if (!hasBeenVisible && !visible) return null;

  const isShowing = visible && !isExiting;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        // LAYOUT STABILITY: Fixed height container prevents jitter
        height: '56px',
        minHeight: '56px',
        maxHeight: '56px',
        overflow: 'hidden',
      }}
    >
      <div
        className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-amber-950/40 backdrop-blur-md"
        style={{
          maxWidth: '90%',
          // LAYOUT STABILITY: Only transition opacity and transform, not layout properties
          transition: 'opacity 400ms ease-out, transform 400ms ease-out',
          opacity: isShowing ? 1 : 0,
          transform: isShowing ? 'scale(1)' : 'scale(0.95)',
          pointerEvents: isShowing ? 'auto' : 'none',
          boxShadow: isShowing ? '0 0 30px -5px rgba(251,191,36,0.3)' : 'none',
          animation: isShowing ? 'ia11-error-glow 2s ease-in-out infinite' : 'none',
        }}
      >
        {/* Premium halo effect */}
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(251,191,36,0.15) 0%, transparent 70%)',
            filter: 'blur(10px)',
          }}
        />
        
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 relative z-10" />
        
        <span className="text-sm font-medium text-amber-200/90 relative z-10 whitespace-nowrap">
          {t('loader.ia11Error')}
        </span>

        <style>{`
          @keyframes ia11-error-glow {
            0%, 100% {
              box-shadow: 0 0 20px -5px rgba(251,191,36,0.3);
            }
            50% {
              box-shadow: 0 0 35px -5px rgba(251,191,36,0.5);
            }
          }
        `}</style>
      </div>
    </div>
  );
};
