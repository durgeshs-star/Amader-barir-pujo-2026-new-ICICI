import React from 'react';

interface SelectFieldProps {
  id: string;
  label: string;
  name: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (name: string, value: string) => void;
  onBlur: (name: string) => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  required?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  name,
  value,
  options,
  onChange,
  onBlur,
  error,
  touched,
  placeholder = 'Select an option',
  required = true,
}) => {
  const showError = Boolean(touched && error);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-text-secondary">
        {label}
        {required ? ' *' : ''}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={() => onBlur(name)}
        className={`w-full rounded-xl border px-4 py-3 text-base text-text shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[rgb(248,233,206)] ${
          showError
            ? 'border-danger bg-danger/5 focus:border-danger'
            : 'border-border focus:border-primary'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {showError ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
};

export default SelectField;
