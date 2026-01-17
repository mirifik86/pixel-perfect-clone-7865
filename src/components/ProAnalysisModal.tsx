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
      subtitle: "Advanced context for informed decisions",
      features: [
        {
          title: "Image Signal Analysis",
          description: "Detection of metadata, AI-generated indicators, and visual manipulation markers."
        },
        {
          title: "Deep Source Corroboration",
          description: "Cross-referencing with verified databases and institutional records."
        },
        {
          title: "Contextual Risk Mapping",
          description: "Identification of amplification patterns and propagation dynamics."
        }
      ],
      disclaimer: "Pro Analysis does not provide absolute truth. It adds additional context to support your own judgment.",
      status: "Coming soon"
    },
    fr: {
      title: "Analyse Pro",
      subtitle: "Contexte avancé pour des décisions éclairées",
      features: [
        {
          title: "Analyse des signaux image",
          description: "Détection des métadonnées, indicateurs d'images générées par IA et marqueurs de manipulation visuelle."
        },
        {
          title: "Corroboration approfondie des sources",
          description: "Recoupement avec des bases de données vérifiées et des registres institutionnels."
        },
        {
          title: "Cartographie des risques contextuels",
          description: "Identification des schémas d'amplification et des dynamiques de propagation."
        }
      ],
      disclaimer: "L'Analyse Pro ne fournit pas de vérité absolue. Elle apporte un contexte supplémentaire pour éclairer votre propre jugement.",
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

        <div className="mt-4 space-y-4">
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

        <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-3">
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
