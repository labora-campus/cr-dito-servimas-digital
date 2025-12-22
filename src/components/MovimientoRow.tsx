import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Settings, Pencil } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Movimiento } from '@/types/cortinero';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SecurityPinModal } from '@/components/SecurityPinModal';
import { EditMovimientoModal } from '@/components/EditMovimientoModal';
import { updateMovimiento } from '@/data/supabaseApi';
import { toast } from '@/hooks/use-toast';

interface MovimientoRowProps {
  movimiento: Movimiento;
}

export function MovimientoRow({ movimiento }: MovimientoRowProps) {
  const [showPinModal, setShowPinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; monto: number; descripcion?: string; metodoPago?: string; comentarios?: string; fecha: string }) =>
      updateMovimiento(data.id, {
        monto: data.monto,
        descripcion: data.descripcion,
        metodoPago: data.metodoPago,
        comentarios: data.comentarios,
        fecha: data.fecha
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cortineros'] });
      queryClient.invalidateQueries({ queryKey: ['cortinero'] });
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      toast({
        title: 'Movimiento actualizado',
        description: 'Los cambios han sido guardados correctamente.',
      });
      setShowEditModal(false);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el movimiento.',
        variant: 'destructive',
      });
    }
  });

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

  const handleEdit = async (id: string, data: any) => {
    await updateMutation.mutateAsync({ id, ...data });
  };

  return (
    <>
      <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
        <td className="py-4 px-4">
          <span className="text-sm text-muted-foreground">
            {formatDate(movimiento.fecha)}
            <span className="text-xs text-muted-foreground ml-2">
              {movimiento.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
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
        <td className="py-4 px-4 text-right w-10">
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setShowPinModal(true)}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
        </td>
      </tr>

      <SecurityPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => setShowEditModal(true)}
      />

      <EditMovimientoModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        movimiento={movimiento}
        onSubmit={handleEdit}
      />
    </>
  );
}
