import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'navy' | 'gold' | 'green' | 'blue';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'navy',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn('w-full bg-gray-200 rounded-full overflow-hidden', {
          'h-1.5': size === 'sm',
          'h-2.5': size === 'md',
          'h-4': size === 'lg',
        })}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', {
            'bg-navy-800': color === 'navy',
            'bg-gold-500': color === 'gold',
            'bg-green-500': color === 'green',
            'bg-blue-600': color === 'blue',
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && <span className="text-sm font-medium text-gray-600">{percentage}%</span>}
    </div>
  );
}
