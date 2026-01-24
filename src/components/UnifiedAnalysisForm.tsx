import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CheckCircle2, Image, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/i18n/useLanguage';

interface UnifiedAnalysisFormProps {
  onAnalyzeText: (input: string) => void;
  onImageReady: (file: File, preview: string) => void;
  isLoading: boolean;
  onContentChange?: (hasContent: boolean) => void;
}

export interface UnifiedAnalysisFormHandle {
  submit: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export const UnifiedAnalysisForm = forwardRef<UnifiedAnalysisFormHandle, UnifiedAnalysisFormProps>(
  ({ onAnalyzeText, onImageReady, isLoading, onContentChange }, ref) => {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const hasImage = Boolean(uploadedImage);
  const hasText = input.trim().length > 0;
  const hasContent = hasText || hasImage;
  const isActive = isDragOver; // Only drag-over triggers card glow, not focus

  // Expose submit method to parent via ref
  const triggerSubmit = useCallback(() => {
    if (uploadedImage) {
      onImageReady(uploadedImage.file, uploadedImage.preview);
    } else if (input.trim()) {
      onAnalyzeText(input.trim());
    }
  }, [uploadedImage, input, onImageReady, onAnalyzeText]);

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
      setUploadedImage({ file, preview });
      setInput('');
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
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadedImage) {
      onImageReady(uploadedImage.file, uploadedImage.preview);
    } else if (input.trim()) {
      onAnalyzeText(input.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift triggers submit
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onAnalyzeText(input.trim());
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (uploadedImage && e.target.value.trim()) {
      setUploadedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger file picker if clicking on the icon/upload area, not the textarea
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA') return;
    
    if (!hasImage && !hasText) {
      // Focus textarea to allow typing
      textareaRef.current?.focus();
    }
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
        className="relative cursor-pointer"
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

          {/* Main content area - compact padding */}
          <div style={{ padding: 'var(--space-4)' }}>
            
            {/* Image uploaded state */}
            {uploadedImage ? (
              <div className="flex flex-col items-center" style={{ gap: 'var(--space-4)' }}>
                {/* Image preview */}
                <div className="relative">
                  <img 
                    src={uploadedImage.preview} 
                    alt="Preview" 
                    className="rounded-xl object-cover"
                    style={{ 
                      width: '5rem',
                      height: '5rem',
                      boxShadow: '0 4px 20px hsl(0 0% 0% / 0.4), 0 0 30px hsl(174 60% 50% / 0.2)',
                      border: '2px solid hsl(174 60% 50% / 0.3)',
                    }}
                  />
                  <div 
                    className="absolute -bottom-1 -right-1 rounded-full"
                    style={{
                      padding: 'var(--space-1)',
                      background: 'linear-gradient(135deg, hsl(174 70% 45%) 0%, hsl(174 60% 40%) 100%)',
                      boxShadow: '0 2px 8px hsl(0 0% 0% / 0.3)',
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                {/* File info */}
                <div className="text-center">
                  <p className="font-medium text-white/90 truncate max-w-[200px]" style={{ fontSize: 'var(--text-sm)' }}>
                    {uploadedImage.file.name}
                  </p>
                  <p className="text-white/50" style={{ marginTop: 'var(--space-1)', fontSize: 'var(--text-xs)' }}>
                    {(uploadedImage.file.size / 1024).toFixed(0)} KB · {t('form.imageReady')}
                  </p>
                </div>
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center rounded-full font-medium transition-all hover:bg-white/10"
                  style={{ 
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-4)',
                    fontSize: 'var(--text-xs)',
                    color: 'hsl(0 0% 100% / 0.6)',
                    border: '1px solid hsl(0 0% 100% / 0.1)',
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                  {t('form.removeImage')}
                </button>
              </div>
            ) : (
              /* Text/Image input state - unified layout */
              <div className="flex items-stretch w-full" style={{ gap: 'var(--space-4)' }}>
                {/* Text input zone - always visible, full width when hasText */}
                <div className={`relative transition-all duration-200 ${hasText ? 'flex-1' : 'flex-1'}`} onClick={(e) => e.stopPropagation()}>
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={t('form.placeholder')}
                    className="w-full resize-none rounded-xl border-0 bg-white/[0.04] text-left text-white placeholder:text-white/40 placeholder:text-center focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                    style={{
                      minHeight: '80px',
                      padding: 'var(--space-3)',
                      fontSize: 'var(--text-sm)',
                      boxShadow: 'inset 0 2px 4px hsl(0 0% 0% / 0.1)',
                    }}
                  />
                </div>
                
                {/* Vertical divider - hidden when text is entered */}
                {!hasText && (
                  <div 
                    className="w-px self-stretch"
                    style={{
                      marginTop: 'var(--space-2)',
                      marginBottom: 'var(--space-2)',
                      background: 'linear-gradient(to bottom, transparent, hsl(0 0% 100% / 0.15), transparent)',
                    }}
                  />
                )}
                
                {/* Image upload zone - hidden when text is entered */}
                {!hasText && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="flex flex-col items-center justify-center rounded-xl transition-all hover:scale-105 group/img"
                    style={{
                      padding: '0 var(--space-6)',
                      gap: 'var(--space-2)',
                      background: 'linear-gradient(135deg, hsl(174 50% 30% / 0.25), hsl(174 40% 25% / 0.15))',
                      border: '1px dashed hsl(174 50% 50% / 0.35)',
                      boxShadow: '0 4px 16px hsl(0 0% 0% / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.05)',
                    }}
                    title={t('form.addImage')}
                  >
                    {/* Icon container with glow */}
                    <div 
                      className="rounded-xl transition-all group-hover/img:scale-110"
                      style={{
                        padding: 'var(--space-3)',
                        background: 'linear-gradient(135deg, hsl(174 60% 45% / 0.3), hsl(174 50% 40% / 0.2))',
                        boxShadow: '0 0 20px hsl(174 60% 50% / 0.2), 0 4px 12px hsl(0 0% 0% / 0.2)',
                      }}
                    >
                      <Image 
                        className="h-7 w-7" 
                        style={{ color: 'hsl(174 65% 60%)' }}
                      />
                    </div>
                    
                    {/* Label */}
                    <span 
                      className="font-medium tracking-wide uppercase"
                      style={{ color: 'hsl(174 60% 55% / 0.8)', fontSize: 'var(--text-xs)' }}
                    >
                      {t('form.imageUpload')}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      
      {/* CSS for animations */}
      <style>{`
        @keyframes card-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.005); }
        }
        @keyframes icon-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.95); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </form>
  );
});

UnifiedAnalysisForm.displayName = 'UnifiedAnalysisForm';
