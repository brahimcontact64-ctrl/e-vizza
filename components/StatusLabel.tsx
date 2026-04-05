import React from 'react';
import Badge from '@/components/Badge';

type StatusLabelProps = {
  status: string;
  className?: string;
};

export default function StatusLabel({ status, className = '' }: StatusLabelProps) {
  const normalized = status.toLowerCase();

  let tone: 'neutral' | 'primary' | 'accent' | 'success' | 'danger' = 'neutral';
  if (['approved', 'submitted', 'confirmed'].includes(normalized)) tone = 'success';
  else if (['reviewing', 'pending', 'waiting', 'waiting_list', 'sent_to_freelancer'].includes(normalized)) tone = 'accent';
  else if (['rejected', 'cancelled'].includes(normalized)) tone = 'danger';

  const label = status.replace(/_/g, ' ');

  return <Badge tone={tone} className={`capitalize ${className}`}>{label}</Badge>;
}
