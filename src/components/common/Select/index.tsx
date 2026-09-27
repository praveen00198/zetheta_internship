import { forwardRef, useId } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { clsx } from '../../../utils/clsx';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  options: readonly SelectOption[] | SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      error,
      helpText,
      required,
      options,
      placeholder = 'Select an option',
      className,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const autoId = useId();
    const selectId = id || autoId;
    const errorId = error ? `${selectId}-error` : undefined;
    const helpId = helpText ? `${selectId}-help` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className={clsx(
              'block text-sm font-medium text-text-primary tracking-wide',
              required && 'after:content-["_*"] after:text-error',
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-required={required}
            aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
            aria-invalid={!!error}
            className={clsx(
              'field-input appearance-none pr-8 cursor-pointer',
              error && 'field-input-error',
              className,
            )}
            {...rest}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        {helpText && (
          <p id={helpId} className="text-xs text-text-muted">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" aria-live="polite" className="text-xs text-error flex items-center gap-1">
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
Select.displayName = 'Select';

export default Select;
