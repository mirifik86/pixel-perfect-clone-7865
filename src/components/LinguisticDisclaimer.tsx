import { Info } from 'lucide-react';

interface LinguisticDisclaimerProps {
  language: 'en' | 'fr';
}

const translations = {
  en: {
    text: 'These observations are based on writing patterns and internal structure only. Verifying the accuracy of the claims requires external source analysis included in PRO.',
  },
  fr: {
    text: 'Ces observations sont basées uniquement sur les modèles d\'écriture et la structure interne. Vérifier l\'exactitude des affirmations nécessite une analyse de sources externes incluse dans PRO.',
  },
};

export const LinguisticDisclaimer = ({ language }: LinguisticDisclaimerProps) => {
  const t = translations[language];

  return (
    <div 
      className="flex items-start gap-3 rounded-lg p-4 mb-6"
      style={{
        background: 'linear-gradient(135deg, hsl(220 20% 97%) 0%, hsl(200 15% 96%) 100%)',
        border: '1px solid hsl(220 15% 88%)',
      }}
    >
      <div 
        className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
        style={{
          background: 'hsl(220 20% 92%)',
        }}
      >
        <Info className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <p className="text-sm leading-relaxed text-slate-600 italic">
        {t.text}
      </p>
    </div>
  );
};
