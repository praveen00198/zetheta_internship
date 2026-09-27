import { forwardRef } from 'react';
import { clsx } from '../../../utils/clsx';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helpText?: string;
  required?: boolean;
  layout?: 'horizontal' | 'vertical' | 'card';
  className?: string;
}

const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      name,
      label,
      options,
      value,
      onChange,
      error,
      helpText,
      required,
      layout = 'vertical',
      className,
    },
    ref,
  ) => {
    const groupId = `rg-${name}`;
    const errorId = error ? `${groupId}-error` : undefined;

    return (
      <fieldset
        ref={ref}
        aria-required={required}
        aria-describedby={errorId}
        aria-invalid={!!error}
        className={clsx('border-0 p-0 m-0', className)}
      >
        {label && (
          <legend
            className={clsx(
              'block text-sm font-medium text-text-primary tracking-wide mb-2',
              required && 'after:content-["_*"] after:text-error',
            )}
          >
            {label}
          </legend>
        )}
        <div
          className={clsx(
            layout === 'horizontal' && 'flex flex-wrap gap-3',
            layout === 'vertical' && 'flex flex-col gap-2',
            layout === 'card' && 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3',
          )}
        >
          {options.map((option) => (
            <label
              key={option.value}
              className={clsx(
                layout === 'card'
                  ? clsx(
                      'radio-card cursor-pointer',
                      value === option.value && 'radio-card-selected',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                    )
                  : clsx(
                      'flex items-center gap-2.5 cursor-pointer group',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                    ),
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                disabled={option.disabled}
                onChange={(e) => onChange?.(e.target.value)}
                className={clsx(
                  'w-4 h-4 border-2 border-neutral-300 accent-black',
                  'focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2',
                  layout === 'card' && 'sr-only',
                )}
                aria-describedby={option.description ? `${name}-${option.value}-desc` : undefined}
              />
              {layout === 'card' ? (
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">{option.label}</span>
                    <span
                      aria-hidden="true"
                      className={clsx(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
                        value === option.value
                          ? 'border-black bg-black'
                          : 'border-neutral-300',
                      )}
                    >
                      {value === option.value && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  {option.description && (
                    <p
                      id={`${name}-${option.value}-desc`}
                      className="text-xs text-text-muted mt-1"
                    >
                      {option.description}
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-sm text-text-primary">{option.label}</span>
              )}
            </label>
          ))}
        </div>
        {helpText && <p className="text-xs text-text-muted mt-1.5">{helpText}</p>}
        {error && (
          <p id={errorId} role="alert" aria-live="polite" className="text-xs text-error flex items-center gap-1 mt-1.5">
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="shrink-0">
              <path fillRule="evenodd" d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zm-.75 2.75a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-1.5 0v-2.5zM6 9a.75.75 0 1 1 0-1.5A.75.75 0 0 1 6 9z" />
            </svg>
            {error}
          </p>
        )}
      </fieldset>
    );
  },
);
RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
