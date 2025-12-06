import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'destructive';
  className?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, variant = 'default', className }: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-lg animate-fade-in',
        variant === 'primary' && 'gradient-primary text-primary-foreground',
        variant === 'success' && 'bg-success text-success-foreground',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground',
        variant === 'default' && 'bg-card border border-border',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            'text-sm font-medium',
            variant === 'default' ? 'text-muted-foreground' : 'opacity-90'
          )}>
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className={cn(
              'text-xs',
              variant === 'default' ? 'text-muted-foreground' : 'opacity-75'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          'rounded-xl p-3',
          variant === 'default' ? 'bg-muted' : 'bg-background/20'
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
