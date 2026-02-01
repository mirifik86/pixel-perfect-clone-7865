import { forwardRef } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/useLanguage';

interface AnalysisErrorProps {
  errorMessage?: string;
  errorCode?: string;
  onRetry: () => void;
  onNewAnalysis: () => void;
}

export const AnalysisError = forwardRef<HTMLDivElement, AnalysisErrorProps>(({
  errorMessage,
  errorCode,
  onRetry,
  onNewAnalysis,
}, ref) => {
  const { t } = useLanguage();

  return (
    <div 
      ref={ref}
      className="container-content mx-auto animate-fade-in"
      style={{ marginTop: 'var(--space-6)' }}
    >
      <div 
        className="relative rounded-xl border border-destructive/30 bg-gradient-to-b from-destructive/10 to-transparent p-6 backdrop-blur-sm"
        style={{
          boxShadow: '0 8px 32px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.05)',
        }}
      >
        <div className="mb-4 flex justify-center">
          <div 
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: 'linear-gradient(135deg, hsl(0 60% 45% / 0.2), hsl(0 60% 35% / 0.1))',
              boxShadow: '0 0 20px hsl(0 60% 50% / 0.3)',
            }}
          >
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
        </div>

        <h3 
          className="mb-2 text-center font-semibold text-foreground"
          style={{ fontSize: 'var(--text-lg)' }}
        >
          {t('error.title')}
        </h3>

        <p 
          className="mb-4 text-center text-muted-foreground"
          style={{ fontSize: 'var(--text-sm)' }}
        >
          {errorMessage || t('error.description')}
        </p>

        {errorCode && (
          <div className="mb-5 flex justify-center">
            <span 
              className="rounded-md px-3 py-1 font-mono text-muted-foreground"
              style={{ fontSize: 'var(--text-xs)', background: 'hsl(var(--muted) / 0.5)' }}
            >
              {t('error.debugId')}: {errorCode}
            </span>
          </div>
        )}

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={onRetry}
            className="w-full gap-2 sm:w-auto"
            style={{ background: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(174 60% 45% / 0.3)' }}
          >
            <RefreshCw className="h-4 w-4" />
            {t('error.retry')}
          </Button>
          
          <Button
            onClick={onNewAnalysis}
            variant="outline"
            className="w-full gap-2 border-white/10 bg-white/5 text-foreground hover:bg-white/10 sm:w-auto"
          >
            <Home className="h-4 w-4" />
            {t('error.newAnalysis')}
          </Button>
        </div>
      </div>
    </div>
  );
});

AnalysisError.displayName = 'AnalysisError';