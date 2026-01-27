import { Sparkles } from 'lucide-react';

interface StandardAnalysisIntroProps {
  language: 'en' | 'fr';
}

const translations = {
  en: {
    title: 'Linguistic Credibility Analysis',
    subtitle: 'This first-level analysis examines how the content is written to detect signals commonly associated with reliable or misleading information.',
  },
  fr: {
    title: 'Analyse de Crédibilité Linguistique',
    subtitle: 'Cette analyse de premier niveau examine la façon dont le contenu est rédigé pour détecter les signaux communément associés à une information fiable ou trompeuse.',
  },
};

export const StandardAnalysisIntro = ({ language }: StandardAnalysisIntroProps) => {
  const t = translations[language];

  return (
    <div 
      className="relative overflow-hidden rounded-xl p-5 mb-6"
      style={{
        background: 'linear-gradient(135deg, hsl(200 30% 98%) 0%, hsl(220 25% 96%) 50%, hsl(200 20% 97%) 100%)',
        border: '1px solid hsl(200 30% 88%)',
        boxShadow: '0 4px 20px hsl(200 30% 50% / 0.06), inset 0 1px 0 hsl(0 0% 100% / 0.8)',
      }}
    >
      {/* Subtle decorative element */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, hsl(174 60% 70% / 0.3) 0%, transparent 70%)',
        }}
      />
      
      <div className="relative">
        <div className="flex items-center gap-2.5 mb-3">
          <div 
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, hsl(200 50% 92%) 0%, hsl(174 50% 88%) 100%)',
              boxShadow: '0 2px 6px hsl(200 50% 50% / 0.15)',
            }}
          >
            <Sparkles className="w-4 h-4 text-cyan-600" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-slate-800">
            {t.title}
          </h2>
        </div>
        
        <p className="text-sm leading-relaxed text-slate-600 pl-10">
          {t.subtitle}
        </p>
      </div>
    </div>
  );
};
