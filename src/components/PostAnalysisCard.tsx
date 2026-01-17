import { FileText, RotateCcw } from 'lucide-react';

interface PostAnalysisCardProps {
  articleSummary: string;
  onReset: () => void;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    summaryTitle: 'Article Summary',
    newAnalysis: 'Run Another Analysis',
  },
  fr: {
    summaryTitle: "Résumé de l'article",
    newAnalysis: 'Faire autre analyse',
  },
};

export const PostAnalysisCard = ({ articleSummary, onReset, language }: PostAnalysisCardProps) => {
  const t = translations[language];

  return (
    <div className="mt-6 w-full max-w-2xl animate-fade-in md:mt-8">
      <div 
        className="rounded-2xl border border-border/30 p-5 md:p-7"
        style={{
          background: 'linear-gradient(180deg, hsl(220 25% 12% / 0.95) 0%, hsl(220 30% 10% / 0.92) 100%)',
          boxShadow: '0 4px 24px -4px hsl(220 30% 5% / 0.5), 0 8px 48px -8px hsl(220 30% 5% / 0.3)',
        }}
      >
        {/* Article Summary Section */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground/80" />
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80 md:text-sm">
              {t.summaryTitle}
            </h4>
          </div>
          <p className="text-sm leading-relaxed text-foreground/85 md:text-base">
            {articleSummary}
          </p>
        </div>

        {/* Subtle separator */}
        <div 
          className="mb-5 h-px w-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, hsl(220 20% 30% / 0.4) 50%, transparent 100%)'
          }}
        />

        {/* Reset Button - Clear and accessible */}
        <div className="flex justify-center">
          <button
            onClick={onReset}
            className="group flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-5 py-2.5 transition-all duration-200 hover:border-primary/60 hover:bg-primary/25 md:gap-3 md:px-7 md:py-3"
          >
            <RotateCcw className="h-4 w-4 text-primary transition-transform duration-300 group-hover:-rotate-180 md:h-5 md:w-5" />
            <span className="text-sm font-semibold text-primary md:text-base">
              {t.newAnalysis}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
