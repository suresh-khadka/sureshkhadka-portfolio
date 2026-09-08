import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = ({ variant = 'primary', className = '', children, ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-accent text-primary font-bold hover:bg-sky-300',
    secondary: 'bg-secondary text-white hover:bg-slate-700',
    outline: 'border-2 border-accent text-accent hover:bg-accent hover:text-primary',
  };

  return (
    <button
      className={`px-6 py-2 rounded-lg transition-colors duration-200 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
