import { Search } from 'lucide-react';
import { useLanguage } from '@/i18n/useLanguage';

interface CTAButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const CTAButton = ({ onClick, disabled }: CTAButtonProps) => {
  const { t } = useLanguage();
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative px-8 py-4 rounded-xl font-semibold uppercase tracking-widest transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
      style={{
        animationDelay: '150ms',
        fontSize: 'clamp(0.7rem, 0.65rem + 0.2vw, 0.85rem)',
        letterSpacing: '0.2em',
        color: 'hsl(0 0% 98%)',
        background: 'linear-gradient(135deg, hsl(174 60% 40%) 0%, hsl(174 55% 35%) 100%)',
        border: '1px solid hsl(174 50% 50% / 0.4)',
        boxShadow: `
          0 0 30px hsl(174 60% 45% / 0.3),
          0 4px 20px hsl(0 0% 0% / 0.3),
          inset 0 1px 0 hsl(0 0% 100% / 0.15)
        `,
      }}
    >
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, hsl(174 65% 45%) 0%, hsl(174 60% 40%) 100%)',
          boxShadow: '0 0 40px hsl(174 60% 50% / 0.4)',
        }}
      />
      
      {/* Button content */}
      <span className="relative flex items-center gap-3">
        <Search className="w-4 h-4" />
        {t('landing.cta.analyze')}
      </span>
      
      {/* Corner brackets */}
      <div 
        className="absolute top-2 left-2 w-3 h-3 pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity"
        style={{
          borderTop: '1px solid hsl(174 60% 60%)',
          borderLeft: '1px solid hsl(174 60% 60%)',
        }}
      />
      <div 
        className="absolute top-2 right-2 w-3 h-3 pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity"
        style={{
          borderTop: '1px solid hsl(174 60% 60%)',
          borderRight: '1px solid hsl(174 60% 60%)',
        }}
      />
      <div 
        className="absolute bottom-2 left-2 w-3 h-3 pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity"
        style={{
          borderBottom: '1px solid hsl(174 60% 60%)',
          borderLeft: '1px solid hsl(174 60% 60%)',
        }}
      />
      <div 
        className="absolute bottom-2 right-2 w-3 h-3 pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity"
        style={{
          borderBottom: '1px solid hsl(174 60% 60%)',
          borderRight: '1px solid hsl(174 60% 60%)',
        }}
      />
    </button>
  );
};
