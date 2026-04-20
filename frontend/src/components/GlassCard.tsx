import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const GlassCard = ({ children, className, hover, onClick }: GlassCardProps) => (
  <div
    className={cn(hover ? 'card-hover' : 'card', className)}
    onClick={onClick}
    style={onClick ? { cursor: 'pointer' } : undefined}
  >
    {children}
  </div>
);
