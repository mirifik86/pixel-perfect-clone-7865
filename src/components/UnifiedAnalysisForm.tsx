import { useState, useMemo, useRef, useCallback } from 'react';
import { Search, Loader2, CheckCircle2, ChevronDown, ImagePlus, X, Type } from 'lucide-react';
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
    analyze: 'Analyze',
    description: 'We analyze source credibility, linguistic patterns, and context to help you understand online information.',
    urlDetected: 'URL detected',
    imageReady: 'Image ready',
    removeImage: 'Remove',
  },
  fr: {
    analyze: 'Analyser',
    description: 'Nous analysons la crédibilité des sources, les modèles linguistiques et le contexte pour vous aider à comprendre les informations en ligne.',
    urlDetected: 'URL détectée',
    imageReady: 'Image prête',
    removeImage: 'Retirer',
  },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const isValidUrl = (text: string): boolean => {
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
  return urlPattern.test(text.trim());
};

export const UnifiedAnalysisForm = ({ onAnalyzeText, onImageReady, isLoading, language }: UnifiedAnalysisFormProps) => {
  const [input, setInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];
  
  const hasValidUrl = useMemo(() => isValidUrl(input), [input]);
  const hasImage = Boolean(uploadedImage);
  const hasText = input.trim().length > 0;

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
      setInput(''); // Clear text when image is added
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

  const handleRemoveImage = () => {
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
    // Clear image if user starts typing
    if (uploadedImage && e.target.value.trim()) {
      handleRemoveImage();
    }
  };

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

      {/* Input container with subtle pulse glow */}
      <div className="relative">
        {/* Drag overlay */}
        {isDragOver && (
          <div 
            className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border-2 border-dashed"
            style={{
              borderColor: 'hsl(174 70% 55%)',
              background: 'hsl(174 60% 45% / 0.1)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span className="text-sm font-medium" style={{ color: 'hsl(174 70% 55%)' }}>
              {language === 'fr' ? 'Déposez l\'image ici' : 'Drop image here'}
            </span>
          </div>
        )}

        {/* Subtle pulse ring for input area */}
        <div 
          className="absolute -inset-0.5 rounded-xl opacity-60"
          style={{
            background: 'linear-gradient(135deg, hsl(174 60% 45% / 0.15), transparent, hsl(174 60% 45% / 0.1))',
            animation: 'pulse-glow 3s ease-in-out infinite',
          }}
        />
        
        <div 
          className="relative rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-4 backdrop-blur-md transition-all duration-300"
          style={{
            boxShadow: (hasValidUrl || hasImage)
              ? '0 0 30px hsl(174 60% 45% / 0.2), 0 8px 32px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.1)'
              : '0 8px 32px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.1)',
          }}
        >
          {/* Status indicators - bottom right corner */}
          {(hasValidUrl || hasImage) && (
            <div className="absolute bottom-2 right-3 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary">
                {hasImage ? t.imageReady : t.urlDetected}
              </span>
            </div>
          )}
          

          {/* Upload Icon - Right side (clickable) - Premium & visible */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-all duration-200 hover:scale-105"
            style={{ 
              background: hasImage 
                ? 'linear-gradient(135deg, hsl(174 70% 40%) 0%, hsl(174 60% 35%) 100%)'
                : 'hsl(0 0% 100% / 0.08)',
              border: hasImage ? 'none' : '1px solid hsl(0 0% 100% / 0.15)',
              boxShadow: hasImage 
                ? '0 0 12px hsl(174 60% 45% / 0.4)'
                : '0 2px 8px hsl(0 0% 0% / 0.2)',
            }}
            title={language === 'fr' ? 'Ajouter une image' : 'Add an image'}
          >
            <ImagePlus 
              className="h-4 w-4" 
              style={{
                color: hasImage 
                  ? 'white'
                  : 'hsl(0 0% 100% / 0.7)'
              }}
            />
            <span 
              className="text-[10px] font-medium tracking-wide"
              style={{
                color: hasImage 
                  ? 'white'
                  : 'hsl(0 0% 100% / 0.6)'
              }}
            >
              {language === 'fr' ? 'Image' : 'Image'}
            </span>
          </button>

          {/* Image Preview */}
          {uploadedImage && (
            <div className="mb-3 flex items-center gap-3 rounded-lg p-2" style={{ background: 'hsl(0 0% 100% / 0.05)' }}>
              <img 
                src={uploadedImage.preview} 
                alt="Preview" 
                className="h-12 w-12 rounded-md object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/80 truncate">{uploadedImage.file.name}</p>
                <p className="text-[10px] text-white/50">
                  {(uploadedImage.file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] transition-colors hover:bg-white/10"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <X className="h-3 w-3" />
                {t.removeImage}
              </button>
            </div>
          )}
          
          {/* Visual placeholder with icons */}
          {!input && !uploadedImage && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4">
              {/* Two input types as visual icons */}
              <div className="flex items-center justify-center gap-8 mb-3">
                {/* Text icon */}
                <div className="flex flex-col items-center gap-1.5">
                  <div 
                    className="flex h-11 w-11 items-center justify-center rounded-full"
                    style={{ 
                      background: 'hsl(0 0% 100% / 0.08)',
                      border: '1px solid hsl(0 0% 100% / 0.12)'
                    }}
                  >
                    <Type className="h-5 w-5 text-white/60" />
                  </div>
                  <span className="text-[9px] font-medium text-white/40 uppercase tracking-wider">
                    {language === 'fr' ? 'Texte' : 'Text'}
                  </span>
                </div>
                
                {/* Image icon */}
                <div className="flex flex-col items-center gap-1.5">
                  <div 
                    className="flex h-11 w-11 items-center justify-center rounded-full"
                    style={{ 
                      background: 'hsl(0 0% 100% / 0.08)',
                      border: '1px solid hsl(0 0% 100% / 0.12)'
                    }}
                  >
                    <ImagePlus className="h-5 w-5 text-white/60" />
                  </div>
                  <span className="text-[9px] font-medium text-white/40 uppercase tracking-wider">Image</span>
                </div>
              </div>
              
              {/* Arrow hint */}
              <div 
                className="mt-1 flex flex-col items-center"
                style={{
                  filter: 'drop-shadow(0 0 6px hsl(174 80% 50% / 0.6)) drop-shadow(0 0 12px hsl(174 80% 45% / 0.4))',
                }}
              >
                <ChevronDown 
                  className="h-4 w-4 md:h-5 md:w-5 animate-bounce" 
                  style={{ 
                    color: 'hsl(174 70% 55%)',
                    animationDuration: '1.5s',
                  }} 
                />
              </div>
            </div>
          )}
          
          <Textarea
            value={input}
            onChange={handleInputChange}
            className="min-h-[50px] md:min-h-[80px] resize-none border-0 bg-transparent text-center text-sm text-white focus-visible:ring-0 focus-visible:ring-offset-0 px-10"
            disabled={Boolean(uploadedImage)}
          />
        </div>
      </div>
      
      {/* Analyze Button with premium pulse effect */}
      <div className="relative mt-2 md:mt-4">
        {/* Outer pulse ring */}
        <div 
          className="absolute -inset-1 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(174 60% 45% / 0.4), hsl(174 60% 55% / 0.2), hsl(174 60% 45% / 0.4))',
            animation: 'button-pulse 2s ease-in-out infinite',
            animationDelay: '0.5s',
            filter: 'blur(8px)',
          }}
        />
        
        <Button
          type="submit"
          disabled={isLoading || (!input.trim() && !uploadedImage)}
          className="relative w-full bg-primary py-5 md:py-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          style={{
            boxShadow: '0 0 25px hsl(174 60% 45% / 0.4), 0 4px 12px hsl(0 0% 0% / 0.25)',
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

      <p className="mt-2 md:mt-4 text-center text-[10px] md:text-sm text-muted-foreground/80">
        {t.description}
      </p>
      
      {/* CSS for custom pulse animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.01); }
        }
        @keyframes button-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.98); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
      `}</style>
    </form>
  );
};
