import { Shield, Clock, Hash } from 'lucide-react';

interface IA11Meta {
  engine?: string;
  requestId?: string;
  tookMs?: number;
  version?: string;
}

interface IA11VerificationFooterProps {
  meta?: IA11Meta;
  language: 'en' | 'fr';
}

export const IA11VerificationFooter = ({ meta, language }: IA11VerificationFooterProps) => {
  if (!meta) return null;

  const { engine, requestId, tookMs, version } = meta;
  
  // Only show if we have meaningful data
  if (!engine && !requestId && !tookMs) return null;

  const labels = {
    engine: language === 'fr' ? 'Moteur' : 'Engine',
    request: language === 'fr' ? 'Requête' : 'Request',
    timing: language === 'fr' ? 'Durée' : 'Took',
  };

  return (
    <div 
      className="mt-6 pt-4 border-t border-slate-200/60"
      style={{ opacity: 0.7 }}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
        {/* Engine */}
        {engine && (
          <span className="inline-flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            <span>{labels.engine}: <strong className="font-semibold text-slate-600">{engine}</strong></span>
            {version && <span className="text-slate-400">v{version}</span>}
          </span>
        )}
        
        {/* Request ID */}
        {requestId && (
          <span className="inline-flex items-center gap-1.5">
            <Hash className="h-3 w-3" />
            <span>{labels.request}: <code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">{requestId}</code></span>
          </span>
        )}
        
        {/* Timing */}
        {typeof tookMs === 'number' && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{labels.timing}: <strong className="font-semibold text-slate-600">{tookMs}ms</strong></span>
          </span>
        )}
      </div>
    </div>
  );
};
