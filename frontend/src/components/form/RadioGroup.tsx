import React from 'react';

interface RadioGroupProps {
  id: string;
  label: string;
  name: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (name: string, value: string) => void;
  onBlur: (name: string) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  label,
  name,
  value,
  options,
  onChange,
  onBlur,
  error,
  touched,
  required = true,
}) => {
  const showError = Boolean(touched && error);

  return (
    <fieldset className="space-y-2" id={id}>
      <legend className="text-sm font-semibold text-text-secondary">
        {label}
        {required ? ' *' : ''}
      </legend>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface text-text-secondary hover:border-primary/40'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => {
                  onChange(name, option.value);
                  onBlur(name);
                }}
                className="h-4 w-4 border-border text-primary focus:ring-primary"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
      {showError ? <p className="text-sm text-danger">{error}</p> : null}
    </fieldset>
  );
};

export default RadioGroup;
