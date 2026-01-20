import { useState, useRef, useCallback } from 'react';
import { Search, Loader2, CheckCircle2, FileImage, X } from 'lucide-react';
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
    placeholder: 'Paste text or drop an image to analyze',
    hint: 'Text · PNG · JPG · Screenshots',
    analyze: 'Analyze',
    imageReady: 'Ready',
    removeImage: 'Remove',
    dropHere: 'Drop image here',
  },
  fr: {
    placeholder: 'Collez du texte ou déposez une image à analyser',
    hint: 'Texte · PNG · JPG · Captures d\'écran',
    analyze: 'Analyser',
    imageReady: 'Prêt',
    removeImage: 'Retirer',
    dropHere: 'Déposez l\'image ici',
  },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export const UnifiedAnalysisForm = ({ onAnalyzeText, onImageReady, isLoading, language }: UnifiedAnalysisFormProps) => {
  const [input, setInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];
  
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

      {/* Main input card */}
      <div className="relative">
        {/* Drag overlay */}
        {isDragOver && (
          <div 
            className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl border-2 border-dashed"
            style={{
              borderColor: 'hsl(174 70% 55%)',
              background: 'hsl(174 60% 45% / 0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <FileImage className="h-8 w-8" style={{ color: 'hsl(174 70% 55%)' }} />
              <span className="text-sm font-medium" style={{ color: 'hsl(174 70% 55%)' }}>
                {t.dropHere}
              </span>
            </div>
          </div>
        )}

        {/* Subtle glow ring */}
        <div 
          className="absolute -inset-0.5 rounded-2xl opacity-50"
          style={{
            background: 'linear-gradient(135deg, hsl(174 60% 45% / 0.2), transparent, hsl(174 60% 45% / 0.15))',
            animation: 'pulse-glow 3s ease-in-out infinite',
          }}
        />
        
        {/* Glass card */}
        <div 
          className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-xl transition-all duration-300"
          style={{
            boxShadow: hasImage
              ? '0 0 40px hsl(174 60% 45% / 0.25), 0 8px 32px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.1)'
              : '0 8px 32px hsl(0 0% 0% / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.08)',
          }}
        >
          {/* Top icon - clickable for image upload */}
          <div className="flex justify-center pt-4 pb-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group flex items-center justify-center rounded-full p-3 transition-all duration-200 hover:scale-110"
              style={{ 
                background: hasImage 
                  ? 'linear-gradient(135deg, hsl(174 70% 42%) 0%, hsl(174 60% 38%) 100%)'
                  : 'hsl(0 0% 100% / 0.06)',
                border: hasImage ? 'none' : '1px solid hsl(0 0% 100% / 0.1)',
                boxShadow: hasImage 
                  ? '0 0 20px hsl(174 60% 45% / 0.5), 0 4px 12px hsl(0 0% 0% / 0.3)'
                  : '0 2px 8px hsl(0 0% 0% / 0.15)',
              }}
              title={language === 'fr' ? 'Cliquez pour ajouter une image' : 'Click to add an image'}
            >
              <FileImage 
                className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" 
                style={{
                  color: hasImage ? 'white' : 'hsl(0 0% 100% / 0.5)'
                }}
              />
            </button>
          </div>

          {/* Image Preview */}
          {uploadedImage && (
            <div className="mx-4 mb-2 flex items-center gap-3 rounded-xl p-2.5" style={{ background: 'hsl(0 0% 100% / 0.05)' }}>
              <img 
                src={uploadedImage.preview} 
                alt="Preview" 
                className="h-14 w-14 rounded-lg object-cover"
                style={{ boxShadow: '0 2px 8px hsl(0 0% 0% / 0.3)' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/80 truncate font-medium">{uploadedImage.file.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  <span className="text-[10px] text-primary font-medium">{t.imageReady}</span>
                  <span className="text-[10px] text-white/40">· {(uploadedImage.file.size / 1024).toFixed(0)} KB</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-medium transition-all hover:bg-white/10"
                style={{ color: 'hsl(0 0% 100% / 0.5)' }}
              >
                <X className="h-3 w-3" />
                {t.removeImage}
              </button>
            </div>
          )}
          
          {/* Textarea with placeholder */}
          <div className="relative px-4 pb-4">
            {!input && !uploadedImage && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4">
                <p className="text-sm font-medium text-white/70 text-center">
                  {t.placeholder}
                </p>
                <p className="mt-1.5 text-[10px] font-medium tracking-wider text-white/30 uppercase">
                  {t.hint}
                </p>
                
                {/* "Puis" hint with arrow - synchronized with PRÊT À ANALYSER pulse */}
                <div className="relative mt-2 flex flex-col items-center gap-0.5">
                  {/* Subtle synchronized pulse glow - 50% intensity of PRÊT À ANALYSER */}
                  <div 
                    className="absolute -inset-x-6 -inset-y-3 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, hsl(174 70% 50% / 0.35), hsl(174 70% 55% / 0.2), hsl(174 70% 50% / 0.35))',
                      animation: 'puis-pulse 2s ease-in-out infinite',
                      animationDelay: '1s',
                      filter: 'blur(10px)',
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
              </div>
            )}
            
            <Textarea
              value={input}
              onChange={handleInputChange}
              className="min-h-[60px] md:min-h-[70px] resize-none border-0 bg-transparent text-center text-sm text-white placeholder:text-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={Boolean(uploadedImage)}
            />
          </div>
        </div>
      </div>
      
      {/* Analyze Button */}
      <div className="relative mt-3 md:mt-4">
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
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.005); }
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
