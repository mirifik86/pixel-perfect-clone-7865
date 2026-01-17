import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: 'en' | 'fr';
}

export const ProAnalysisModal = ({ open, onOpenChange, language }: ProAnalysisModalProps) => {
  const content = {
    en: {
      title: "Pro Analysis",
      subtitle: "Additional context for informed judgment",
      features: [
        {
          title: "Image Signal Analysis",
          description: "Contextual assessment of image origin, metadata indicators, and visual-textual coherence."
        },
        {
          title: "Enhanced Source Verification",
          description: "Deeper cross-referencing with institutional records and verified databases."
        },
        {
          title: "Contextual Risk Indicators",
          description: "Identification of patterns that may amplify or reduce credibility concerns."
        }
      ],
      disclaimer: "Pro Analysis provides additional context to support your own judgment. It does not determine absolute truth or falsity.",
      note: "This feature adds depth to the standard analysis. Your current results remain unchanged.",
      status: "Coming soon"
    },
    fr: {
      title: "Analyse Pro",
      subtitle: "Contexte supplémentaire pour un jugement éclairé",
      features: [
        {
          title: "Analyse des signaux image",
          description: "Évaluation contextuelle de l'origine des images, indicateurs de métadonnées et cohérence visuelle-textuelle."
        },
        {
          title: "Vérification approfondie des sources",
          description: "Recoupement élargi avec des registres institutionnels et des bases de données vérifiées."
        },
        {
          title: "Indicateurs de risque contextuel",
          description: "Identification des schémas pouvant amplifier ou réduire les préoccupations de crédibilité."
        }
      ],
      disclaimer: "L'Analyse Pro apporte un contexte supplémentaire pour éclairer votre propre jugement. Elle ne détermine pas la vérité ou la fausseté absolue.",
      note: "Cette fonctionnalité enrichit l'analyse standard. Vos résultats actuels restent inchangés.",
      status: "Bientôt disponible"
    }
  };

  const t = content[language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md border-border/50 bg-background/95 backdrop-blur-xl"
        style={{
          boxShadow: '0 0 40px hsl(174 60% 45% / 0.15), 0 20px 40px hsl(0 0% 0% / 0.4)'
        }}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {t.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t.subtitle}
          </p>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {t.features.map((feature, index) => (
            <div 
              key={index}
              className="rounded-lg border border-border/30 bg-muted/20 p-3"
            >
              <h4 className="text-sm font-medium text-foreground">
                {feature.title}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Informational note - neutral tone */}
        <div className="mt-4 rounded-lg border border-border/20 bg-muted/10 p-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t.note}
          </p>
        </div>

        {/* Disclaimer - institutional tone */}
        <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs leading-relaxed text-foreground/70">
            {t.disclaimer}
          </p>
        </div>

        <div className="mt-4 flex justify-center">
          <span 
            className="rounded-full border border-border/50 px-4 py-1.5 text-xs font-medium text-muted-foreground"
          >
            {t.status}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
