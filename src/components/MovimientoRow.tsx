import { ArrowDownCircle, ArrowUpCircle, Settings } from 'lucide-react';
import { Movimiento } from '@/types/cortinero';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

interface MovimientoRowProps {
  movimiento: Movimiento;
}

export function MovimientoRow({ movimiento }: MovimientoRowProps) {
  const getIcon = () => {
    switch (movimiento.tipo) {
      case 'pago':
        return <ArrowUpCircle className="h-5 w-5 text-success" />;
      case 'entrega':
        return <ArrowDownCircle className="h-5 w-5 text-destructive" />;
      case 'ajuste':
        return <Settings className="h-5 w-5 text-warning" />;
    }
  };

  const getTipoLabel = () => {
    switch (movimiento.tipo) {
      case 'pago':
        return 'Pago';
      case 'entrega':
        return 'Entrega';
      case 'ajuste':
        return 'Ajuste';
    }
  };

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="py-4 px-4">
        <span className="text-sm text-muted-foreground">
          {formatDate(movimiento.fecha)}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            movimiento.tipo === 'pago' && 'bg-success/10 text-success',
            movimiento.tipo === 'entrega' && 'bg-destructive/10 text-destructive',
            movimiento.tipo === 'ajuste' && 'bg-warning/10 text-warning'
          )}>
            {getTipoLabel()}
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <p className="text-sm font-medium text-foreground">{movimiento.descripcion}</p>
        {movimiento.metodoPago && (
          <p className="text-xs text-muted-foreground">{movimiento.metodoPago}</p>
        )}
      </td>
      <td className="py-4 px-4 text-right">
        <span className={cn(
          'font-semibold',
          movimiento.tipo === 'pago' ? 'text-success' : 'text-destructive'
        )}>
          {movimiento.tipo === 'pago' ? '+' : '-'}{formatCurrency(movimiento.importe)}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <span className={cn(
          'font-medium',
          movimiento.saldoResultante < 0 ? 'text-destructive' : movimiento.saldoResultante > 0 ? 'text-success' : 'text-muted-foreground'
        )}>
          {formatCurrency(movimiento.saldoResultante)}
        </span>
      </td>
    </tr>
  );
}
