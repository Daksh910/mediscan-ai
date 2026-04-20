interface RiskBadgeProps { level: string; }

export const RiskBadge = ({ level }: RiskBadgeProps) => {
  const l = level?.toLowerCase() || 'low';
  const map: Record<string, { cls: string; dot: string }> = {
    low:      { cls: 'risk-badge risk-low',      dot: '#2d9b6b' },
    medium:   { cls: 'risk-badge risk-medium',   dot: '#d97706' },
    high:     { cls: 'risk-badge risk-high',     dot: '#e05c3a' },
    critical: { cls: 'risk-badge risk-critical', dot: '#c0293a' },
  };
  const { cls, dot } = map[l] || map.low;
  return (
    <span className={cls}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />
      {level}
    </span>
  );
};
