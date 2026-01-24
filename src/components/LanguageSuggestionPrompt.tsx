import { X } from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '@/i18n';
import { Button } from '@/components/ui/button';

interface LanguageSuggestionPromptProps {
  detectedLanguage: SupportedLanguage;
  onAccept: () => void;
  onDismiss: () => void;
  currentLanguage: SupportedLanguage;
}

const translations = {
  en: {
    detected: 'We detected',
    switch: 'Switch',
    keep: 'Keep English'
  },
  fr: {
    detected: 'Nous avons détecté',
    switch: 'Changer',
    keep: 'Garder le français'
  },
  ja: {
    detected: '検出しました',
    switch: '切り替え',
    keep: '現在のまま'
  }
};

export const LanguageSuggestionPrompt = ({ 
  detectedLanguage, 
  onAccept, 
  onDismiss,
  currentLanguage 
}: LanguageSuggestionPromptProps) => {
  const t = translations[currentLanguage] || translations.en;
  const detectedInfo = SUPPORTED_LANGUAGES[detectedLanguage];

  return (
    <div 
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-slide-up"
      style={{
        maxWidth: 'calc(100vw - 2rem)'
      }}
    >
      <div 
        className="relative rounded-xl border border-primary/30 bg-card/95 px-4 py-3 backdrop-blur-xl shadow-2xl"
        style={{
          boxShadow: `
            0 0 30px hsl(174 60% 45% / 0.15),
            0 10px 40px hsl(0 0% 0% / 0.4),
            inset 0 1px 0 hsl(0 0% 100% / 0.1)
          `
        }}
      >
        {/* Close button */}
        <button 
          onClick={onDismiss}
          className="absolute -top-2 -right-2 rounded-full bg-muted p-1 text-muted-foreground hover:text-foreground transition-colors"
          style={{
            boxShadow: '0 2px 8px hsl(0 0% 0% / 0.3)'
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          {/* Language indicator with flag */}
          <div className="flex items-center gap-2">
            {detectedInfo?.flag && (
              <span className="text-xl">{detectedInfo.flag}</span>
            )}
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground">{t.detected}</p>
              <p 
                className="font-semibold"
                style={{ color: 'hsl(174 60% 55%)' }}
              >
                {detectedInfo?.nativeName || detectedLanguage.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onAccept}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              style={{
                boxShadow: '0 0 12px hsl(174 60% 45% / 0.3)'
              }}
            >
              {t.switch}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              {t.keep}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
