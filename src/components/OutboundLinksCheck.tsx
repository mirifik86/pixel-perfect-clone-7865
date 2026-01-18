import { ExternalLink, Shield, ShieldAlert, ShieldQuestion, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

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
    subtitle: 'Detected external links and their risk assessment',
    noLinks: 'No outbound links detected on this page',
    domain: 'Domain',
    risk: 'Risk',
    reasons: 'Indicators',
    safe: 'Safe',
    unknown: 'Unknown',
    suspicious: 'Suspicious',
    disclaimer: 'Suspicious does not guarantee fraud; it indicates higher risk patterns.',
    linksFound: 'links analyzed',
    showAll: 'Show all',
    showLess: 'Show less',
    loading: 'Checking outbound links...',
    error: 'Could not analyze outbound links',
    proNote: 'Pro: Reputation check',
  },
  fr: {
    title: 'Vérification des Liens Sortants',
    subtitle: 'Liens externes détectés et leur évaluation de risque',
    noLinks: 'Aucun lien sortant détecté sur cette page',
    domain: 'Domaine',
    risk: 'Risque',
    reasons: 'Indicateurs',
    safe: 'Sûr',
    unknown: 'Inconnu',
    suspicious: 'Suspect',
    disclaimer: 'Un lien suspect ne garantit pas une fraude ; il indique des schémas à risque élevé.',
    linksFound: 'liens analysés',
    showAll: 'Voir tout',
    showLess: 'Voir moins',
    loading: 'Vérification des liens sortants...',
    error: 'Impossible d\'analyser les liens sortants',
    proNote: 'Pro : Vérification de réputation',
  },
};

const getLabelIcon = (label: string) => {
  switch (label) {
    case 'Safe':
      return <Shield className="h-4 w-4 text-emerald-500" />;
    case 'Suspicious':
      return <ShieldAlert className="h-4 w-4 text-red-500" />;
    default:
      return <ShieldQuestion className="h-4 w-4 text-amber-500" />;
  }
};

const getLabelStyles = (label: string) => {
  switch (label) {
    case 'Safe':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Suspicious':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-amber-100 text-amber-800 border-amber-200';
  }
};

export const OutboundLinksCheck = ({ data, language, isLoading }: OutboundLinksCheckProps) => {
  const t = translations[language];
  const [showAll, setShowAll] = useState(false);

  const getLabelText = (label: string) => {
    switch (label) {
      case 'Safe': return t.safe;
      case 'Suspicious': return t.suspicious;
      default: return t.unknown;
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
  const hasSuspicious = data.links.some(l => l.label === 'Suspicious');

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

      {/* Links table */}
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">{t.domain}</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-700">{t.risk}</th>
              <th className="hidden px-3 py-2 text-left font-semibold text-slate-700 md:table-cell">{t.reasons}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedLinks.map((link, index) => (
              <tr key={index} className="hover:bg-slate-50/50">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {getLabelIcon(link.label)}
                    <span className="font-medium text-slate-800 truncate max-w-[120px] md:max-w-[200px]" title={link.domain}>
                      {link.domain}
                    </span>
                  </div>
                  {/* Show reasons on mobile */}
                  <div className="mt-1 flex flex-wrap gap-1 md:hidden">
                    {link.reasons.slice(0, 2).map((reason, i) => (
                      <span key={i} className="inline-block text-xs text-slate-500">
                        • {reason}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${getLabelStyles(link.label)}`}>
                    {getLabelText(link.label)}
                  </span>
                </td>
                <td className="hidden px-3 py-2 md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {link.reasons.map((reason, i) => (
                      <span key={i} className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {reason}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show more/less toggle */}
      {data.links.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
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

      {/* Disclaimer */}
      {hasSuspicious && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
          <p className="text-xs text-slate-600">{t.disclaimer}</p>
        </div>
      )}
    </div>
  );
};
