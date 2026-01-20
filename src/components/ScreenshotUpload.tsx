import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, FileImage, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScreenshotUploadProps {
  onImageReady: (file: File, preview: string) => void;
  onRemove: () => void;
  language: 'en' | 'fr';
  uploadedFile: { file: File; preview: string } | null;
}

const translations = {
  en: {
    title: 'Analyze a Screenshot',
    dragDrop: 'Drag & drop your screenshot here',
    or: 'or',
    browse: 'Browse files',
    recommendation: 'Best results: PNG screenshot, cropped to the claim + source.',
    constraints: 'PNG/JPG · up to 10MB',
    remove: 'Remove',
    launchAnalysis: 'Launch Analysis',
    fileSelected: 'File selected',
    fileTooLarge: 'File too large. Maximum 10MB.',
    invalidType: 'Invalid file type. Please use PNG or JPG.',
  },
  fr: {
    title: 'Analyser une capture d\'écran',
    dragDrop: 'Glissez-déposez votre capture ici',
    or: 'ou',
    browse: 'Parcourir',
    recommendation: 'Meilleurs résultats : capture PNG, recadrée sur l\'affirmation + source.',
    constraints: 'PNG/JPG · jusqu\'à 10Mo',
    remove: 'Supprimer',
    launchAnalysis: 'Lancer l\'analyse',
    fileSelected: 'Fichier sélectionné',
    fileTooLarge: 'Fichier trop volumineux. Maximum 10Mo.',
    invalidType: 'Type de fichier invalide. Utilisez PNG ou JPG.',
  },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export const ScreenshotUpload = ({ onImageReady, onRemove, language, uploadedFile }: ScreenshotUploadProps) => {
  const t = translations[language];
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t.invalidType);
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setError(t.fileTooLarge);
      return false;
    }
    
    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (!validateFile(file)) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      onImageReady(file, preview);
    };
    reader.readAsDataURL(file);
  }, [onImageReady, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // If file is uploaded, show preview
  if (uploadedFile) {
    return (
      <div className="w-full max-w-2xl animate-fade-in">
        <div 
          className="relative rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-4 backdrop-blur-md"
          style={{
            boxShadow: '0 8px 32px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.1)',
          }}
        >
          {/* Success indicator */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">{t.fileSelected}</span>
          </div>

          {/* Image preview */}
          <div className="flex flex-col items-center gap-4">
            <div 
              className="relative max-h-48 overflow-hidden rounded-lg border border-white/10"
              style={{
                boxShadow: '0 4px 16px hsl(0 0% 0% / 0.3)',
              }}
            >
              <img 
                src={uploadedFile.preview} 
                alt="Preview" 
                className="max-h-48 w-auto object-contain"
              />
            </div>

            {/* File info */}
            <div className="flex items-center gap-3 text-sm">
              <FileImage className="h-4 w-4 text-primary" />
              <span className="text-white/90 font-medium truncate max-w-[200px]">
                {uploadedFile.file.name}
              </span>
              <span className="text-white/50">
                {formatFileSize(uploadedFile.file.size)}
              </span>
            </div>

            {/* Remove button */}
            <button
              onClick={onRemove}
              className="flex items-center gap-1.5 text-sm text-white/60 hover:text-red-400 transition-colors"
            >
              <X className="h-4 w-4" />
              {t.remove}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Upload zone
  return (
    <div className="w-full max-w-2xl animate-fade-in">
      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8 transition-all duration-300
          ${isDragOver 
            ? 'border-primary bg-primary/10' 
            : 'border-white/20 bg-gradient-to-b from-white/[0.06] to-white/[0.02] hover:border-white/30 hover:from-white/[0.08] hover:to-white/[0.04]'
          }
        `}
        style={{
          boxShadow: isDragOver 
            ? '0 0 30px hsl(174 60% 45% / 0.2), 0 8px 32px hsl(0 0% 0% / 0.4)'
            : '0 8px 32px hsl(0 0% 0% / 0.3)',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          {/* Icon */}
          <div 
            className="rounded-full p-4"
            style={{
              background: 'linear-gradient(135deg, hsl(174 60% 45% / 0.2) 0%, hsl(174 60% 45% / 0.1) 100%)',
              boxShadow: '0 0 20px hsl(174 60% 45% / 0.15)',
            }}
          >
            <Upload className="h-8 w-8 text-primary" />
          </div>

          {/* Text */}
          <div className="text-center">
            <p className="text-sm font-medium text-white/90">{t.dragDrop}</p>
            <p className="mt-1 text-xs text-white/50">{t.or}</p>
            <span 
              className="mt-2 inline-block text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {t.browse}
            </span>
          </div>

          {/* Recommendation */}
          <div className="flex items-start gap-2 rounded-lg bg-white/5 px-4 py-2.5 mt-2">
            <ImageIcon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-white/70 leading-relaxed">
              {t.recommendation}
            </p>
          </div>

          {/* Constraints badge */}
          <span className="text-[11px] font-medium text-white/40 tracking-wide">
            {t.constraints}
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};
