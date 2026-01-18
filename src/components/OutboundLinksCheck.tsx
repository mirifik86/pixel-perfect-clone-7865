import { ExternalLink, Shield, ShieldAlert, ShieldQuestion, AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface LinkAnalysis {
  url: string;
  domain: string;
  label: 'Safe' | 'Unknown' | 'Suspicious';
  reasons: string[];
  riskScore: number;
}

interface OutboundLinksData {
  success: boolean;
  links: LinkAnalysis[];
  totalFound: number;
  analyzed: number;
  proAvailable: boolean;
  proMessage?: string;
  error?: string;
}

interface OutboundLinksCheckProps {
  data: OutboundLinksData | null;
  language: 'en' | 'fr';
  isLoading?: boolean;
}

const translations = {
  en: {
    title: 'Outbound Links Check',
    subtitle: 'External links detected on this page',
    noLinks: 'No outbound links detected on this page',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    linksFound: 'links analyzed',
    showAll: 'Show all',
    showLess: 'Show less',
    loading: 'Checking outbound links...',
    error: 'Could not analyze outbound links',
    proNote: 'Pro: Reputation check',
    disclaimer: 'Link risk indicates potential safety concerns. It does not automatically mean fraud or reduce the credibility score.',
  },
  fr: {
    title: 'Vérification des Liens Sortants',
    subtitle: 'Liens externes détectés sur cette page',
    noLinks: 'Aucun lien sortant détecté sur cette page',
    low: 'Faible',
    medium: 'Moyen',
    high: 'Élevé',
    linksFound: 'liens analysés',
    showAll: 'Voir tout',
    showLess: 'Voir moins',
    loading: 'Vérification des liens sortants...',
    error: 'Impossible d\'analyser les liens sortants',
    proNote: 'Pro : Vérification de réputation',
    disclaimer: 'Le risque d\'un lien indique des préoccupations de sécurité potentielles. Il ne signifie pas automatiquement une fraude et ne réduit pas le score de crédibilité.',
  },
};

type RiskCategory = 'Low' | 'Medium' | 'High';

const getRiskCategory = (score: number): RiskCategory => {
  if (score <= 29) return 'Low';
  if (score <= 69) return 'Medium';
  return 'High';
};

const getRiskStyles = (category: RiskCategory) => {
  switch (category) {
    case 'Low':
      return {
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        progress: 'bg-emerald-500',
        icon: <Shield className="h-4 w-4 text-emerald-600" />,
      };
    case 'Medium':
      return {
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        progress: 'bg-amber-500',
        icon: <ShieldQuestion className="h-4 w-4 text-amber-600" />,
      };
    case 'High':
      return {
        badge: 'bg-red-100 text-red-800 border-red-200',
        progress: 'bg-red-500',
        icon: <ShieldAlert className="h-4 w-4 text-red-600" />,
      };
  }
};

export const OutboundLinksCheck = ({ data, language, isLoading }: OutboundLinksCheckProps) => {
  const t = translations[language];
  const [showAll, setShowAll] = useState(false);

  const getCategoryLabel = (category: RiskCategory) => {
    switch (category) {
      case 'Low': return t.low;
      case 'Medium': return t.medium;
      case 'High': return t.high;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="analysis-card mt-6 animate-pulse">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-primary/60" />
          <h3 className="font-serif text-lg font-semibold text-slate-900">{t.title}</h3>
        </div>
        <p className="mt-2 text-sm text-slate-500">{t.loading}</p>
      </div>
    );
  }

  // No data means we didn't check (not a URL input) - don't show anything
  if (!data) {
    return null;
  }

  // Error state - show error message
  if (!data.success) {
    return (
      <div className="analysis-card mt-6">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-primary/60" />
          <h3 className="font-serif text-lg font-semibold text-slate-900">{t.title}</h3>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {data.error || t.error}
        </p>
      </div>
    );
  }

  // No links found
  if (data.links.length === 0) {
    return (
      <div className="analysis-card mt-6">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-primary/60" />
          <h3 className="font-serif text-lg font-semibold text-slate-900">{t.title}</h3>
        </div>
        <p className="mt-2 text-sm text-slate-500">{t.noLinks}</p>
      </div>
    );
  }

  const displayedLinks = showAll ? data.links : data.links.slice(0, 5);

  return (
    <div className="analysis-card mt-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-primary" />
          <h3 className="font-serif text-lg font-semibold text-slate-900">{t.title}</h3>
        </div>
        <span className="text-xs text-slate-500">
          {data.analyzed} {t.linksFound}
        </span>
      </div>
      
      <p className="mb-4 text-sm text-slate-600">{t.subtitle}</p>

      {/* Pro message if available */}
      {data.proMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-xs text-amber-800">{data.proMessage}</span>
        </div>
      )}

      {/* Links list - compact card style */}
      <div className="space-y-3">
        {displayedLinks.map((link, index) => {
          const category = getRiskCategory(link.riskScore);
          const styles = getRiskStyles(category);
          
          return (
            <div 
              key={index} 
              className="rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50/50"
            >
              {/* Top row: Icon, Domain, Badge, Score */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {styles.icon}
                  <span 
                    className="truncate font-medium text-slate-800" 
                    title={link.domain}
                  >
                    {link.domain}
                  </span>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${styles.badge}`}>
                    {getCategoryLabel(category)}
                  </span>
                  <span className="min-w-[45px] text-right text-sm font-bold text-slate-700">
                    {link.riskScore}/100
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${styles.progress}`}
                    style={{ width: `${link.riskScore}%` }}
                  />
                </div>
              </div>

              {/* Reasons (max 2) */}
              {link.reasons.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {link.reasons.slice(0, 2).map((reason, i) => (
                    <span 
                      key={i} 
                      className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show more/less toggle */}
      {data.links.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 flex w-full items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
        >
          {showAll ? (
            <>
              <ChevronUp className="h-4 w-4" />
              {t.showLess}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              {t.showAll} ({data.links.length})
            </>
          )}
        </button>
      )}

      {/* Disclaimer - always visible */}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
        <p className="text-xs text-slate-600">{t.disclaimer}</p>
      </div>
    </div>
  );
};
