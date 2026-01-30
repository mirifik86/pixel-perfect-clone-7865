import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CheckCircle2, Image, X, ImagePlus, Upload, RefreshCw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/i18n/useLanguage';

interface UnifiedAnalysisFormProps {
  onAnalyze: (input: string, image: { file: File; preview: string } | null) => void;
  isLoading: boolean;
  onContentChange?: (hasContent: boolean) => void;
  onTypingStateChange?: (state: 'idle' | 'typing' | 'valid') => void; // New: typing feedback
  highlightInput?: boolean; // Triggered when chevrons complete a cycle (idle state)
  captureGlow?: boolean; // Triggered when idle→ready transfer starts
  validationMessage?: string | null; // Inline validation message to display
  onClearValidation?: () => void; // Clear validation when user starts typing
}

export interface UnifiedAnalysisFormHandle {
  submit: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export const UnifiedAnalysisForm = forwardRef<UnifiedAnalysisFormHandle, UnifiedAnalysisFormProps>(
  ({ onAnalyze, isLoading, onContentChange, onTypingStateChange, highlightInput, captureGlow, validationMessage, onClearValidation }, ref) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<{ file: File; preview: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showCaptureGlow, setShowCaptureGlow] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Trigger highlight animation when chevron cycle completes (idle state)
  useEffect(() => {
    if (highlightInput) {
      setShowHighlight(true);
      const timer = setTimeout(() => setShowHighlight(false), 250);
      return () => clearTimeout(timer);
    }
  }, [highlightInput]);
  
  // Trigger capture glow when idle→ready transfer starts
  useEffect(() => {
    if (captureGlow) {
      setShowCaptureGlow(true);
      const timer = setTimeout(() => setShowCaptureGlow(false), 180);
      return () => clearTimeout(timer);
    }
  }, [captureGlow]);
  
  const hasImage = Boolean(attachedImage);
  const hasText = inputText.trim().length > 0;
  const hasContent = hasText || hasImage;
  const isActive = isDragOver;
  
  // Validation states for CTA button
  const trimmedLength = inputText.trim().length;
  const isTyping = trimmedLength >= 3 && trimmedLength < 8;
  const isValidText = trimmedLength >= 8 || hasImage; // Valid if >= 8 chars OR has image
  
  // Notify parent about typing state changes
  useEffect(() => {
    if (!hasContent) {
      onTypingStateChange?.('idle');
    } else if (isValidText) {
      onTypingStateChange?.('valid');
    } else if (isTyping) {
      onTypingStateChange?.('typing');
    } else {
      onTypingStateChange?.('idle');
    }
  }, [hasContent, isTyping, isValidText, onTypingStateChange]);

  // Expose submit method to parent via ref
  const triggerSubmit = useCallback(() => {
    if (hasContent && !isLoading) {
      onAnalyze(inputText.trim(), attachedImage);
    }
  }, [hasContent, isLoading, inputText, attachedImage, onAnalyze]);

  useImperativeHandle(ref, () => ({
    submit: triggerSubmit
  }), [triggerSubmit]);

  // Notify parent when content state changes
  useEffect(() => {
    onContentChange?.(hasContent);
  }, [hasContent, onContentChange]);

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      return false;
    }
    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (!validateFile(file)) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setAttachedImage({ file, preview });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift triggers submit
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasContent && !isLoading) {
        triggerSubmit();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputText(newValue);
    // Validation message persists until next successful analyze attempt
    // Only clear if input is completely emptied
    if (newValue.trim().length === 0 && validationMessage) {
      onClearValidation?.();
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA') return;
    textareaRef.current?.focus();
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleFile(file);
            return;
          }
        }
      }
    }
  }, [handleFile]);

  const handleAddImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full animate-fade-in flex flex-col"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Premium Drop Card - ULTRA PREMIUM with deep glass morphism */}
      <div 
        className="relative cursor-text"
        onClick={handleCardClick}
      >
        {/* Outer ambient glow - multi-layered for depth */}
        <div 
          className="absolute -inset-3 rounded-3xl transition-all duration-500"
          style={{
            background: showCaptureGlow
              ? 'radial-gradient(ellipse at center, hsl(174 85% 60% / 0.5), hsl(174 75% 55% / 0.3) 50%, transparent 80%)'
              : isActive
              ? 'radial-gradient(ellipse at center, hsl(174 80% 55% / 0.4), hsl(174 65% 50% / 0.2) 50%, transparent 80%)'
              : hasContent
              ? 'radial-gradient(ellipse at center, hsl(174 75% 50% / 0.3), hsl(174 60% 45% / 0.15) 50%, transparent 80%)'
              : 'radial-gradient(ellipse at center, hsl(174 70% 50% / 0.2), hsl(174 55% 45% / 0.1) 50%, transparent 80%)',
            animation: showCaptureGlow ? 'capture-glow-pulse 180ms ease-out forwards' : 'card-ambient-glow 4s ease-in-out infinite',
            filter: showCaptureGlow ? 'blur(20px)' : isActive ? 'blur(18px)' : 'blur(14px)',
            opacity: 1,
          }}
        />
        
        {/* Secondary inner glow ring */}
        <div 
          className="absolute -inset-1 rounded-2xl transition-all duration-300"
          style={{
            background: hasContent 
              ? 'linear-gradient(135deg, hsl(174 70% 55% / 0.15), transparent 40%, hsl(174 65% 50% / 0.1))'
              : 'linear-gradient(135deg, hsl(174 60% 50% / 0.1), transparent 40%, hsl(174 55% 45% / 0.08))',
            filter: 'blur(4px)',
          }}
        />
        
        {/* Glass card container - ULTRA PREMIUM with refined borders */}
        <div 
          className="relative rounded-2xl transition-all duration-300"
          style={{
            border: showCaptureGlow
              ? '2px solid hsl(174 80% 60% / 0.7)'
              : isActive 
              ? '2px solid hsl(174 70% 55% / 0.55)' 
              : hasContent 
              ? '2px solid hsl(174 65% 52% / 0.45)'
              : '1.5px solid hsl(174 55% 48% / 0.3)',
            background: isActive
              ? 'linear-gradient(165deg, hsl(220 28% 14% / 0.96), hsl(220 32% 9% / 0.98))'
              : 'linear-gradient(165deg, hsl(220 28% 12% / 0.94), hsl(220 32% 8% / 0.97))',
            backdropFilter: 'blur(28px)',
            boxShadow: showCaptureGlow
              ? '0 0 80px hsl(174 80% 58% / 0.45), 0 20px 60px hsl(0 0% 0% / 0.55), inset 0 0 30px hsl(174 70% 58% / 0.18), inset 0 1px 0 hsl(0 0% 100% / 0.28), inset 0 -1px 0 hsl(174 60% 50% / 0.1)'
              : isActive
              ? '0 0 70px hsl(174 70% 52% / 0.35), 0 18px 55px hsl(0 0% 0% / 0.52), inset 0 0 25px hsl(174 60% 55% / 0.12), inset 0 1px 0 hsl(0 0% 100% / 0.22), inset 0 -1px 0 hsl(174 55% 48% / 0.08)'
              : hasContent
              ? '0 0 55px hsl(174 65% 48% / 0.28), 0 14px 45px hsl(0 0% 0% / 0.5), inset 0 0 20px hsl(174 55% 50% / 0.08), inset 0 1px 0 hsl(0 0% 100% / 0.18), inset 0 -1px 0 hsl(174 50% 45% / 0.06)'
              : '0 0 45px hsl(174 60% 48% / 0.18), 0 14px 42px hsl(0 0% 0% / 0.48), inset 0 0 15px hsl(174 50% 45% / 0.05), inset 0 1px 0 hsl(0 0% 100% / 0.15), inset 0 -1px 0 hsl(174 45% 42% / 0.04)',
          }}
        >
          {/* Capture glow inner pulse - triggered during idle→ready transfer */}
          {showCaptureGlow && (
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none z-30"
              style={{
                boxShadow: 'inset 0 0 30px hsl(174 65% 58% / 0.2), inset 0 0 15px hsl(174 60% 55% / 0.15)',
                animation: 'capture-inner-pulse 180ms ease-out forwards',
              }}
            />
          )}
          
          {/* Premium beam impact effect - triggered when chevrons complete (idle state) */}
          {showHighlight && (
            <>
              {/* Impact point - soft glow at top center */}
              <div 
                className="absolute pointer-events-none z-40"
                style={{ 
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '24px',
                  height: '12px',
                  background: 'radial-gradient(ellipse at center bottom, hsl(180 50% 65% / 0.5) 0%, hsl(180 45% 60% / 0.2) 40%, transparent 70%)',
                  filter: 'blur(2px)',
                  animation: 'impact-glow 120ms ease-out forwards',
                }}
              />
              
              {/* Left propagation beam */}
              <div 
                className="absolute top-0 left-1/2 h-px pointer-events-none z-35 overflow-hidden"
                style={{ 
                  width: '50%',
                  transform: 'translateX(-100%) scaleX(-1)',
                  borderRadius: '16px 0 0 0',
                }}
              >
                <div 
                  style={{
                    height: '1.5px',
                    width: '100%',
                    background: 'linear-gradient(90deg, transparent 0%, hsl(180 45% 62% / 0.6) 30%, hsl(180 50% 68% / 0.8) 60%, transparent 100%)',
                    filter: 'blur(0.5px)',
                    opacity: 0,
                    animation: 'beam-sweep-left 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 60ms forwards',
                  }}
                />
              </div>
              
              {/* Right propagation beam */}
              <div 
                className="absolute top-0 left-1/2 h-px pointer-events-none z-35 overflow-hidden"
                style={{ 
                  width: '50%',
                  borderRadius: '0 16px 0 0',
                }}
              >
                <div 
                  style={{
                    height: '1.5px',
                    width: '100%',
                    background: 'linear-gradient(90deg, transparent 0%, hsl(180 45% 62% / 0.6) 30%, hsl(180 50% 68% / 0.8) 60%, transparent 100%)',
                    filter: 'blur(0.5px)',
                    opacity: 0,
                    animation: 'beam-sweep-right 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 60ms forwards',
                  }}
                />
              </div>
              
              {/* Soft internal glow pulse */}
              <div 
                className="absolute inset-0 rounded-2xl pointer-events-none z-20"
                style={{
                  boxShadow: 'inset 0 0 25px hsl(180 50% 55% / 0.08), inset 0 4px 12px hsl(180 45% 60% / 0.06)',
                  animation: 'inner-glow-pulse 200ms ease-out forwards',
                }}
              />
            </>
          )}
          {/* Drag overlay */}
          {isDragOver && (
            <div 
              className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl"
              style={{
                background: 'hsl(174 60% 45% / 0.12)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <div className="flex flex-col items-center" style={{ gap: 'var(--space-3)' }}>
                <div 
                  className="rounded-full"
                  style={{
                    padding: 'var(--space-4)',
                    background: 'linear-gradient(135deg, hsl(174 70% 45%) 0%, hsl(174 60% 40%) 100%)',
                    boxShadow: '0 0 30px hsl(174 60% 50% / 0.5)',
                  }}
                >
                  <Image className="h-7 w-7 text-white" />
                </div>
                <span 
                  className="font-semibold"
                  style={{ color: 'hsl(174 70% 60%)', fontSize: 'var(--text-sm)' }}
                >
                  {t('form.dropHere')}
                </span>
              </div>
            </div>
          )}

          {/* Main content area */}
          <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
            {/* Text input + Image upload as visually distinct options */}
            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
              
              {/* Text input zone with centered placeholder */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                {/* Custom placeholder - brighter, premium, single instruction */}
                {!inputText && (
                  <div 
                    className="absolute inset-0 flex items-start justify-center pointer-events-none z-10"
                    style={{ paddingTop: 'var(--space-4)' }}
                  >
                    <span 
                      className="text-center font-medium tracking-wide"
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'hsl(174 50% 78% / 0.92)',
                        textShadow: '0 0 20px hsl(174 55% 55% / 0.3), 0 0 40px hsl(174 50% 50% / 0.15)',
                        animation: 'placeholder-glow 3s ease-in-out infinite',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {t('form.placeholder')}
                    </span>
                  </div>
                )}
                
                <Textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleInputChange}
                  onPaste={handlePaste}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder=""
                  className="w-full resize-none rounded-xl text-center text-white placeholder:text-transparent focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                  style={{
                    minHeight: '80px',
                    padding: 'var(--space-4) var(--space-3) var(--space-3)',
                    fontSize: 'var(--text-sm)',
                    background: isFocused
                      ? 'hsl(200 20% 12% / 0.5)'
                      : 'hsl(200 15% 10% / 0.35)',
                    boxShadow: isFocused 
                      ? `
                        inset 0 2px 8px hsl(0 0% 0% / 0.15),
                        inset 0 0 20px hsl(174 55% 50% / 0.08),
                        0 0 0 1.5px hsl(174 60% 52% / 0.5),
                        0 0 20px hsl(174 60% 50% / 0.2)
                      `
                      : `
                        inset 0 2px 6px hsl(0 0% 0% / 0.12),
                        inset 0 0 16px hsl(174 45% 48% / 0.04),
                        0 0 0 1px hsl(174 45% 55% / 0.18),
                        0 0 12px hsl(174 50% 50% / 0.08)
                      `,
                    border: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
              
              {/* Validation message - premium centered beam between text and image */}
              {validationMessage && (
                <div 
                  className="flex items-center justify-center"
                  style={{ 
                    padding: 'var(--space-2) 0',
                    animation: 'validation-fade-in 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
                  }}
                >
                  <div
                    className="relative rounded-xl text-center"
                    style={{
                      padding: 'var(--space-3) var(--space-5)',
                      background: 'linear-gradient(165deg, hsl(35 25% 12% / 0.95), hsl(35 20% 8% / 0.98))',
                      border: '1px solid hsl(35 45% 50% / 0.3)',
                      boxShadow: `
                        0 0 40px hsl(35 55% 50% / 0.15),
                        0 4px 20px hsl(0 0% 0% / 0.3),
                        inset 0 1px 0 hsl(0 0% 100% / 0.06)
                      `,
                      backdropFilter: 'blur(16px)',
                    }}
                  >
                    {/* Breathing halo/beam effect */}
                    <div 
                      className="absolute -inset-2 rounded-2xl pointer-events-none"
                      style={{
                        background: 'radial-gradient(ellipse at center, hsl(35 50% 50% / 0.12), transparent 60%)',
                        filter: 'blur(12px)',
                        animation: 'validation-breathing 2.5s ease-in-out infinite',
                      }}
                    />
                    
                    {/* Single-line validation message */}
                    <p 
                      className="relative font-medium leading-snug"
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'hsl(35 60% 72%)',
                        textShadow: '0 0 16px hsl(35 50% 50% / 0.3)',
                        letterSpacing: '0.015em',
                        animation: 'validation-text-breathing 2.5s ease-in-out infinite',
                      }}
                    >
                      {t('form.validationTitle')}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Minimal premium divider */}
              <div className="flex items-center justify-center" style={{ padding: '0' }}>
                <div 
                  className="relative flex items-center justify-center"
                  style={{ 
                    width: '100%',
                    maxWidth: '200px',
                  }}
                >
                  {/* Left gradient line */}
                  <div 
                    className="flex-1 h-px"
                    style={{ 
                      background: 'linear-gradient(to right, transparent 0%, hsl(174 45% 55% / 0.2) 100%)',
                    }}
                  />
                  {/* Center dot accent */}
                  <div 
                    className="mx-3 rounded-full"
                    style={{ 
                      width: '4px',
                      height: '4px',
                      background: 'hsl(174 55% 55% / 0.4)',
                      boxShadow: '0 0 8px hsl(174 55% 55% / 0.3)',
                    }}
                  />
                  {/* Right gradient line */}
                  <div 
                    className="flex-1 h-px"
                    style={{ 
                      background: 'linear-gradient(to left, transparent 0%, hsl(174 45% 55% / 0.2) 100%)',
                    }}
                  />
                </div>
              </div>
              
              {/* Premium Image Dropzone */}
              <div 
                className="relative group/dropzone"
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                onDrop={(e) => { e.stopPropagation(); handleDrop(e); }}
              >
                {/* Ambient glow behind dropzone */}
                <div 
                  className="absolute -inset-1 rounded-xl transition-all duration-500 pointer-events-none"
                  style={{
                    background: hasImage 
                      ? 'radial-gradient(ellipse at center, hsl(174 85% 55% / 0.25), transparent 70%)'
                      : isDragOver
                      ? 'radial-gradient(ellipse at center, hsl(174 80% 60% / 0.35), transparent 70%)'
                      : 'radial-gradient(ellipse at center, hsl(174 70% 55% / 0.15), transparent 70%)',
                    filter: 'blur(10px)',
                    animation: hasImage || isDragOver ? 'none' : 'dropzone-glow 3s ease-in-out infinite',
                  }}
                />

                {!attachedImage ? (
                  /* Empty state - Dropzone */
                  <button
                    type="button"
                    onClick={handleAddImageClick}
                    className="relative w-full rounded-xl transition-all duration-300 group-hover/dropzone:scale-[1.008] cursor-pointer"
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      background: isDragOver
                        ? 'linear-gradient(165deg, hsl(174 32% 16% / 0.55), hsl(174 28% 12% / 0.5))'
                        : 'linear-gradient(165deg, hsl(200 22% 13% / 0.45), hsl(200 18% 9% / 0.4))',
                      border: isDragOver
                        ? '1px solid hsl(174 65% 55% / 0.55)'
                        : '1px solid hsl(174 50% 52% / 0.22)',
                      boxShadow: isDragOver
                        ? `
                          inset 0 0 25px hsl(174 55% 50% / 0.1),
                          inset 0 1px 0 hsl(0 0% 100% / 0.08),
                          0 0 0 1px hsl(174 55% 55% / 0.2),
                          0 0 20px hsl(174 55% 50% / 0.18)
                        `
                        : `
                          inset 0 0 18px hsl(174 45% 48% / 0.05),
                          inset 0 1px 0 hsl(0 0% 100% / 0.05),
                          inset 0 2px 6px hsl(0 0% 0% / 0.08),
                          0 0 12px hsl(174 50% 50% / 0.06)
                        `,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <div className="flex flex-col items-center" style={{ gap: 'var(--space-2)' }}>
                      {/* Icon */}
                      <div 
                        className="rounded-full transition-all duration-300"
                        style={{
                          padding: 'var(--space-3)',
                          background: isDragOver
                            ? 'linear-gradient(135deg, hsl(174 60% 35% / 0.5), hsl(174 55% 30% / 0.4))'
                            : 'linear-gradient(135deg, hsl(174 50% 30% / 0.35), hsl(174 45% 25% / 0.25))',
                          boxShadow: isDragOver
                            ? '0 0 20px hsl(174 60% 55% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.15)'
                            : '0 0 12px hsl(174 55% 50% / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.1)',
                        }}
                      >
                        <Upload 
                          className="transition-all duration-300"
                          style={{ 
                            width: '24px',
                            height: '24px',
                            color: isDragOver ? 'hsl(174 85% 70%)' : 'hsl(174 70% 65%)',
                            filter: isDragOver 
                              ? 'drop-shadow(0 0 10px hsl(174 75% 60% / 0.8))'
                              : 'drop-shadow(0 0 6px hsl(174 65% 55% / 0.5))',
                          }} 
                        />
                      </div>
                      
                      {/* Primary text */}
                      <p 
                        className="font-medium text-center transition-all duration-300"
                        style={{ 
                          fontSize: 'var(--text-sm)',
                          color: isDragOver ? 'hsl(174 75% 75%)' : 'hsl(174 60% 70%)',
                          textShadow: isDragOver 
                            ? '0 0 15px hsl(174 65% 55% / 0.5)'
                            : '0 0 10px hsl(174 55% 50% / 0.3)',
                          letterSpacing: '0.01em',
                        }}
                      >
                        {t('form.dropzoneTitle')}
                      </p>
                      
                      {/* Secondary text */}
                      <p 
                        className="text-center"
                        style={{ 
                          fontSize: '11px',
                          color: 'hsl(0 0% 100% / 0.45)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {t('form.dropzoneSubtitle')}
                      </p>
                    </div>
                  </button>
                ) : (
                  /* Image attached state - Preview card */
                  <div 
                    className="relative rounded-xl animate-fade-in"
                    style={{
                      padding: 'var(--space-3)',
                      background: 'linear-gradient(165deg, hsl(174 35% 16% / 0.5), hsl(174 30% 12% / 0.45))',
                      border: '1.5px solid hsl(174 65% 52% / 0.45)',
                      boxShadow: `
                        inset 0 0 25px hsl(174 55% 50% / 0.1),
                        0 0 0 1px hsl(174 55% 55% / 0.2),
                        0 0 20px hsl(174 60% 50% / 0.15)
                      `,
                    }}
                  >
                    <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                      {/* Thumbnail */}
                      <div className="relative shrink-0">
                        <img 
                          src={attachedImage.preview} 
                          alt="Attached" 
                          className="rounded-lg object-cover"
                          style={{ 
                            width: '56px',
                            height: '56px',
                            boxShadow: '0 4px 12px hsl(0 0% 0% / 0.4), 0 0 0 1px hsl(174 50% 50% / 0.2)',
                          }}
                        />
                        {/* Success badge */}
                        <div 
                          className="absolute -bottom-1 -right-1 rounded-full"
                          style={{
                            padding: '3px',
                            background: 'linear-gradient(135deg, hsl(174 75% 45%) 0%, hsl(174 65% 40%) 100%)',
                            boxShadow: '0 2px 6px hsl(0 0% 0% / 0.35), 0 0 8px hsl(174 65% 50% / 0.4)',
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                      
                      {/* File info + status */}
                      <div className="flex-1 min-w-0">
                        {/* Image ready label */}
                        <div 
                          className="flex items-center mb-1"
                          style={{ gap: 'var(--space-1)' }}
                        >
                          <span 
                            className="font-semibold"
                            style={{ 
                              fontSize: '12px',
                              color: 'hsl(174 80% 65%)',
                              textShadow: '0 0 10px hsl(174 70% 55% / 0.4)',
                            }}
                          >
                            {t('form.imageReady')} ✓
                          </span>
                        </div>
                        
                        {/* Filename */}
                        <p 
                          className="font-medium truncate text-white/80" 
                          style={{ fontSize: '11px' }}
                        >
                          {attachedImage.file.name}
                        </p>
                        
                        {/* File size */}
                        <p 
                          className="text-white/45" 
                          style={{ fontSize: '10px' }}
                        >
                          {(attachedImage.file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center shrink-0" style={{ gap: 'var(--space-2)' }}>
                        {/* Replace button */}
                        <button
                          type="button"
                          onClick={handleAddImageClick}
                          className="flex items-center rounded-lg transition-all hover:scale-105"
                          style={{ 
                            padding: 'var(--space-2) var(--space-2)',
                            gap: '4px',
                            background: 'hsl(174 40% 25% / 0.4)',
                            border: '1px solid hsl(174 50% 50% / 0.25)',
                            color: 'hsl(174 70% 70%)',
                            fontSize: '11px',
                            fontWeight: 500,
                          }}
                          title={t('form.replaceImage')}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{t('form.replaceImage')}</span>
                        </button>
                        
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="flex items-center rounded-lg transition-all hover:scale-105 hover:bg-red-500/20 hover:border-red-400/40"
                          style={{ 
                            padding: 'var(--space-2) var(--space-2)',
                            gap: '4px',
                            background: 'hsl(0 30% 20% / 0.3)',
                            border: '1px solid hsl(0 40% 50% / 0.25)',
                            color: 'hsl(0 60% 70%)',
                            fontSize: '11px',
                            fontWeight: 500,
                          }}
                          title={t('form.removeImage')}
                        >
                          <X className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{t('form.removeImage')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Button removed - globe center is now the only primary CTA */}
      {/* CSS for animations */}
      <style>{`
        @keyframes card-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.005); }
        }
        @keyframes impact-glow {
          0% { opacity: 0; transform: translateX(-50%) scale(0.6); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
          100% { opacity: 0; transform: translateX(-50%) scale(1); }
        }
        @keyframes beam-sweep-left {
          0% { transform: translateX(0%) scaleX(0.3); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.6; }
          100% { transform: translateX(-100%) scaleX(1); opacity: 0; }
        }
        @keyframes beam-sweep-right {
          0% { transform: translateX(0%) scaleX(0.3); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.6; }
          100% { transform: translateX(100%) scaleX(1); opacity: 0; }
        }
        @keyframes inner-glow-pulse {
          0% { opacity: 0; }
          35% { opacity: 1; }
          100% { opacity: 0; }
        }
        /* Capture glow animations for idle→ready transfer */
        @keyframes capture-glow-pulse {
          0% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 0.5; transform: scale(1); }
        }
        @keyframes capture-inner-pulse {
          0% { opacity: 0; }
          40% { opacity: 1; }
          100% { opacity: 0; }
        }
        /* Premium placeholder glow - subtle breathing effect */
        @keyframes placeholder-glow {
          0%, 100% { 
            opacity: 0.7; 
            text-shadow: 0 0 18px hsl(174 55% 50% / 0.25), 0 0 35px hsl(174 45% 45% / 0.1);
          }
          50% { 
            opacity: 1; 
            text-shadow: 0 0 24px hsl(174 60% 55% / 0.4), 0 0 45px hsl(174 50% 50% / 0.2);
          }
        }
        /* Validation error breathing glow */
        @keyframes validation-glow {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.02);
          }
        }
        /* Premium validation beam - slow breathing halo */
        @keyframes validation-beam {
          0%, 100% { 
            opacity: 0.5;
            transform: scale(0.98);
          }
          50% { 
            opacity: 1;
            transform: scale(1.01);
          }
        }
        /* CTA button breathing glow */
        @keyframes cta-breathing-glow {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(0.98);
          }
          50% { 
            opacity: 1;
            transform: scale(1.02);
          }
        }
        /* Dropzone breathing glow */
        @keyframes dropzone-glow {
          0%, 100% { 
            opacity: 0.5;
          }
          50% { 
            opacity: 0.9;
          }
        }
      `}</style>
    </form>
  );
});

UnifiedAnalysisForm.displayName = 'UnifiedAnalysisForm';
