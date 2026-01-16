export const LeenScoreLogo = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 backdrop-blur-sm">
        <div className="relative h-12 w-12">
          {/* Feuille de news blanche */}
          <svg
            viewBox="0 0 24 24"
            className="absolute inset-0 h-full w-full"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Document */}
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="white" stroke="white" />
            <polyline points="14 2 14 8 20 8" fill="none" stroke="hsl(var(--muted))" />
            {/* Lignes de texte */}
            <line x1="8" y1="13" x2="16" y2="13" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
            <line x1="8" y1="17" x2="14" y2="17" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
          </svg>
          
          {/* Loupe couleur Leen */}
          <svg
            viewBox="0 0 24 24"
            className="absolute -bottom-1 -right-1 h-8 w-8"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="6" fill="hsl(var(--primary) / 0.2)" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>
      
      <h1 className="brand-text text-6xl font-normal tracking-tight md:text-7xl">
        <span className="brand-accent italic">Leen</span>
        <span className="font-semibold not-italic text-foreground">Score</span>
      </h1>
    </div>
  );
};
