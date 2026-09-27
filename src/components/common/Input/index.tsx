import React, { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { clsx } from '../../../utils/clsx';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

interface InputLabelProps {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface InputErrorProps {
  id?: string;
  children?: React.ReactNode;
  className?: string;
}

interface InputHelpProps {
  id?: string;
  children?: React.ReactNode;
  className?: string;
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────
function InputLabel({ htmlFor, required, children, className }: InputLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        'block text-sm font-medium text-text-primary tracking-wide',
        required && 'after:content-["_*"] after:text-error',
        className,
      )}
    >
      {children}
    </label>
  );
}

function InputError({ id, children, className }: InputErrorProps) {
  if (!children) return null;
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={clsx('text-xs text-error flex items-center gap-1 mt-0.5', className)}
    >
      <svg
        aria-hidden="true"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="currentColor"
        className="shrink-0 mt-px"
      >
        <path
          fillRule="evenodd"
          d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zm-.75 2.75a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-1.5 0v-2.5zM6 9a.75.75 0 1 1 0-1.5A.75.75 0 0 1 6 9z"
        />
      </svg>
      <span>{children}</span>
    </p>
  );
}

function InputHelpText({ id, children, className }: InputHelpProps) {
  if (!children) return null;
  return (
    <p id={id} className={clsx('text-xs text-text-muted mt-0.5', className)}>
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const InputField = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      error,
      helpText,
      required,
      prefix,
      suffix,
      className,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helpId = helpText ? `${inputId}-help` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <InputLabel htmlFor={inputId} required={required}>
            {label}
          </InputLabel>
        )}
        <div className={clsx('relative flex items-center', prefix || suffix ? 'group' : '')}>
          {prefix && (
            <span
              aria-hidden="true"
              className="absolute left-3 flex items-center text-text-muted pointer-events-none"
            >
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-required={required}
            aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
            aria-invalid={!!error}
            className={clsx(
              'field-input',
              error && 'field-input-error',
              prefix && 'pl-9',
              suffix && 'pr-9',
              className,
            )}
            {...rest}
          />
          {suffix && (
            <span
              aria-hidden="true"
              className="absolute right-3 flex items-center text-text-muted pointer-events-none"
            >
              {suffix}
            </span>
          )}
        </div>
        {helpText && <InputHelpText id={helpId}>{helpText}</InputHelpText>}
        {error && <InputError id={errorId}>{error}</InputError>}
      </div>
    );
  },
);
InputField.displayName = 'Input';

export const Input = InputField;
export default Input;
