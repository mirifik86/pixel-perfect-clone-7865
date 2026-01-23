import { useState, useEffect } from 'react';

interface MissionControlLoaderProps {
  language: 'en' | 'fr';
}

const translations = {
  en: {
    primary: 'Analysis in progress…',
    subtitle: 'Building a Trust Score',
    secondary: [
      'Extracting visual signals',
      'Evaluating credibility indicators',
      'Cross-verifying factual consistency',
      'Finalizing assessment',
    ],
  },
  fr: {
    primary: 'Analyse en cours…',
    subtitle: 'Construction du Score de confiance',
    secondary: [
      'Extraction des signaux visuels',
      'Évaluation des indicateurs de crédibilité',
      'Vérification croisée de la cohérence factuelle',
      'Finalisation de l\'évaluation',
    ],
  },
};

export const MissionControlLoader = ({ language }: MissionControlLoaderProps) => {
  const t = translations[language];
  const [secondaryIndex, setSecondaryIndex] = useState(0);
  const [scanPosition, setScanPosition] = useState(0);
  const [horizontalScanPosition, setHorizontalScanPosition] = useState(0);
  const [activeNodes, setActiveNodes] = useState<boolean[]>([false, false, false, false, false]);

  // Rotate secondary text every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondaryIndex((prev) => (prev + 1) % t.secondary.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [t.secondary.length]);

  // Smooth scanning line animations (vertical and horizontal)
  useEffect(() => {
    let animationFrame: number;
    let startTime: number;
    const verticalDuration = 4000; // 4 seconds per full cycle
    const horizontalDuration = 5500; // Slightly offset timing for visual interest

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      // Vertical scanning - smooth sine wave
      const verticalProgress = (elapsed % verticalDuration) / verticalDuration;
      const verticalPosition = Math.sin(verticalProgress * Math.PI * 2) * 0.5 + 0.5;
      setScanPosition(verticalPosition);
      
      // Horizontal scanning - offset phase for depth
      const horizontalProgress = (elapsed % horizontalDuration) / horizontalDuration;
      const horizontalPosition = Math.sin(horizontalProgress * Math.PI * 2 + Math.PI / 3) * 0.5 + 0.5;
      setHorizontalScanPosition(horizontalPosition);
      
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Sequential node activation
  useEffect(() => {
    const activateNode = (index: number) => {
      setActiveNodes((prev) => {
        const newNodes = [...prev];
        newNodes[index] = true;
        return newNodes;
      });

      // Deactivate after delay
      setTimeout(() => {
        setActiveNodes((prev) => {
          const newNodes = [...prev];
          newNodes[index] = false;
          return newNodes;
        });
      }, 1200);
    };

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * 5);
      activateNode(randomIndex);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="relative flex flex-col items-center justify-center w-full"
      style={{ 
        minHeight: '320px',
        maxWidth: '400px',
        margin: '0 auto'
      }}
    >
      {/* Dark elegant backdrop */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, hsl(220 30% 12% / 0.95) 0%, hsl(240 25% 8% / 0.98) 100%)',
          border: '1px solid hsl(220 20% 20% / 0.4)',
          boxShadow: '0 25px 60px -12px hsl(0 0% 0% / 0.6), inset 0 1px 0 hsl(220 30% 25% / 0.2)',
          backdropFilter: 'blur(20px)',
        }}
      />

      {/* Scanning area */}
      <div 
        className="relative z-10 flex flex-col items-center"
        style={{ padding: 'var(--space-8) var(--space-6)' }}
      >
        {/* LeenScore mini logo */}
        <div 
          className="mb-6 flex items-center justify-center"
          style={{
            opacity: 0.9,
          }}
        >
          <div 
            className="relative flex items-center gap-1.5"
            style={{
              fontSize: 'clamp(1rem, 0.9rem + 0.5vw, 1.25rem)',
            }}
          >
            <span 
              className="font-serif font-semibold"
              style={{
                color: 'hsl(174 65% 52%)',
                textShadow: '0 0 20px hsl(174 70% 50% / 0.5)',
              }}
            >
              Leen
            </span>
            <span 
              className="font-serif font-semibold"
              style={{
                color: 'hsl(0 0% 92%)',
              }}
            >
              Score
            </span>
          </div>
        </div>

        {/* Scanning visualization container */}
        <div 
          className="relative mb-8"
          style={{ 
            width: '200px', 
            height: '120px',
          }}
        >
          {/* Scanning grid background */}
          <div 
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{
              background: `
                linear-gradient(90deg, hsl(174 40% 25% / 0.05) 1px, transparent 1px),
                linear-gradient(hsl(174 40% 25% / 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              border: '1px solid hsl(174 30% 30% / 0.2)',
            }}
          />

          {/* Vertical scanning line */}
          <div 
            className="absolute h-full transition-none"
            style={{
              width: '2px',
              left: `${scanPosition * 100}%`,
              background: 'linear-gradient(180deg, transparent 0%, hsl(174 70% 55%) 30%, hsl(174 80% 60%) 50%, hsl(174 70% 55%) 70%, transparent 100%)',
              boxShadow: '0 0 20px 4px hsl(174 70% 50% / 0.6), 0 0 40px 8px hsl(174 60% 45% / 0.3)',
              filter: 'blur(0.5px)',
            }}
          />

          {/* Horizontal scanning line */}
          <div 
            className="absolute w-full transition-none"
            style={{
              height: '1.5px',
              top: `${horizontalScanPosition * 100}%`,
              background: 'linear-gradient(90deg, transparent 0%, hsl(174 60% 50% / 0.7) 20%, hsl(174 75% 58%) 50%, hsl(174 60% 50% / 0.7) 80%, transparent 100%)',
              boxShadow: '0 0 15px 3px hsl(174 65% 48% / 0.5), 0 0 30px 6px hsl(174 55% 42% / 0.25)',
              filter: 'blur(0.3px)',
            }}
          />

          {/* Intersection glow - where lines cross */}
          <div 
            className="absolute rounded-full pointer-events-none transition-none"
            style={{
              width: '10px',
              height: '10px',
              left: `calc(${scanPosition * 100}% - 5px)`,
              top: `calc(${horizontalScanPosition * 100}% - 5px)`,
              background: 'radial-gradient(circle, hsl(174 85% 65%) 0%, hsl(174 70% 55% / 0.6) 40%, transparent 70%)',
              boxShadow: '0 0 16px 4px hsl(174 80% 55% / 0.7)',
              opacity: 0.9,
            }}
          />

          {/* Signal detection nodes */}
          <div className="absolute inset-0 flex items-center justify-around px-4">
            {activeNodes.map((isActive, index) => (
              <div
                key={index}
                className="relative"
                style={{
                  top: `${(index % 3) * 15 - 15}px`,
                }}
              >
                <div 
                  className="rounded-full transition-all duration-500"
                  style={{
                    width: '8px',
                    height: '8px',
                    background: isActive 
                      ? 'hsl(174 80% 60%)' 
                      : 'hsl(220 20% 30%)',
                    boxShadow: isActive 
                      ? '0 0 12px 3px hsl(174 70% 55% / 0.8), 0 0 24px 6px hsl(174 60% 50% / 0.4)' 
                      : 'none',
                    opacity: isActive ? 1 : 0.4,
                  }}
                />
                {/* Ripple effect when active */}
                {isActive && (
                  <div 
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{
                      background: 'hsl(174 70% 55% / 0.3)',
                      animationDuration: '1s',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l rounded-tl" style={{ borderColor: 'hsl(174 50% 45% / 0.4)' }} />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r rounded-tr" style={{ borderColor: 'hsl(174 50% 45% / 0.4)' }} />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l rounded-bl" style={{ borderColor: 'hsl(174 50% 45% / 0.4)' }} />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r rounded-br" style={{ borderColor: 'hsl(174 50% 45% / 0.4)' }} />
        </div>

        {/* Primary text */}
        <h3 
          className="text-center font-sans font-medium mb-1"
          style={{
            fontSize: 'clamp(1rem, 0.95rem + 0.3vw, 1.125rem)',
            color: 'hsl(0 0% 95%)',
            letterSpacing: '0.02em',
            textShadow: '0 0 20px hsl(0 0% 100% / 0.2)',
          }}
        >
          {t.primary}
        </h3>

        {/* Subtitle - static, smaller */}
        <p 
          className="text-center font-sans mb-4"
          style={{
            fontSize: 'clamp(0.75rem, 0.7rem + 0.2vw, 0.85rem)',
            color: 'hsl(174 50% 70%)',
            letterSpacing: '0.04em',
            opacity: 0.9,
          }}
        >
          {t.subtitle}
        </p>

        {/* Secondary rotating text */}
        <p 
          key={secondaryIndex}
          className="text-center font-sans animate-fade-in"
          style={{
            fontSize: 'clamp(0.7rem, 0.65rem + 0.15vw, 0.8rem)',
            color: 'hsl(220 15% 55%)',
            letterSpacing: '0.03em',
            opacity: 0.7,
          }}
        >
          {t.secondary[secondaryIndex]}
        </p>

        {/* Subtle progress indicator dots */}
        <div 
          className="flex gap-2 mt-6"
          style={{ opacity: 0.6 }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: '4px',
                height: '4px',
                background: i === secondaryIndex 
                  ? 'hsl(174 70% 55%)' 
                  : 'hsl(220 20% 35%)',
                boxShadow: i === secondaryIndex 
                  ? '0 0 8px 2px hsl(174 60% 50% / 0.5)' 
                  : 'none',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Ambient glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: 'radial-gradient(ellipse 50% 30% at 50% 30%, hsl(174 60% 45% / 0.08) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};
