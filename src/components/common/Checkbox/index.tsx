import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { clsx } from '../../../utils/clsx';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string | React.ReactNode;
  description?: string;
  error?: string;
  required?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, label, description, error, required, className, disabled, ...rest }, ref) => {
    const autoId = useId();
    const checkId = id || autoId;
    const errorId = error ? `${checkId}-error` : undefined;
    const descId = description ? `${checkId}-desc` : undefined;

    return (
      <div className={clsx('flex flex-col gap-1', className)}>
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            id={checkId}
            type="checkbox"
            disabled={disabled}
            aria-required={required}
            aria-describedby={[descId, errorId].filter(Boolean).join(' ') || undefined}
            aria-invalid={!!error}
            className={clsx(
              'mt-0.5 w-4 h-4 rounded border-2 border-neutral-300 accent-black cursor-pointer',
              'focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-error',
            )}
            {...rest}
          />
          <div className="flex-1">
            <label
              htmlFor={checkId}
              className={clsx(
                'text-sm text-text-primary cursor-pointer leading-snug',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              {label}
              {required && <span className="text-error ml-0.5" aria-hidden="true"> *</span>}
            </label>
            {description && (
              <p id={descId} className="text-xs text-text-muted mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
        {error && (
          <p id={errorId} role="alert" aria-live="polite" className="text-xs text-error flex items-center gap-1 ml-7">
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="shrink-0">
              <path fillRule="evenodd" d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zm-.75 2.75a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-1.5 0v-2.5zM6 9a.75.75 0 1 1 0-1.5A.75.75 0 0 1 6 9z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export default Checkbox;
