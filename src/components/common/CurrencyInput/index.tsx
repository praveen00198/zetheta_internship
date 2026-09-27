import { forwardRef, useState, useCallback, useEffect, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { clsx } from '../../../utils/clsx';
import { formatIndianNumber, parseCurrencyInput } from '../../../utils/formatters';

export interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      id,
      label,
      error,
      helpText,
      required,
      value,
      onChange,
      min,
      max,
      className,
      disabled,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helpId = helpText ? `${inputId}-help` : undefined;

    const [displayValue, setDisplayValue] = useState(
      value ? formatIndianNumber(value) : '',
    );
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(value ? formatIndianNumber(value) : '');
      }
    }, [value, isFocused]);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      // Show raw number when focused
      if (value) setDisplayValue(String(value));
    }, [value]);

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        const parsed = parseCurrencyInput(e.target.value);
        onChange?.(parsed);
        setDisplayValue(parsed ? formatIndianNumber(parsed) : '');
        onBlur?.(e);
      },
      [onChange, onBlur],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9.]/g, '');
        setDisplayValue(raw);
        const parsed = parseFloat(raw) || 0;
        onChange?.(parsed);
      },
      [onChange],
    );

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'block text-sm font-medium text-text-primary tracking-wide',
              required && 'after:content-["_*"] after:text-error',
            )}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <span
            aria-hidden="true"
            className="absolute left-3 text-sm text-text-muted pointer-events-none select-none font-medium"
          >
            ₹
          </span>
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="numeric"
            disabled={disabled}
            aria-required={required}
            aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
            aria-invalid={!!error}
            aria-valuemin={min}
            aria-valuemax={max}
            value={displayValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={clsx(
              'field-input pl-7',
              error && 'field-input-error',
              className,
            )}
            {...rest}
          />
        </div>
        {helpText && <p id={helpId} className="text-xs text-text-muted">{helpText}</p>}
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
CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
