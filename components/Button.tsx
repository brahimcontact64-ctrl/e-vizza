import React from 'react';
import { Loader as Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-primary disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={20} />}
      {children}
    </button>
  );
}
