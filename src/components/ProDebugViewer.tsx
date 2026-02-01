import { useState } from 'react';
import { Bug, ChevronDown, ChevronUp, Copy, Check, AlertTriangle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import type { NormalizedIA11Data } from '@/utils/ia11Normalization';

interface ProDebugViewerProps {
  normalized: NormalizedIA11Data;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    debugButton: 'Debug',
    rawResponseTitle: 'IA11 Raw Response',
    normalizedTitle: 'Normalized Data',
    consistencyTitle: 'Consistency Check',
    copied: 'Copied!',
    copy: 'Copy',
    sourcesTotal: 'Total Sources',
    counters: 'Counters',
    derivedStatus: 'Derived Status',
    badgeText: 'Badge Text',
    guardApplied: 'Consistency Guard Applied',
    guardNotNeeded: 'No Guard Needed',
    guardExplanation: 'Sources = 0, so counters forced to 0/0/0',
    noGuardExplanation: 'Sources present, counters from IA11',
  },
  fr: {
    debugButton: 'Debug',
    rawResponseTitle: 'Réponse brute IA11',
    normalizedTitle: 'Données normalisées',
    consistencyTitle: 'Vérification de cohérence',
    copied: 'Copié !',
    copy: 'Copier',
    sourcesTotal: 'Total sources',
    counters: 'Compteurs',
    derivedStatus: 'Statut dérivé',
    badgeText: 'Texte du badge',
    guardApplied: 'Garde de cohérence appliqué',
    guardNotNeeded: 'Pas de garde nécessaire',
    guardExplanation: 'Sources = 0, donc compteurs forcés à 0/0/0',
    noGuardExplanation: 'Sources présentes, compteurs depuis IA11',
  },
};

export const ProDebugViewer = ({ normalized, language }: ProDebugViewerProps) => {
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const guardWasApplied = normalized.sources.total === 0;
  
  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(normalized.raw, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs font-medium border-slate-300 hover:bg-slate-50"
          >
            <Bug className="h-3.5 w-3.5" />
            {t.debugButton}
            {isOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-3">
          <div 
            className="rounded-xl border p-4 space-y-4"
            style={{
              background: 'hsl(220 15% 97%)',
              borderColor: 'hsl(220 15% 88%)',
            }}
          >
            {/* Consistency Check Alert */}
            <div 
              className="rounded-lg border p-3 flex items-start gap-3"
              style={{
                background: guardWasApplied ? 'hsl(35 50% 96%)' : 'hsl(145 40% 96%)',
                borderColor: guardWasApplied ? 'hsl(35 50% 85%)' : 'hsl(145 40% 85%)',
              }}
            >
              <AlertTriangle 
                className="h-4 w-4 flex-shrink-0 mt-0.5"
                style={{ color: guardWasApplied ? 'hsl(35 70% 45%)' : 'hsl(145 55% 40%)' }}
              />
              <div>
                <p 
                  className="text-xs font-semibold"
                  style={{ color: guardWasApplied ? 'hsl(35 60% 35%)' : 'hsl(145 50% 30%)' }}
                >
                  {guardWasApplied ? t.guardApplied : t.guardNotNeeded}
                </p>
                <p 
                  className="text-xs mt-0.5"
                  style={{ color: guardWasApplied ? 'hsl(35 40% 45%)' : 'hsl(145 30% 40%)' }}
                >
                  {guardWasApplied ? t.guardExplanation : t.noGuardExplanation}
                </p>
              </div>
            </div>
            
            {/* Normalized Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white border border-slate-200 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                  {t.sourcesTotal}
                </p>
                <p className="text-lg font-bold text-slate-800">
                  {normalized.sources.total}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  C:{normalized.sources.corroborate.length} / 
                  N:{normalized.sources.neutral.length} / 
                  X:{normalized.sources.contradict.length}
                </p>
              </div>
              
              <div className="rounded-lg bg-white border border-slate-200 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                  {t.counters}
                </p>
                <p className="text-lg font-bold text-slate-800">
                  {normalized.counters.confirmed}/{normalized.counters.uncertain}/{normalized.counters.contradicted}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  ✓ / ? / ✗
                </p>
              </div>
              
              <div className="rounded-lg bg-white border border-slate-200 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                  {t.derivedStatus}
                </p>
                <p className="text-sm font-semibold text-slate-800 uppercase">
                  {normalized.status}
                </p>
              </div>
              
              <div className="rounded-lg bg-white border border-slate-200 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                  {t.badgeText}
                </p>
                <p className="text-xs font-medium text-slate-700 line-clamp-2">
                  {normalized.badgeText}
                </p>
              </div>
            </div>
            
            {/* Raw JSON */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-700">
                  {t.rawResponseTitle}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyRaw}
                  className="h-7 px-2 text-xs gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      {t.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      {t.copy}
                    </>
                  )}
                </Button>
              </div>
              <pre 
                className="rounded-lg bg-slate-900 text-slate-100 p-3 text-[10px] leading-relaxed overflow-x-auto max-h-[300px] overflow-y-auto"
                style={{ fontFamily: 'ui-monospace, monospace' }}
              >
                {JSON.stringify(normalized.raw, null, 2)}
              </pre>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
