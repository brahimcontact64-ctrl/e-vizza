import React from 'react';
import Container from '@/components/Container';

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  containerSize?: 'md' | 'lg' | 'xl';
};

export default function Section({
  className = '',
  containerSize = 'xl',
  children,
  ...props
}: SectionProps) {
  return (
    <section className={`ui-section ${className}`} {...props}>
      <Container size={containerSize}>{children}</Container>
    </section>
  );
}
