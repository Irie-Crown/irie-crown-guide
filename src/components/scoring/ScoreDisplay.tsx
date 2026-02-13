import { cn } from '@/lib/utils';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function ScoreRing({ score, size = 'md', label, className }: ScoreRingProps) {
  const sizes = {
    sm: { ring: 48, stroke: 4, text: 'text-sm', labelText: 'text-[10px]' },
    md: { ring: 72, stroke: 5, text: 'text-xl', labelText: 'text-xs' },
    lg: { ring: 96, stroke: 6, text: 'text-2xl', labelText: 'text-sm' },
  };

  const { ring, stroke, text, labelText } = sizes[size];
  const radius = (ring - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 75) return 'text-secondary';
    if (s >= 50) return 'text-primary';
    return 'text-destructive';
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <svg width={ring} height={ring} className="transform -rotate-90">
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-700 ease-out', getColor(score))}
        />
      </svg>
      <span className={cn('absolute font-semibold text-foreground', text)} style={{ lineHeight: `${ring}px`, width: ring, textAlign: 'center', position: 'relative', top: 0 }}>
        {score}
      </span>
      {label && (
        <span className={cn('text-muted-foreground text-center leading-tight', labelText)}>
          {label}
        </span>
      )}
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  score: number;
  className?: string;
}

export function ScoreBar({ label, score, className }: ScoreBarProps) {
  const getColor = (s: number) => {
    if (s >= 75) return 'bg-secondary';
    if (s >= 50) return 'bg-primary';
    return 'bg-destructive';
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{score}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', getColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
