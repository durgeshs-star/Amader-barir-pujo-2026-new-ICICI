import React from 'react';

interface TextFieldProps {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  onBlur: (name: string) => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  required?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({
  id,
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  type = 'text',
  autoComplete,
  inputMode,
  required = true,
}) => {
  const showError = Boolean(touched && error);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-text-secondary">
        {label}
        {required ? ' *' : ''}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={() => onBlur(name)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-4 py-3 text-base text-text shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          showError
            ? 'border-danger bg-danger/5 focus:border-danger'
            : 'border-border bg-surface focus:border-primary'
        }`}
      />
      {showError ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
};

export default TextField;
