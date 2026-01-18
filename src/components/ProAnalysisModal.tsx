import { useState } from 'react';
import { Sparkles, Search, Image, ArrowRight, Loader2 } from 'lucide-react';
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
  const content = {
    en: {
      title: "Pro Analysis",
      subtitle: "Web-backed plausibility assessment",
      features: [
        {
          icon: Search,
          title: "Web Corroboration",
          description: "Up to 10 verified sources from recognized media and official institutions."
        },
        {
          icon: Sparkles,
          title: "Claim Gravity & Coherence",
          description: "Assessment of claim weight and alignment with known contextual patterns."
        },
        {
          icon: Image,
          title: "Image Signal Analysis",
          description: "Origin detection, metadata indicators, and visual-textual coherence."
        }
      ],
      disclaimer: "Pro Analysis provides plausibility assessment, not absolute verification. Score range: 5-98.",
      cta: "Launch Pro Analysis",
      loading: "Analyzing..."
    },
    fr: {
      title: "Analyse Pro",
      subtitle: "Évaluation de plausibilité avec recherche web",
      features: [
        {
          icon: Search,
          title: "Corroboration Web",
          description: "Jusqu'à 10 sources vérifiées de médias reconnus et institutions officielles."
        },
        {
          icon: Sparkles,
          title: "Gravité & Cohérence",
          description: "Évaluation du poids de l'affirmation et de sa cohérence contextuelle."
        },
        {
          icon: Image,
          title: "Analyse des Signaux Image",
          description: "Détection d'origine, indicateurs de métadonnées et cohérence visuelle."
        }
      ],
      disclaimer: "L'Analyse Pro fournit une évaluation de plausibilité, pas une vérification absolue. Score: 5-98.",
      cta: "Lancer l'Analyse Pro",
      loading: "Analyse en cours..."
    }
  };

  const t = content[language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md border-0 p-0 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, hsl(220 25% 12%) 0%, hsl(240 20% 8%) 100%)',
          boxShadow: '0 0 60px hsl(200 80% 50% / 0.2), 0 0 100px hsl(174 70% 45% / 0.15), 0 25px 50px hsl(0 0% 0% / 0.5)'
        }}
      >
        {/* Gradient header accent */}
        <div 
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background: 'linear-gradient(90deg, hsl(200 80% 55%) 0%, hsl(174 70% 50%) 50%, hsl(280 60% 60%) 100%)'
          }}
        />

        <div className="p-6">
          <DialogHeader className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span 
                className="rounded-md px-2 py-1 text-xs font-black tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, hsl(200 80% 55%) 0%, hsl(280 60% 60%) 100%)',
                  color: 'white',
                  boxShadow: '0 0 15px hsl(200 80% 55% / 0.4)'
                }}
              >
                PRO
              </span>
            </div>
            <DialogTitle 
              className="text-2xl font-bold"
              style={{
                background: 'linear-gradient(135deg, hsl(200 80% 70%) 0%, hsl(174 70% 60%) 50%, hsl(280 60% 70%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t.subtitle}
            </p>
          </DialogHeader>

          <div className="space-y-3">
            {t.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="flex items-start gap-3 rounded-xl p-3 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, hsl(220 25% 15% / 0.8) 0%, hsl(240 20% 12% / 0.8) 100%)',
                    border: '1px solid hsl(220 20% 25% / 0.5)'
                  }}
                >
                  <div 
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, hsl(200 80% 55% / 0.2) 0%, hsl(174 70% 50% / 0.2) 100%)',
                      border: '1px solid hsl(174 60% 45% / 0.3)'
                    }}
                  >
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {feature.title}
                    </h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div 
            className="mt-4 rounded-lg p-3"
            style={{
              background: 'hsl(220 20% 15% / 0.5)',
              border: '1px solid hsl(220 20% 25% / 0.3)'
            }}
          >
            <p className="text-[11px] leading-relaxed text-muted-foreground text-center">
              {t.disclaimer}
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={onLaunchPro}
            disabled={isLoading}
            className="group relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-3 text-sm font-semibold text-white transition-all duration-300 disabled:opacity-70"
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
            
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t.loading}</span>
              </>
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
