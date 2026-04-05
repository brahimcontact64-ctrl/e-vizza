import React from 'react';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'primary' | 'accent' | 'success' | 'danger';
};

export default function Badge({ tone = 'neutral', className = '', children, ...props }: BadgeProps) {
  const toneClass = {
    neutral: 'bg-[#F1F7F5] text-[#0B3948] border-[#DDEAE5]',
    primary: 'bg-[#00D474]/10 text-[#00B863] border-[#00D474]/30',
    accent: 'bg-[#FED488]/25 text-[#8A5B14] border-[#FED488]',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-red-50 text-red-600 border-red-200',
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClass} ${className}`} {...props}>
      {children}
    </span>
  );
}
