import { useState, useEffect, useCallback, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/i18n/useLanguage';
import { type SupportedLanguage, type LanguageMode } from '@/i18n/config';
import { LanguageToggle } from '@/components/LanguageToggle';
import { LanguageSuggestionPrompt } from '@/components/LanguageSuggestionPrompt';
import { ScoreGauge } from '@/components/ScoreGauge';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { UnifiedAnalysisForm, UnifiedAnalysisFormHandle } from '@/components/UnifiedAnalysisForm';
import { AnalysisResult } from '@/components/AnalysisResult';
import { AnalysisError } from '@/components/AnalysisError';
import { ProAnalysisLoader } from '@/components/ProAnalysisLoader';
import { ProAnalysisModal } from '@/components/ProAnalysisModal';
import { MissionControlLoader } from '@/components/MissionControlLoader';
import { ScreenshotEvidence } from '@/components/ScreenshotEvidence';
import { 
  HeroSection, 
  MethodologySection, 
  CredibilityScaleSection, 
  AnalyzerSection,
  AnalyzerSectionHandle,
  LandingFooter 
} from '@/components/landing';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import earthBg from '@/assets/earth-cosmic-bg.jpg';

interface AnalysisBreakdown {
  sources: { points: number; reason: string };
  factual: { points: number; reason: string };
  tone: { points: number; reason: string };
  context: { points: number; reason: string };
  transparency: { points: number; reason: string };
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

interface BilingualSummaries {
  en: { summary: string; articleSummary: string } | null;
  fr: { summary: string; articleSummary: string } | null;
}

const Index = () => {
  const isMobile = useIsMobile();
  
  const { 
    language: resolvedLanguage, 
    mode: languageMode, 
    setLanguage: setLanguageMode,
    t: i18nT,
    shouldShowPrompt,
    detectedLanguage,
    handlePromptResponse,
    dismissPrompt
  } = useLanguage();
  
  const language: 'en' | 'fr' = (resolvedLanguage === 'en' || resolvedLanguage === 'fr') 
    ? resolvedLanguage 
    : 'en';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isProLoading, setIsProLoading] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isLoaderExiting, setIsLoaderExiting] = useState(false);
  const [lastAnalyzedContent, setLastAnalyzedContent] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<{ message: string; code: string } | null>(null);
  const lastInputRef = useRef<{ type: 'text' | 'image'; content: string; file?: File; preview?: string } | null>(null);
  const [isImageAnalysis, setIsImageAnalysis] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ file: File; preview: string } | null>(null);
  const [screenshotLoaderStep, setScreenshotLoaderStep] = useState(0);
  const [screenshotData, setScreenshotData] = useState<ScreenshotAnalysisData | null>(null);
  const [isRerunning, setIsRerunning] = useState(false);
  const [hasFormContent, setHasFormContent] = useState(false);
  const [inputHighlight, setInputHighlight] = useState(false);
  const [inputCaptureGlow, setInputCaptureGlow] = useState(false);
  
  const handleChevronCycleComplete = useCallback(() => {
    setInputHighlight(true);
    setTimeout(() => setInputHighlight(false), 300);
  }, []);
  
  const handleTransferStart = useCallback(() => {
    setInputCaptureGlow(true);
    setTimeout(() => setInputCaptureGlow(false), 200);
  }, []);
  
  const formRef = useRef<UnifiedAnalysisFormHandle>(null);
  const analyzerRef = useRef<AnalyzerSectionHandle>(null);
  
  const handleGaugeAnalyze = useCallback(() => {
    formRef.current?.submit();
  }, []);
  
  const [analysisByLanguage, setAnalysisByLanguage] = useState<Record<'en' | 'fr', AnalysisData | null>>({
    en: null,
    fr: null,
  });
  
  const [summariesByLanguage, setSummariesByLanguage] = useState<BilingualSummaries>({
    en: null,
    fr: null,
  });

  const analysisData = analysisByLanguage[language];
  const hasAnyAnalysis = Boolean(analysisByLanguage.en || analysisByLanguage.fr || screenshotData?.analysis);
  const score = (analysisByLanguage.en ?? analysisByLanguage.fr)?.score 
    ?? screenshotData?.analysis?.score 
    ?? null;
  
  const currentSummaries = summariesByLanguage[language];
  const displayArticleSummary = currentSummaries?.articleSummary || null;

  const runBilingualTextAnalysis = async ({
    content,
    analysisType,
  }: {
    content: string;
    analysisType?: 'standard' | 'pro';
  }): Promise<{ en: AnalysisData; fr: AnalysisData }> => {
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

  const handleReset = useCallback(() => {
    setAnalysisByLanguage({ en: null, fr: null });
    setSummariesByLanguage({ en: null, fr: null });
    setLastAnalyzedContent('');
    setUploadedFile(null);
    setScreenshotData(null);
    setScreenshotLoaderStep(0);
    setIsImageAnalysis(false);
    setAnalysisError(null);
    lastInputRef.current = null;
  }, []);
  
  const handleRetry = useCallback(() => {
    if (!lastInputRef.current) return;
    
    setAnalysisError(null);
    
    if (lastInputRef.current.type === 'text') {
      handleAnalyze(lastInputRef.current.content);
    } else if (lastInputRef.current.file && lastInputRef.current.preview) {
      handleImageAnalysis(lastInputRef.current.file, lastInputRef.current.preview);
    }
  }, []);

  const handleAnalyze = useCallback(async (input: string) => {
    const errorAnalysis = i18nT('index.errorAnalysis');

    lastInputRef.current = { type: 'text', content: input };
    
    setIsLoading(true);
    setIsImageAnalysis(false);
    setAnalysisByLanguage({ en: null, fr: null });
    setSummariesByLanguage({ en: null, fr: null });
    setLastAnalyzedContent(input);
    setAnalysisError(null);

    try {
      const { en, fr } = await runBilingualTextAnalysis({ content: input, analysisType: 'standard' });

      setSummariesByLanguage({
        en: { summary: en.summary || '', articleSummary: en.articleSummary || '' },
        fr: { summary: fr.summary || '', articleSummary: fr.articleSummary || '' },
      });

      setAnalysisByLanguage({ en, fr });
    } catch (err) {
      console.error('Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : errorAnalysis;
      const errorCode = `ERR_${Date.now().toString(36).toUpperCase()}`;
      setAnalysisError({ message: errorMessage, code: errorCode });
      toast.error(errorAnalysis);
    } finally {
      setIsLoaderExiting(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsLoaderExiting(false);
      }, 500);
    }
  }, [language, runBilingualTextAnalysis]);

  const handleImageAnalysis = useCallback(async (
    file: File, 
    preview: string, 
    analysisType: 'standard' | 'pro' = 'standard',
    contextText?: string
  ) => {
    const errorAnalysis = i18nT('index.errorAnalysis');
    
    lastInputRef.current = { type: 'image', content: preview, file, preview };
    
    setUploadedFile({ file, preview });
    setIsLoading(true);
    setIsImageAnalysis(true);
    setAnalysisByLanguage({ en: null, fr: null });
    setSummariesByLanguage({ en: null, fr: null });
    setScreenshotLoaderStep(0);
    setAnalysisError(null);
    
    if (contextText) {
      setLastAnalyzedContent(contextText);
    }

    try {
      setScreenshotLoaderStep(0);
      await new Promise(r => setTimeout(r, 500));
      
      setScreenshotLoaderStep(1);
      await new Promise(r => setTimeout(r, 300));
      
      const result = await supabase.functions.invoke('analyze-image', {
        body: { 
          imageData: preview, 
          language: language,
          analysisType: analysisType,
          contextText: contextText || undefined
        },
      });

      setScreenshotLoaderStep(2);

      if (result.error) {
        console.error('Screenshot analysis error:', result.error);
        const errorCode = `IMG_${Date.now().toString(36).toUpperCase()}`;
        setAnalysisError({ message: errorAnalysis, code: errorCode });
        return;
      }

      if (result.data?.error) {
        console.error('API error:', result.data.error);
        const errorCode = `API_${Date.now().toString(36).toUpperCase()}`;
        setAnalysisError({ message: result.data.error, code: errorCode });
        return;
      }

      const data = result.data;
      
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
      setLastAnalyzedContent(data.ocr.cleaned_text);

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

          setScreenshotData({
            ...processedData,
            analysis: language === 'fr' ? fr : en,
          });
        } catch (e) {
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

      if (data.warning) {
        toast.warning(data.warning);
      }

    } catch (err) {
      console.error('Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : errorAnalysis;
      const errorCode = `ERR_${Date.now().toString(36).toUpperCase()}`;
      setAnalysisError({ message: errorMessage, code: errorCode });
      toast.error(errorAnalysis);
    } finally {
      setIsLoaderExiting(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsLoaderExiting(false);
      }, 500);
    }
  }, [language, runBilingualTextAnalysis]);

  const handleUnifiedAnalyze = useCallback(async (
    text: string, 
    image: { file: File; preview: string } | null
  ) => {
    if (image) {
      await handleImageAnalysis(image.file, image.preview, 'standard', text);
    } else if (text) {
      await handleAnalyze(text);
    }
  }, [handleImageAnalysis, handleAnalyze]);

  const handleRerunAnalysis = async (editedText: string) => {
    setIsRerunning(true);
    try {
      await handleAnalyze(editedText);
      setLastAnalyzedContent(editedText);
    } finally {
      setIsRerunning(false);
    }
  };

  const handleProAnalysis = async () => {
    if (!lastAnalyzedContent) return;
    
    const errorAnalysis = i18nT('index.errorAnalysis');
    setIsProLoading(true);

    try {
      const { en, fr } = await runBilingualTextAnalysis({ content: lastAnalyzedContent, analysisType: 'pro' });

      setSummariesByLanguage({
        en: { summary: en.summary || '', articleSummary: en.articleSummary || '' },
        fr: { summary: fr.summary || '', articleSummary: fr.articleSummary || '' },
      });

      setAnalysisByLanguage({ en, fr });
      setIsProModalOpen(false);
      toast.success(i18nT('pro.analysisComplete'));
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error(errorAnalysis);
    } finally {
      setIsProLoading(false);
    }
  };

  const handleLanguageChange = (mode: LanguageMode) => {
    setLanguageMode(mode);
  };

  const gaugeSize = isMobile ? 180 : 220;

  return (
    <div 
      className="relative flex min-h-screen flex-col overflow-x-hidden" 
      style={{
        background: 'linear-gradient(180deg, hsl(240 30% 5%) 0%, hsl(220 35% 8%) 100%)'
      }}
    >
      {/* Earth background */}
      <div 
        className="pointer-events-none fixed inset-0 transition-all duration-500 ease-out" 
        style={{
          backgroundImage: `url(${earthBg})`,
          backgroundPosition: 'center 40%',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          opacity: hasFormContent && !isLoading && !hasAnyAnalysis ? 0.72 : 0.80,
          filter: hasFormContent && !isLoading && !hasAnyAnalysis ? 'brightness(0.94)' : 'brightness(1)',
        }} 
      />
      
      {/* Main content */}
      <main className="container-unified relative z-10 flex flex-1 flex-col items-center overflow-x-hidden py-6 md:py-8" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex w-full max-w-full flex-col items-center overflow-hidden">
          
          {/* Language toggle - top right corner positioning */}
          <div className="absolute top-4 right-4 z-20">
            <LanguageToggle 
              mode={languageMode} 
              language={resolvedLanguage} 
              onLanguageChange={handleLanguageChange} 
            />
          </div>
          
          {/* LANDING VIEW: Show when no analysis is in progress or complete */}
          {!hasAnyAnalysis && !isLoading && !analysisError && (
            <>
              {/* Hero Section */}
              <HeroSection />
              
              {/* Methodology Section */}
              <MethodologySection />
              
              {/* Credibility Scale */}
              <CredibilityScaleSection />
              
              {/* Analyzer Form Section */}
              <AnalyzerSection
                ref={analyzerRef}
                onAnalyze={handleUnifiedAnalyze}
                isLoading={isLoading}
                onContentChange={setHasFormContent}
                highlightInput={inputHighlight}
                captureGlow={inputCaptureGlow}
              />
              
              {/* Landing Footer */}
              <LandingFooter />
            </>
          )}
          
          {/* LOADING VIEW */}
          {isLoading && (
            <div 
              className={`flex flex-col items-center justify-center min-h-[60vh] transition-all duration-500 ease-out ${
                isLoaderExiting 
                  ? 'opacity-0 translate-y-8 scale-95' 
                  : 'opacity-100 translate-y-0 scale-100 animate-fade-in'
              }`}
            >
              {isImageAnalysis ? (
                <MissionControlLoader />
              ) : (
                <AnalysisLoader size={gaugeSize} />
              )}
            </div>
          )}
          
          {/* ERROR VIEW */}
          {analysisError && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <AnalysisError
                errorMessage={analysisError.message}
                errorCode={analysisError.code}
                onRetry={handleRetry}
                onNewAnalysis={handleReset}
              />
            </div>
          )}
          
          {/* RESULTS VIEW: Show after analysis complete */}
          {hasAnyAnalysis && !isLoading && !analysisError && (
            <>
              {/* Score Gauge with result */}
              <div className="flex flex-col items-center animate-fade-in" style={{ marginTop: 'clamp(1rem, 3vh, 2rem)' }}>
                <ScoreGauge 
                  score={score} 
                  size={gaugeSize} 
                  hasContent={false}
                  isLoading={false}
                />
              </div>
              
              {/* Action buttons */}
              <div className="container-content w-full animate-fade-in flex justify-center gap-3" style={{ marginTop: 'var(--space-5)' }}>
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
                  {i18nT('index.newAnalysis')}
                </button>
                
                {analysisData?.analysisType !== 'pro' && (
                  <button
                    onClick={() => setIsProModalOpen(true)}
                    className="btn-unified group relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, hsl(200 80% 50%) 0%, hsl(174 70% 45%) 50%, hsl(280 60% 55%) 100%)',
                      boxShadow: '0 0 25px hsl(200 80% 55% / 0.5), 0 0 50px hsl(174 70% 45% / 0.3), 0 4px 20px hsl(0 0% 0% / 0.3)',
                    }}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                        animation: 'shine 2s infinite',
                      }}
                    />
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
                      {i18nT('pro.launchAnalysis')}
                    </span>
                  </button>
                )}
              </div>
              
              {/* PRO Analysis loading */}
              {isProLoading && (
                <ProAnalysisLoader language={language} />
              )}
              
              {/* Analysis result */}
              {analysisData && !isProLoading && (
                <AnalysisResult 
                  data={analysisData} 
                  language={language} 
                  articleSummary={displayArticleSummary}
                  hasImage={isImageAnalysis}
                />
              )}
              
              {/* Screenshot Evidence */}
              {screenshotData && !isProLoading && (
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
              
              {/* Results footer */}
              <footer 
                className="relative mt-auto flex flex-col items-center text-center py-6 animate-fade-in"
                style={{ animationDelay: '400ms', opacity: 0.75 }}
              >
                <p 
                  className="font-semibold"
                  style={{ 
                    fontSize: 'clamp(0.85rem, 0.8rem + 0.2vw, 1rem)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  <span className="italic" style={{ color: 'hsl(174 65% 52%)' }}>Leen</span>
                  <span className="not-italic" style={{ color: 'hsl(0 0% 98%)' }}>Score</span>
                </p>
                <p style={{ fontSize: 'clamp(0.65rem, 0.6rem + 0.1vw, 0.75rem)', color: 'hsl(0 0% 60%)' }}>
                  {i18nT('footer.developedBy')}{' '}
                  <span style={{ color: 'hsl(174 60% 55%)' }}>Sol&Air</span>
                </p>
              </footer>
            </>
          )}
        </div>

        <div className="flex-grow" />
      </main>
      
      {/* PRO Analysis Modal */}
      <ProAnalysisModal 
        open={isProModalOpen} 
        onOpenChange={setIsProModalOpen} 
        language={language}
        onLaunchPro={handleProAnalysis}
        isLoading={isProLoading}
      />
      
      {/* Language suggestion prompt */}
      {shouldShowPrompt && detectedLanguage && (
        <LanguageSuggestionPrompt
          detectedLanguage={detectedLanguage}
          currentLanguage={language}
          onAccept={() => handlePromptResponse(true)}
          onDismiss={() => handlePromptResponse(false)}
        />
      )}
    </div>
  );
};

export default Index;
