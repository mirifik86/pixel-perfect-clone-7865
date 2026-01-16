export const LeenScoreLogo = () => {
  return <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 backdrop-blur-sm">
        <div className="relative h-12 w-12">
          {/* Feuille de news blanche */}
          <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Document */}
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="white" stroke="white" />
            <polyline points="14 2 14 8 20 8" fill="none" stroke="hsl(var(--muted))" />
            {/* Lignes de texte */}
            <line x1="8" y1="13" x2="16" y2="13" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
            <line x1="8" y1="17" x2="14" y2="17" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
          </svg>
          
          {/* Loupe couleur Leen - plus grosse et stylée */}
          <svg viewBox="0 0 24 24" className="absolute -bottom-2 -right-3 h-11 w-11 drop-shadow-lg px-0 py-[2px] my-0 mx-[10px]" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="6" fill="hsl(var(--primary) / 0.25)" />
            <circle cx="10" cy="10" r="6" stroke="hsl(var(--primary))" strokeWidth="2" />
            {/* Reflet sur la loupe */}
            <path d="M7 7 Q8 6 9 7" stroke="white" strokeWidth="1.5" opacity="0.6" fill="none" />
            <line x1="22" y1="22" x2="15" y2="15" strokeWidth="3" />
          </svg>
        </div>
      </div>
      
      <h1 className="brand-text text-6xl font-normal tracking-tight md:text-7xl">
        <span className="brand-accent italic">Leen</span>
        <span className="font-semibold not-italic text-foreground">Score</span>
      </h1>
    </div>;
};