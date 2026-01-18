import { useState, useEffect } from 'react';
import { Sparkles, Search, Image, ArrowRight, Scale } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  // Auto-close modal with smooth transition when loading starts
  useEffect(() => {
    if (isLoading && open) {
      setIsClosing(true);
      // Wait for fade-out animation before closing
      const timer = setTimeout(() => {
        onOpenChange(false);
        setIsClosing(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isLoading, open, onOpenChange]);

  const content = {
    en: {
      title: "PRO Analysis — In-Depth Verification",
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
      loading: "Analysis in progress…"
    },
    fr: {
      title: "Analyse PRO — Vérification approfondie",
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
      loading: "Analyse en cours…"
    }
  };

  const t = content[language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`!top-[50%] !translate-y-[-50%] flex flex-col max-w-md border-0 p-0 overflow-hidden transition-all duration-300 max-h-[85vh] ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        style={{
          background: 'linear-gradient(180deg, hsl(220 25% 12%) 0%, hsl(240 20% 8%) 100%)',
          boxShadow: '0 0 60px hsl(200 80% 50% / 0.2), 0 0 100px hsl(174 70% 45% / 0.15), 0 25px 50px hsl(0 0% 0% / 0.5)',
        }}
      >
        {/* Gradient header accent */}
        <div 
          className="absolute inset-x-0 top-0 h-1 z-10"
          style={{
            background: 'linear-gradient(90deg, hsl(200 80% 55%) 0%, hsl(174 70% 50%) 50%, hsl(280 60% 60%) 100%)'
          }}
        />

        {/* Header - more compact */}
        <div className="pt-4 pb-2 px-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span 
              className="rounded-md px-2 py-0.5 text-[9px] font-black tracking-widest"
              style={{
                background: 'linear-gradient(135deg, hsl(200 80% 55%) 0%, hsl(280 60% 60%) 100%)',
                color: 'white',
                boxShadow: '0 0 15px hsl(200 80% 55% / 0.4)'
              }}
            >
              PRO
            </span>
          </div>
          <DialogHeader>
            <DialogTitle 
              className="text-lg font-bold leading-tight"
              style={{
                background: 'linear-gradient(135deg, hsl(200 80% 75%) 0%, hsl(174 70% 65%) 50%, hsl(280 60% 75%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Content - compact features */}
        <div className="flex-1 overflow-y-auto px-5 pb-2 min-h-0">
          <div className="space-y-2">
            {t.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="flex items-center gap-2.5 rounded-lg p-2.5"
                  style={{
                    background: 'linear-gradient(135deg, hsl(220 25% 15% / 0.8) 0%, hsl(240 20% 12% / 0.8) 100%)',
                    border: '1px solid hsl(220 20% 25% / 0.5)'
                  }}
                >
                  <div 
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, hsl(200 80% 55% / 0.15) 0%, hsl(174 70% 50% / 0.15) 100%)',
                      border: '1px solid hsl(174 60% 45% / 0.25)'
                    }}
                  >
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-foreground">
                      {feature.title}
                    </h4>
                    {/* Description hidden on mobile */}
                    <p className="hidden md:block mt-0.5 text-[10px] leading-snug text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Disclaimer - more compact */}
          <div 
            className="mt-3 rounded-lg p-2"
            style={{
              background: 'hsl(220 20% 15% / 0.5)',
              border: '1px solid hsl(220 20% 25% / 0.3)'
            }}
          >
            <p className="text-[10px] leading-relaxed text-muted-foreground text-center">
              {t.disclaimer}
            </p>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="px-6 pt-3 pb-6">
          <button
            onClick={onLaunchPro}
            disabled={isLoading || isClosing}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full py-3.5 text-sm font-semibold text-white transition-all duration-300 disabled:opacity-70"
            style={{
              background: 'linear-gradient(135deg, hsl(200 80% 50%) 0%, hsl(174 70% 45%) 50%, hsl(280 60% 55%) 100%)',
              boxShadow: '0 0 30px hsl(200 80% 55% / 0.4), 0 0 60px hsl(174 70% 45% / 0.2), 0 4px 20px hsl(0 0% 0% / 0.3)',
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
              <span>{t.loading}</span>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{t.cta}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
