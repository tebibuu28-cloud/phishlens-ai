import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RiskScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function RiskScoreGauge({ 
  score, 
  size = 160, 
  strokeWidth = 12,
  className 
}: RiskScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate the score on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  // Determine color based on score
  let colorClass = "text-emerald-500";
  let glowClass = "drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]";
  
  if (score >= 60) {
    colorClass = "text-rose-500";
    glowClass = "drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]";
  } else if (score >= 30) {
    colorClass = "text-amber-500";
    glowClass = "drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]";
  }

  // SVG calculations
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Background Track */}
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          className="text-border"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Ring */}
        <circle
          className={cn("transition-all duration-1000 ease-out", colorClass, glowClass)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      
      {/* Center Text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold tracking-tighter text-white">
          {Math.round(animatedScore)}
        </span>
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          / 100
        </span>
      </div>
    </div>
  );
}
