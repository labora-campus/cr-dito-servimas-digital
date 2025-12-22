import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, CreditCard, DollarSign, Package, FileDown, StickyNote, Trash2, Pencil } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MovimientoRow } from '@/components/MovimientoRow';
import { PaymentModal } from '@/components/PaymentModal';
import { DeliveryModal } from '@/components/DeliveryModal';
import { SecurityPinModal } from '@/components/SecurityPinModal';
import { AddNoteModal } from '@/components/AddNoteModal'; // Import
import { EditCortineroModal } from '@/components/EditCortineroModal'; // Import
import { createEntrega, createPago, getCortineroById, getMovimientosByCortinero, deleteCortinero, updateCortinero } from '@/data/supabaseApi';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/auth/AuthProvider';

export default function CortineroDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showDeletePinModal, setShowDeletePinModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false); // State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false); // State

  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('No ID');
      await deleteCortinero(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cortineros'] });
      toast({ title: 'Cortinero eliminado', description: 'El cortinero ha sido desactivado.' });
      navigate('/cortineros');
    },
    onError: (err) => {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
  });

  const {
    data: cortinero,
    isLoading: loadingCortinero,
    isError: isCortineroError,
    error: cortineroError,
  } = useQuery({
    queryKey: ['cortinero', id],
    queryFn: () => getCortineroById(id || ''),
    enabled: Boolean(id) && !authLoading && Boolean(user),
  });

  const {
    data: movimientos = [],
    isLoading: loadingMovimientos,
    isError: isMovimientosError,
    error: movimientosError,
  } = useQuery({
    queryKey: ['movimientos', id],
    queryFn: () => getMovimientosByCortinero(id || ''),
    enabled: Boolean(id) && !authLoading && Boolean(user),
  });

  const paymentMutation = useMutation({
    mutationFn: (data: { monto: number; metodoPago: string; comentarios: string; fecha: string }) => {
      if (!id) throw new Error('Missing cortinero id');
      if (!user) throw new Error('No authenticated user');
      return createPago({
        cortineroId: id,
        monto: data.monto,
        metodoPago: data.metodoPago,
        comentarios: data.comentarios,
        fecha: data.fecha,
        createdBy: user.id,
      });
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cortineros'] }),
        queryClient.invalidateQueries({ queryKey: ['cortinero', id] }),
        queryClient.invalidateQueries({ queryKey: ['movimientos', id] }),
        queryClient.invalidateQueries({ queryKey: ['movimientos', 'recent'] }),
      ]);
      toast({
        title: 'Pago registrado',
        description: `Se registró un pago de ${formatCurrency(variables.monto)} para ${cortinero?.nombre ?? ''}`,
      });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'No se pudo registrar el pago';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    },
  });

  const deliveryMutation = useMutation({
    mutationFn: async (data: { monto: number; descripcion: string; fecha: string; pagoInicial?: number; metodoPago?: string }) => {
      if (!id) throw new Error('Missing cortinero id');
      if (!user) throw new Error('No authenticated user');

      // 1. Create Delivery
      await createEntrega({
        cortineroId: id,
        monto: data.monto,
        descripcion: data.descripcion,
        fecha: data.fecha,
        createdBy: user.id,
      });

      // 2. Create Payment if applicable
      if (data.pagoInicial && data.pagoInicial > 0) {
        await createPago({
          cortineroId: id,
          monto: data.pagoInicial,
          metodoPago: data.metodoPago || 'efectivo',
          comentarios: `Pago inicial por: ${data.descripcion}`,
          fecha: data.fecha,
          createdBy: user.id,
        });
      }
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cortineros'] }),
        queryClient.invalidateQueries({ queryKey: ['cortinero', id] }),
        queryClient.invalidateQueries({ queryKey: ['movimientos', id] }),
        queryClient.invalidateQueries({ queryKey: ['movimientos', 'recent'] }),
      ]);
      toast({
        title: 'Entrega registrada',
        description: variables.pagoInicial
          ? `Se registró la entrega y un pago inicial de ${formatCurrency(variables.pagoInicial)}`
          : `Se registró una entrega de ${formatCurrency(variables.monto)} para ${cortinero?.nombre ?? ''}`,
      });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'No se pudo registrar la entrega';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    },
  });

  const noteMutation = useMutation({
    mutationFn: async (nota: string) => {
      if (!id || !user) throw new Error('Missing data');
      // A note is basically a payment/delivery with 0 amount? Or specific type?
      // Let's use 'ajuste' with 0 amount for now, or 'pago' with 0.
      // I'll create an 'ajuste' if possible, but API only has createPago/Entrega.
      // Ah, I need `createMovimiento` generic or use createPago with 0.
      // I'll use createPago with type 'pago' (or add 'ajuste' support).
      // Wait, the API `createPago` sets type='pago'.
      // Let's assume for now I use `createPago` with 0 amount, or I should update API to support generic create.
      // Actually, I'll update `supabaseApi` to have `createNota` or similar? 
      // No, I'll just use `createPago` with 0 amount and the note as comments.
      return createPago({
        cortineroId: id,
        monto: 0,
        metodoPago: 'nota',
        comentarios: nota,
        fecha: new Date().toISOString().split('T')[0],
        createdBy: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos', id] });
      toast({ title: 'Nota agregada', description: 'La nota se ha guardado en el historial.' });
    }
  });

  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!id) throw new Error('No ID');
      await updateCortinero(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cortinero', id] });
      queryClient.invalidateQueries({ queryKey: ['cortineros'] });
      toast({ title: 'Perfil actualizado', description: 'La información del cortinero ha sido actualizada.' });
    }
  });

  if (loadingCortinero || loadingMovimientos) {
    return (
      <div className="space-y-6">
        <Link
          to="/cortineros"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </Link>
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (isCortineroError || isMovimientosError) {
    const message =
      (cortineroError instanceof Error ? cortineroError.message : '') ||
      (movimientosError instanceof Error ? movimientosError.message : '') ||
      'No se pudieron cargar los datos';
    return (
      <div className="space-y-6">
        <Link
          to="/cortineros"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </Link>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-destructive">{message}</div>
      </div>
    );
  }

  if (!cortinero) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-foreground">Cortinero no encontrado</h2>
        <Link to="/cortineros" className="text-primary hover:underline mt-2 inline-block">
          Volver al listado
        </Link>
      </div>
    );
  }

  const isDebt = cortinero.saldo < 0;
  const isPositive = cortinero.saldo > 0;

  const handlePayment = (data: { monto: number; metodoPago: string; comentarios: string; fecha: string }) => {
    return paymentMutation.mutateAsync(data);
  };

  // Import these at top, but for now assuming we will fix imports in next step or use dynamic import/require if needed.
  // Actually, better to add imports at top. I will do that in separate step.
  // Here I add the logic.

  const handleExportPDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text(`Reporte de Cuenta: ${cortinero.nombre}`, 14, 20);

      doc.setFontSize(10);
      doc.text(`Zona: ${cortinero.zona}`, 14, 28);
      doc.text(`Saldo Actual: ${formatCurrency(Math.abs(cortinero.saldo))} ${isDebt ? '(Debe)' : isPositive ? '(A favor)' : '(Al día)'}`, 14, 34);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 40);

      const tableData = movimientos.map(m => [
        m.fecha.toLocaleDateString(),
        m.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        m.descripcion + (m.nota ? ` (${m.nota})` : ''),
        (m.tipo === 'pago' ? '+' : '-') + formatCurrency(m.importe),
        formatCurrency(m.saldoResultante)
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Fecha', 'Hora', 'Descripción', 'Importe', 'Saldo']],
        body: tableData,
      });

      doc.save(`Estado_Cuenta_${cortinero.nombre.replace(/\s+/g, '_')}.pdf`);
      toast({ title: 'PDF Generado', description: 'El reporte se ha descargado correctamente.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudo generar el PDF', variant: 'destructive' });
    }
  };

  const handleDelivery = (data: { monto: number; descripcion: string; fecha: string; pagoInicial?: number; metodoPago?: string }) => {
    return deliveryMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/cortineros"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al listado
      </Link>

      {/* Profile Header */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden animate-fade-in">
        <div className="gradient-primary h-24 md:h-32" />
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16">
            <img
              src={cortinero.foto}
              alt={cortinero.nombre}
              className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover ring-4 ring-card shadow-xl"
            />
            <div className="flex-1 md:pb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{cortinero.nombre}</h1>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setShowEditProfileModal(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                {cortinero.telefono && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {cortinero.telefono}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {cortinero.zona}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  Límite: {formatCurrency(cortinero.limiteCredito)}
                </span>
              </div>
            </div>
            <div className="md:pb-2 text-left md:text-right">
              <p className="text-sm text-muted-foreground">Saldo actual</p>
              <p className={cn(
                'text-3xl md:text-4xl font-bold',
                isDebt && 'text-destructive',
                isPositive && 'text-success',
                !isDebt && !isPositive && 'text-muted-foreground'
              )}>
                {isDebt && '-'}{formatCurrency(Math.abs(cortinero.saldo))}
              </p>
              <p className={cn(
                'text-sm font-medium',
                isDebt ? 'Debe' : isPositive ? 'A favor' : 'Al día',
                isDebt ? 'text-destructive' : isPositive ? 'text-success' : 'text-muted-foreground'
              )}>
                {isDebt ? 'Debe' : isPositive ? 'A favor' : 'Al día'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setShowPaymentModal(true)}
          className="bg-success hover:bg-success/90 text-success-foreground"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Registrar Pago
        </Button>
        <Button onClick={() => setShowDeliveryModal(true)}>
          <Package className="h-4 w-4 mr-2" />
          Registrar Entrega
        </Button>
        <Button variant="outline" onClick={handleExportPDF}>
          <FileDown className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
        <Button variant="outline" onClick={() => setShowAddNoteModal(true)}>
          <StickyNote className="h-4 w-4 mr-2" />
          Agregar Nota
        </Button>
        <Button
          variant="destructive"
          className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
          onClick={() => setShowDeletePinModal(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </Button>
      </div>

      {/* Movements Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Historial de Movimientos</h2>
          <p className="text-sm text-muted-foreground mt-1">{movimientos.length} movimientos registrados</p>
        </div>

        {movimientos.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay movimientos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Fecha
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Tipo
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Descripción
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Importe
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((movimiento) => (
                  <MovimientoRow key={movimiento.id} movimiento={movimiento} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cortineroNombre={cortinero.nombre}
        onSubmit={handlePayment}
      />
      <DeliveryModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        cortineroNombre={cortinero.nombre}
        onSubmit={handleDelivery}
      />
      <SecurityPinModal
        isOpen={showDeletePinModal}
        onClose={() => setShowDeletePinModal(false)}
        onSuccess={() => deleteMutation.mutate()}
      />

      <AddNoteModal
        isOpen={showAddNoteModal}
        onClose={() => setShowAddNoteModal(false)}
        onSubmit={(nota) => noteMutation.mutateAsync(nota)}
      />

      <EditCortineroModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        cortinero={cortinero}
        onSubmit={(data) => profileMutation.mutateAsync(data)}
      />
    </div>
  );
}
