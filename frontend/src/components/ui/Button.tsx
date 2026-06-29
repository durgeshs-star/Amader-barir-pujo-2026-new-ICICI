import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark border-2 border-transparent hover:border-accent hover:shadow-lg focus-visible:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-red-700 border-2 border-transparent hover:shadow-lg focus-visible:ring-secondary',
    accent: 'bg-accent text-white hover:bg-accent-light border-2 border-transparent hover:shadow-lg focus-visible:ring-accent',
    outline: 'bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white focus-visible:ring-primary',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs md:text-sm',
    md: 'px-6 py-3 text-sm md:text-base',
    lg: 'px-8 py-4 text-base md:text-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
