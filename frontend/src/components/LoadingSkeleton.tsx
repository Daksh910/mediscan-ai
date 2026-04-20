const Sk = ({ style }: { style?: React.CSSProperties }) => (
  <div className="skeleton" style={{ height: 12, ...style }} />
);

export const LoadingSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`skeleton ${className}`} />
);

export const CardSkeleton = () => (
  <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Sk style={{ width: '40%', height: 11 }} />
    <Sk style={{ width: '55%', height: 28, marginTop: 4 }} />
  </div>
);

export const ChartSkeleton = () => (
  <div className="card" style={{ padding: 20 }}>
    <Sk style={{ width: '30%', height: 14, marginBottom: 16 }} />
    <Sk style={{ height: 200 }} />
  </div>
);

export const TableSkeleton = () => (
  <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
    <Sk style={{ width: '30%', height: 14, marginBottom: 6 }} />
    {Array.from({ length: 5 }).map((_, i) => (
      <Sk key={i} style={{ height: 40, opacity: 1 - i * 0.12 }} />
    ))}
  </div>
);
