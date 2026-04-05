import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
};

export default function Card({
  hover = false,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const paddingClass = {
    sm: 'p-4 sm:p-5',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-10',
  }[padding];

  return (
    <div
      className={`ui-card ${paddingClass} ${hover ? 'ui-card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
