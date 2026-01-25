import { useLanguage } from '@/i18n/useLanguage';

export const LandingFooter = () => {
  const { t } = useLanguage();
  
  return (
    <footer 
      className="relative mt-auto flex flex-col items-center text-center py-6 animate-fade-in"
      style={{ 
        animationDelay: '500ms',
        animationFillMode: 'both',
      }}
    >
      {/* Final disclaimer */}
      <div 
        className="mb-6 px-4"
        style={{ maxWidth: '28rem' }}
      >
        <p 
          className="text-center"
          style={{ 
            fontSize: 'clamp(0.65rem, 0.6rem + 0.15vw, 0.75rem)',
            color: 'hsl(0 0% 55%)',
            lineHeight: 1.6,
          }}
        >
          <span 
            className="italic"
            style={{ color: 'hsl(174 55% 50%)' }}
          >
            Leen
          </span>
          <span 
            className="font-semibold not-italic"
            style={{ color: 'hsl(0 0% 85%)' }}
          >
            Score
          </span>
          {' '}{t('landing.footer.noTruth')}
        </p>
        <p 
          className="text-center mt-2"
          style={{ 
            fontSize: 'clamp(0.6rem, 0.55rem + 0.1vw, 0.7rem)',
            color: 'hsl(0 0% 50%)',
            lineHeight: 1.5,
          }}
        >
          {t('landing.footer.structuredAssessment')}
        </p>
      </div>
      
      {/* Divider */}
      <div 
        className="w-16 h-px mb-5"
        style={{ 
          background: 'linear-gradient(90deg, transparent, hsl(174 50% 50% / 0.3), transparent)',
        }}
      />
      
      {/* Brand signature */}
      <p 
        className="font-semibold mb-1"
        style={{ 
          fontSize: 'clamp(0.85rem, 0.8rem + 0.2vw, 1rem)',
          letterSpacing: '-0.01em',
          fontFamily: 'var(--font-display)',
        }}
      >
        <span 
          className="italic"
          style={{ color: 'hsl(174 65% 52%)' }}
        >
          Leen
        </span>
        <span 
          className="not-italic"
          style={{ color: 'hsl(0 0% 98%)' }}
        >
          Score
        </span>
        <span 
          style={{ 
            color: 'hsl(0 0% 60%)',
            fontWeight: 400,
            fontStyle: 'normal',
          }}
        >
          {' '}— Built on IA11
        </span>
      </p>
      
      {/* Developed by */}
      <p 
        style={{ 
          fontSize: 'clamp(0.65rem, 0.6rem + 0.1vw, 0.75rem)',
          color: 'hsl(0 0% 60%)',
          marginBottom: '4px',
        }}
      >
        {t('footer.developedBy')}{' '}
        <span style={{ color: 'hsl(174 60% 55%)' }}>
          Sol&Air
        </span>
      </p>
      
      {/* Engine tagline */}
      <p 
        style={{ 
          fontSize: 'clamp(0.55rem, 0.5rem + 0.1vw, 0.65rem)',
          color: 'hsl(0 0% 45%)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        Credibility Intelligence Engine
      </p>
    </footer>
  );
};
