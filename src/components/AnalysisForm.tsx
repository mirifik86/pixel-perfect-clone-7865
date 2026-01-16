import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AnalysisFormProps {
  onAnalyze: (input: string) => void;
  isLoading: boolean;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    placeholder: 'Paste a URL or text from a news article or social media post...',
    analyze: 'Analyze',
    description: 'We analyze source credibility, linguistic patterns, and context to help you understand online information.',
  },
  fr: {
    placeholder: "Collez une URL ou du texte d'un article de presse ou d'une publication de réseau social...",
    analyze: 'Analyser',
    description: 'Nous analysons la crédibilité des sources, les modèles linguistiques et le contexte pour vous aider à comprendre les informations en ligne.',
  },
};

export const AnalysisForm = ({ onAnalyze, isLoading, language }: AnalysisFormProps) => {
  const [input, setInput] = useState('');
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAnalyze(input.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="analysis-card w-full max-w-2xl animate-fade-in">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t.placeholder}
        className="min-h-[120px] resize-none border-muted bg-transparent text-card-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary"
      />
      
      <Button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="mt-4 w-full bg-primary py-6 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
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
