import { useLanguage } from '@/i18n/useLanguage';

const scaleItems = [
  { key: 'veryLow', color: 'hsl(0 70% 50%)' },
  { key: 'low', color: 'hsl(25 85% 50%)' },
  { key: 'moderate', color: 'hsl(45 80% 50%)' },
  { key: 'high', color: 'hsl(145 55% 45%)' },
  { key: 'veryHigh', color: 'hsl(174 60% 45%)' },
];

export const CredibilityScaleSection = () => {
  const { t } = useLanguage();
  
  return (
    <section 
      className="animate-fade-in"
      style={{ 
        animationDelay: '200ms',
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
        {t('landing.scale.title')}
      </h2>
      
      {/* Scale visualization */}
      <div 
        className="flex flex-wrap justify-center gap-3 px-4"
        style={{ maxWidth: '36rem', margin: '0 auto' }}
      >
        {scaleItems.map((item, index) => (
          <div 
            key={index}
            className="flex items-center gap-2"
          >
            <div 
              className="w-2.5 h-2.5 rounded-full"
              style={{ 
                background: item.color,
                boxShadow: `0 0 8px ${item.color.replace(')', ' / 0.5)')}`,
              }}
            />
            <span 
              style={{ 
                fontSize: 'clamp(0.7rem, 0.65rem + 0.15vw, 0.8rem)',
                color: 'hsl(0 0% 70%)',
              }}
            >
              {t(`gauge.credibilityLevels.${item.key}`)}
            </span>
          </div>
        ))}
      </div>
      
      {/* Explanation */}
      <p 
        className="text-center mt-4 px-4"
        style={{ 
          fontSize: 'clamp(0.7rem, 0.65rem + 0.15vw, 0.8rem)',
          color: 'hsl(0 0% 60%)',
          maxWidth: '28rem',
          margin: '1rem auto 0',
        }}
      >
        {t('landing.scale.description')}
      </p>
    </section>
  );
};
