interface BadgeProps {
  text: string;
  variant: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
}

const colors: Record<BadgeProps['variant'], string> = {
  green: '#d1fae5 color:#065f46',
  blue: '#dbeafe color:#1e40af',
  yellow: '#fef9c3 color:#854d0e',
  red: '#fee2e2 color:#991b1b',
  gray: '#f3f4f6 color:#374151',
};

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
  return <Badge text={type} variant={type === 'Incoming' ? 'green' : 'blue'} />;
}

export function orderStatusBadge(status: string) {
  const map: Record<string, BadgeProps['variant']> = {
    Draft: 'gray', Confirmed: 'yellow', Completed: 'green',
  };
  return <Badge text={status} variant={map[status] ?? 'gray'} />;
}
