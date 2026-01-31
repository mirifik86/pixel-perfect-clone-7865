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
 */
export const IA11ErrorMessage = ({ visible, onFadeOut }: IA11ErrorMessageProps) => {
  const { t } = useLanguage();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!visible && onFadeOut) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsExiting(false);
        onFadeOut();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [visible, onFadeOut]);

  if (!visible && !isExiting) return null;

  return (
    <div
      className={`
        relative flex items-center justify-center gap-3 px-6 py-4 mx-auto my-4
        rounded-xl border border-amber-500/30
        bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-amber-950/40
        backdrop-blur-md
        shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)]
        transition-all duration-500 ease-out
        ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-fade-in'}
      `}
      style={{
        maxWidth: '90%',
        animation: isExiting ? undefined : 'ia11-error-glow 2s ease-in-out infinite',
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
      
      <span className="text-sm font-medium text-amber-200/90 relative z-10">
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
  );
};
