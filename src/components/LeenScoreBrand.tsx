interface LeenScoreBrandProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  xs: 'text-[0.7rem]',
  sm: 'text-[0.85rem]',
  md: 'text-[1rem]',
  lg: 'text-[1.25rem]',
};

export const LeenScoreBrand = ({ size = 'sm', className = '' }: LeenScoreBrandProps) => {
  return (
    <span 
      className={`font-serif tracking-tight ${sizeStyles[size]} ${className}`}
      style={{ letterSpacing: '-0.02em' }}
    >
      <span 
        className="italic"
        style={{
          color: 'hsl(174 65% 52%)',
        }}
      >
        Leen
      </span>
      <span 
        className="font-semibold not-italic" 
        style={{
          color: 'hsl(0 0% 98%)',
        }}
      >
        Score
      </span>
    </span>
  );
};
