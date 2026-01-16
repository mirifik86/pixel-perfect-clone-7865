export const LeenScoreLogo = () => {
  return <div className="flex flex-col items-center gap-3 md:gap-5">
      {/* Premium icon with layered glow effects */}
      <div className="relative">
        {/* Outer glow ring */}
        <div 
          className="absolute -inset-2 rounded-2xl md:-inset-3"
          style={{
            background: 'radial-gradient(circle, hsl(174 60% 45% / 0.2) 0%, transparent 70%)',
            filter: 'blur(8px)'
          }}
        />
        
        {/* Icon container with premium styling */}
        <div 
          className="relative rounded-xl border border-primary/40 p-2.5 backdrop-blur-md md:rounded-2xl md:p-4"
          style={{
            background: 'linear-gradient(135deg, hsl(174 60% 45% / 0.15) 0%, hsl(240 20% 10% / 0.8) 100%)',
            boxShadow: '0 0 20px hsl(174 60% 45% / 0.2), inset 0 1px 1px hsl(0 0% 100% / 0.1), 0 8px 32px hsl(0 0% 0% / 0.4)'
          }}
        >
          <div className="relative h-8 w-8 md:h-12 md:w-12">
            {/* Document icon - white with subtle shadow */}
            <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full drop-shadow-lg" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="hsl(0 0% 95%)" stroke="hsl(0 0% 85%)" strokeWidth="0.5" />
              <polyline points="14 2 14 8 20 8" fill="hsl(0 0% 90%)" stroke="hsl(0 0% 80%)" strokeWidth="0.5" />
              <line x1="8" y1="13" x2="16" y2="13" stroke="hsl(220 10% 60%)" strokeWidth="1.2" />
              <line x1="8" y1="17" x2="13" y2="17" stroke="hsl(220 10% 70%)" strokeWidth="1.2" />
            </svg>
            
            {/* Magnifying glass - premium teal with glow */}
            <svg 
              viewBox="0 0 24 24" 
              className="absolute -bottom-1.5 -right-1.5 h-6 w-6 md:-bottom-2 md:-right-2 md:h-8 md:w-8" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                filter: 'drop-shadow(0 2px 4px hsl(0 0% 0% / 0.3)) drop-shadow(0 0 8px hsl(174 60% 45% / 0.4))'
              }}
            >
              {/* Glass fill with gradient */}
              <defs>
                <radialGradient id="glassGradient" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="hsl(174 70% 65%)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(174 60% 45%)" stopOpacity="0.2" />
                </radialGradient>
              </defs>
              <circle cx="10" cy="10" r="6" fill="url(#glassGradient)" />
              <circle cx="10" cy="10" r="6" stroke="hsl(174 70% 55%)" strokeWidth="2.5" />
              {/* Shine effect */}
              <path d="M7 7.5 Q8.5 6 9.5 7" stroke="hsl(0 0% 100%)" strokeWidth="1.5" opacity="0.7" fill="none" />
              {/* Handle with glow */}
              <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="hsl(174 60% 50%)" strokeWidth="3" />
              <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="hsl(174 80% 70%)" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Title with solar halo reflection effect */}
      <div className="relative">
        {/* Solar halo glow behind title */}
        <div className="absolute -inset-x-16 -inset-y-8 rounded-full md:-inset-x-24 md:-inset-y-12" style={{
          background: 'radial-gradient(ellipse 80% 60% at center, hsl(40 100% 60% / 0.15) 0%, hsl(30 100% 50% / 0.08) 30%, transparent 70%)'
        }} />
        
        {/* Subtle dark vignette for contrast */}
        <div className="absolute -inset-x-12 -inset-y-4 rounded-3xl md:-inset-x-16 md:-inset-y-6" style={{
          background: 'radial-gradient(ellipse at center, hsl(240 20% 4% / 0.6) 0%, transparent 70%)'
        }} />
        
        <h1 className="relative brand-text text-5xl font-normal tracking-tight md:text-8xl" style={{
          letterSpacing: '-0.03em'
        }}>
          <span className="brand-accent italic text-5xl md:text-8xl" style={{
            color: 'hsl(174 65% 52%)',
            textShadow: '0 0 40px hsl(174 60% 45% / 0.4), 0 0 80px hsl(40 100% 60% / 0.2), 0 2px 20px hsl(30 90% 55% / 0.15)'
          }}>
            Leen
          </span>
          <span className="font-semibold not-italic" style={{
            color: 'hsl(0 0% 98%)',
            textShadow: '0 0 30px hsl(40 100% 70% / 0.25), 0 2px 15px hsl(30 90% 55% / 0.1)'
          }}>
            Score
          </span>
        </h1>
      </div>
    </div>;
};