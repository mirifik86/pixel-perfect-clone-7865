import { useState, useEffect } from 'react';
import { Sparkles, Search, Image, ArrowRight, Scale, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: 'en' | 'fr';
  onLaunchPro?: () => void;
  isLoading?: boolean;
}

export const ProAnalysisModal = ({ 
  open, 
  onOpenChange, 
  language, 
  onLaunchPro,
  isLoading = false 
}: ProAnalysisModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  // Handle open/close animations
  useEffect(() => {
    if (open) {
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [open]);

  // Disable background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Auto-close modal with smooth transition when loading starts
  useEffect(() => {
    if (isLoading && open) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        onOpenChange(false);
        setIsClosing(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isLoading, open, onOpenChange]);

  const content = {
    en: {
      title: "PRO Analysis",
      titleSuffix: "In-Depth Verification",
      subtitle: "Advanced plausibility assessment with web research and cross-source analysis.",
      features: [
        {
          icon: Search,
          title: "Web Corroboration",
          description: "Web research and cross-checking across up to 10 sources from recognized media outlets and official institutions."
        },
        {
          icon: Scale,
          title: "Claim Gravity & Context",
          description: "Evaluation of the real-world weight of the claim and its coherence with known contextual patterns."
        },
        {
          icon: Image,
          title: "Image Signal Analysis",
          description: "Assessment of visual signals including probable origin, available metadata, and image coherence."
        }
      ],
      disclaimer: "PRO Analysis provides a plausibility assessment based on reliable signals, not absolute truth.",
      scoreRange: "Plausibility score range: 5–98.",
      cta: "Launch PRO Analysis",
      ctaPrice: "$2.99",
      loading: "Analysis in progress…"
    },
    fr: {
      title: "Analyse PRO",
      titleSuffix: "Vérification approfondie",
      subtitle: "Évaluation de plausibilité avancée avec recherche web et analyse multi-sources.",
      features: [
        {
          icon: Search,
          title: "Corroboration Web",
          description: "Recherche web et recoupement sur jusqu'à 10 sources provenant de médias reconnus et d'institutions officielles."
        },
        {
          icon: Scale,
          title: "Gravité & Contexte",
          description: "Évaluation du poids réel de l'affirmation et de sa cohérence avec les schémas contextuels connus."
        },
        {
          icon: Image,
          title: "Analyse des Signaux Image",
          description: "Évaluation des signaux visuels incluant l'origine probable, les métadonnées disponibles et la cohérence de l'image."
        }
      ],
      disclaimer: "L'Analyse PRO fournit une évaluation de plausibilité basée sur des signaux fiables, pas une vérité absolue.",
      scoreRange: "Plage du score de plausibilité : 5–98.",
      cta: "Lancer l'Analyse PRO",
      ctaPrice: "2,99$",
      loading: "Analyse en cours…"
    }
  };

  const t = content[language];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with blur */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${isVisible && !isClosing ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'hsl(0 0% 0% / 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Container */}
      <div 
        className={`
          absolute flex flex-col overflow-hidden
          transition-all duration-300 ease-out
          ${isMobile 
            ? `bottom-0 left-[3vw] right-[3vw] rounded-t-2xl ${isVisible && !isClosing ? 'translate-y-0' : 'translate-y-full'}` 
            : `top-1/2 left-1/2 -translate-x-1/2 rounded-2xl ${isVisible && !isClosing ? '-translate-y-1/2 scale-100 opacity-100' : '-translate-y-1/2 scale-95 opacity-0'}`
          }
        `}
        style={{
          width: isMobile ? '94vw' : 'clamp(720px, 78vw, 880px)',
          height: isMobile ? 'auto' : 'auto',
          maxHeight: isMobile ? '75vh' : '80vh',
          background: 'linear-gradient(180deg, hsl(220 25% 12%) 0%, hsl(240 20% 8%) 100%)',
          boxShadow: '0 0 80px hsl(200 80% 50% / 0.25), 0 0 120px hsl(174 70% 45% / 0.15), 0 30px 60px hsl(0 0% 0% / 0.6)',
          border: '1px solid hsl(220 20% 20% / 0.5)',
        }}
      >
        {/* Gradient header accent line */}
        <div 
          className="absolute inset-x-0 top-0 h-1 z-10 rounded-t-2xl"
          style={{
            background: 'linear-gradient(90deg, hsl(200 80% 55%) 0%, hsl(174 70% 50%) 50%, hsl(280 60% 60%) 100%)'
          }}
        />

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Sticky Header */}
        <div 
          className="sticky top-0 z-10 pt-4 pb-3 px-5 md:pt-8 md:pb-6 md:px-10 text-center"
          style={{
            background: 'linear-gradient(180deg, hsl(220 25% 12%) 0%, hsl(220 25% 12% / 0.95) 80%, transparent 100%)',
          }}
        >
          {/* PRO Badge */}
          <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
            <span 
              className="rounded-lg px-2.5 py-0.5 text-[9px] md:text-xs font-black tracking-widest"
              style={{
                background: 'linear-gradient(135deg, hsl(200 80% 55%) 0%, hsl(280 60% 60%) 100%)',
                color: 'white',
                boxShadow: '0 0 20px hsl(200 80% 55% / 0.5)'
              }}
            >
              PRO
            </span>
          </div>

          {/* Title */}
          <h2 
            className="text-lg md:text-2xl font-bold leading-tight mb-1 md:mb-2"
            style={{
              background: 'linear-gradient(135deg, hsl(200 80% 75%) 0%, hsl(174 70% 65%) 50%, hsl(280 60% 75%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t.title} — {t.titleSuffix}
          </h2>

          {/* Subtitle - hidden on mobile */}
          <p className="hidden md:block text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 md:px-10 pb-3 md:pb-4">
          {/* Feature Cards */}
          <div className="space-y-2 md:space-y-4">
            {t.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="flex items-start gap-3 md:gap-4 rounded-xl p-3 md:p-5"
                  style={{
                    background: 'linear-gradient(135deg, hsl(220 25% 15% / 0.9) 0%, hsl(240 20% 12% / 0.9) 100%)',
                    border: '1px solid hsl(220 20% 25% / 0.5)'
                  }}
                >
                  <div 
                    className="flex h-9 w-9 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg md:rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, hsl(200 80% 55% / 0.2) 0%, hsl(174 70% 50% / 0.2) 100%)',
                      border: '1px solid hsl(174 60% 45% / 0.3)'
                    }}
                  >
                    <Icon className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] md:text-base font-semibold text-foreground mb-0.5 md:mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-[11px] md:text-sm leading-snug md:leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Disclaimer - hidden on mobile */}
          <div 
            className="hidden md:block mt-6 rounded-xl p-4"
            style={{
              background: 'hsl(220 20% 15% / 0.6)',
              border: '1px solid hsl(220 20% 25% / 0.4)'
            }}
          >
            <p className="text-sm leading-relaxed text-muted-foreground text-center">
              {t.disclaimer}
            </p>
          </div>
        </div>

        {/* Sticky CTA Bar */}
        <div 
          className="sticky bottom-0 px-5 md:px-10 pt-3 pb-4 md:pt-4 md:pb-8"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, hsl(240 20% 8% / 0.95) 20%, hsl(240 20% 8%) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <button
            onClick={onLaunchPro}
            disabled={isLoading || isClosing}
            className="group relative flex w-full items-center justify-center gap-2 md:gap-3 overflow-hidden rounded-full text-[15px] md:text-lg font-semibold text-white transition-all duration-300 disabled:opacity-70 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              height: isMobile ? '50px' : '52px',
              minHeight: '44px',
              background: 'linear-gradient(135deg, hsl(200 80% 50%) 0%, hsl(174 70% 45%) 50%, hsl(280 60% 55%) 100%)',
              boxShadow: '0 0 40px hsl(200 80% 55% / 0.5), 0 0 80px hsl(174 70% 45% / 0.25), 0 8px 30px hsl(0 0% 0% / 0.4)',
            }}
          >
            {/* Animated shine */}
            <div 
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                animation: 'shine 2s infinite',
              }}
            />
            
            {isLoading || isClosing ? (
              <span className="text-base md:text-lg">{t.loading}</span>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>{t.cta}</span>
                <span 
                  className="ml-2 rounded-full px-3 py-1 text-sm font-bold relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, hsl(45 100% 60%) 0%, hsl(35 100% 50%) 50%, hsl(45 100% 65%) 100%)',
                    color: 'hsl(30 90% 15%)',
                    boxShadow: '0 0 20px hsl(45 100% 55% / 0.6), 0 0 40px hsl(35 100% 50% / 0.4), inset 0 1px 0 hsl(45 100% 80% / 0.5)',
                    textShadow: '0 1px 1px hsl(45 100% 80% / 0.3)',
                    animation: 'price-glow 2s ease-in-out infinite',
                  }}
                >
                  {/* Animated shine sweep */}
                  <span 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 30%, hsl(45 100% 90% / 0.8) 45%, hsl(45 100% 95% / 0.9) 50%, hsl(45 100% 90% / 0.8) 55%, transparent 70%)',
                      animation: 'price-shine 2.5s ease-in-out infinite',
                    }}
                  />
                  <span className="relative z-10">{t.ctaPrice}</span>
                </span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
