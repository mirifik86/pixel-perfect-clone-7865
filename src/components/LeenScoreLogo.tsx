export const LeenScoreLogo = () => {
  return <div className="flex flex-col items-center gap-3 md:gap-5">
      {/* Icon - supporting role, reduced prominence */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 backdrop-blur-sm opacity-75 md:p-3">
        <div className="relative h-7 w-7 md:h-10 md:w-10">
          {/* Feuille de news blanche */}
          <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="white" stroke="white" />
            <polyline points="14 2 14 8 20 8" fill="none" stroke="hsl(var(--muted))" />
            <line x1="8" y1="13" x2="16" y2="13" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
            <line x1="8" y1="17" x2="14" y2="17" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
          </svg>
          
          {/* Loupe couleur Leen */}
          <svg viewBox="0 0 24 24" className="absolute -bottom-2 -right-3 h-6 w-6 drop-shadow-md px-0 py-[2px] my-0 mx-[10px] md:h-9 md:w-9" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="6" fill="hsl(var(--primary) / 0.25)" />
            <circle cx="10" cy="10" r="6" stroke="hsl(var(--primary))" strokeWidth="2" />
            <path d="M7 7 Q8 6 9 7" stroke="white" strokeWidth="1.5" opacity="0.6" fill="none" />
            <line x1="22" y1="22" x2="15" y2="15" strokeWidth="3" />
          </svg>
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