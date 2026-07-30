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
        className={`w-full px-4 py-2 border border-[rgb(180,160,130)] rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-[rgb(248,233,206)] ${
          showError
            ? 'border-red-500 bg-red-50'
            : 'border-[rgb(180,160,130)]'
        }`}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={() => onBlur(name)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
      />
      {showError ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
};

export default TextField;
