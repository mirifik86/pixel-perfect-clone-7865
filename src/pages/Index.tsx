import { useState, useEffect, useCallback, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/i18n/useLanguage';
import { type SupportedLanguage, type LanguageMode } from '@/i18n/config';
import { LeenScoreLogo, ValueProposition } from '@/components/LeenScoreLogo';
import { LanguageToggle } from '@/components/LanguageToggle';
import { LanguageSuggestionPrompt } from '@/components/LanguageSuggestionPrompt';
import { ScoreGauge } from '@/components/ScoreGauge';

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
  const [inputHighlight, setInputHighlight] = useState(false);
  const [inputCaptureGlow, setInputCaptureGlow] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  
  // Handle chevron cycle complete - trigger input highlight (idle state beam impact)
  const handleChevronCycleComplete = useCallback(() => {
    setInputHighlight(true);
    setTimeout(() => setInputHighlight(false), 300);
  }, []);
  
  // Handle transfer start - trigger input capture glow (idle→ready transition)
  const handleTransferStart = useCallback(() => {
    setInputCaptureGlow(true);
    setTimeout(() => setInputCaptureGlow(false), 200);
  }, []);
  
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

  // Sync screenshotData.analysis with the current UI language (no API calls)
  useEffect(() => {
    const targetAnalysis = analysisByLanguage[language];
    if (screenshotData && targetAnalysis && screenshotData.analysis !== targetAnalysis) {
      setScreenshotData(prev => prev ? { ...prev, analysis: targetAnalysis } : null);
    }
  }, [language, analysisByLanguage, screenshotData]);

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
    setHasFormContent(false);
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
  // contextText: optional text provided alongside the image for multimodal analysis
  const handleImageAnalysis = useCallback(async (
    file: File, 
    preview: string, 
    analysisType: 'standard' | 'pro' = 'standard',
    contextText?: string
  ) => {
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
    
    // Store context text if provided
    if (contextText) {
      setLastAnalyzedContent(contextText);
    }

    try {
      // Step 1: OCR
      setScreenshotLoaderStep(0);
      await new Promise(r => setTimeout(r, 500)); // Brief delay for visual feedback
      
      // Step 2: Image Signals
      setScreenshotLoaderStep(1);
      await new Promise(r => setTimeout(r, 300));
      
      // Call the analyze-image endpoint with optional context text
      const result = await supabase.functions.invoke('analyze-image', {
        body: { 
          imageData: preview, 
          language: language,
          analysisType: analysisType,
          contextText: contextText || undefined
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

      // If the image endpoint already returned a full PRO analysis, skip the second text analysis call
      // and just use the provided analysis directly (avoids double analysis).
      if (data.analysis && data.analysis.analysisType === 'pro') {
        // PRO analysis already complete - store bilingual summaries from this analysis
        // Note: image endpoint returns analysis in the requested language, so we store it accordingly
        setSummariesByLanguage({
          en: language === 'en' ? { summary: data.analysis.summary || '', articleSummary: data.analysis.articleSummary || '' } : null,
          fr: language === 'fr' ? { summary: data.analysis.summary || '', articleSummary: data.analysis.articleSummary || '' } : null,
        });
        setAnalysisByLanguage({
          en: language === 'en' ? data.analysis : null,
          fr: language === 'fr' ? data.analysis : null,
        });
      } else if (data?.ocr?.cleaned_text) {
        // If OCR extracted text, run a single master analysis (EN) then translate (FR).
        // This keeps ALL sections (Explication PRO, détails, corroboration, etc.) coherent across the FR/EN toggle.
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

  // Input validation - checks if text appears to be meaningful content
  const isValidInput = useCallback((text: string): boolean => {
    const trimmed = text.trim();
    
    // Minimum length check (at least 10 characters for meaningful content)
    if (trimmed.length < 10) return false;
    
    // Check for random character patterns (no vowels or too many consecutive consonants)
    const vowelPattern = /[aeiouàâäéèêëïîôùûüœæ]/i;
    const hasVowels = vowelPattern.test(trimmed);
    if (!hasVowels) return false;
    
    // Check for word-like patterns (at least 2 words with 2+ characters each)
    const words = trimmed.split(/\s+/).filter(w => w.length >= 2);
    if (words.length < 2) return false;
    
    // Check for excessive special characters or numbers only
    const alphaRatio = (trimmed.match(/[a-zA-ZàâäéèêëïîôùûüœæçÀÂÄÉÈÊËÏÎÔÙÛÜŒÆÇ]/g) || []).length / trimmed.length;
    if (alphaRatio < 0.5) return false;
    
    // Check for repetitive characters (like "aaaaaaa" or "asdfasdf")
    const repetitivePattern = /(.)\1{4,}/;
    if (repetitivePattern.test(trimmed)) return false;
    
    return true;
  }, []);

  // Unified analyze handler - supports text only, image only, or both (multimodal)
  const handleUnifiedAnalyze = useCallback(async (
    text: string, 
    image: { file: File; preview: string } | null
  ) => {
    // Clear any previous validation message
    setValidationMessage(null);
    
    // If we have an image, use image analysis (which includes text context if available)
    if (image) {
      await handleImageAnalysis(image.file, image.preview, 'standard', text);
    } else if (text) {
      // Validate text input before analysis
      if (!isValidInput(text)) {
        setValidationMessage(i18nT('form.validationError'));
        return;
      }
      // Text-only analysis
      await handleAnalyze(text);
    }
  }, [handleImageAnalysis, handleAnalyze, isValidInput, i18nT]);
  
  // Clear validation message when user types
  const handleClearValidation = useCallback(() => {
    setValidationMessage(null);
  }, []);

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
      {/* Earth background - dims when ready for action */}
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
      
      {/* Main content - MOBILE SCROLL FIX: use min-h-screen + overflow-y-auto on main, not h-screen + overflow-hidden on wrapper */}
      <main className="container-unified relative z-10 flex flex-1 flex-col items-center overflow-x-hidden py-2 md:py-3" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex w-full max-w-full flex-col items-center overflow-hidden">
          {/* Logo & branding - CLEAN HIERARCHY */}
          <div 
            className="relative flex animate-fade-in flex-col items-center overflow-visible" 
            style={{ animationDelay: '0ms', animationFillMode: 'both', marginBottom: '0' }}
          >
            {/* Unified halo effect behind logo */}
            <div 
              className="pointer-events-none absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 40%, hsl(174 60% 45% / 0.15) 0%, transparent 70%)',
                filter: 'blur(20px)'
              }}
            />
            
            <LeenScoreLogo />
          </div>

          {/* Value proposition + Language toggle - inverted order */}
          <div style={{ marginTop: 'clamp(0.5rem, 1.5vh, 1rem)', marginBottom: 'clamp(0.5rem, 1.5vh, 1rem)' }}>
            <ValueProposition>
              <LanguageToggle 
                mode={languageMode} 
                language={resolvedLanguage} 
                onLanguageChange={handleLanguageChange} 
              />
            </ValueProposition>
          </div>

          {/* Score gauge - MOBILE: reduced height to keep button above fold */}
          <div 
            className="relative flex justify-center items-center mb-2 md:mb-6"
            style={{ 
              minHeight: isLoading && isImageAnalysis 
                ? 'clamp(280px, 45vh, 400px)' // MOBILE: larger container for image loader
                : `clamp(${gaugeSize}px, 18vh, ${gaugeSize + 40}px)` // MOBILE: dynamic height
            }}
          >
            {/* External Loader - ONLY for image analysis (MissionControlLoader) */}
            {isLoading && isImageAnalysis && (
              <div 
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
                  isLoaderExiting 
                    ? 'opacity-0 translate-y-8 scale-95' 
                    : 'opacity-100 translate-y-0 scale-100 animate-fade-in'
                }`}
                style={{
                  // Push Mission Control loader down for clean visual separation
                  paddingTop: 'clamp(24px, 6vh, 48px)'
                }}
              >
                <MissionControlLoader />
              </div>
            )}
            
            {/* Score Gauge - ALWAYS visible, includes in-gauge loader for text analysis */}
            {(!isLoading || !isImageAnalysis) && (
              <div 
                className={`relative ${!isLoading ? 'animate-scale-in' : ''}`} 
                style={{ animationDuration: '500ms' }}
              >
                {/* Ready state framing halo - subtle teal ring around gauge */}
                {hasFormContent && !hasAnyAnalysis && !isLoading && (
                  <div 
                    className="absolute pointer-events-none rounded-full animate-fade-in"
                    style={{
                      inset: -12,
                      border: '1px solid hsl(174 50% 55% / 0.15)',
                      boxShadow: '0 0 30px hsl(174 55% 50% / 0.08), inset 0 0 20px hsl(174 50% 50% / 0.05)',
                      animationDuration: '350ms',
                    }}
                  />
                )}
                <ScoreGauge 
                  score={score} 
                  size={gaugeSize} 
                  hasContent={hasFormContent}
                  onAnalyze={handleGaugeAnalyze}
                  isLoading={isLoading && !isImageAnalysis}
                  onChevronCycleComplete={handleChevronCycleComplete}
                  onTransferStart={handleTransferStart}
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

          {/* Minimal separator between gauge and form */}
          {!hasAnyAnalysis && !isLoading && !analysisError && (
            <div 
              className="flex items-center justify-center"
              style={{ 
                marginTop: 'var(--space-3)',
                marginBottom: 'var(--space-3)',
                height: '1px',
                width: '60px',
              }}
            >
              <div 
                style={{
                  width: '100%',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, hsl(174 50% 50% / 0.3), transparent)',
                }}
              />
            </div>
          )}

          {/* Unified Analysis Form - hidden during loading, after analysis, or during error */}
          {!hasAnyAnalysis && !isLoading && !analysisError && (
            <div 
              className="container-content w-full animate-fade-in"
              style={{ animationDelay: '350ms', animationFillMode: 'both', marginTop: '0' }}
            >
              <UnifiedAnalysisForm 
                ref={formRef}
                onAnalyze={handleUnifiedAnalyze}
                isLoading={isLoading} 
                onContentChange={setHasFormContent}
                highlightInput={inputHighlight}
                captureGlow={inputCaptureGlow}
                validationMessage={validationMessage}
                onClearValidation={handleClearValidation}
              />
              
              {/* Disclaimer note - single line, branded */}
              <p 
                className="text-center animate-fade-in px-4"
                style={{ 
                  marginTop: 'var(--space-3)',
                  fontSize: 'clamp(0.55rem, 0.5rem + 0.5vw, 0.8rem)',
                  color: 'hsl(0 0% 100% / 0.65)',
                  lineHeight: 1.4,
                  animationDelay: '500ms',
                  animationFillMode: 'both',
                  maxWidth: '100%',
                }}
              >
                <span 
                  className="italic"
                  style={{
                    color: 'hsl(174 65% 52%)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  Leen
                </span>
                <span 
                  className="font-semibold not-italic"
                  style={{
                    color: 'hsl(0 0% 98%)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  Score
                </span>
                <span style={{ color: 'hsl(0 0% 100% / 0.65)' }}>
                  {' '}{i18nT('form.disclaimer').replace('LeenScore ', '')}
                </span>
              </p>
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

        {/* Footer - premium 3-line signature */}
        <footer 
          className="relative mt-auto flex flex-col items-center text-center py-4 animate-fade-in"
          style={{ 
            opacity: 0.75,
            animationDelay: '600ms',
            animationFillMode: 'both',
          }}
        >
          {/* Line 1: LeenScore branded */}
          <p 
            className="font-semibold"
            style={{ 
              fontSize: 'clamp(0.9rem, 0.85rem + 0.25vw, 1.05rem)',
              letterSpacing: '-0.01em',
              fontFamily: 'var(--font-display)',
              marginBottom: '4px',
            }}
          >
            <span 
              className="italic"
              style={{ color: 'hsl(174 65% 52%)' }}
            >
              Leen
            </span>
            <span 
              className="not-italic"
              style={{ color: 'hsl(0 0% 98%)' }}
            >
              Score
            </span>
          </p>
          
          {/* Line 2: Developed by Sol&Air */}
          <p 
            style={{ 
              fontSize: 'clamp(0.7rem, 0.65rem + 0.15vw, 0.8rem)',
              color: 'hsl(0 0% 100% / 0.65)',
              marginBottom: '2px',
            }}
          >
            {i18nT('footer.developedBy')}{' '}
            <span 
              style={{
                color: 'hsl(174 65% 58%)',
              }}
            >
              Sol&Air
            </span>
          </p>
          
          {/* Line 3: Version */}
          <p 
            style={{ 
              fontSize: 'clamp(0.6rem, 0.55rem + 0.1vw, 0.7rem)',
              color: 'hsl(0 0% 100% / 0.55)',
            }}
          >
            {i18nT('footer.version')} 1.0
          </p>
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
