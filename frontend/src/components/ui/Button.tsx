import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-muted disabled:border-gray-200 disabled:shadow-none disabled:hover:bg-gray-200';

  const variants = {
    primary:
      'bg-primary text-text-on-primary hover:bg-primary-dark border-2 border-transparent hover:border-accent focus-visible:ring-primary',
    secondary:
      'bg-secondary text-text-on-primary hover:bg-secondary-dark border-2 border-transparent focus-visible:ring-secondary',
    accent:
      'bg-accent-dark text-text-on-primary hover:bg-accent-text border-2 border-transparent focus-visible:ring-accent-dark',
    outline:
      'bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-text-on-primary focus-visible:ring-primary',
    text: 'bg-transparent text-primary hover:bg-primary/10 hover:text-primary-dark border-2 border-transparent focus-visible:ring-primary',
    danger:
      'bg-danger text-text-on-primary hover:bg-red-800 border-2 border-transparent focus-visible:ring-danger',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs md:text-sm gap-1.5',
    md: 'px-6 py-3 text-sm md:text-base gap-2',
    lg: 'px-8 py-4 text-base md:text-lg gap-2.5',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
