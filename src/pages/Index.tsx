import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { LeenScoreLogo } from '@/components/LeenScoreLogo';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ScoreGauge } from '@/components/ScoreGauge';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { UnifiedAnalysisForm } from '@/components/UnifiedAnalysisForm';
import { AnalysisResult } from '@/components/AnalysisResult';
import { ProAnalysisLoader } from '@/components/ProAnalysisLoader';
import { ProAnalysisModal } from '@/components/ProAnalysisModal';
import { ScreenshotAnalysisLoader } from '@/components/ScreenshotAnalysisLoader';
import { ScreenshotEvidence } from '@/components/ScreenshotEvidence';
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

interface ImageSignals {
  screenshotLikelihood: 'likely' | 'uncertain';
  blurLevel: 'low' | 'medium' | 'high';
  compressionArtifacts: 'low' | 'medium' | 'high';
  suspiciousEditingHints: 'none' | 'possible';
  metadataPresent: 'yes' | 'no' | 'partial';
}

interface VisualTextMismatch {
  detected: boolean;
  visible_entity: string | null;
  text_entity: string | null;
  mismatch_description: string | null;
}

interface ScreenshotAnalysisData {
  ocr: {
    raw_text: string;
    cleaned_text: string;
    confidence: number;
    text_length: number;
  };
  image_signals: ImageSignals;
  analysis: AnalysisData | null;
  warning?: string;
  visual_text_mismatch?: VisualTextMismatch;
  visual_description?: string;
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
    newAnalysis: 'New Analysis',
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
    newAnalysis: 'Faire autre analyse',
  }
};

const Index = () => {
  const isMobile = useIsMobile();
  const [language, setLanguage] = useState<'en' | 'fr'>('fr');
  const [isLoading, setIsLoading] = useState(false);
  const [isProLoading, setIsProLoading] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [lastAnalyzedContent, setLastAnalyzedContent] = useState<string>('');
  
  // Track if current analysis is from an image (for loader display)
  const [isImageAnalysis, setIsImageAnalysis] = useState(false);
  
  // Screenshot state
  const [uploadedFile, setUploadedFile] = useState<{ file: File; preview: string } | null>(null);
  const [screenshotLoaderStep, setScreenshotLoaderStep] = useState(0);
  const [screenshotData, setScreenshotData] = useState<ScreenshotAnalysisData | null>(null);
  const [isRerunning, setIsRerunning] = useState(false);
  const [hasFormContent, setHasFormContent] = useState(false);
  
  // Both language results are fetched in parallel on submit - no API calls on toggle
  const [analysisByLanguage, setAnalysisByLanguage] = useState<Record<'en' | 'fr', AnalysisData | null>>({
    en: null,
    fr: null,
  });
  
  // BILINGUAL SUMMARIES: Both languages stored at analysis time for instant switching
  const [summariesByLanguage, setSummariesByLanguage] = useState<BilingualSummaries>({
    en: null,
    fr: null,
  });

  const t = translations[language];
  const analysisData = analysisByLanguage[language];
  const hasAnyAnalysis = Boolean(analysisByLanguage.en || analysisByLanguage.fr || screenshotData?.analysis);

  // Score is consistent across both languages (same analysis, different text)
  // Also fallback to screenshotData.analysis.score for image analysis results
  const score = (analysisByLanguage.en ?? analysisByLanguage.fr)?.score 
    ?? screenshotData?.analysis?.score 
    ?? null;
  
  // INSTANT SUMMARY ACCESS: Pure synchronous lookup, no async operations
  const currentSummaries = summariesByLanguage[language];
  const displayArticleSummary = currentSummaries?.articleSummary || null;

  // Always run the actual analysis once (master), then translate for the other language.
  // This guarantees identical scoring + web corroboration across the EN/FR toggle.
  const runBilingualTextAnalysis = async ({
    content,
    analysisType,
  }: {
    content: string;
    analysisType?: 'standard' | 'pro';
  }): Promise<{ en: AnalysisData; fr: AnalysisData }> => {
    // Master analysis is always in English for determinism.
    const master = await supabase.functions.invoke('analyze', {
      body: {
        content,
        language: 'en',
        ...(analysisType ? { analysisType } : {}),
      },
    });

    if (master.error) throw master.error;
    if (master.data?.error) throw new Error(master.data.error);

    const enData = master.data as AnalysisData;

    const fr = await supabase.functions.invoke('translate-analysis', {
      body: {
        analysisData: enData,
        targetLanguage: 'fr',
      },
    });

    const frData = (!fr.error && fr.data && !fr.data.error ? (fr.data as AnalysisData) : enData);

    return { en: enData, fr: frData };
  };

  const handleReset = () => {
    setAnalysisByLanguage({ en: null, fr: null });
    setSummariesByLanguage({ en: null, fr: null });
    setLastAnalyzedContent('');
    setUploadedFile(null);
    setScreenshotData(null);
    setScreenshotLoaderStep(0);
    setIsImageAnalysis(false);
  };

  // Analyze in BOTH languages simultaneously - no API calls needed on language toggle
  const handleAnalyze = async (input: string) => {
    const tLocal = translations[language];

    setIsLoading(true);
    setIsImageAnalysis(false);
    setAnalysisByLanguage({ en: null, fr: null });
    setSummariesByLanguage({ en: null, fr: null });
    setLastAnalyzedContent(input);

    try {
      const { en, fr } = await runBilingualTextAnalysis({ content: input, analysisType: 'standard' });

      setSummariesByLanguage({
        en: { summary: en.summary || '', articleSummary: en.articleSummary || '' },
        fr: { summary: fr.summary || '', articleSummary: fr.articleSummary || '' },
      });

      setAnalysisByLanguage({ en, fr });
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error(tLocal.errorAnalysis);
    } finally {
      setIsLoading(false);
    }
  };

  // Screenshot Analysis Handler - now called directly when image is ready
  const handleImageAnalysis = async (file: File, preview: string, analysisType: 'standard' | 'pro' = 'standard') => {
    const tLocal = translations[language];
    setUploadedFile({ file, preview });
    setIsLoading(true);
    setIsImageAnalysis(true);
    setAnalysisByLanguage({ en: null, fr: null });
    setSummariesByLanguage({ en: null, fr: null });
    setScreenshotLoaderStep(0);

    try {
      // Step 1: OCR
      setScreenshotLoaderStep(0);
      await new Promise(r => setTimeout(r, 500)); // Brief delay for visual feedback
      
      // Step 2: Image Signals
      setScreenshotLoaderStep(1);
      await new Promise(r => setTimeout(r, 300));
      
      // Call the analyze-image endpoint
      const result = await supabase.functions.invoke('analyze-image', {
        body: { 
          imageData: preview, 
          language: language,
          analysisType: analysisType
        },
      });

      // Step 3: LeenScore Analysis
      setScreenshotLoaderStep(2);

      if (result.error) {
        console.error('Screenshot analysis error:', result.error);
        toast.error(tLocal.errorAnalysis);
        return;
      }

      if (result.data?.error) {
        console.error('API error:', result.data.error);
        toast.error(result.data.error);
        return;
      }

      // Process the result
      const data = result.data;
      
      // Transform image_signals from API format to component format
      const apiSignals = data.image_signals || {};
      const transformedSignals: ImageSignals = {
        screenshotLikelihood: apiSignals.screenshot_likelihood || 'uncertain',
        blurLevel: apiSignals.blur_level || 'medium',
        compressionArtifacts: apiSignals.compression_artifacts || 'medium',
        suspiciousEditingHints: apiSignals.suspicious_editing_hints || 'none',
        metadataPresent: apiSignals.metadata_present || 'no',
      };
      
      const processedData: ScreenshotAnalysisData = {
        ocr: data.ocr,
        image_signals: transformedSignals,
        analysis: data.analysis,
        warning: data.warning,
        visual_text_mismatch: data.visual_text_mismatch,
        visual_description: data.visual_description,
      };
      
      setScreenshotData(processedData);
      
      // Store the extracted text for potential re-runs
      setLastAnalyzedContent(data.ocr.cleaned_text);

      // If OCR extracted text, run a single master analysis (EN) then translate (FR).
      // This keeps ALL sections (Explication PRO, détails, corroboration, etc.) coherent across the FR/EN toggle.
      if (data?.ocr?.cleaned_text) {
        try {
          const { en, fr } = await runBilingualTextAnalysis({
            content: data.ocr.cleaned_text,
            analysisType,
          });

          setSummariesByLanguage({
            en: { summary: en.summary || '', articleSummary: en.articleSummary || '' },
            fr: { summary: fr.summary || '', articleSummary: fr.articleSummary || '' },
          });

          setAnalysisByLanguage({ en, fr });

          // Keep screenshotData.analysis aligned with the currently selected UI language
          setScreenshotData({
            ...processedData,
            analysis: language === 'fr' ? fr : en,
          });
        } catch (e) {
          // Fallback: keep analyze-image provided analysis (single language)
          setSummariesByLanguage({
            en: language === 'en' && data.analysis ? { summary: data.analysis.summary || '', articleSummary: data.analysis.articleSummary || '' } : null,
            fr: language === 'fr' && data.analysis ? { summary: data.analysis.summary || '', articleSummary: data.analysis.articleSummary || '' } : null,
          });
          setAnalysisByLanguage({
            en: language === 'en' ? data.analysis : null,
            fr: language === 'fr' ? data.analysis : null,
          });
        }
      }

      // Show warning if applicable
      if (data.warning) {
        toast.warning(data.warning);
      }

    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error(tLocal.errorAnalysis);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run analysis with edited text
  const handleRerunAnalysis = async (editedText: string) => {
    setIsRerunning(true);
    try {
      await handleAnalyze(editedText);
      setLastAnalyzedContent(editedText);
    } finally {
      setIsRerunning(false);
    }
  };

  // PRO Analysis - uses the same content with analysisType: 'pro'
  const handleProAnalysis = async () => {
    if (!lastAnalyzedContent) return;
    
    const tLocal = translations[language];
    setIsProLoading(true);

    try {
      const { en, fr } = await runBilingualTextAnalysis({ content: lastAnalyzedContent, analysisType: 'pro' });

      setSummariesByLanguage({
        en: { summary: en.summary || '', articleSummary: en.articleSummary || '' },
        fr: { summary: fr.summary || '', articleSummary: fr.articleSummary || '' },
      });

      setAnalysisByLanguage({ en, fr });
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

  // Compact gauge size to fit above fold
  const gaugeSize = 150;

  return (
    <div 
      className="relative flex h-screen flex-col overflow-hidden" 
      style={{
        background: 'linear-gradient(180deg, hsl(240 30% 5%) 0%, hsl(220 35% 8%) 100%)'
      }}
    >
      {/* Earth background */}
      <div 
        className="pointer-events-none fixed inset-0 opacity-80" 
        style={{
          backgroundImage: `url(${earthBg})`,
          backgroundPosition: 'center 40%',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed'
        }} 
      />
      
      {/* Main content - scrollable layout for results */}
      <main className="container-unified relative z-10 flex min-h-full flex-col items-center overflow-y-auto py-3">
        <div className="flex w-full flex-col items-center">
          {/* Logo & branding with unified halo */}
          <div 
            className="relative flex animate-fade-in flex-col items-center" 
            style={{ animationDelay: '0ms', animationFillMode: 'both', marginBottom: 'var(--space-1)' }}
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
            <div className="relative flex w-full items-center justify-center" style={{ marginTop: 'var(--space-1)', marginBottom: 'var(--space-1)' }}>
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
            
            {/* Byline - premium luminous styling */}
            <p 
              className="animate-fade-in font-bold uppercase text-center"
              style={{ 
                animationDelay: '150ms', 
                animationFillMode: 'both',
                marginTop: 'var(--space-3)',
                fontSize: 'var(--text-sm)',
                letterSpacing: '0.35em',
                color: 'hsl(174 85% 70%)',
                textShadow: '0 0 15px hsl(174 90% 60% / 0.8), 0 0 30px hsl(174 80% 55% / 0.6), 0 0 50px hsl(174 70% 50% / 0.4), 0 0 70px hsl(174 60% 45% / 0.3)'
              }}
            >
              {t.byLine}
            </p>
          </div>

          {/* Language toggle - compact spacing */}
          <div 
            className="flex w-full justify-center animate-fade-in"
            style={{ animationDelay: '200ms', animationFillMode: 'both', marginBottom: 'var(--space-1)' }}
          >
            <LanguageToggle language={language} onLanguageChange={handleLanguageChange} />
          </div>

          {/* Score gauge - compact spacing with smooth transition */}
          <div 
            className="relative flex justify-center items-center"
            style={{ marginBottom: 'var(--space-1)', minHeight: `${gaugeSize}px` }}
          >
            {/* Loader - shows during analysis */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
                {isImageAnalysis ? (
                  <ScreenshotAnalysisLoader language={language} currentStep={screenshotLoaderStep} />
                ) : (
                  <AnalysisLoader size={gaugeSize} language={language} />
                )}
              </div>
            )}
            
            {/* Score Gauge - shows when not loading */}
            {!isLoading && (
              <div className="animate-scale-in" style={{ animationDuration: '500ms' }}>
                <ScoreGauge score={score} size={gaugeSize} language={language} hasContent={hasFormContent} />
              </div>
            )}
          </div>

          {/* Post-Analysis: CTA buttons - PRO button hidden after PRO analysis */}
          {hasAnyAnalysis && (
            <div className="container-content w-full animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both', marginTop: 'var(--space-5)' }}>
              {/* Action buttons row */}
              <div className="flex items-center justify-center" style={{ gap: 'var(--space-3)' }}>
                {/* Primary CTA - Run another analysis */}
                <button
                  onClick={handleReset}
                  className="btn-unified"
                  style={{
                    background: analysisData?.analysisType === 'pro' 
                      ? 'linear-gradient(135deg, hsl(174 70% 40%) 0%, hsl(174 60% 35%) 100%)'
                      : 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    boxShadow: analysisData?.analysisType === 'pro'
                      ? '0 0 30px hsl(174 60% 45% / 0.5), 0 4px 16px hsl(0 0% 0% / 0.3)'
                      : '0 0 20px hsl(174 60% 45% / 0.3), 0 4px 12px hsl(0 0% 0% / 0.2)'
                  }}
                >
                  {language === 'fr' ? 'Nouvelle analyse' : 'New analysis'}
                </button>
                
                {/* Secondary CTA - Pro Analysis (Hidden after PRO analysis is complete) */}
                {analysisData?.analysisType !== 'pro' && (
                  <button
                    onClick={() => setIsProModalOpen(true)}
                    className="btn-unified group relative overflow-hidden"
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
                      className="relative rounded-md font-black tracking-wider"
                      style={{
                        padding: '2px 6px',
                        fontSize: 'var(--text-xs)',
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

          {/* Unified Analysis Form - hidden during loading and after analysis */}
          {!hasAnyAnalysis && !isLoading && (
            <div 
              className="container-content w-full animate-fade-in"
              style={{ animationDelay: '350ms', animationFillMode: 'both' }}
            >
              <UnifiedAnalysisForm 
                onAnalyzeText={handleAnalyze} 
                onImageReady={(file, preview) => handleImageAnalysis(file, preview, 'standard')}
                isLoading={isLoading} 
                language={language}
                onContentChange={setHasFormContent}
              />
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
              hasImage={isImageAnalysis}
            />
          )}

          {/* Screenshot Evidence Section - show after analysis results (PRO explanation) */}
          {screenshotData && hasAnyAnalysis && !isProLoading && (
            <div className="container-content w-full animate-fade-in" style={{ marginTop: 'var(--space-4)' }}>
              <ScreenshotEvidence
                extractedText={screenshotData.ocr.cleaned_text}
                ocrConfidence={screenshotData.ocr.confidence}
                imageSignals={screenshotData.image_signals}
                onRerunAnalysis={handleRerunAnalysis}
                isRerunning={isRerunning}
                language={language}
                imagePreview={uploadedFile?.preview}
                visualTextMismatch={screenshotData.visual_text_mismatch}
                visualDescription={screenshotData.visual_description}
              />
            </div>
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

        {/* Spacer to push footer down when content is short */}
        <div className="flex-grow" />

        {/* Footer - minimal */}
        <footer className="absolute bottom-4 left-0 right-0 flex flex-col items-center text-center pointer-events-none">
          <div className="text-sm text-white/85 tracking-wide">
            <span 
              className="italic"
              style={{
                color: 'hsl(174 65% 52%)',
                textShadow: '0 0 40px hsl(174 60% 45% / 0.4), 0 0 80px hsl(40 100% 60% / 0.2), 0 2px 20px hsl(30 90% 55% / 0.15)'
              }}
            >Leen</span>
            <span 
              className="font-semibold not-italic" 
              style={{
                color: 'hsl(0 0% 98%)',
                textShadow: '0 0 30px hsl(40 100% 70% / 0.25), 0 2px 15px hsl(30 90% 55% / 0.1)'
              }}
            >Score</span>
          </div>
          <div className="mt-1 text-xs text-white/50 tracking-widest uppercase">
            Built by Sol&Air · Version 1.2 BETA
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
