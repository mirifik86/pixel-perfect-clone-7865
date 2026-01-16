import { FileCheck } from 'lucide-react';

export const LeenScoreLogo = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 backdrop-blur-sm">
        <FileCheck className="h-10 w-10 text-primary" strokeWidth={1.5} />
      </div>
      
      <h1 className="brand-text text-6xl font-normal tracking-tight md:text-7xl">
        <span className="italic text-foreground">Leen</span>
        <span className="brand-accent font-semibold not-italic">Score</span>
      </h1>
    </div>
  );
};
