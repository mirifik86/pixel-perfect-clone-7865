import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { LeenScoreLogo } from '@/components/LeenScoreLogo';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ScoreGauge } from '@/components/ScoreGauge';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { AnalysisForm } from '@/components/AnalysisForm';
import { AnalysisResult } from '@/components/AnalysisResult';
import { ProAnalysisLoader } from '@/components/ProAnalysisLoader';
import { ProAnalysisModal } from '@/components/ProAnalysisModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  analysisType?: 'standard' | 'pro';
  breakdown: AnalysisBreakdown;
  summary: string;
  articleSummary?: string;
  confidence: 'low' | 'medium' | 'high';
  corroboration?: {
    outcome: string;
    sourcesConsulted: number;
    sourceTypes: string[];
    summary: string;
  };
}

// Bilingual summaries stored at analysis time - no translation calls on toggle
interface BilingualSummaries {
  en: { summary: string; articleSummary: string } | null;
  fr: { summary: string; articleSummary: string } | null;
}
const translations = {
  en: {
    tagline: 'See clearly through information.',
    byLine: 'BY SOL&AIR',
    scoreLabel: 'LeenScore Index',
    pending: 'Pending',
    footer: 'LeenScore illuminates information, without orienting your opinion.',
    developedBy: 'TOOL DEVELOPED BY SOL&AIR.',
    version: 'VERSION 1',
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
    version: 'VERSION 1',
    analyzing: 'Analyse en cours...',
    errorAnalysis: "L'analyse a échoué. Veuillez réessayer.",
    newAnalysis: 'Faire autre analyse'
  }
};
const Index = () => {
  const isMobile = useIsMobile();
  const [language, setLanguage] = useState<'en' | 'fr'>('fr');
  const [isLoading, setIsLoading] = useState(false);
  const [isProLoading, setIsProLoading] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [lastAnalyzedContent, setLastAnalyzedContent] = useState<string>('');
  
  // Both language results are fetched in parallel on submit - no API calls on toggle
  const [analysisByLanguage, setAnalysisByLanguage] = useState<Record<'en' | 'fr', AnalysisData | null>>({
    en: null,
    fr: null,
  });
  
  // BILINGUAL SUMMARIES: Both languages stored at analysis time for instant switching
  // No translation calls, no async operations on language toggle
  const [summariesByLanguage, setSummariesByLanguage] = useState<BilingualSummaries>({
    en: null,
    fr: null,
  });

  const t = translations[language];
  const analysisData = analysisByLanguage[language];
  const hasAnyAnalysis = Boolean(analysisByLanguage.en || analysisByLanguage.fr);

  // Score is consistent across both languages (same analysis, different text)
  const score = (analysisByLanguage.en ?? analysisByLanguage.fr)?.score ?? null;
  
  // INSTANT SUMMARY ACCESS: Pure synchronous lookup, no async operations
  const currentSummaries = summariesByLanguage[language];
  const displayArticleSummary = currentSummaries?.articleSummary || null;

  const handleReset = () => {
    setAnalysisByLanguage({ en: null, fr: null });
    setSummariesByLanguage({ en: null, fr: null });
    setLastAnalyzedContent('');
  };

  // Analyze in BOTH languages simultaneously - no API calls needed on language toggle
  const handleAnalyze = async (input: string) => {
    const tLocal = translations[language];

    setIsLoading(true);
    setAnalysisByLanguage({ en: null, fr: null });
    setSummariesByLanguage({ en: null, fr: null });
    setLastAnalyzedContent(input);

    try {
      // Fetch both languages in parallel - summaries generated for BOTH languages upfront
      const [enResult, frResult] = await Promise.all([
        supabase.functions.invoke('analyze', {
          body: { content: input, language: 'en' },
        }),
        supabase.functions.invoke('analyze', {
          body: { content: input, language: 'fr' },
        }),
      ]);

      // Check for errors
      if (enResult.error || frResult.error) {
        console.error('Analysis error:', enResult.error || frResult.error);
        toast.error(tLocal.errorAnalysis);
        return;
      }

      if (enResult.data?.error || frResult.data?.error) {
        console.error('API error:', enResult.data?.error || frResult.data?.error);
        toast.error(enResult.data?.error || frResult.data?.error);
        return;
      }

      // Use the primary language score as the master score for both
      const masterScore = language === 'fr' ? frResult.data.score : enResult.data.score;
      const masterConfidence = language === 'fr' ? frResult.data.confidence : enResult.data.confidence;
      const masterBreakdownPoints = language === 'fr' ? frResult.data.breakdown : enResult.data.breakdown;
      
      // STORE BILINGUAL SUMMARIES: Both languages cached for instant toggle
      setSummariesByLanguage({
        en: {
          summary: enResult.data.summary || '',
          articleSummary: enResult.data.articleSummary || '',
        },
        fr: {
          summary: frResult.data.summary || '',
          articleSummary: frResult.data.articleSummary || '',
        },
      });

      // Ensure both languages have IDENTICAL numerical values
      const normalizedEn: AnalysisData = {
        ...enResult.data,
        score: masterScore,
        confidence: masterConfidence,
        breakdown: {
          sources: { ...enResult.data.breakdown.sources, points: masterBreakdownPoints.sources.points },
          factual: { ...enResult.data.breakdown.factual, points: masterBreakdownPoints.factual.points },
          tone: { ...enResult.data.breakdown.tone, points: masterBreakdownPoints.tone.points },
          context: { ...enResult.data.breakdown.context, points: masterBreakdownPoints.context.points },
          transparency: { ...enResult.data.breakdown.transparency, points: masterBreakdownPoints.transparency.points },
        },
      };

      const normalizedFr: AnalysisData = {
        ...frResult.data,
        score: masterScore,
        confidence: masterConfidence,
        breakdown: {
          sources: { ...frResult.data.breakdown.sources, points: masterBreakdownPoints.sources.points },
          factual: { ...frResult.data.breakdown.factual, points: masterBreakdownPoints.factual.points },
          tone: { ...frResult.data.breakdown.tone, points: masterBreakdownPoints.tone.points },
          context: { ...frResult.data.breakdown.context, points: masterBreakdownPoints.context.points },
          transparency: { ...frResult.data.breakdown.transparency, points: masterBreakdownPoints.transparency.points },
        },
      };

      // Store both - language toggle is now purely local state
      setAnalysisByLanguage({ en: normalizedEn, fr: normalizedFr });
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error(tLocal.errorAnalysis);
    } finally {
      setIsLoading(false);
    }
  };

  // PRO Analysis - uses the same content with analysisType: 'pro'
  const handleProAnalysis = async () => {
    if (!lastAnalyzedContent) return;
    
    const tLocal = translations[language];
    setIsProLoading(true);

    try {
      const [enResult, frResult] = await Promise.all([
        supabase.functions.invoke('analyze', {
          body: { content: lastAnalyzedContent, language: 'en', analysisType: 'pro' },
        }),
        supabase.functions.invoke('analyze', {
          body: { content: lastAnalyzedContent, language: 'fr', analysisType: 'pro' },
        }),
      ]);

      if (enResult.error || frResult.error) {
        console.error('Pro analysis error:', enResult.error || frResult.error);
        toast.error(tLocal.errorAnalysis);
        return;
      }

      if (enResult.data?.error || frResult.data?.error) {
        console.error('API error:', enResult.data?.error || frResult.data?.error);
        toast.error(enResult.data?.error || frResult.data?.error);
        return;
      }

      const masterScore = language === 'fr' ? frResult.data.score : enResult.data.score;
      const masterConfidence = language === 'fr' ? frResult.data.confidence : enResult.data.confidence;

      setSummariesByLanguage({
        en: {
          summary: enResult.data.summary || '',
          articleSummary: enResult.data.articleSummary || '',
        },
        fr: {
          summary: frResult.data.summary || '',
          articleSummary: frResult.data.articleSummary || '',
        },
      });

      const normalizedEn: AnalysisData = {
        ...enResult.data,
        score: masterScore,
        confidence: masterConfidence,
        analysisType: 'pro',
      };

      const normalizedFr: AnalysisData = {
        ...frResult.data,
        score: masterScore,
        confidence: masterConfidence,
        analysisType: 'pro',
      };

      setAnalysisByLanguage({ en: normalizedEn, fr: normalizedFr });
      setIsProModalOpen(false);
      toast.success(language === 'fr' ? 'Analyse Pro terminée' : 'Pro Analysis complete');
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error(tLocal.errorAnalysis);
    } finally {
      setIsProLoading(false);
    }
  };

  // INSTANT language switch - pure local state change, zero API calls
  const handleLanguageChange = (next: 'en' | 'fr') => {
    setLanguage(next);
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
      
      {/* Main content - mobile-first: fit everything above fold */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-between px-4 py-2 md:py-6">
        <div className="flex w-full flex-col items-center pt-2 md:pt-8">
          {/* Logo & branding with unified halo */}
          <div 
            className="relative mb-2 md:mb-8 flex animate-fade-in flex-col items-center" 
            style={{ animationDelay: '0ms', animationFillMode: 'both' }}
          >
            {/* Unified halo effect behind logo + subtitles */}
            <div 
              className="pointer-events-none absolute -inset-6"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 40%, hsl(174 60% 45% / 0.15) 0%, transparent 70%)',
                filter: 'blur(20px)'
              }}
            />
            
            <LeenScoreLogo />
            
            {/* Premium light beam separator */}
            <div className="relative my-1 md:my-2 flex w-full items-center justify-center">
              {/* Central glow dot */}
              <div 
                className="absolute h-1.5 w-1.5 rounded-full"
                style={{
                  background: 'hsl(174 80% 60%)',
                  boxShadow: '0 0 8px 2px hsl(174 80% 55% / 0.8), 0 0 20px 4px hsl(174 60% 45% / 0.4)'
                }}
              />
              {/* Light beam left */}
              <div 
                className="h-px w-24"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, hsl(174 60% 50% / 0.6) 100%)'
                }}
              />
              {/* Light beam right */}
              <div 
                className="h-px w-24"
                style={{
                  background: 'linear-gradient(90deg, hsl(174 60% 50% / 0.6) 0%, transparent 100%)'
                }}
              />
            </div>
            
            {/* Subtitle - unified styling */}
            <p 
              className="animate-fade-in text-center text-base md:text-lg font-medium text-foreground/95"
              style={{ animationDelay: '100ms', animationFillMode: 'both' }}
            >
              {t.tagline}
            </p>
            <p 
              className="mt-0.5 md:mt-1.5 animate-fade-in text-[10px] md:text-xs font-bold uppercase tracking-[0.35em]"
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

          {/* Language toggle - perfectly centered */}
          <div 
            className="flex w-full justify-center mb-2 md:mb-8 animate-fade-in"
            style={{ animationDelay: '200ms', animationFillMode: 'both' }}
          >
            <LanguageToggle language={language} onLanguageChange={handleLanguageChange} />
          </div>

          {/* Score gauge - clean, instrument-like design */}
          <div 
            className="relative mb-1 md:mb-4 animate-scale-in"
            style={{ animationDelay: '300ms', animationFillMode: 'both' }}
          >
            <div className="relative flex justify-center">
              {/* Show loader during analysis, gauge otherwise - smaller on mobile */}
              {isLoading ? (
                <AnalysisLoader size={isMobile ? 150 : 200} language={language} />
              ) : (
                <ScoreGauge score={score} size={isMobile ? 150 : 200} language={language} />
              )}
            </div>
          </div>

          {/* Post-Analysis: CTA buttons only (summary moved to AnalysisResult card) */}
          {hasAnyAnalysis && (
            <div className="w-full max-w-xl animate-fade-in mt-5" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              {/* Action buttons row - premium dual CTA */}
              <div className="flex items-center justify-center gap-3">
                {/* Primary CTA - Run another analysis */}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                  style={{
                    boxShadow: '0 0 20px hsl(174 60% 45% / 0.3), 0 4px 12px hsl(0 0% 0% / 0.2)'
                  }}
                >
                  {language === 'fr' ? 'Nouvelle analyse' : 'New analysis'}
                </button>
                
                {/* Secondary CTA - Pro Analysis (only show if NOT already a PRO analysis) */}
                {analysisData?.analysisType !== 'pro' && (
                  <button
                    onClick={() => setIsProModalOpen(true)}
                    className="group relative flex items-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, hsl(200 80% 50%) 0%, hsl(174 70% 45%) 50%, hsl(280 60% 55%) 100%)',
                      boxShadow: '0 0 25px hsl(200 80% 55% / 0.5), 0 0 50px hsl(174 70% 45% / 0.3), 0 4px 20px hsl(0 0% 0% / 0.3)',
                    }}
                  >
                    {/* Animated shine effect */}
                    <div 
                      className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                        animation: 'shine 2s infinite',
                      }}
                    />
                    
                    {/* PRO badge with glow */}
                    <span 
                      className="relative rounded-md px-1.5 py-0.5 text-[10px] font-black tracking-wider"
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        textShadow: '0 0 10px rgba(255,255,255,0.5)',
                      }}
                    >
                      PRO
                    </span>
                    
                    <span className="relative text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                      {language === 'fr' ? 'Analyse avancée' : 'Advanced analysis'}
                    </span>
                  
                    {/* Subtle pulse ring */}
                    <div 
                      className="absolute -inset-1 -z-10 rounded-full opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, hsl(200 80% 55%) 0%, hsl(174 70% 50%) 50%, hsl(280 60% 60%) 100%)',
                        animation: 'pulse 2s ease-in-out infinite',
                        filter: 'blur(8px)',
                      }}
                    />
                  </button>
                )}
              </div>
            </div>
          )}



          {/* Analysis form - hidden during loading and after analysis */}
          {!hasAnyAnalysis && !isLoading && (
            <div 
              className="mt-0 md:mt-2 w-full max-w-2xl animate-fade-in"
              style={{ animationDelay: '400ms', animationFillMode: 'both' }}
            >
              <AnalysisForm onAnalyze={handleAnalyze} isLoading={isLoading} language={language} />
            </div>
          )}

          {/* PRO Analysis loading skeleton */}
          {isProLoading && (
            <ProAnalysisLoader language={language} />
          )}

          {/* Analysis result - detailed breakdown below */}
          {analysisData && !isProLoading && (
            <AnalysisResult 
              data={analysisData} 
              language={language} 
              articleSummary={displayArticleSummary}
            />
          )}

          {/* Pro Analysis Modal */}
          <ProAnalysisModal 
            open={isProModalOpen} 
            onOpenChange={setIsProModalOpen} 
            language={language}
            onLaunchPro={handleProAnalysis}
            isLoading={isProLoading}
          />
        </div>

        {/* Footer - premium styling */}
        <footer 
          className="animate-fade-in pb-6 pt-8 text-center"
          style={{ animationDelay: '500ms', animationFillMode: 'both' }}
        >
          {/* Ethical positioning - premium institutional style */}
          <p className="mx-auto max-w-md border-t border-white/10 pt-6 text-xs tracking-wide text-foreground/50">
            <span 
              className="font-serif italic"
              style={{ color: 'hsl(174 65% 55%)' }}
            >Leen</span>
            <span className="font-serif text-foreground/70">Score</span>
            <span className="ml-1">{t.footer.split('LeenScore')[1]}</span>
          </p>
          
          <p className="mt-4 text-[10px] font-medium tracking-[0.2em] text-primary/70">
            {t.developedBy}
          </p>
          <p className="mt-1 text-[10px] tracking-[0.15em] text-muted-foreground/40">
            {t.version}
          </p>
        </footer>
      </main>
    </div>;
};
export default Index;