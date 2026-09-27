import { clsx } from '../../../utils/clsx';

export interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProgressBar({
  value,
  label,
  showPercentage = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const height = { sm: 'h-1', md: 'h-1.5', lg: 'h-2' }[size];

  return (
    <div className={clsx('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-text-muted">{label}</span>}
          {showPercentage && (
            <span className="text-xs font-medium text-text-primary">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
        className={clsx('w-full bg-neutral-200 rounded-full overflow-hidden', height)}
      >
        <div
          className={clsx('rounded-full bg-black transition-all duration-500 ease-out', height)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
