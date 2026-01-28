import { ArrowRight, Search, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type SupportedLanguage } from '@/i18n/config';
import { getTranslationWithFallback } from '@/i18n/fallback';

interface UpgradeBridgeProps {
  language: SupportedLanguage;
  onUpgradeClick?: () => void;
}

const translations = {
  en: {
    title: 'Want factual verification?',
    description: 'This Standard analysis evaluates how the message is written. The PRO version verifies the claims using multiple trusted external sources and contradiction detection.',
    cta: 'Upgrade to PRO for Fact Verification',
    features: [
      'Multi-source verification',
      'Contradiction detection',
      'Expert fact-checking',
    ],
  },
  fr: {
    title: 'Vous voulez une vérification factuelle ?',
    description: 'Cette analyse Standard évalue la façon dont le message est rédigé. La version PRO vérifie les affirmations en utilisant plusieurs sources externes fiables et la détection de contradictions.',
    cta: 'Passer en PRO pour Vérification Factuelle',
    features: [
      'Vérification multi-sources',
      'Détection de contradictions',
      'Expertise fact-checking',
    ],
  },
};

export const UpgradeBridge = ({ language, onUpgradeClick }: UpgradeBridgeProps) => {
  const t = getTranslationWithFallback(translations, language);

  return (
    <div 
      className="relative overflow-hidden rounded-xl p-5 mb-6"
      style={{
        background: 'linear-gradient(135deg, hsl(45 60% 97%) 0%, hsl(35 50% 95%) 50%, hsl(200 30% 96%) 100%)',
        border: '1px solid hsl(45 50% 85%)',
        boxShadow: '0 4px 20px hsl(45 50% 50% / 0.08), inset 0 1px 0 hsl(0 0% 100% / 0.9)',
      }}
    >
      {/* Decorative gradient orb */}
      <div 
        className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, hsl(45 70% 70% / 0.4) 0%, transparent 70%)',
        }}
      />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div 
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, hsl(45 60% 75%) 0%, hsl(35 70% 65%) 100%)',
              boxShadow: '0 2px 8px hsl(45 60% 50% / 0.3)',
            }}
          >
            <Search className="w-4 h-4 text-amber-900" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-slate-800">
            {t.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-slate-600 mb-4 pl-10">
          {t.description}
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 mb-4 pl-10">
          {t.features.map((feature, idx) => (
            <span 
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'hsl(45 50% 92%)',
                color: 'hsl(35 60% 35%)',
                border: '1px solid hsl(45 40% 80%)',
              }}
            >
              <CheckCircle className="w-3 h-3" />
              {feature}
            </span>
          ))}
        </div>

        {/* CTA Button */}
        <div className="pl-10">
          <Button 
            onClick={onUpgradeClick}
            className="group relative overflow-hidden rounded-lg px-5 py-2.5 text-sm font-semibold transition-all hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, hsl(45 70% 55%) 0%, hsl(35 80% 50%) 100%)',
              color: 'hsl(35 50% 15%)',
              border: 'none',
              boxShadow: '0 4px 15px hsl(45 70% 50% / 0.3)',
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              {t.cta}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
