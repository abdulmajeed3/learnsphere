import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  size = 'md',
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={clsx('w-full', className)}>
      <div
        className={clsx(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          size === 'sm' ? 'h-1.5' : 'h-2.5',
        )}
      >
        <div
          className="bg-primary-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <p className="mt-1 text-xs text-gray-500 text-right">{pct}%</p>}
    </div>
  );
}
