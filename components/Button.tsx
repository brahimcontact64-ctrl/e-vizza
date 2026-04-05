import React from 'react';
import { Loader as Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    md: 'h-12 px-6 text-sm',
    lg: 'h-14 px-7 text-base',
  };

  const variantStyles = {
    primary: 'btn-primary bg-gradient-to-r from-[#00D474] to-[#00C86E] text-white shadow-primary hover:shadow-xl',
    secondary: 'bg-[#F1F7F5] text-[#0B3948] border border-[#DDEAE5] hover:bg-[#E8F4EF]',
    outline: 'border border-[#00D474] text-[#00B863] bg-white hover:bg-[#E8FFF4]',
    ghost: 'text-[#0B3948] hover:bg-[#F1F7F5]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={20} />}
      {children}
    </button>
  );
}
