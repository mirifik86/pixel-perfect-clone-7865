import { useLanguage } from '@/i18n/useLanguage';

const methodologyKeys = [
  'landing.methodology.linguistic',
  'landing.methodology.contextual',
  'landing.methodology.visual',
  'landing.methodology.corroboration',
];

export const MethodologySection = () => {
  const { t } = useLanguage();
  
  return (
    <section 
      className="animate-fade-in"
      style={{ 
        animationDelay: '100ms',
        marginTop: 'clamp(2rem, 5vh, 3.5rem)',
      }}
    >
      {/* Section title */}
      <h2 
        className="text-center mb-5"
        style={{ 
          fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.9rem)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'hsl(174 55% 55%)',
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
        }}
      >
        {t('landing.methodology.title')}
      </h2>
      
      {/* Methodology items */}
      <div 
        className="flex flex-col items-center gap-2 px-4"
        style={{ maxWidth: '32rem', margin: '0 auto' }}
      >
        {methodologyKeys.map((key, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 w-full"
            style={{
              padding: '0.5rem 0',
            }}
          >
            <span 
              style={{ 
                color: 'hsl(174 60% 52%)',
                fontSize: '0.5rem',
                marginTop: '0.35rem',
              }}
            >
              •
            </span>
            <span 
              style={{ 
                fontSize: 'clamp(0.8rem, 0.75rem + 0.2vw, 0.95rem)',
                color: 'hsl(0 0% 75%)',
                lineHeight: 1.5,
              }}
            >
              {t(key)}
            </span>
          </div>
        ))}
      </div>
      
      {/* Disclaimer note */}
      <p 
        className="text-center mt-5"
        style={{ 
          fontSize: 'clamp(0.7rem, 0.65rem + 0.15vw, 0.8rem)',
          color: 'hsl(0 0% 60%)',
          fontStyle: 'italic',
        }}
      >
        {t('landing.methodology.disclaimer')}
      </p>
    </section>
  );
};
