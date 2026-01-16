import { useState } from 'react';
import { LeenScoreLogo } from '@/components/LeenScoreLogo';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ScoreGauge } from '@/components/ScoreGauge';
import { AnalysisForm } from '@/components/AnalysisForm';
import { AnalysisResult } from '@/components/AnalysisResult';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import earthBg from '@/assets/earth-cosmic-bg.jpg';
interface AnalysisBreakdown {
  sources: {
    points: number;
    reason: string;
  };
  factual: {
    points: number;
    reason: string;
  };
  tone: {
    points: number;
    reason: string;
  };
  context: {
    points: number;
    reason: string;
  };
  transparency: {
    points: number;
    reason: string;
  };
}
interface AnalysisData {
  score: number;
  breakdown: AnalysisBreakdown;
  summary: string;
  confidence: 'low' | 'medium' | 'high';
}
const translations = {
  en: {
    tagline: 'See clearly through information.',
    byLine: 'BY SOL&AIR',
    scoreLabel: 'LeenScore Index',
    pending: 'Pending',
    footer: 'LeenScore illuminates information, without orienting your opinion.',
    developedBy: 'TOOL DEVELOPED BY SOL&AIR.',
    version: 'VERSION 2.0',
    analyzing: 'Analyzing...',
    errorAnalysis: 'Analysis failed. Please try again.',
    newAnalysis: 'New Analysis'
  },
  fr: {
    tagline: "Voir clair dans l'information.",
    byLine: 'PAR SOL&AIR',
    scoreLabel: 'Indice LeenScore',
    pending: 'En attente',
    footer: "LeenScore éclaire l'information, sans orienter votre opinion.",
    developedBy: 'OUTIL DÉVELOPPÉ PAR SOL&AIR.',
    version: 'VERSION 2.0',
    analyzing: 'Analyse en cours...',
    errorAnalysis: "L'analyse a échoué. Veuillez réessayer.",
    newAnalysis: 'Faire autre analyse'
  }
};
const Index = () => {
  const [language, setLanguage] = useState<'en' | 'fr'>('fr');
  const [isLoading, setIsLoading] = useState(false);
  const [lastInput, setLastInput] = useState<string | null>(null);
  const [analysisByLanguage, setAnalysisByLanguage] = useState<Record<'en' | 'fr', AnalysisData | null>>({
    en: null,
    fr: null,
  });

  const t = translations[language];
  const analysisData = analysisByLanguage[language];
  const hasAnyAnalysis = Boolean(analysisByLanguage.en || analysisByLanguage.fr);

  // Keep a stable score visible during language re-generation
  const score = (
    analysisData ?? (language === 'en' ? analysisByLanguage.fr : analysisByLanguage.en)
  )?.score ?? null;

  const handleReset = () => {
    setLastInput(null);
    setAnalysisByLanguage({ en: null, fr: null });
  };

  const handleAnalyze = async (input: string, langOverride?: 'en' | 'fr') => {
    const lang = langOverride ?? language;
    const tLocal = translations[lang];

    setIsLoading(true);
    setLastInput(input);

    // Clear only the target language result; keep the other language cached
    setAnalysisByLanguage((prev) => ({ ...prev, [lang]: null }));

    try {
      const { data, error } = await supabase.functions.invoke('analyze', {
        body: {
          content: input,
          language: lang,
        },
      });

      if (error) {
        console.error('Analysis error:', error);
        toast.error(tLocal.errorAnalysis);
        return;
      }

      if (data?.error) {
        console.error('API error:', data.error);
        toast.error(data.error);
        return;
      }

      setAnalysisByLanguage((prev) => ({ ...prev, [lang]: data }));
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error(tLocal.errorAnalysis);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (next: 'en' | 'fr') => {
    setLanguage(next);

    // If we already analyzed once, keep everything in sync with the selected language.
    if (hasAnyAnalysis && lastInput && !analysisByLanguage[next] && !isLoading) {
      void handleAnalyze(lastInput, next);
    }
  };
  return <div className="relative flex min-h-screen flex-col overflow-hidden" style={{
    background: 'linear-gradient(180deg, hsl(240 30% 5%) 0%, hsl(220 35% 8%) 100%)'
  }}>
      {/* Earth background */}
      <div className="pointer-events-none fixed inset-0 opacity-80" style={{
      backgroundImage: `url(${earthBg})`,
      backgroundPosition: 'center 40%',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed'
    }} />
      
      {/* Main content - use min-h-screen and justify-between to fit everything without scrolling */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-between px-3 py-4 md:px-4 md:py-16">
        <div className="flex w-full flex-col items-center">
          {/* Logo & branding with unified halo */}
          <div 
            className="relative mb-3 flex animate-fade-in flex-col items-center md:mb-12" 
            style={{ animationDelay: '0ms', animationFillMode: 'both' }}
          >
            {/* Unified halo effect behind logo + subtitles */}
            <div 
              className="pointer-events-none absolute -inset-4 md:-inset-8"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 40%, hsl(174 60% 45% / 0.15) 0%, transparent 70%)',
                filter: 'blur(20px)'
              }}
            />
            
            <LeenScoreLogo />
            
            {/* Premium light beam separator */}
            <div className="relative my-2 flex w-full items-center justify-center md:my-3">
              {/* Central glow dot */}
              <div 
                className="absolute h-1 w-1 rounded-full md:h-1.5 md:w-1.5"
                style={{
                  background: 'hsl(174 80% 60%)',
                  boxShadow: '0 0 8px 2px hsl(174 80% 55% / 0.8), 0 0 20px 4px hsl(174 60% 45% / 0.4)'
                }}
              />
              {/* Light beam left */}
              <div 
                className="h-px w-16 md:w-32"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, hsl(174 60% 50% / 0.6) 100%)'
                }}
              />
              {/* Light beam right */}
              <div 
                className="h-px w-16 md:w-32"
                style={{
                  background: 'linear-gradient(90deg, hsl(174 60% 50% / 0.6) 0%, transparent 100%)'
                }}
              />
            </div>
            
            {/* Subtitle - tighter spacing */}
            <p 
              className="animate-fade-in text-center text-sm font-medium text-foreground/95 md:text-2xl"
              style={{ animationDelay: '100ms', animationFillMode: 'both' }}
            >
              {t.tagline}
            </p>
            <p 
              className="mt-1 animate-fade-in text-[10px] font-bold uppercase tracking-[0.3em] md:mt-2 md:text-sm md:tracking-[0.4em]"
              style={{ 
                animationDelay: '150ms', 
                animationFillMode: 'both',
                color: 'hsl(174 80% 65%)',
                textShadow: '0 0 10px hsl(174 80% 55% / 0.6), 0 0 20px hsl(174 60% 45% / 0.4), 0 0 30px hsl(174 60% 45% / 0.2)'
              }}
            >
              {t.byLine}
            </p>
          </div>

          {/* Language toggle */}
          <div 
            className="mb-3 animate-fade-in md:mb-10"
            style={{ animationDelay: '200ms', animationFillMode: 'both' }}
          >
            <LanguageToggle language={language} onLanguageChange={handleLanguageChange} />
          </div>

          {/* Score gauge - smaller on mobile */}
          <div 
            className="mb-1 animate-scale-in md:mb-4"
            style={{ animationDelay: '300ms', animationFillMode: 'both' }}
          >
            <ScoreGauge score={score} size={120} className="md:hidden" language={language} />
            <ScoreGauge score={score} size={180} className="hidden md:block" language={language} />
          </div>

          {/* Reset button - appears after analysis */}
          {hasAnyAnalysis && (
            <button
              onClick={handleReset}
              className="group mb-3 flex animate-fade-in items-center gap-1.5 rounded-full border-2 border-primary/50 bg-gradient-to-r from-primary/30 to-primary/20 px-4 py-2 backdrop-blur-md transition-all duration-300 hover:border-primary hover:from-primary/50 hover:to-primary/30 hover:shadow-xl hover:shadow-primary/30 md:mb-8 md:gap-3 md:px-8 md:py-4"
              style={{
                boxShadow: '0 0 25px hsl(174 60% 45% / 0.3), 0 0 50px hsl(174 60% 45% / 0.15)'
              }}
            >
              <RotateCcw className="h-3.5 w-3.5 text-primary transition-transform duration-300 group-hover:-rotate-180 md:h-5 md:w-5" />
              <span className="text-xs font-semibold tracking-wide text-primary group-hover:text-primary md:text-base">
                {t.newAnalysis}
              </span>
            </button>
          )}

          {/* Analysis form - hidden after first analysis */}
          {!hasAnyAnalysis && (
            <div 
              className="mt-1 w-full max-w-2xl animate-fade-in md:mt-10"
              style={{ animationDelay: '400ms', animationFillMode: 'both' }}
            >
              <AnalysisForm onAnalyze={handleAnalyze} isLoading={isLoading} language={language} />
              {/* Tagline directly below the form */}
              <p 
                className="mt-3 animate-fade-in text-center text-xs md:mt-6 md:text-base"
                style={{ animationDelay: '450ms', animationFillMode: 'both' }}
              >
                <span className="font-serif italic text-primary">Leen</span>
                <span className="font-serif text-foreground">Score</span>
                <span className="ml-1 text-muted-foreground md:ml-2">{t.footer.split('LeenScore')[1]}</span>
              </p>
            </div>
          )}

          {/* Analysis result (per language) */}
          {analysisData && <AnalysisResult data={analysisData} language={language} />}

          {/* While switching languages, show a small placeholder until the new language result is ready */}
          {hasAnyAnalysis && !analysisData && (
            <div className="analysis-card mt-3 w-full max-w-2xl animate-fade-in md:mt-8">
              <p className="text-center text-xs text-muted-foreground/90 md:text-sm">
                {language === 'fr' ? 'Traduction en cours…' : 'Translating…'}
              </p>
            </div>
          )}
        </div>

        {/* Footer - integrated into main for proper spacing */}
        <footer 
          className="mt-2 animate-fade-in pb-2 pt-2 text-center md:mt-12 md:pb-8 md:pt-12"
          style={{ animationDelay: '500ms', animationFillMode: 'both' }}
        >
          <p className="text-[8px] font-semibold tracking-widest text-primary md:text-xs">
            {t.developedBy}
          </p>
          <p className="mt-0.5 text-[8px] tracking-widest text-muted-foreground/60 md:mt-1 md:text-xs">
            {t.version}
          </p>
        </footer>
      </main>
    </div>;
};
export default Index;