import i18n from '../i18n/i18n';

interface BadgeProps {
  text: string;
  variant: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
}

export function Badge({ text, variant }: BadgeProps) {
  const style: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 600,
    background: variant === 'green' ? '#d1fae5' : variant === 'blue' ? '#dbeafe' : variant === 'yellow' ? '#fef9c3' : variant === 'red' ? '#fee2e2' : '#f3f4f6',
    color: variant === 'green' ? '#065f46' : variant === 'blue' ? '#1e40af' : variant === 'yellow' ? '#854d0e' : variant === 'red' ? '#991b1b' : '#374151',
  };
  return <span style={style}>{text}</span>;
}

export function orderTypeBadge(type: string) {
  const label = i18n.t(`badge.${type}`, { defaultValue: type });
  return <Badge text={label} variant={type === 'Incoming' ? 'green' : 'blue'} />;
}

export function orderStatusBadge(status: string) {
  const map: Record<string, BadgeProps['variant']> = {
    Draft: 'gray', Confirmed: 'yellow', Completed: 'green',
  };
  const label = i18n.t(`badge.${status}`, { defaultValue: status });
  return <Badge text={label} variant={map[status] ?? 'gray'} />;
}
