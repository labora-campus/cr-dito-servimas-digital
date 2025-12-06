import { Link } from 'react-router-dom';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import { Cortinero } from '@/types/cortinero';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

interface CortineroCardProps {
  cortinero: Cortinero;
  index: number;
}

export function CortineroCard({ cortinero, index }: CortineroCardProps) {
  const isDebt = cortinero.saldo < 0;
  const isPositive = cortinero.saldo > 0;

  return (
    <Link
      to={`/cortineros/${cortinero.id}`}
      className="group block animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <img
              src={cortinero.foto}
              alt={cortinero.nombre}
              className="h-16 w-16 rounded-full object-cover ring-4 ring-background shadow-lg"
            />
            <div
              className={cn(
                'absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background',
                isDebt ? 'bg-destructive' : 'bg-success'
              )}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {cortinero.nombre}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{cortinero.zona}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Último mov: {formatDate(cortinero.ultimoMovimiento)}</span>
            </div>
          </div>

          {/* Balance */}
          <div className="text-right">
            <p
              className={cn(
                'text-xl font-bold',
                isDebt && 'text-destructive',
                isPositive && 'text-success',
                !isDebt && !isPositive && 'text-muted-foreground'
              )}
            >
              {formatCurrency(Math.abs(cortinero.saldo))}
            </p>
            <p className={cn(
              'text-xs font-medium',
              isDebt ? 'text-destructive' : isPositive ? 'text-success' : 'text-muted-foreground'
            )}>
              {isDebt ? 'Debe' : isPositive ? 'A favor' : 'Al día'}
            </p>
          </div>

          {/* Arrow */}
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>

        {/* Credit limit indicator */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Uso de crédito</span>
            <span>{Math.round((Math.abs(cortinero.saldo) / cortinero.limiteCredito) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                Math.abs(cortinero.saldo) / cortinero.limiteCredito > 0.8
                  ? 'bg-destructive'
                  : Math.abs(cortinero.saldo) / cortinero.limiteCredito > 0.5
                  ? 'bg-warning'
                  : 'bg-primary'
              )}
              style={{
                width: `${Math.min((Math.abs(cortinero.saldo) / cortinero.limiteCredito) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
