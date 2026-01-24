import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CheckCircle2, Image, X, ImagePlus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/i18n/useLanguage';

interface UnifiedAnalysisFormProps {
  onAnalyze: (input: string, image: { file: File; preview: string } | null) => void;
  isLoading: boolean;
  onContentChange?: (hasContent: boolean) => void;
  highlightInput?: boolean; // Triggered when chevrons complete a cycle
}

export interface UnifiedAnalysisFormHandle {
  submit: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export const UnifiedAnalysisForm = forwardRef<UnifiedAnalysisFormHandle, UnifiedAnalysisFormProps>(
  ({ onAnalyze, isLoading, onContentChange, highlightInput }, ref) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<{ file: File; preview: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Trigger highlight animation when chevron cycle completes
  useEffect(() => {
    if (highlightInput) {
      setShowHighlight(true);
      const timer = setTimeout(() => setShowHighlight(false), 250);
      return () => clearTimeout(timer);
    }
  }, [highlightInput]);
  
  const hasImage = Boolean(attachedImage);
  const hasText = inputText.trim().length > 0;
  const hasContent = hasText || hasImage;
  const isActive = isDragOver;

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
    setInputText(e.target.value);
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
      
      {/* Premium Drop Card */}
      <div 
        className="relative cursor-text"
        onClick={handleCardClick}
      >
        {/* Outer glow ring - enhanced on hover/drag */}
        <div 
          className="absolute -inset-1 rounded-2xl transition-all duration-300"
          style={{
            background: isActive
              ? 'linear-gradient(135deg, hsl(174 70% 50% / 0.4), hsl(174 60% 55% / 0.25), hsl(174 70% 50% / 0.4))'
              : hasImage
              ? 'linear-gradient(135deg, hsl(174 60% 45% / 0.3), transparent, hsl(174 60% 45% / 0.25))'
              : 'linear-gradient(135deg, hsl(174 60% 45% / 0.15), transparent, hsl(174 60% 45% / 0.1))',
            animation: 'card-glow 3s ease-in-out infinite',
            filter: isActive ? 'blur(12px)' : 'blur(8px)',
            opacity: isActive ? 1 : 0.7,
          }}
        />
        
        {/* Glass card container */}
        <div 
          className="relative rounded-2xl border transition-all duration-300"
          style={{
            borderColor: isActive 
              ? 'hsl(174 60% 50% / 0.4)' 
              : hasImage 
              ? 'hsl(174 60% 45% / 0.25)'
              : 'hsl(0 0% 100% / 0.1)',
            background: isActive
              ? 'linear-gradient(to bottom, hsl(0 0% 100% / 0.1), hsl(0 0% 100% / 0.04))'
              : 'linear-gradient(to bottom, hsl(0 0% 100% / 0.07), hsl(0 0% 100% / 0.02))',
            backdropFilter: 'blur(20px)',
            boxShadow: isActive
              ? '0 0 50px hsl(174 60% 50% / 0.25), 0 12px 40px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.15)'
              : hasImage
              ? '0 0 40px hsl(174 60% 45% / 0.2), 0 8px 32px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.1)'
              : '0 8px 32px hsl(0 0% 0% / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.08)',
          }}
        >
          {/* Light sweep highlight - triggered when chevrons complete */}
          {showHighlight && (
            <div 
              className="absolute top-0 left-0 right-0 h-px overflow-hidden pointer-events-none z-30"
              style={{ borderRadius: '16px 16px 0 0' }}
            >
              <div 
                style={{
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent 0%, hsl(174 70% 60% / 0.9) 50%, transparent 100%)',
                  animation: 'input-sweep 200ms ease-out forwards',
                }}
              />
            </div>
          )}
          
          {/* Inner glow pulse - triggered with highlight */}
          {showHighlight && (
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none z-20"
              style={{
                boxShadow: 'inset 0 0 20px hsl(174 60% 50% / 0.15), inset 0 2px 8px hsl(174 65% 55% / 0.1)',
                animation: 'input-glow-pulse 250ms ease-out forwards',
              }}
            />
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
          <div style={{ padding: 'var(--space-4)' }}>
            {/* Text input + optional attached image preview */}
            <div className="flex flex-col" style={{ gap: 'var(--space-3)' }}>
              {/* Textarea row with image button */}
              <div className="flex items-start w-full" style={{ gap: 'var(--space-3)' }}>
                {/* Text input zone - always visible */}
                <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
                  <Textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={handleInputChange}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={t('form.placeholder')}
                    className="w-full resize-none rounded-xl border-0 bg-white/[0.04] text-left text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                    style={{
                      minHeight: '80px',
                      padding: 'var(--space-3)',
                      fontSize: 'var(--text-sm)',
                      boxShadow: 'inset 0 2px 4px hsl(0 0% 0% / 0.1)',
                    }}
                  />
                </div>
                
                {/* Image button - ALWAYS visible */}
                <button
                  type="button"
                  onClick={handleAddImageClick}
                  className="flex flex-col items-center justify-center rounded-xl transition-all hover:scale-105 group/img shrink-0"
                  style={{
                    width: '80px',
                    height: '80px',
                    gap: 'var(--space-1)',
                    background: hasImage 
                      ? 'linear-gradient(135deg, hsl(174 60% 35% / 0.4), hsl(174 50% 30% / 0.3))'
                      : 'linear-gradient(135deg, hsl(174 50% 30% / 0.25), hsl(174 40% 25% / 0.15))',
                    border: hasImage 
                      ? '1px solid hsl(174 60% 50% / 0.5)'
                      : '1px dashed hsl(174 50% 50% / 0.35)',
                    boxShadow: hasImage
                      ? '0 0 20px hsl(174 60% 50% / 0.2), 0 4px 16px hsl(0 0% 0% / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.1)'
                      : '0 4px 16px hsl(0 0% 0% / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.05)',
                  }}
                  title={t('form.addImage')}
                >
                  {/* Icon container with glow */}
                  <div 
                    className="rounded-lg transition-all group-hover/img:scale-110"
                    style={{
                      padding: 'var(--space-2)',
                      background: hasImage 
                        ? 'linear-gradient(135deg, hsl(174 70% 45% / 0.5), hsl(174 60% 40% / 0.4))'
                        : 'linear-gradient(135deg, hsl(174 60% 45% / 0.3), hsl(174 50% 40% / 0.2))',
                      boxShadow: '0 0 15px hsl(174 60% 50% / 0.15), 0 2px 8px hsl(0 0% 0% / 0.15)',
                    }}
                  >
                    {hasImage ? (
                      <CheckCircle2 className="h-5 w-5" style={{ color: 'hsl(174 80% 65%)' }} />
                    ) : (
                      <ImagePlus className="h-5 w-5" style={{ color: 'hsl(174 65% 60%)' }} />
                    )}
                  </div>
                  
                  {/* Label */}
                  <span 
                    className="font-medium tracking-wide uppercase"
                    style={{ 
                      color: hasImage ? 'hsl(174 70% 65%)' : 'hsl(174 60% 55% / 0.8)', 
                      fontSize: '9px' 
                    }}
                  >
                    {hasImage ? t('form.imageReady') : t('form.imageUpload')}
                  </span>
                </button>
              </div>
              
              {/* Attached image preview - shown below text input when image is attached */}
              {attachedImage && (
                <div 
                  className="flex items-center rounded-xl animate-fade-in"
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    gap: 'var(--space-3)',
                    background: 'linear-gradient(135deg, hsl(174 50% 25% / 0.3), hsl(174 40% 20% / 0.2))',
                    border: '1px solid hsl(174 50% 45% / 0.25)',
                  }}
                >
                  {/* Thumbnail */}
                  <div className="relative shrink-0">
                    <img 
                      src={attachedImage.preview} 
                      alt="Attached" 
                      className="rounded-lg object-cover"
                      style={{ 
                        width: '48px',
                        height: '48px',
                        boxShadow: '0 2px 8px hsl(0 0% 0% / 0.3)',
                        border: '1px solid hsl(174 50% 50% / 0.2)',
                      }}
                    />
                    {/* Success badge */}
                    <div 
                      className="absolute -bottom-1 -right-1 rounded-full"
                      style={{
                        padding: '2px',
                        background: 'linear-gradient(135deg, hsl(174 70% 45%) 0%, hsl(174 60% 40%) 100%)',
                        boxShadow: '0 1px 4px hsl(0 0% 0% / 0.3)',
                      }}
                    >
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p 
                      className="font-medium truncate text-white/90" 
                      style={{ fontSize: 'var(--text-xs)' }}
                    >
                      {attachedImage.file.name}
                    </p>
                    <p 
                      className="text-white/50" 
                      style={{ fontSize: '10px' }}
                    >
                      {(attachedImage.file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center justify-center rounded-full transition-all hover:bg-red-500/20 hover:text-red-400 shrink-0"
                    style={{ 
                      width: '28px',
                      height: '28px',
                      color: 'hsl(0 0% 100% / 0.5)',
                      border: '1px solid hsl(0 0% 100% / 0.1)',
                    }}
                    title={t('form.removeImage')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style>{`
        @keyframes card-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.005); }
        }
        @keyframes input-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes input-glow-pulse {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </form>
  );
});

UnifiedAnalysisForm.displayName = 'UnifiedAnalysisForm';
