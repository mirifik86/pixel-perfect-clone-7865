import { CheckCircle, HelpCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * IA11 is the SINGLE SOURCE OF TRUTH.
 * Lovable is a pure renderer - no inference, no fallback logic.
 * Counters are displayed ONLY from the normalization layer.
 */

interface Counters {
  confirmed: number;
  uncertain: number;
  contradicted: number;
}

interface ProKeyPointsProps {
  /** Pre-normalized counters from the normalization layer */
  counters: Counters;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    title: 'PRO Key Points',
    confirmed: 'Confirmed',
    uncertain: 'Uncertain',
    contradicted: 'Contradicted',
    limitedTitle: 'Limited Evaluation',
    limitedMessage: 'Verification limited due to lack of reliable web sources.',
  },
  fr: {
    title: 'Points clés PRO',
    confirmed: 'Confirmé',
    uncertain: 'Incertain',
    contradicted: 'Contredit',
    limitedTitle: 'Évaluation limitée',
    limitedMessage: 'Vérification limitée en raison d\'un manque de sources web fiables.',
  },
};

export const ProKeyPoints = ({ counters, language }: ProKeyPointsProps) => {
  const t = translations[language];
  
  // Use pre-normalized counters directly - no inference
  const { confirmed, uncertain, contradicted } = counters;
  
  const counterItems = [
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
        <div className="grid grid-cols-3 gap-3">
          {counterItems.map(({ key, label, value, icon: Icon, activeColor, activeBg, activeBorder }) => {
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
        /* Limited verification state */
        <div 
          className="rounded-xl border p-4 flex items-center gap-3"
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
              {t.limitedMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};