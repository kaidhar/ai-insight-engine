import { Badge } from "@/components/ui/badge";
import { Zap, Crown } from "lucide-react";

interface TierIndicatorProps {
  tierUsed: 'tier1_fast' | 'tier2_deep';
  cost: number;
  showCost?: boolean;
  size?: 'sm' | 'md' | 'lg';
  upgradeReason?: string;
}

const TierIndicator = ({
  tierUsed,
  cost,
  showCost = true,
  size = 'md',
  upgradeReason
}: TierIndicatorProps) => {
  const isFast = tierUsed === 'tier1_fast';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={`
          ${sizeClasses[size]}
          ${isFast
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
          }
          font-medium
        `}
      >
        <div className="flex items-center gap-1.5">
          {isFast ? (
            <Zap className={iconSizes[size]} />
          ) : (
            <Crown className={iconSizes[size]} />
          )}
          <span>{isFast ? 'Quick Research' : 'Deep Research'}</span>
        </div>
      </Badge>

      {showCost && (
        <span className={`
          ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}
          text-muted-foreground font-medium
        `}>
          {cost} {cost === 1 ? 'credit' : 'credits'}
        </span>
      )}

      {upgradeReason && tierUsed === 'tier2_deep' && (
        <div className="group relative">
          <span className={`
            ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}
            text-blue-600 dark:text-blue-400 cursor-help
          `}>
            ℹ️
          </span>
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
            <div className="bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border border-border w-64 text-xs">
              <p className="font-semibold mb-1">Why upgraded?</p>
              <p className="text-muted-foreground">{upgradeReason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TierIndicator;
