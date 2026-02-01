import { CheckCircle, HelpCircle, XCircle } from 'lucide-react';

interface KeyPoints {
  confirmed: number;
  uncertain: number;
  contradicted: number;
}

interface SourcesBuckets {
  corroborate?: unknown[];
  contradict?: unknown[];
  neutral?: unknown[];
}

interface ProKeyPointsProps {
  keyPoints?: KeyPoints;
  sourcesBuckets?: SourcesBuckets;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    title: 'PRO Key Points',
    confirmed: 'Confirmed',
    uncertain: 'Uncertain',
    contradicted: 'Contradicted',
  },
  fr: {
    title: 'Points clés PRO',
    confirmed: 'Confirmé',
    uncertain: 'Incertain',
    contradicted: 'Contredit',
  },
};

export const ProKeyPoints = ({ keyPoints, sourcesBuckets, language }: ProKeyPointsProps) => {
  const t = translations[language];
  
  // Use provided keyPoints or compute fallback from sourcesBuckets
  let confirmed = keyPoints?.confirmed ?? 0;
  let uncertain = keyPoints?.uncertain ?? 0;
  let contradicted = keyPoints?.contradicted ?? 0;
  
  // Fallback logic if keyPoints is missing
  if (!keyPoints && sourcesBuckets) {
    const hasCorroborate = (sourcesBuckets.corroborate?.length ?? 0) > 0;
    const hasContradict = (sourcesBuckets.contradict?.length ?? 0) > 0;
    
    confirmed = hasCorroborate ? 1 : 0;
    contradicted = hasContradict ? 1 : 0;
    uncertain = (!hasCorroborate && !hasContradict) ? 1 : 0;
  }
  
  const counters = [
    { 
      key: 'confirmed', 
      label: t.confirmed, 
      value: confirmed,
      icon: CheckCircle,
      activeColor: 'hsl(145 55% 42%)',
      activeBg: 'hsl(145 40% 95%)',
      activeBorder: 'hsl(145 40% 82%)',
    },
    { 
      key: 'uncertain', 
      label: t.uncertain, 
      value: uncertain,
      icon: HelpCircle,
      activeColor: 'hsl(35 70% 50%)',
      activeBg: 'hsl(35 50% 95%)',
      activeBorder: 'hsl(35 50% 82%)',
    },
    { 
      key: 'contradicted', 
      label: t.contradicted, 
      value: contradicted,
      icon: XCircle,
      activeColor: 'hsl(0 65% 50%)',
      activeBg: 'hsl(0 40% 96%)',
      activeBorder: 'hsl(0 40% 85%)',
    },
  ];

  return (
    <div 
      className="analysis-card mb-6"
      style={{
        background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(260 20% 98%) 100%)',
        border: '1px solid hsl(260 30% 88%)',
        boxShadow: '0 4px 24px hsl(260 30% 50% / 0.06)',
      }}
    >
      <h3 className="font-serif text-lg font-semibold text-slate-900 mb-4">
        {t.title}
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        {counters.map(({ key, label, value, icon: Icon, activeColor, activeBg, activeBorder }) => {
          const isActive = value > 0;
          
          return (
            <div 
              key={key}
              className="rounded-xl border p-4 text-center transition-all"
              style={{
                background: isActive ? activeBg : 'hsl(220 15% 97%)',
                borderColor: isActive ? activeBorder : 'hsl(220 15% 90%)',
              }}
            >
              <div className="flex justify-center mb-2">
                <div 
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    background: isActive 
                      ? `linear-gradient(135deg, ${activeColor} 0%, ${activeColor} 100%)`
                      : 'hsl(220 15% 88%)',
                    boxShadow: isActive ? `0 2px 10px ${activeColor}40` : 'none',
                  }}
                >
                  <Icon 
                    className="h-5 w-5" 
                    style={{ color: isActive ? 'white' : 'hsl(220 15% 60%)' }}
                    strokeWidth={2.5}
                  />
                </div>
              </div>
              
              <p 
                className="text-2xl font-bold mb-1"
                style={{ color: isActive ? activeColor : 'hsl(220 15% 55%)' }}
              >
                {value}
              </p>
              
              <p 
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: isActive ? activeColor : 'hsl(220 15% 50%)' }}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
