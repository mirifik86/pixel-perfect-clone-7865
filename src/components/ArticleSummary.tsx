import { FileText } from 'lucide-react';

interface ArticleSummaryProps {
  summary: string;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    title: 'Article Summary',
  },
  fr: {
    title: "Résumé de l'article",
  },
};

export const ArticleSummary = ({ summary, language }: ArticleSummaryProps) => {
  const t = translations[language];

  return (
    <div className="mt-6 w-full max-w-2xl animate-fade-in">
      <div className="rounded-xl border border-border/20 bg-card/30 p-4 backdrop-blur-sm md:p-5">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {t.title}
          </h4>
        </div>
        <p className="text-sm leading-relaxed text-foreground/80 md:text-base">
          {summary}
        </p>
      </div>
    </div>
  );
};
