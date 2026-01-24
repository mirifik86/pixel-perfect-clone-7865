import { useState, useEffect, useCallback, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/i18n/useLanguage';
import { type SupportedLanguage, type LanguageMode } from '@/i18n/config';
import { LeenScoreLogo } from '@/components/LeenScoreLogo';
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

// REMOVED: Local translations object - now using i18n system

const Index = () => {
  const isMobile = useIsMobile();
  
  // Use the global i18n system
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
  
  // Map resolved language to 'en' | 'fr' for backward compatibility with analysis
  // (analysis API only supports en/fr currently)
  const language: 'en' | 'fr' = (resolvedLanguage === 'en' || resolvedLanguage === 'fr') 
    ? resolvedLanguage 
    : 'en'; // fallback to 'en' for other languages like 'ja'
  
  const [isLoading, setIsLoading] = useState(false);
  const [isProLoading, setIsProLoading] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isLoaderExiting, setIsLoaderExiting] = useState(false); // Track loader exit animation
  const [lastAnalyzedContent, setLastAnalyzedContent] = useState<string>('');
  
  // Error state for robust error handling (no redirect to home)
  const [analysisError, setAnalysisError] = useState<{ message: string; code: string } | null>(null);
  
  // Track the last input for retry functionality
  const lastInputRef = useRef<{ type: 'text' | 'image'; content: string; file?: File; preview?: string } | null>(null);
  
  // Track if current analysis is from an image (for loader display)
  const [isImageAnalysis, setIsImageAnalysis] = useState(false);
  
  // Screenshot state
  const [uploadedFile, setUploadedFile] = useState<{ file: File; preview: string } | null>(null);
  const [screenshotLoaderStep, setScreenshotLoaderStep] = useState(0);
  const [screenshotData, setScreenshotData] = useState<ScreenshotAnalysisData | null>(null);
  const [isRerunning, setIsRerunning] = useState(false);
  const [hasFormContent, setHasFormContent] = useState(false);
  
  // Ref to the form for triggering submit from ScoreGauge
  const formRef = useRef<UnifiedAnalysisFormHandle>(null);
  
  // Handler for ScoreGauge to trigger form submission
  const handleGaugeAnalyze = useCallback(() => {
    formRef.current?.submit();
  }, []);
  
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
  // Use i18n for UI text
  const getT = (key: string) => i18nT(key);
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
  
  // Retry the last analysis (for error recovery)
  const handleRetry = useCallback(() => {
    if (!lastInputRef.current) return;
    
    setAnalysisError(null);
    
    if (lastInputRef.current.type === 'text') {
      handleAnalyze(lastInputRef.current.content);
    } else if (lastInputRef.current.file && lastInputRef.current.preview) {
      handleImageAnalysis(lastInputRef.current.file, lastInputRef.current.preview);
    }
  }, []);

  // Analyze in BOTH languages simultaneously - no API calls needed on language toggle
  const handleAnalyze = useCallback(async (input: string) => {
    const errorAnalysis = i18nT('index.errorAnalysis');

    // Store input for retry
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
      // Stay on page, show error panel instead of toast only
      const errorMessage = err instanceof Error ? err.message : errorAnalysis;
      const errorCode = `ERR_${Date.now().toString(36).toUpperCase()}`;
      setAnalysisError({ message: errorMessage, code: errorCode });
      toast.error(errorAnalysis);
    } finally {
      // Trigger exit animation before hiding loader
      setIsLoaderExiting(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsLoaderExiting(false);
      }, 500); // Match exit animation duration
    }
  }, [language, runBilingualTextAnalysis]);

  // Screenshot Analysis Handler - now called directly when image is ready
  const handleImageAnalysis = useCallback(async (file: File, preview: string, analysisType: 'standard' | 'pro' = 'standard') => {
    const errorAnalysis = i18nT('index.errorAnalysis');
    
    // Store input for retry
    lastInputRef.current = { type: 'image', content: preview, file, preview };
    
    setUploadedFile({ file, preview });
    setIsLoading(true);
    setIsImageAnalysis(true);
    setAnalysisByLanguage({ en: null, fr: null });
    setSummariesByLanguage({ en: null, fr: null });
    setScreenshotLoaderStep(0);
    setAnalysisError(null);

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
      // Stay on page with error panel
      const errorMessage = err instanceof Error ? err.message : errorAnalysis;
      const errorCode = `ERR_${Date.now().toString(36).toUpperCase()}`;
      setAnalysisError({ message: errorMessage, code: errorCode });
      toast.error(errorAnalysis);
    } finally {
      // Trigger exit animation before hiding loader
      setIsLoaderExiting(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsLoaderExiting(false);
      }, 500); // Match exit animation duration
    }
  }, [language, runBilingualTextAnalysis]);

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

  // INSTANT language switch - uses global i18n system
  const handleLanguageChange = (mode: LanguageMode) => {
    setLanguageMode(mode);
  };

  // Premium gauge size - larger and more imposing
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
        className="pointer-events-none fixed inset-0 opacity-80" 
        style={{
          backgroundImage: `url(${earthBg})`,
          backgroundPosition: 'center 40%',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed'
        }} 
      />
      
      {/* Main content - MOBILE SCROLL FIX: use min-h-screen + overflow-y-auto on main, not h-screen + overflow-hidden on wrapper */}
      <main className="container-unified relative z-10 flex flex-1 flex-col items-center overflow-x-hidden py-2 md:py-3" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex w-full max-w-full flex-col items-center overflow-hidden">
          {/* Logo & branding with unified halo - MOBILE OPTIMIZED */}
          <div 
            className="relative flex animate-fade-in flex-col items-center overflow-visible" 
            style={{ animationDelay: '0ms', animationFillMode: 'both', marginBottom: '0' }}
          >
            {/* Unified halo effect behind logo + subtitles - constrained */}
            <div 
              className="pointer-events-none absolute inset-0"
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
            
            {/* Byline - clean, compact, premium */}
            <p 
              className="animate-fade-in font-semibold uppercase text-center"
              style={{ 
                animationDelay: '150ms', 
                animationFillMode: 'both',
                marginTop: 'var(--space-2)',
                fontSize: 'clamp(0.65rem, 0.6rem + 0.3vw, 0.8rem)',
                letterSpacing: '0.3em',
                color: 'hsl(174 85% 68%)',
                textShadow: '0 0 15px hsl(174 90% 60% / 0.7), 0 0 30px hsl(174 80% 55% / 0.5)'
              }}
            >
              {i18nT('hero.byLine')}
            </p>
          </div>

          {/* Premium separator between header and language toggle */}
          <div 
            className="relative w-full flex items-center justify-center"
            style={{ 
              marginTop: 'clamp(1rem, 3vh, 1.75rem)',
              marginBottom: 'clamp(0.75rem, 2vh, 1.25rem)'
            }}
          >
            {/* Subtle horizontal line with fade */}
            <div 
              className="absolute h-px"
              style={{
                width: 'clamp(120px, 25vw, 200px)',
                background: 'linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.06) 30%, hsl(0 0% 100% / 0.06) 70%, transparent 100%)'
              }}
            />
          </div>

          {/* Language toggle - centered with premium spacing */}
          <div 
            className="flex w-full justify-center animate-fade-in"
            style={{ animationDelay: '200ms', animationFillMode: 'both' }}
          >
            <LanguageToggle 
              mode={languageMode} 
              language={resolvedLanguage} 
              onLanguageChange={handleLanguageChange} 
            />
          </div>

          {/* Premium separator between language toggle and gauge */}
          <div 
            className="relative w-full flex items-center justify-center"
            style={{ 
              marginTop: 'clamp(0.75rem, 2vh, 1.25rem)',
              marginBottom: 'clamp(0.5rem, 1.5vh, 1rem)'
            }}
          >
            {/* Subtle horizontal line with fade */}
            <div 
              className="absolute h-px"
              style={{
                width: 'clamp(80px, 15vw, 140px)',
                background: 'linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.04) 30%, hsl(0 0% 100% / 0.04) 70%, transparent 100%)'
              }}
            />
          </div>

          {/* Score gauge - MOBILE: reduced height to keep button above fold */}
          <div 
            className="relative flex justify-center items-center mb-2 md:mb-6"
            style={{ 
              minHeight: isLoading && isImageAnalysis 
                ? 'clamp(280px, 45vh, 400px)' // MOBILE: smaller container
                : `clamp(${gaugeSize}px, 18vh, ${gaugeSize + 40}px)` // MOBILE: dynamic height
            }}
          >
            {/* Loader - shows during analysis with smooth exit */}
            {isLoading && (
              <div 
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
                  isLoaderExiting 
                    ? 'opacity-0 translate-y-8 scale-95' 
                    : 'opacity-100 translate-y-0 scale-100 animate-fade-in'
                }`}
                style={{
                  // Push Mission Control loader down for clean visual separation
                  paddingTop: isImageAnalysis ? 'clamp(24px, 6vh, 48px)' : '0'
                }}
              >
                {isImageAnalysis ? (
                  <MissionControlLoader />
                ) : (
                  <AnalysisLoader size={gaugeSize} />
                )}
              </div>
            )}
            
            {/* Score Gauge - shows when not loading */}
            {!isLoading && (
              <div className="animate-scale-in" style={{ animationDuration: '500ms' }}>
                <ScoreGauge 
                  score={score} 
                  size={gaugeSize} 
                  hasContent={hasFormContent}
                  onAnalyze={handleGaugeAnalyze}
                  isLoading={isLoading}
                />
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
                  {i18nT('index.newAnalysis')}
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
                      {i18nT('pro.launchAnalysis')}
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

          {/* Error Panel - shown when analysis fails (stays on page, no redirect) */}
          {analysisError && !isLoading && (
            <AnalysisError
              errorMessage={analysisError.message}
              errorCode={analysisError.code}
              onRetry={handleRetry}
              onNewAnalysis={handleReset}
            />
          )}

          {/* Premium arrow indicators - between gauge and form */}
          {!hasAnyAnalysis && !isLoading && !analysisError && (
            <div 
              className="relative flex items-center justify-center"
              style={{ 
                marginTop: 'var(--space-2)',
                marginBottom: 'var(--space-3)',
                height: '40px',
                width: '60px',
              }}
            >
              {/* Arrow pointing DOWN (to input) - shown when NO content */}
              <div 
                className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                  !hasFormContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                }`}
                style={{
                  animation: !hasFormContent ? 'arrow-float 2s ease-in-out infinite' : 'none',
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Outer glow effect */}
                <div 
                  className="absolute"
                  style={{
                    width: '60px',
                    height: '40px',
                    background: 'radial-gradient(ellipse at center, hsl(174 70% 55% / 0.4), transparent 70%)',
                    filter: 'blur(12px)',
                    animation: 'arrow-glow 2s ease-in-out infinite',
                  }}
                />
                
                {/* Double chevron arrow pointing DOWN */}
                <svg 
                  width="28"
                  height="20"
                  viewBox="0 0 28 20" 
                  fill="none"
                  className="relative"
                >
                  <path 
                    d="M4 3L14 11L24 3" 
                    stroke="url(#arrowGradientDown)" 
                    strokeWidth="2.5"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{
                      filter: 'drop-shadow(0 0 6px hsl(174 70% 55% / 0.8))',
                    }}
                  />
                  <path 
                    d="M4 10L14 18L24 10" 
                    stroke="url(#arrowGradientDown)" 
                    strokeWidth="2"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    opacity="0.5"
                    style={{
                      filter: 'drop-shadow(0 0 4px hsl(174 70% 55% / 0.5))',
                    }}
                  />
                  <defs>
                    <linearGradient id="arrowGradientDown" x1="14" y1="3" x2="14" y2="18" gradientUnits="userSpaceOnUse">
                      <stop stopColor="hsl(174 80% 70%)" />
                      <stop offset="1" stopColor="hsl(174 60% 50%)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Arrow pointing UP (to Analyze button) - shown when HAS content */}
              <div 
                className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                  hasFormContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                }`}
                style={{
                  animation: hasFormContent ? 'arrow-float-up 2s ease-in-out infinite' : 'none',
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Outer glow effect - intensified for active state */}
                <div 
                  className="absolute"
                  style={{
                    width: '70px',
                    height: '50px',
                    background: 'radial-gradient(ellipse at center, hsl(174 75% 55% / 0.5), transparent 70%)',
                    filter: 'blur(14px)',
                    animation: 'arrow-glow-intense 1.5s ease-in-out infinite',
                  }}
                />
                
                {/* Double chevron arrow pointing UP */}
                <svg 
                  width="28"
                  height="20"
                  viewBox="0 0 28 20" 
                  fill="none"
                  className="relative"
                  style={{ transform: 'rotate(180deg)' }}
                >
                  <path 
                    d="M4 3L14 11L24 3" 
                    stroke="url(#arrowGradientUp)" 
                    strokeWidth="2.5"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{
                      filter: 'drop-shadow(0 0 8px hsl(174 75% 60% / 0.9))',
                    }}
                  />
                  <path 
                    d="M4 10L14 18L24 10" 
                    stroke="url(#arrowGradientUp)" 
                    strokeWidth="2"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    opacity="0.6"
                    style={{
                      filter: 'drop-shadow(0 0 6px hsl(174 75% 60% / 0.7))',
                    }}
                  />
                  <defs>
                    <linearGradient id="arrowGradientUp" x1="14" y1="3" x2="14" y2="18" gradientUnits="userSpaceOnUse">
                      <stop stopColor="hsl(174 85% 75%)" />
                      <stop offset="1" stopColor="hsl(174 70% 55%)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          )}

          {/* Unified Analysis Form - hidden during loading, after analysis, or during error */}
          {!hasAnyAnalysis && !isLoading && !analysisError && (
            <div 
              className="container-content w-full animate-fade-in"
              style={{ animationDelay: '350ms', animationFillMode: 'both' }}
            >
              <UnifiedAnalysisForm 
                ref={formRef}
                onAnalyzeText={handleAnalyze} 
                onImageReady={(file, preview) => handleImageAnalysis(file, preview, 'standard')}
                isLoading={isLoading} 
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

        {/* Footer - premium signature */}
        <footer className="relative mt-auto flex flex-col items-center text-center py-5">
          {/* Subtle premium separator */}
          <div 
            className="mb-4"
            style={{ 
              width: '60px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, hsl(174 60% 50% / 0.3) 50%, transparent 100%)',
            }}
          />
          
          {/* LeenScore brand - same style as main title */}
          <div 
            className="brand-text tracking-tight"
            style={{ 
              fontSize: 'clamp(1.3rem, 1.2rem + 0.5vw, 1.6rem)',
              letterSpacing: '-0.03em'
            }}
          >
            <span 
              className="italic"
              style={{
                color: 'hsl(174 65% 52%)',
                textShadow: '0 0 30px hsl(174 60% 45% / 0.5), 0 0 60px hsl(40 100% 60% / 0.2)'
              }}
            >Leen</span>
            <span 
              className="font-semibold not-italic" 
              style={{
                color: 'hsl(0 0% 98%)',
                textShadow: '0 0 25px hsl(40 100% 70% / 0.25), 0 2px 12px hsl(30 90% 55% / 0.1)'
              }}
            >Score</span>
          </div>
          
          {/* Signature premium */}
          <p 
            className="mt-3 flex items-center gap-1.5"
            style={{ 
              fontSize: '0.72rem',
              letterSpacing: '0.06em',
              color: 'hsl(0 0% 55%)',
            }}
          >
            <span style={{ opacity: 0.8 }}>{i18nT('index.developedBy')}</span>
            <span 
              className="transition-all duration-300 relative inline-block"
              style={{ 
                color: 'hsl(174 65% 52%)',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textShadow: '0 0 12px hsl(174 60% 45% / 0.35), 0 0 24px hsl(174 60% 45% / 0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'hsl(174 65% 60%)';
                e.currentTarget.style.textShadow = '0 0 16px hsl(174 60% 50% / 0.5), 0 0 32px hsl(174 60% 45% / 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'hsl(174 65% 52%)';
                e.currentTarget.style.textShadow = '0 0 12px hsl(174 60% 45% / 0.35), 0 0 24px hsl(174 60% 45% / 0.15)';
              }}
            >
              Sol&Air
            </span>
          </p>
          
          {/* Version */}
          <div 
            className="mt-1 uppercase"
            style={{ 
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              color: 'hsl(0 0% 45%)'
            }}
          >
            {i18nT('index.version')}
          </div>
        </footer>
      </main>
      
      {/* Language suggestion prompt - shows once for non-EN/FR detected languages */}
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
