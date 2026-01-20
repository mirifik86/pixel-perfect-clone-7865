import { useState } from 'react';
import { FileText, RefreshCw, AlertTriangle, Camera, Loader2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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

interface ScreenshotEvidenceProps {
  extractedText: string;
  ocrConfidence: number;
  imageSignals: ImageSignals;
  onRerunAnalysis: (editedText: string) => void;
  isRerunning: boolean;
  language: 'en' | 'fr';
  imagePreview?: string;
  visualTextMismatch?: VisualTextMismatch;
  visualDescription?: string;
}

const translations = {
  en: {
    title: 'Screenshot Evidence',
    extractedText: 'Extracted Text',
    editText: 'Edit extracted text',
    rerunAnalysis: 'Re-run analysis',
    rerunning: 'Re-analyzing...',
    imageSignals: 'Image Signals',
    contextWarning: 'Critical Disclaimer',
    contextWarningText: 'This analysis is based on extracted text and limited visual context. Screenshots can be partial or misleading and do not constitute proof of factual claims.',
    ocrLowConfidence: 'OCR confidence is low. Crop or edit the extracted text, then re-run.',
    showPreview: 'Show original',
    hidePreview: 'Hide original',
    expand: 'Expand',
    collapse: 'Collapse',
    visualTextMismatch: 'Visual-Text Mismatch Detected',
    visualTextMismatchDesc: 'The image shows a different person/entity than the text refers to. No verified link exists.',
    visualDescription: 'Visual Description',
    signals: {
      screenshotLikelihood: {
        likely: 'Image appears to be a screenshot (likely).',
        uncertain: 'Image type uncertain (may not be a screenshot).',
      },
      blurLevel: {
        low: 'Image clarity: Good',
        medium: 'Image clarity: Moderate blur detected',
        high: 'Image clarity: Significant blur (may affect readability)',
      },
      compressionArtifacts: {
        low: 'Compression: Low artifacts',
        medium: 'Compression: Medium artifacts (may reduce readability)',
        high: 'Compression: High artifacts (quality degraded)',
      },
      suspiciousEditingHints: {
        none: 'No obvious editing indicators detected',
        possible: 'Possible editing hints (low confidence)',
      },
      metadataPresent: {
        yes: 'Metadata: Present',
        no: 'Metadata: Not detected',
        partial: 'Metadata: Partial',
      },
    },
  },
  fr: {
    title: 'Éléments de la capture',
    extractedText: 'Texte extrait',
    editText: 'Modifier le texte extrait',
    rerunAnalysis: 'Relancer l\'analyse',
    rerunning: 'Réanalyse...',
    imageSignals: 'Signaux image',
    contextWarning: 'Avertissement Critique',
    contextWarningText: 'Cette analyse est basée sur le texte extrait et un contexte visuel limité. Les captures d\'écran peuvent être partielles ou trompeuses et ne constituent pas une preuve de faits.',
    ocrLowConfidence: 'Confiance OCR faible. Recadrez ou modifiez le texte extrait, puis relancez.',
    showPreview: 'Voir l\'original',
    hidePreview: 'Masquer l\'original',
    expand: 'Développer',
    collapse: 'Réduire',
    visualTextMismatch: 'Incohérence Visuel-Texte Détectée',
    visualTextMismatchDesc: 'L\'image montre une personne/entité différente de celle mentionnée dans le texte. Aucun lien vérifié n\'existe.',
    visualDescription: 'Description Visuelle',
    signals: {
      screenshotLikelihood: {
        likely: 'L\'image semble être une capture d\'écran.',
        uncertain: 'Type d\'image incertain (peut-être pas une capture).',
      },
      blurLevel: {
        low: 'Netteté : Bonne',
        medium: 'Netteté : Flou modéré détecté',
        high: 'Netteté : Flou important (peut affecter la lisibilité)',
      },
      compressionArtifacts: {
        low: 'Compression : Faibles artefacts',
        medium: 'Compression : Artefacts moyens (lisibilité réduite)',
        high: 'Compression : Artefacts élevés (qualité dégradée)',
      },
      suspiciousEditingHints: {
        none: 'Aucun indicateur d\'édition détecté',
        possible: 'Indices d\'édition possibles (faible confiance)',
      },
      metadataPresent: {
        yes: 'Métadonnées : Présentes',
        no: 'Métadonnées : Non détectées',
        partial: 'Métadonnées : Partielles',
      },
    },
  },
};

export const ScreenshotEvidence = ({
  extractedText,
  ocrConfidence,
  imageSignals,
  onRerunAnalysis,
  isRerunning,
  language,
  imagePreview,
  visualTextMismatch,
  visualDescription,
}: ScreenshotEvidenceProps) => {
  const t = translations[language];
  const [editedText, setEditedText] = useState(extractedText);
  const [showPreview, setShowPreview] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isLowConfidence = ocrConfidence < 0.55 || extractedText.length < 40;
  const hasTextChanged = editedText.trim() !== extractedText.trim();

  const getSignalColor = (type: string, value: string): string => {
    const positiveValues = ['likely', 'low', 'none', 'yes'];
    const neutralValues = ['medium', 'partial', 'uncertain'];
    
    if (positiveValues.includes(value)) return 'text-emerald-400';
    if (neutralValues.includes(value)) return 'text-amber-400';
    return 'text-red-400';
  };

  const getSignalDot = (type: string, value: string): string => {
    const positiveValues = ['likely', 'low', 'none', 'yes'];
    const neutralValues = ['medium', 'partial', 'uncertain'];
    
    if (positiveValues.includes(value)) return 'bg-emerald-400';
    if (neutralValues.includes(value)) return 'bg-amber-400';
    return 'bg-red-400';
  };

  return (
    <div 
      className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] overflow-hidden"
      style={{
        boxShadow: '0 4px 20px hsl(0 0% 0% / 0.3)',
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: 'linear-gradient(135deg, hsl(174 60% 45% / 0.1) 0%, transparent 100%)',
          borderBottom: '1px solid hsl(0 0% 100% / 0.05)',
        }}
      >
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-white">{t.title}</h4>
        </div>
        <button className="text-white/50 hover:text-white transition-colors">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Collapsible content */}
      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4 space-y-4">
          {/* Context Warning - Always visible */}
          <div 
            className="flex items-start gap-3 rounded-lg p-3"
            style={{
              background: 'linear-gradient(135deg, hsl(45 80% 50% / 0.1) 0%, hsl(45 80% 50% / 0.05) 100%)',
              border: '1px solid hsl(45 80% 50% / 0.3)',
            }}
          >
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-400">{t.contextWarning}</p>
              <p className="text-xs text-amber-300/80 mt-0.5">{t.contextWarningText}</p>
            </div>
          </div>

          {/* Visual-Text Mismatch Alert - RULE 1 */}
          {visualTextMismatch?.detected && (
            <div 
              className="flex items-start gap-3 rounded-lg p-3"
              style={{
                background: 'linear-gradient(135deg, hsl(0 90% 45% / 0.15) 0%, hsl(0 90% 45% / 0.08) 100%)',
                border: '1px solid hsl(0 90% 50% / 0.5)',
              }}
            >
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-red-400">{t.visualTextMismatch}</p>
                <p className="text-xs text-red-300/90 mt-1">
                  {language === 'fr' 
                    ? `L'image montre "${visualTextMismatch.visible_entity}". Le texte fait référence à "${visualTextMismatch.text_entity}".`
                    : `The image shows "${visualTextMismatch.visible_entity}". The text refers to "${visualTextMismatch.text_entity}".`
                  }
                </p>
                <p className="text-xs text-red-300/70 mt-1">{t.visualTextMismatchDesc}</p>
              </div>
            </div>
          )}

          {/* Low OCR Confidence warning */}
          {isLowConfidence && (
            <div 
              className="flex items-start gap-3 rounded-lg p-3"
              style={{
                background: 'linear-gradient(135deg, hsl(0 80% 50% / 0.1) 0%, hsl(0 80% 50% / 0.05) 100%)',
                border: '1px solid hsl(0 80% 50% / 0.3)',
              }}
            >
              <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300">{t.ocrLowConfidence}</p>
            </div>
          )}

          {/* Visual Description - RULE 5 (Factual only) */}
          {visualDescription && (
            <div 
              className="rounded-lg p-3"
              style={{
                background: 'linear-gradient(135deg, hsl(210 60% 50% / 0.08) 0%, transparent 100%)',
                border: '1px solid hsl(210 60% 50% / 0.2)',
              }}
            >
              <p className="text-xs font-medium text-blue-400 mb-1">{t.visualDescription}</p>
              <p className="text-xs text-white/70">{visualDescription}</p>
            </div>
          )}

          {/* Image Preview Toggle */}
          {imagePreview && (
            <div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors mb-2"
              >
                {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPreview ? t.hidePreview : t.showPreview}
              </button>
              {showPreview && (
                <div className="rounded-lg overflow-hidden border border-white/10 mb-3">
                  <img src={imagePreview} alt="Original" className="max-h-32 w-auto mx-auto" />
                </div>
              )}
            </div>
          )}

          {/* Extracted Text */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-primary" />
              <label className="text-xs font-medium text-white/80">{t.extractedText}</label>
              <span className="text-[10px] text-white/40 ml-auto">
                OCR: {Math.round(ocrConfidence * 100)}%
              </span>
            </div>
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              placeholder={t.editText}
              className="min-h-[100px] bg-white/5 border-white/10 text-white/90 text-sm resize-none"
            />
            
            {/* Re-run button */}
            {hasTextChanged && (
              <Button
                onClick={() => onRerunAnalysis(editedText)}
                disabled={isRerunning || !editedText.trim()}
                className="mt-3 w-full"
                variant="outline"
                size="sm"
              >
                {isRerunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.rerunning}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t.rerunAnalysis}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Image Signals */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Camera className="h-4 w-4 text-primary" />
              <h5 className="text-xs font-medium text-white/80">{t.imageSignals}</h5>
            </div>
            <div className="space-y-2">
              {/* Screenshot likelihood */}
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${getSignalDot('screenshotLikelihood', imageSignals.screenshotLikelihood)}`} />
                <span className={`text-xs ${getSignalColor('screenshotLikelihood', imageSignals.screenshotLikelihood)}`}>
                  {t.signals.screenshotLikelihood[imageSignals.screenshotLikelihood]}
                </span>
              </div>
              
              {/* Blur level */}
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${getSignalDot('blurLevel', imageSignals.blurLevel)}`} />
                <span className={`text-xs ${getSignalColor('blurLevel', imageSignals.blurLevel)}`}>
                  {t.signals.blurLevel[imageSignals.blurLevel]}
                </span>
              </div>
              
              {/* Compression */}
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${getSignalDot('compressionArtifacts', imageSignals.compressionArtifacts)}`} />
                <span className={`text-xs ${getSignalColor('compressionArtifacts', imageSignals.compressionArtifacts)}`}>
                  {t.signals.compressionArtifacts[imageSignals.compressionArtifacts]}
                </span>
              </div>
              
              {/* Editing hints */}
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${getSignalDot('suspiciousEditingHints', imageSignals.suspiciousEditingHints)}`} />
                <span className={`text-xs ${getSignalColor('suspiciousEditingHints', imageSignals.suspiciousEditingHints)}`}>
                  {t.signals.suspiciousEditingHints[imageSignals.suspiciousEditingHints]}
                </span>
              </div>
              
              {/* Metadata */}
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${getSignalDot('metadataPresent', imageSignals.metadataPresent)}`} />
                <span className={`text-xs ${getSignalColor('metadataPresent', imageSignals.metadataPresent)}`}>
                  {t.signals.metadataPresent[imageSignals.metadataPresent]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed preview */}
      {!isExpanded && (
        <div className="px-4 py-3 border-t border-white/5">
          <p className="text-xs text-white/50 line-clamp-2">
            {extractedText.substring(0, 150)}...
          </p>
        </div>
      )}
    </div>
  );
};
