import { CheckCircle, HelpCircle, XCircle, AlertCircle } from 'lucide-react';

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

type ProStatus = 'confirmed' | 'contradicted' | 'uncertain' | 'limited';

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
    // Status-specific explanations
    statusConfirmed: 'Claim confirmed by credible web sources.',
    statusContradicted: 'Claim contradicted by credible web sources.',
    statusUncertain: 'Credible sources exist with conflicting or ambiguous conclusions.',
    statusLimited: 'Verification limited due to lack of reliable web sources.',
    limitedTitle: 'Limited Evaluation',
  },
  fr: {
    title: 'Points clés PRO',
    confirmed: 'Confirmé',
    uncertain: 'Incertain',
    contradicted: 'Contredit',
    // Status-specific explanations
    statusConfirmed: 'Affirmation confirmée par des sources web fiables.',
    statusContradicted: 'Affirmation contredite par des sources web fiables.',
    statusUncertain: 'Sources crédibles avec conclusions conflictuelles ou ambiguës.',
    statusLimited: 'Vérification limitée en raison d\'un manque de sources web fiables.',
    limitedTitle: 'Évaluation limitée',
  },
};

/**
 * Compute the official PRO status based on source buckets
 * Rules:
 * - CONFIRMÉ: at least one corroborating source
 * - CONTREDIT: at least one contradicting source (and no corroborating)
 * - INCERTAIN: both corroborating AND contradicting sources exist
 * - ÉVALUATION LIMITÉE: no strong sources found
 */
const computeProStatus = (sourcesBuckets?: SourcesBuckets): ProStatus => {
  if (!sourcesBuckets) return 'limited';
  
  const hasCorroborate = (sourcesBuckets.corroborate?.length ?? 0) > 0;
  const hasContradict = (sourcesBuckets.contradict?.length ?? 0) > 0;
  
  // If both exist -> uncertain (conflicting sources)
  if (hasCorroborate && hasContradict) return 'uncertain';
  
  // Only corroborating -> confirmed
  if (hasCorroborate) return 'confirmed';
  
  // Only contradicting -> contradicted
  if (hasContradict) return 'contradicted';
  
  // No strong sources -> limited
  return 'limited';
};

export const ProKeyPoints = ({ keyPoints, sourcesBuckets, language }: ProKeyPointsProps) => {
  const t = translations[language];
  
  // Compute the official status
  const proStatus = computeProStatus(sourcesBuckets);
  
  // Use provided keyPoints or compute fallback from sourcesBuckets
  let confirmed = keyPoints?.confirmed ?? 0;
  let uncertain = keyPoints?.uncertain ?? 0;
  let contradicted = keyPoints?.contradicted ?? 0;
  
  // Fallback logic if keyPoints is missing - based on official status rules
  if (!keyPoints && sourcesBuckets) {
    const hasCorroborate = (sourcesBuckets.corroborate?.length ?? 0) > 0;
    const hasContradict = (sourcesBuckets.contradict?.length ?? 0) > 0;
    
    // Reset counters based on status logic
    if (hasCorroborate && hasContradict) {
      // Conflicting sources = uncertain
      confirmed = 1;
      contradicted = 1;
      uncertain = 1;
    } else if (hasCorroborate) {
      confirmed = 1;
      contradicted = 0;
      uncertain = 0;
    } else if (hasContradict) {
      confirmed = 0;
      contradicted = 1;
      uncertain = 0;
    } else {
      // No strong sources - all zeros, show limited state
      confirmed = 0;
      contradicted = 0;
      uncertain = 0;
    }
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

  // Get explanation text based on current status
  const getStatusExplanation = (): string => {
    switch (proStatus) {
      case 'confirmed':
        return t.statusConfirmed;
      case 'contradicted':
        return t.statusContradicted;
      case 'uncertain':
        return t.statusUncertain;
      case 'limited':
        return t.statusLimited;
      default:
        return t.statusLimited;
    }
  };

  // Check if all counters are zero (limited verification)
  const isLimitedVerification = confirmed === 0 && uncertain === 0 && contradicted === 0;

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
      
      {/* Counter grid - only show if not limited verification */}
      {!isLimitedVerification ? (
        <div className="grid grid-cols-3 gap-3 mb-4">
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
      ) : (
        /* Limited verification state - special display */
        <div 
          className="rounded-xl border p-4 mb-4 flex items-center gap-3"
          style={{
            background: 'hsl(220 15% 97%)',
            borderColor: 'hsl(220 15% 88%)',
          }}
        >
          <div 
            className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
            style={{
              background: 'hsl(220 15% 85%)',
            }}
          >
            <AlertCircle className="h-5 w-5" style={{ color: 'hsl(220 15% 50%)' }} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-0.5">
              {t.limitedTitle}
            </p>
            <p className="text-xs text-slate-500">
              {t.statusLimited}
            </p>
          </div>
        </div>
      )}
      
      {/* Status explanation - always matches counters */}
      {!isLimitedVerification && (
        <div 
          className="rounded-lg p-3 text-center"
          style={{
            background: 'hsl(220 15% 97%)',
            borderColor: 'hsl(220 15% 90%)',
          }}
        >
          <p className="text-sm text-slate-600">
            {getStatusExplanation()}
          </p>
        </div>
      )}
    </div>
  );
};