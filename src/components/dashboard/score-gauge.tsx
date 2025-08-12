'use client';

interface ScoreGaugeProps {
  score: number;
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s < 50) return 'hsl(var(--destructive))';
    if (s < 80) return 'hsl(var(--primary))';
    return '#4ade80'; // A success green
  };
  
  const color = getColor(score);

  return (
    <div className="relative h-48 w-48">
      <svg className="h-full w-full" viewBox="0 0 140 140">
        <circle
          className="text-secondary"
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="70"
          cy="70"
        />
        <circle
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="url(#gradient)"
          fill="transparent"
          r={radius}
          cx="70"
          cy="70"
          className="transform -rotate-90 origin-center transition-all duration-1000 ease-out"
        />
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-sm text-muted-foreground">ATS Score</span>
      </div>
    </div>
  );
}
