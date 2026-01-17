import { useState, useMemo } from 'react';
import { Search, Loader2, Link2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AnalysisFormProps {
  onAnalyze: (input: string) => void;
  isLoading: boolean;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    placeholder: 'Please paste a link to analyze',
    analyze: 'Analyze',
    description: 'We analyze source credibility, linguistic patterns, and context to help you understand online information.',
    urlDetected: 'URL detected',
  },
  fr: {
    placeholder: 'Veuillez coller un lien pour analyse',
    analyze: 'Analyser',
    description: 'Nous analysons la crédibilité des sources, les modèles linguistiques et le contexte pour vous aider à comprendre les informations en ligne.',
    urlDetected: 'URL détectée',
  },
};

const isValidUrl = (text: string): boolean => {
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
  return urlPattern.test(text.trim());
};

export const AnalysisForm = ({ onAnalyze, isLoading, language }: AnalysisFormProps) => {
  const [input, setInput] = useState('');
  const t = translations[language];
  
  const hasValidUrl = useMemo(() => isValidUrl(input), [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAnalyze(input.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl animate-fade-in">
      {/* Unified container with premium border */}
      <div className="relative">
      {/* Outer glow effect */}
        <div 
          className="absolute -inset-[1px] rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, hsl(174 60% 50% / 0.3), hsl(174 60% 40% / 0.1), hsl(174 60% 50% / 0.2))',
            filter: 'blur(1px)',
          }}
        />
        
        {/* Premium border container with shimmer */}
        <div 
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, hsl(174 50% 45% / 0.4), hsl(174 40% 35% / 0.2), hsl(174 50% 45% / 0.3))',
            padding: '1px',
          }}
        >
          {/* Shimmer animation overlay */}
          <div 
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, hsl(174 70% 60% / 0.4) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          />
          {/* Inner content container */}
          <div 
            className="rounded-2xl bg-gradient-to-b from-black/80 to-black/90 backdrop-blur-xl"
            style={{
              boxShadow: 'inset 0 1px 0 hsl(0 0% 100% / 0.08), inset 0 -1px 0 hsl(0 0% 0% / 0.3)',
            }}
          >
            {/* Input section */}
            <div className="relative p-4 pb-3">
              {/* URL Detection indicator - top right corner */}
              {hasValidUrl && (
                <div className="absolute top-3 right-3 flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  <span className="text-xs text-primary font-medium">{t.urlDetected}</span>
                </div>
              )}
              
              {/* Input Icon */}
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <Link2 
                  className="h-5 w-5 transition-colors duration-300" 
                  style={{
                    color: hasValidUrl 
                      ? 'hsl(174 80% 45%)'
                      : 'hsl(0 0% 100% / 0.3)'
                  }}
                />
              </div>
              
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className="min-h-[50px] md:min-h-[70px] resize-none border-0 bg-transparent pl-10 text-sm text-white placeholder:text-white/50 placeholder:font-medium placeholder:tracking-wide focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            
            {/* Separator line */}
            <div 
              className="mx-4 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, hsl(174 50% 45% / 0.3), transparent)',
              }}
            />
            
            {/* Button section - fused */}
            <div className="p-3">
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="relative w-full bg-primary py-5 md:py-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 rounded-xl"
                style={{
                  boxShadow: '0 0 20px hsl(174 60% 45% / 0.25), 0 2px 8px hsl(0 0% 0% / 0.3)',
                }}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Search className="mr-2 h-5 w-5" />
                )}
                {t.analyze}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 md:mt-4 text-center text-[10px] md:text-sm text-muted-foreground/70">
        {t.description}
      </p>
    </form>
  );
};

// CSS for shimmer animation
const shimmerStyle = document.createElement('style');
shimmerStyle.textContent = `
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
if (!document.getElementById('shimmer-style')) {
  shimmerStyle.id = 'shimmer-style';
  document.head.appendChild(shimmerStyle);
}
