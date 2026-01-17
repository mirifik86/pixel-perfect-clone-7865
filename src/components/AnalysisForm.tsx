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
    placeholder: 'Paste a link or text to analyze',
    analyze: 'Analyze',
    description: 'We analyze source credibility, linguistic patterns, and context to help you understand online information.',
    urlDetected: 'URL detected',
  },
  fr: {
    placeholder: 'Collez un lien ou un texte à analyser',
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
      <div 
        className="relative rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-4 backdrop-blur-md transition-all duration-300"
        style={{
          boxShadow: hasValidUrl 
            ? '0 0 30px hsl(174 60% 45% / 0.2), 0 8px 32px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.1)'
            : '0 8px 32px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.1)',
        }}
      >
        {/* URL Detection Badge */}
        {hasValidUrl && (
          <div className="absolute -top-3 left-4 flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/20 px-3 py-1 backdrop-blur-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">{t.urlDetected}</span>
          </div>
        )}
        
        {/* Input Icon */}
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
          <Link2 className={`h-5 w-5 transition-colors duration-300 ${hasValidUrl ? 'text-primary' : 'text-muted-foreground/40'}`} />
        </div>
        
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          className="min-h-[80px] resize-none border-0 bg-transparent pl-10 text-sm text-white placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      
      <Button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="mt-4 w-full bg-primary py-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
        style={{
          boxShadow: '0 0 20px hsl(174 60% 45% / 0.35), 0 4px 12px hsl(0 0% 0% / 0.25)',
        }}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Search className="mr-2 h-5 w-5" />
        )}
        {t.analyze}
      </Button>

      <p className="mt-4 text-center text-sm text-muted-foreground/80">
        {t.description}
      </p>
    </form>
  );
};
