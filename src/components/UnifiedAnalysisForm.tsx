import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Loader2, CheckCircle2, FileText, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface UnifiedAnalysisFormProps {
  onAnalyzeText: (input: string) => void;
  onImageReady: (file: File, preview: string) => void;
  isLoading: boolean;
  language: 'en' | 'fr';
  onContentChange?: (hasContent: boolean) => void;
}

const translations = {
  en: {
    primaryText: 'Paste text or drop an image',
    hint: 'Text · PNG · JPG · Screenshots',
    analyze: 'Analyze',
    imageReady: 'Ready',
    removeImage: 'Remove',
    dropHere: 'Drop image here',
    tapToUpload: 'Tap anywhere to upload',
  },
  fr: {
    primaryText: 'Collez un texte ou déposez une image',
    hint: 'Texte · PNG · JPG · Captures d\'écran',
    analyze: 'Analyser',
    imageReady: 'Prêt',
    removeImage: 'Retirer',
    dropHere: 'Déposez l\'image ici',
    tapToUpload: 'Touchez pour importer',
  },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export const UnifiedAnalysisForm = ({ onAnalyzeText, onImageReady, isLoading, language, onContentChange }: UnifiedAnalysisFormProps) => {
  const [input, setInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = translations[language];
  
  const hasImage = Boolean(uploadedImage);
  const hasText = input.trim().length > 0;
  const hasContent = hasText || hasImage;
  const isActive = isDragOver; // Only drag-over triggers card glow, not focus

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
      className="w-full max-w-2xl animate-fade-in"
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
              <div className="flex flex-col items-center gap-3">
                <div 
                  className="rounded-full p-4"
                  style={{
                    background: 'linear-gradient(135deg, hsl(174 70% 45%) 0%, hsl(174 60% 40%) 100%)',
                    boxShadow: '0 0 30px hsl(174 60% 50% / 0.5)',
                  }}
                >
                  <Image className="h-7 w-7 text-white" />
                </div>
                <span 
                  className="text-sm font-semibold"
                  style={{ color: 'hsl(174 70% 60%)' }}
                >
                  {t.dropHere}
                </span>
              </div>
            </div>
          )}

          {/* Main content area */}
          <div className="px-5 py-6 md:px-8 md:py-8">
            
            {/* Image uploaded state */}
            {uploadedImage ? (
              <div className="flex flex-col items-center gap-4">
                {/* Image preview */}
                <div className="relative">
                  <img 
                    src={uploadedImage.preview} 
                    alt="Preview" 
                    className="h-20 w-20 md:h-24 md:w-24 rounded-xl object-cover"
                    style={{ 
                      boxShadow: '0 4px 20px hsl(0 0% 0% / 0.4), 0 0 30px hsl(174 60% 50% / 0.2)',
                      border: '2px solid hsl(174 60% 50% / 0.3)',
                    }}
                  />
                  <div 
                    className="absolute -bottom-1 -right-1 rounded-full p-1"
                    style={{
                      background: 'linear-gradient(135deg, hsl(174 70% 45%) 0%, hsl(174 60% 40%) 100%)',
                      boxShadow: '0 2px 8px hsl(0 0% 0% / 0.3)',
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                {/* File info */}
                <div className="text-center">
                  <p className="text-sm font-medium text-white/90 truncate max-w-[200px]">
                    {uploadedImage.file.name}
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    {(uploadedImage.file.size / 1024).toFixed(0)} KB · {t.imageReady}
                  </p>
                </div>
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all hover:bg-white/10"
                  style={{ 
                    color: 'hsl(0 0% 100% / 0.6)',
                    border: '1px solid hsl(0 0% 100% / 0.1)',
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                  {t.removeImage}
                </button>
              </div>
            ) : hasText ? (
              /* Text input active state */
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onPaste={handlePaste}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="min-h-[100px] resize-none border-0 bg-transparent text-center text-sm text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder={t.primaryText}
                  autoFocus
                />
              </div>
            ) : (
              /* Empty state - Split layout: Text left, Image right */
              <div className="flex items-stretch gap-4 w-full">
                {/* Text input zone */}
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onPaste={handlePaste}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={t.primaryText}
                    className="min-h-[100px] md:min-h-[110px] w-full resize-none rounded-xl border-0 bg-white/[0.04] px-4 py-4 text-center text-sm text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                    style={{
                      boxShadow: 'inset 0 2px 4px hsl(0 0% 0% / 0.1)',
                    }}
                  />
                </div>
                
                {/* Vertical divider */}
                <div 
                  className="w-px self-stretch my-2"
                  style={{
                    background: 'linear-gradient(to bottom, transparent, hsl(0 0% 100% / 0.15), transparent)',
                  }}
                />
                
                {/* Image upload zone - premium button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl px-6 md:px-8 transition-all hover:scale-105 group/img"
                  style={{
                    background: 'linear-gradient(135deg, hsl(174 50% 30% / 0.25), hsl(174 40% 25% / 0.15))',
                    border: '1px dashed hsl(174 50% 50% / 0.35)',
                    boxShadow: '0 4px 16px hsl(0 0% 0% / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.05)',
                  }}
                  title={language === 'fr' ? 'Ajouter une image' : 'Add an image'}
                >
                  {/* Icon container with glow */}
                  <div 
                    className="rounded-xl p-3 transition-all group-hover/img:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, hsl(174 60% 45% / 0.3), hsl(174 50% 40% / 0.2))',
                      boxShadow: '0 0 20px hsl(174 60% 50% / 0.2), 0 4px 12px hsl(0 0% 0% / 0.2)',
                    }}
                  >
                    <Image 
                      className="h-7 w-7 md:h-8 md:w-8" 
                      style={{ color: 'hsl(174 65% 60%)' }}
                    />
                  </div>
                  
                  {/* Label */}
                  <span 
                    className="text-[10px] md:text-[11px] font-medium tracking-wide uppercase"
                    style={{ color: 'hsl(174 60% 55% / 0.8)' }}
                  >
                    Image
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Transition cue - "Puis" on empty, just arrow (intensified) when content */}
      <div className="flex justify-center py-3">
        <div className="relative flex flex-col items-center gap-1">
          {/* "Puis" text - only visible on empty state */}
          {!hasContent && (
            <span 
              className="text-[10px] font-light tracking-[0.25em] uppercase transition-opacity duration-300"
              style={{
                color: 'hsl(174 65% 55% / 0.72)',
                textShadow: '0 0 10px hsl(174 70% 50% / 0.3)',
              }}
            >
              {language === 'fr' ? 'Puis' : 'Then'}
            </span>
          )}
          
          {/* Arrow - always visible, intensified when content is present */}
          <div 
            className="relative transition-transform duration-300"
            style={{
              animation: hasContent 
                ? 'arrow-bounce-intense 1.5s ease-in-out infinite' 
                : 'arrow-bounce 2s ease-in-out infinite',
              transform: hasContent ? 'scale(1.3)' : 'scale(1)',
            }}
          >
            {/* Glow behind arrow - intensified when content is present */}
            <div 
              className="absolute inset-0 rounded-full transition-all duration-300"
              style={{
                background: hasContent 
                  ? 'radial-gradient(circle, hsl(174 70% 55% / 0.7), transparent 70%)'
                  : 'radial-gradient(circle, hsl(174 70% 55% / 0.4), transparent 70%)',
                animation: hasContent 
                  ? 'arrow-glow-intense 1.5s ease-in-out infinite' 
                  : 'arrow-glow 2s ease-in-out infinite',
                filter: hasContent ? 'blur(10px)' : 'blur(6px)',
                transform: hasContent ? 'scale(3.5)' : 'scale(2.5)',
              }}
            />
            <svg 
              width={hasContent ? "22" : "18"}
              height={hasContent ? "12" : "10"}
              viewBox="0 0 18 10" 
              fill="none"
              className="relative transition-all duration-300"
            >
              <path 
                d="M1 1L9 9L17 1" 
                stroke={hasContent ? "hsl(174 80% 65%)" : "hsl(174 70% 60%)"} 
                strokeWidth={hasContent ? "2.5" : "2"}
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{
                  filter: hasContent 
                    ? 'drop-shadow(0 0 10px hsl(174 80% 60% / 0.8))'
                    : 'drop-shadow(0 0 6px hsl(174 70% 55% / 0.6))',
                }}
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Premium Analyze Button */}
      <div className="relative mt-4 md:mt-5 group">
        {/* Outer glow ring - only visible when content is ready */}
        {(hasText || hasImage) && (
          <div 
            className="absolute -inset-1.5 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, hsl(174 70% 50% / 0.5), hsl(200 80% 55% / 0.3), hsl(174 70% 50% / 0.5))',
              animation: 'button-pulse 2s ease-in-out infinite',
              filter: 'blur(12px)',
            }}
          />
        )}
        
        {/* Inner shimmer layer - only visible when content is ready */}
        {(hasText || hasImage) && (
          <div 
            className="absolute -inset-0.5 rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(174 65% 48%), hsl(180 60% 42%), hsl(174 65% 48%))',
            }}
          >
            {/* Animated shine effect */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, hsl(0 0% 100% / 0.15) 45%, hsl(0 0% 100% / 0.25) 50%, hsl(0 0% 100% / 0.15) 55%, transparent 60%)',
                animation: 'button-shine 3s ease-in-out infinite',
              }}
            />
          </div>
        )}
        
        <Button
          type="submit"
          disabled={isLoading || (!hasText && !hasImage)}
          className="relative w-full rounded-xl py-5 md:py-6 text-sm font-bold tracking-wide text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 border-0"
          style={{
            background: (hasText || hasImage)
              ? 'linear-gradient(135deg, hsl(174 65% 45%) 0%, hsl(180 55% 38%) 50%, hsl(174 60% 42%) 100%)'
              : 'linear-gradient(135deg, hsl(174 40% 35% / 0.6) 0%, hsl(180 35% 30% / 0.6) 50%, hsl(174 40% 32% / 0.6) 100%)',
            boxShadow: (hasText || hasImage)
              ? '0 0 40px hsl(174 60% 50% / 0.4), 0 8px 24px hsl(0 0% 0% / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.15), inset 0 -1px 0 hsl(0 0% 0% / 0.1)'
              : '0 4px 12px hsl(0 0% 0% / 0.2)',
            textShadow: '0 1px 2px hsl(0 0% 0% / 0.3)',
          }}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Search className="mr-2 h-5 w-5" style={{ filter: 'drop-shadow(0 1px 1px hsl(0 0% 0% / 0.2))' }} />
          )}
          <span className="relative">
            {t.analyze}
          </span>
        </Button>
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
        @keyframes button-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        @keyframes button-shine {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(100%); }
        }
        @keyframes arrow-bounce-intense {
          0%, 100% { transform: translateY(0) scale(1.3); }
          50% { transform: translateY(6px) scale(1.3); }
        }
        @keyframes arrow-glow-intense {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </form>
  );
};
