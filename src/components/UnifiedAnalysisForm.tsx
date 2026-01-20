import { useState, useRef, useCallback } from 'react';
import { Search, Loader2, CheckCircle2, FileText, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface UnifiedAnalysisFormProps {
  onAnalyzeText: (input: string) => void;
  onImageReady: (file: File, preview: string) => void;
  isLoading: boolean;
  language: 'en' | 'fr';
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

export const UnifiedAnalysisForm = ({ onAnalyzeText, onImageReady, isLoading, language }: UnifiedAnalysisFormProps) => {
  const [input, setInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = translations[language];
  
  const hasImage = Boolean(uploadedImage);
  const hasText = input.trim().length > 0;
  const isActive = isDragOver || isFocused;

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

  const handleCardClick = () => {
    if (!hasImage && !hasText) {
      // Show file picker on tap when empty
      fileInputRef.current?.click();
    } else if (!hasImage) {
      // Focus textarea if there's text
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
              /* Empty state - Premium drop zone */
              <div className="flex flex-col items-center gap-4 py-2">
                {/* Combined icon with aura */}
                <div className="relative">
                  {/* Icon aura */}
                  <div 
                    className="absolute -inset-3 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, hsl(174 60% 50% / 0.2) 0%, transparent 70%)',
                      animation: 'icon-pulse 2.5s ease-in-out infinite',
                    }}
                  />
                  <div 
                    className="relative flex items-center justify-center rounded-xl p-4"
                    style={{
                      background: 'linear-gradient(135deg, hsl(0 0% 100% / 0.08), hsl(0 0% 100% / 0.03))',
                      border: '1px solid hsl(0 0% 100% / 0.1)',
                      boxShadow: '0 4px 16px hsl(0 0% 0% / 0.2)',
                    }}
                  >
                    {/* Combined document + image icon */}
                    <div className="relative">
                      <FileText 
                        className="h-7 w-7 md:h-8 md:w-8" 
                        style={{ color: 'hsl(0 0% 100% / 0.5)' }}
                      />
                      <div 
                        className="absolute -bottom-1 -right-1.5 rounded p-0.5"
                        style={{
                          background: 'linear-gradient(135deg, hsl(174 65% 50%), hsl(174 55% 45%))',
                          boxShadow: '0 2px 6px hsl(174 60% 40% / 0.4)',
                        }}
                      >
                        <Image className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary text */}
                <p 
                  className="text-base md:text-lg font-medium text-center leading-snug"
                  style={{ color: 'hsl(0 0% 100% / 0.85)' }}
                >
                  {t.primaryText}
                </p>
                
                {/* Secondary hint */}
                <p 
                  className="text-[11px] md:text-xs font-medium tracking-wider uppercase"
                  style={{ color: 'hsl(0 0% 100% / 0.35)' }}
                >
                  {t.hint}
                </p>

                {/* Hidden textarea for paste detection */}
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onPaste={handlePaste}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="absolute inset-0 opacity-0 cursor-pointer resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ minHeight: '100%' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Transition cue: PUIS ↓ */}
      {!hasImage && !hasText && (
        <div className="relative mt-3 flex flex-col items-center gap-0.5">
          {/* Subtle synchronized pulse glow - tight around word */}
          <div 
            className="absolute -inset-x-2 -inset-y-2 rounded-full"
            style={{
              background: 'radial-gradient(ellipse 100% 120% at center, hsl(174 70% 50% / 0.4), hsl(174 70% 55% / 0.15) 60%, transparent 100%)',
              animation: 'puis-pulse 2s ease-in-out infinite',
              animationDelay: '1s',
              filter: 'blur(6px)',
            }}
          />
          <span
            className="relative text-[11px] font-semibold tracking-[0.2em] uppercase"
            style={{
              color: 'hsl(174 70% 60%)',
              textShadow: '0 0 12px hsl(174 80% 55% / 0.5), 0 0 20px hsl(174 80% 50% / 0.3)',
              animation: 'puis-text-pulse 2s ease-in-out infinite',
              animationDelay: '1s',
            }}
          >
            {language === 'fr' ? 'Puis' : 'Then'}
          </span>
          <div 
            className="relative flex flex-col items-center"
            style={{
              animation: 'puis-arrow-pulse 2s ease-in-out infinite',
              animationDelay: '1s',
            }}
          >
            <svg 
              width="16" 
              height="10" 
              viewBox="0 0 16 10" 
              fill="none"
              style={{
                filter: 'drop-shadow(0 0 3px hsl(174 80% 50% / 0.3)) drop-shadow(0 0 8px hsl(174 80% 45% / 0.15))',
              }}
            >
              <path 
                d="M1 1L8 8L15 1" 
                stroke="hsl(174 70% 60% / 0.85)" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}
      
      {/* Analyze Button */}
      <div className="relative mt-4 md:mt-5">
        <div 
          className="absolute -inset-1 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, hsl(174 60% 45% / 0.35), hsl(174 60% 55% / 0.2), hsl(174 60% 45% / 0.35))',
            animation: 'button-pulse 2s ease-in-out infinite',
            animationDelay: '0.5s',
            filter: 'blur(10px)',
          }}
        />
        
        <Button
          type="submit"
          disabled={isLoading || (!hasText && !hasImage)}
          className="relative w-full rounded-xl bg-primary py-5 md:py-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          style={{
            boxShadow: '0 0 30px hsl(174 60% 45% / 0.35), 0 4px 16px hsl(0 0% 0% / 0.25)',
          }}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Search className="mr-2 h-5 w-5" />
          )}
          {t.analyze}
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
          0%, 100% { opacity: 0.4; transform: scale(0.98); }
          50% { opacity: 0.8; transform: scale(1.01); }
        }
        @keyframes puis-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes puis-text-pulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        @keyframes puis-arrow-pulse {
          0%, 100% { transform: translateY(0); opacity: 0.8; }
          50% { transform: translateY(2px); opacity: 1; }
        }
      `}</style>
    </form>
  );
};
