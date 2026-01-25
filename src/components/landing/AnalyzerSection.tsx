import { forwardRef, useImperativeHandle, useRef } from 'react';
import { UnifiedAnalysisForm, UnifiedAnalysisFormHandle } from '@/components/UnifiedAnalysisForm';
import { useLanguage } from '@/i18n/useLanguage';

interface AnalyzerSectionProps {
  onAnalyze: (text: string, image: { file: File; preview: string } | null) => void;
  isLoading: boolean;
  onContentChange?: (hasContent: boolean) => void;
  highlightInput?: boolean;
  captureGlow?: boolean;
}

export interface AnalyzerSectionHandle {
  submit: () => void;
}

export const AnalyzerSection = forwardRef<AnalyzerSectionHandle, AnalyzerSectionProps>(
  ({ onAnalyze, isLoading, onContentChange, highlightInput, captureGlow }, ref) => {
    const { t } = useLanguage();
    const formRef = useRef<UnifiedAnalysisFormHandle>(null);

    useImperativeHandle(ref, () => ({
      submit: () => formRef.current?.submit()
    }), []);

    return (
      <section 
        className="w-full animate-fade-in"
        style={{ 
          animationDelay: '300ms',
          marginTop: 'clamp(2rem, 5vh, 3rem)',
        }}
      >
        {/* Section header */}
        <div className="text-center mb-4 px-4">
          <p 
            style={{ 
              fontSize: 'clamp(0.8rem, 0.75rem + 0.2vw, 0.95rem)',
              color: 'hsl(0 0% 75%)',
              lineHeight: 1.6,
              maxWidth: '28rem',
              margin: '0 auto',
            }}
          >
            {t('landing.analyzer.prompt')}
          </p>
        </div>
        
        {/* LeenScore analyzes list */}
        <div 
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-5 px-4"
          style={{ maxWidth: '28rem', margin: '0 auto 1.25rem' }}
        >
          {['text', 'visual', 'viral'].map((type) => (
            <div 
              key={type}
              className="flex items-center gap-2"
            >
              <span 
                style={{ 
                  color: 'hsl(174 60% 52%)',
                  fontSize: '0.4rem',
                }}
              >
                •
              </span>
              <span 
                style={{ 
                  fontSize: 'clamp(0.7rem, 0.65rem + 0.15vw, 0.8rem)',
                  color: 'hsl(0 0% 65%)',
                }}
              >
                {t(`landing.analyzer.${type}`)}
              </span>
            </div>
          ))}
        </div>

        {/* Form container */}
        <div 
          className="container-content w-full"
          style={{ maxWidth: '32rem' }}
        >
          <UnifiedAnalysisForm 
            ref={formRef}
            onAnalyze={onAnalyze}
            isLoading={isLoading} 
            onContentChange={onContentChange}
            highlightInput={highlightInput}
            captureGlow={captureGlow}
          />
        </div>
        
        {/* Analysis types badge */}
        <div 
          className="flex justify-center gap-3 mt-4"
        >
          <span 
            className="px-3 py-1 rounded-full"
            style={{ 
              fontSize: 'clamp(0.6rem, 0.55rem + 0.1vw, 0.7rem)',
              color: 'hsl(0 0% 60%)',
              background: 'hsl(0 0% 100% / 0.05)',
              border: '1px solid hsl(0 0% 100% / 0.1)',
            }}
          >
            {t('landing.analyzer.standard')}
          </span>
          <span 
            className="px-3 py-1 rounded-full"
            style={{ 
              fontSize: 'clamp(0.6rem, 0.55rem + 0.1vw, 0.7rem)',
              color: 'hsl(45 100% 60%)',
              background: 'linear-gradient(135deg, hsl(45 80% 50% / 0.15), hsl(35 70% 45% / 0.1))',
              border: '1px solid hsl(45 80% 50% / 0.3)',
            }}
          >
            PRO {t('landing.analyzer.available')}
          </span>
        </div>
      </section>
    );
  }
);

AnalyzerSection.displayName = 'AnalyzerSection';
