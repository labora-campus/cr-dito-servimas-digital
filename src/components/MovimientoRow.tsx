import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Settings, Pencil, Trash2, Eye } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Movimiento } from '@/types/cortinero';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SecurityPinModal } from '@/components/SecurityPinModal';
import { EditMovimientoModal } from '@/components/EditMovimientoModal';
import { ViewMovimientoModal } from '@/components/ViewMovimientoModal';
import { deleteMovimiento, updateMovimiento } from '@/data/supabaseApi';
import { toast } from '@/hooks/use-toast';

interface MovimientoRowProps {
  movimiento: Movimiento;
}

export function MovimientoRow({ movimiento }: MovimientoRowProps) {
  const [showPinModal, setShowPinModal] = useState(false); // For edits
  const [showDeletePinModal, setShowDeletePinModal] = useState(false); // For deletes
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false); // For view
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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await deleteMovimiento(movimiento.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cortineros'] });
      queryClient.invalidateQueries({ queryKey: ['cortinero'] });
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      toast({
        title: 'Movimiento eliminado',
        description: 'El movimiento ha sido eliminado correctamente.',
      });
      setShowDeletePinModal(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el movimiento.',
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
        <td className="py-2 px-2 sm:py-4 sm:px-4">
          <div className="flex flex-col">
            <span className="text-sm text-foreground font-medium">
              {formatDate(movimiento.fecha)}
            </span>
            <span className="text-xs text-muted-foreground">
              {movimiento.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </td>
        <td className="py-2 px-2 sm:py-4 sm:px-4 hidden sm:table-cell">
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
        <td className="py-2 px-2 sm:py-4 sm:px-4">
          <div className="flex flex-col max-w-[150px] sm:max-w-xs">
            <p className="text-sm font-medium text-foreground truncate" title={movimiento.descripcion}>
              {movimiento.descripcion}
            </p>
            {movimiento.metodoPago && (
              <p className="text-xs text-muted-foreground truncate" title={movimiento.metodoPago}>
                {movimiento.metodoPago}
              </p>
            )}
            {/* Show notes/comments if they exist and are different */}
            {movimiento.nota && movimiento.nota !== movimiento.descripcion && (
              <p className="text-[10px] text-muted-foreground/80 italic truncate" title={movimiento.nota}>
                {movimiento.nota}
              </p>
            )}
          </div>
        </td>
        <td className="py-2 px-2 sm:py-4 sm:px-4 text-right whitespace-nowrap">
          <span className={cn(
            'font-semibold text-sm sm:text-base',
            movimiento.tipo === 'pago' ? 'text-success' : 'text-destructive'
          )}>
            {movimiento.tipo === 'pago' ? '+' : '-'}{formatCurrency(movimiento.importe)}
          </span>
        </td>
        <td className="py-2 px-2 sm:py-4 sm:px-4 text-right whitespace-nowrap hidden sm:table-cell">
          <span className={cn(
            'font-medium text-sm',
            movimiento.saldoResultante < 0 ? 'text-destructive' : movimiento.saldoResultante > 0 ? 'text-success' : 'text-muted-foreground'
          )}>
            {formatCurrency(movimiento.saldoResultante)}
          </span>
        </td>
        <td className="py-2 px-2 sm:py-4 sm:px-4 text-right w-10">
          <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              onClick={() => setShowViewModal(true)}
            >
              <Eye className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              onClick={() => setShowPinModal(true)}
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10"
              onClick={() => setShowDeletePinModal(true)}
            >
              <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
            </Button>
          </div>
        </td>
      </tr>

      <SecurityPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => {
          setShowPinModal(false);
          setShowEditModal(true);
        }}
      />

      <SecurityPinModal
        isOpen={showDeletePinModal}
        onClose={() => setShowDeletePinModal(false)}
        title="Eliminar Movimiento"
        description="Ingresa el PIN para confirmar la eliminación de este movimiento."
        onSuccess={() => deleteMutation.mutateAsync()}
      />

      <EditMovimientoModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        movimiento={movimiento}
        onSubmit={handleEdit}
      />

      <ViewMovimientoModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        movimiento={movimiento}
      />
    </>
  );
}
