import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label displayed above the input */
  label?: string;
  /** Styling variant */
  inputVariant?: 'outlined' | 'filled';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Error message triggers red error state */
  error?: string;
  /** Subtle helper text shown below the input (hidden when error is shown) */
  helperText?: string;
  /** Icon/element rendered on the left inside the input */
  leftIcon?: React.ReactNode;
  /** Icon/element rendered on the right inside the input */
  rightIcon?: React.ReactNode;
  /** Fill the full container width */
  fullWidth?: boolean;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  inputVariant?: 'outlined' | 'filled';
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  inputVariant?: 'outlined' | 'filled';
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const labelBase =
  'block text-[10.5px] font-bold uppercase tracking-widest mb-1.5 transition-colors';

const getWrapperClass = (fullWidth?: boolean) =>
  `flex flex-col gap-0 ${fullWidth ? 'w-full' : ''}`;

function ErrorIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function getVariantClass(variant: 'outlined' | 'filled', hasError: boolean): string {
  if (variant === 'outlined') {
    return hasError
      ? 'bg-white border border-red-400 focus:ring-2 focus:ring-red-300/50 focus:border-red-500'
      : 'bg-white border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary';
  }
  return hasError
    ? 'bg-red-50 border border-red-300 focus:ring-2 focus:ring-red-300/50 focus:border-red-400'
    : 'bg-gray-50/80 border border-transparent focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary';
}

// ─── Input ────────────────────────────────────────────────────────────────────

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      inputVariant = 'outlined',
      size = 'md',
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const genId = id ?? (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    const sizeMap: Record<string, string> = { sm: 'py-2 text-xs', md: 'py-2.5 text-sm', lg: 'py-3.5 text-base' };
    const pl = leftIcon ? 'pl-10' : 'pl-3.5';
    const pr = rightIcon ? 'pr-10' : 'pr-3.5';

    const cls = [
      'w-full rounded-lg transition-all duration-200 focus:outline-none',
      sizeMap[size ?? 'md'],
      pl,
      pr,
      getVariantClass(inputVariant, !!error),
      disabled ? 'opacity-55 cursor-not-allowed' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={getWrapperClass(fullWidth)}>
        {label && (
          <label htmlFor={genId} className={`${labelBase} ${error ? 'text-red-500' : 'text-gray-600'}`}>
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-gray-400 pointer-events-none select-none flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={genId}
            disabled={disabled}
            className={cls}
            aria-invalid={!!error}
            aria-describedby={error ? `${genId}-error` : helperText ? `${genId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-gray-400 pointer-events-none select-none flex items-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <p id={`${genId}-error`} className="mt-1.5 text-[11px] font-medium text-red-500 flex items-center gap-1">
            <ErrorIcon />{error}
          </p>
        ) : helperText ? (
          <p id={`${genId}-helper`} className="mt-1.5 text-[11px] text-gray-400">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

// ─── Textarea ─────────────────────────────────────────────────────────────────

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, inputVariant = 'outlined', error, helperText, fullWidth = false, className = '', id, disabled, ...props },
    ref,
  ) => {
    const genId = id ?? (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    const cls = [
      'w-full rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200 resize-y focus:outline-none',
      getVariantClass(inputVariant, !!error),
      disabled ? 'opacity-55 cursor-not-allowed' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={getWrapperClass(fullWidth)}>
        {label && (
          <label htmlFor={genId} className={`${labelBase} ${error ? 'text-red-500' : 'text-gray-600'}`}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={genId}
          disabled={disabled}
          className={cls}
          aria-invalid={!!error}
          aria-describedby={error ? `${genId}-error` : helperText ? `${genId}-helper` : undefined}
          {...props}
        />
        {error ? (
          <p id={`${genId}-error`} className="mt-1.5 text-[11px] font-medium text-red-500 flex items-center gap-1">
            <ErrorIcon />{error}
          </p>
        ) : helperText ? (
          <p id={`${genId}-helper`} className="mt-1.5 text-[11px] text-gray-400">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

// ─── Select ───────────────────────────────────────────────────────────────────

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, inputVariant = 'outlined', error, helperText, fullWidth = false, className = '', id, disabled, children, ...props },
    ref,
  ) => {
    const genId = id ?? (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    const cls = [
      'w-full rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200 appearance-none pr-9 focus:outline-none',
      getVariantClass(inputVariant, !!error),
      disabled ? 'opacity-55 cursor-not-allowed' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={getWrapperClass(fullWidth)}>
        {label && (
          <label htmlFor={genId} className={`${labelBase} ${error ? 'text-red-500' : 'text-gray-600'}`}>
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={genId}
            disabled={disabled}
            className={cls}
            aria-invalid={!!error}
            aria-describedby={error ? `${genId}-error` : helperText ? `${genId}-helper` : undefined}
            {...props}
          >
            {children}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ChevronIcon />
          </span>
        </div>
        {error ? (
          <p id={`${genId}-error`} className="mt-1.5 text-[11px] font-medium text-red-500 flex items-center gap-1">
            <ErrorIcon />{error}
          </p>
        ) : helperText ? (
          <p id={`${genId}-helper`} className="mt-1.5 text-[11px] text-gray-400">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Input;
