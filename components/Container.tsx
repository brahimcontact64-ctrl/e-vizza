import React from 'react';

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: 'md' | 'lg' | 'xl';
};

export default function Container({ size = 'xl', className = '', children, ...props }: ContainerProps) {
  const sizeClass = {
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
  }[size];

  return (
    <div className={`mx-auto w-full px-6 sm:px-8 ${sizeClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
