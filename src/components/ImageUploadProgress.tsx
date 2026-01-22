import { CheckCircle, Image, Upload, Sparkles } from "lucide-react";

type UploadStage = "validating" | "optimizing" | "uploading" | "analyzing" | "complete" | null;

interface ImageUploadProgressProps {
  stage: UploadStage;
  language: "en" | "fr";
}

const translations = {
  en: {
    validating: "Validating image...",
    optimizing: "Optimizing image...",
    uploading: "Uploading...",
    analyzing: "Analyzing...",
    complete: "Complete!",
  },
  fr: {
    validating: "Validation de l'image...",
    optimizing: "Optimisation...",
    uploading: "Téléversement...",
    analyzing: "Analyse en cours...",
    complete: "Terminé !",
  },
};

const stages: UploadStage[] = ["validating", "optimizing", "uploading", "analyzing"];

export const ImageUploadProgress = ({ stage, language }: ImageUploadProgressProps) => {
  if (!stage) return null;

  const t = translations[language];
  const currentIndex = stages.indexOf(stage);
  const isComplete = stage === "complete";

  const getStageIcon = (s: UploadStage, index: number) => {
    const isActive = currentIndex === index;
    const isPast = currentIndex > index || isComplete;

    const iconClass = `w-4 h-4 transition-all duration-300 ${
      isPast
        ? "text-emerald-400"
        : isActive
          ? "text-cyan-400 animate-pulse"
          : "text-muted-foreground/40"
    }`;

    switch (s) {
      case "validating":
        return isPast ? <CheckCircle className={iconClass} /> : <Image className={iconClass} />;
      case "optimizing":
        return isPast ? <CheckCircle className={iconClass} /> : <Sparkles className={iconClass} />;
      case "uploading":
        return isPast ? <CheckCircle className={iconClass} /> : <Upload className={iconClass} />;
      case "analyzing":
        return isPast ? <CheckCircle className={iconClass} /> : <Sparkles className={iconClass} />;
      default:
        return null;
    }
  };

  const getStageLabel = (s: UploadStage) => {
    if (!s) return "";
    return t[s] || "";
  };

  return (
    <div className="w-full max-w-md mx-auto py-4 px-2">
      {/* Progress bar container */}
      <div className="relative">
        {/* Background track */}
        <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
          {/* Animated progress fill */}
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{
              width: isComplete
                ? "100%"
                : `${((currentIndex + 0.5) / stages.length) * 100}%`,
            }}
          />
        </div>

        {/* Stage indicators */}
        <div className="flex justify-between mt-3">
          {stages.map((s, index) => {
            const isActive = currentIndex === index;
            const isPast = currentIndex > index || isComplete;

            return (
              <div
                key={s}
                className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                  isActive ? "scale-110" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isPast
                      ? "bg-emerald-500/20 ring-1 ring-emerald-400/50"
                      : isActive
                        ? "bg-cyan-500/20 ring-2 ring-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                        : "bg-muted/20 ring-1 ring-muted/30"
                  }`}
                >
                  {getStageIcon(s, index)}
                </div>
                <span
                  className={`text-[10px] font-medium tracking-wide uppercase transition-colors duration-300 ${
                    isPast
                      ? "text-emerald-400/80"
                      : isActive
                        ? "text-cyan-400"
                        : "text-muted-foreground/40"
                  }`}
                >
                  {s === "validating"
                    ? language === "fr"
                      ? "Validation"
                      : "Validate"
                    : s === "optimizing"
                      ? language === "fr"
                        ? "Optimisation"
                        : "Optimize"
                      : s === "uploading"
                        ? language === "fr"
                          ? "Upload"
                          : "Upload"
                        : language === "fr"
                          ? "Analyse"
                          : "Analyze"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current status message */}
      <div className="text-center mt-4">
        <p
          className={`text-sm font-medium tracking-wide transition-all duration-300 ${
            isComplete ? "text-emerald-400" : "text-cyan-400"
          }`}
        >
          {isComplete ? (language === "fr" ? "Terminé !" : "Complete!") : getStageLabel(stage)}
        </p>
      </div>
    </div>
  );
};
