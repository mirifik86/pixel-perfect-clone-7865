import { useState } from 'react';
import { LeenScoreLogo } from '@/components/LeenScoreLogo';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ScoreGauge } from '@/components/ScoreGauge';
import { AnalysisForm } from '@/components/AnalysisForm';
import earthBg from '@/assets/earth-cosmic-bg.jpg';

const translations = {
  en: {
    tagline: 'See clearly through information.',
    byLine: 'BY SOL&AIR',
    scoreLabel: 'LeenScore Index',
    pending: 'Pending',
    footer: 'LeenScore illuminates information, without orienting your opinion.',
    developedBy: 'TOOL DEVELOPED BY SOL&AIR.',
    version: 'VERSION 2.0',
  },
  fr: {
    tagline: "Voir clair dans l'information.",
    byLine: 'PAR SOL&AIR',
    scoreLabel: 'Indice LeenScore',
    pending: 'En attente',
    footer: "LeenScore éclaire l'information, sans orienter votre opinion.",
    developedBy: 'OUTIL DÉVELOPPÉ PAR SOL&AIR.',
    version: 'VERSION 2.0',
  },
};

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'fr'>('fr');
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[language];

  const handleAnalyze = async (input: string) => {
    setIsLoading(true);
    setScore(null);
    
    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Generate a random score for demo purposes
    const randomScore = Math.floor(Math.random() * 100);
    setScore(randomScore);
    setIsLoading(false);
  };

  return (
    <div 
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, hsl(240 30% 5%) 0%, hsl(220 35% 8%) 100%)' }}
    >
      {/* Earth background */}
      <div 
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-60"
        style={{ 
          backgroundImage: `url(${earthBg})`,
          backgroundPosition: 'center 40%'
        }}
      />
      
      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col items-center px-4 py-12">
        {/* Logo & branding */}
        <div className="mb-6">
          <LeenScoreLogo />
        </div>

        <p className="mb-1 text-lg text-muted-foreground">{t.tagline}</p>
        <p className="mb-8 text-sm font-semibold tracking-widest text-primary">
          {t.byLine}
        </p>

        {/* Language toggle */}
        <div className="mb-10">
          <LanguageToggle language={language} onLanguageChange={setLanguage} />
        </div>

        {/* Score gauge */}
        <div className="mb-4">
          <ScoreGauge score={score} size={180} />
        </div>

        <div className="mb-10 text-center">
          <p className="text-lg font-medium text-muted-foreground">{t.scoreLabel}</p>
          <p className="text-sm text-muted-foreground/70">
            {score !== null ? score : t.pending}
          </p>
        </div>

        {/* Analysis form */}
        <AnalysisForm
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          language={language}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-8 pt-12 text-center">
        <p className="mb-4 text-lg">
          <span className="font-serif italic text-foreground">Leen</span>
          <span className="font-serif text-primary">Score</span>
          <span className="ml-2 text-muted-foreground">{t.footer.split('LeenScore')[1]}</span>
        </p>
        <p className="text-xs font-semibold tracking-widest text-primary">
          {t.developedBy}
        </p>
        <p className="mt-1 text-xs tracking-widest text-muted-foreground/60">
          {t.version}
        </p>
      </footer>
    </div>
  );
};

export default Index;
